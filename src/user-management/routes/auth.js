const router = require("express").Router();
const passport = require("passport");
const auth = require("../../config/auth");
const logger = require("../../config/logger");
const { LoginLog, User } = require("../../config/database");
const timeout = require("connect-timeout");
const { toAuthJSON, generateJWT, generateRefreshToken, decodeBase64WithSecret } = require("../../util/jwt");
const { signInLdap } = require("../util/user_ldap_auth");
const { LDAP: ldapOptions } = require("../../config/credentials");
const { rateLimit } = require("express-rate-limit");
const { sendOtpByEmail } = require("../../misc/util/otp");
const bcrypt = require("bcryptjs");
const client = require("../../config/redis");
const { execSelectQuery, execUpdateQery } = require("../../util/queryFunction");
const { JWT_SECRET, REFRESH_TOKEN_SECRET } = require("../../config/credentials");
const jwt = require("jsonwebtoken");
const { clearTokensAndSession } = require("../util/clearTokenAndRedisSession");
const jwt_decode = require("jwt-decode");
const { RedisStore } = require('rate-limit-redis')

const createAccountLimiter = rateLimit({
  //for 5 minutes
  windowMs: 5 * 60 * 1000,
  max: 10, // Limit each IP to 5 create account requests per `window` (here, per minute)
  message: "Too many accounts created from this IP, please try again after an hour",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const resentOtpLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (command, ...args) => client.send_command(command, args),
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    message: "Too many resend-otp attempts. Please try again after 1 hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});



router.post("/signin", createAccountLimiter, timeout("120s"), (req, res, next) => {
  passport.authenticate(
    ["ad-login", "admin-login"],
    { session: true, failureMessage: true },
    async (err, passportUser, message) => {
      if (err) {
        logger.error(err);
        return res.status(500).send("Error!");
      }
      if (passportUser) {
        const user = passportUser;
 
        // Compare password manually (like change-password)
        const isPasswordValid = bcrypt.compareSync(req.body.password, user.password);
        if (!isPasswordValid) {
          return res.status(400).json({
            success: false,
            message: "Incorrect password",
          });
        }
 
 
        const userSession = await client.get(`loggedInUser:${user.id}`);
        if (userSession && user.id !== 682) {
          const { loggedAt } = JSON.parse(userSession);
          const sevenDaysInMs = 1 * 24 * 60 * 60 * 1000;
 
          if (Date.now() - loggedAt > sevenDaysInMs) {
            // Session expired — remove from Redis
            await client.del(`loggedInUser:${user.id}`);
          } else {
            return res.status(400).json({
              success: false,
              message: "User already logged in",
            });
          }
        }
        // 1. Fetch user, including last password change date
        const userData = await execSelectQuery(`
      SELECT id, username, email, isExpirePassword, branchId, departmentId, roleId, LastPasswordChange, hierarchy
      FROM USERS
      WHERE email = '${user.email}'`);
 
        const token = generateJWT({
          payload: {
            email: user.email,
            id: userData[0].id,
            branchId: userData[0].branchId,
            departmentId: userData[0].departmentId,
            roleId: userData[0].roleId,
            hierarchy: userData[0].hierarchy
          },
        }, 5); // access token valid for 5 minutes for other user and for a day in case of cap user
 
        const refreshToken = generateRefreshToken({
          payload: {
            email: user?.email,
            id: userData[0].id,
            branchId: userData[0].branchId,
            departmentId: userData[0].departmentId,
            roleId: userData[0].roleId,
            hierarchy: userData[0].hierarchy
          },
        });
        // 6. Special handling for user ID 682 (CAP user)
        if (user?.id === 682) {
          userData[0].token = token;
          userData[0].refreshToken = refreshToken;
 
          return res
            .cookie("jwt", token, {
              httpOnly: true,
              sameSite: "strict",
              secure: process.env.NODE_ENV === "production",
              maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
              path: "/",
            })
            .cookie("refreshToken", refreshToken, {
              httpOnly: true,
              sameSite: "strict",
              secure: process.env.NODE_ENV === "production",
              maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
              path: "/",
            })
            .status(200)
            .json({
              success: true,
              userData,
            });
        }
 
        LoginLog.create({
          userId: user.id,
          email: user.email,
          loginIp: req.ip || "",
          login: Date.now(),
        }).then(() => {
          User.update(
            { loginAttemptsCount: user.loginAttempts },
            { where: { id: user.id } }
          );
        });
 
 
        try {
          const otpResponse = await sendOtpByEmail({ userId: user.id, email: user.email });
          if (!otpResponse.success) {
            return res.status(500).send({ success: false, message: otpResponse.message });
          }
          return res.send({ success: true, message: "OTP sent to email" });
        } catch (error) {
          console.log(error);
          return res.status(500).json({ success: false, message: error.message || error });
        }
      } else {
        return res.send({
          success: false,
          message:
            message && message.length > 0
              ? message.map((a) => `${a.message}`).join(" ")
              : "Incorrect Credentials",
        });
      }
    }
  )(req, res, next);
});


router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    // 1. Fetch user, including last password change date
    const user = await execSelectQuery(`
      SELECT id, username, email, isExpirePassword, branchId, departmentId, roleId, LastPasswordChange, hierarchy
      FROM USERS
      WHERE email = '${email}'
    `);


    if (!user || user.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const storedHash = await client.get(`otp:${user[0].id}`);
    if (!storedHash) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }
    const isMatch = await bcrypt.compare(otp, storedHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect OTP" });
    }
    await client.del(`otp:${user[0].id}`);


    // 2. ✅ Check if password expired (more than 90 days)
    const lastChange = new Date(user[0].LastPasswordChange);
    const daysSinceChange = (Date.now() - lastChange.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceChange > 90) {
      // 3. ✅ Mark password as expired
      await execUpdateQery(`
      UPDATE USERS
      SET isExpirePassword = 1
      WHERE id = '${user[0].id}'
      `);
      user[0].isExpirePassword = true; // reflect in response
    } else {
      user[0].isExpirePassword = false;
    }


    const token = generateJWT({
      payload: {
        email: email,
        id: user[0].id,
        branchId: user[0].branchId,
        departmentId: user[0].departmentId,
        roleId: user[0].roleId,
        hierarchy: user[0].hierarchy,
      },
    }, 5); // access token valid for 5 minutes

    const refreshToken = generateRefreshToken({
      payload: {
        email: email,
        id: user[0].id,
        branchId: user[0].branchId,
        departmentId: user[0].departmentId,
        roleId: user[0].roleId,
        hierarchy: user[0].hierarchy,
      },
    });

    // Attach tokens to user object if needed
    user[0].token = token;
    user[0].refreshToken = refreshToken;
    // Mark user as active in Redis
    await client.set(
      `loggedInUser:${user[0].id}`,
      JSON.stringify({ loggedAt: Date.now() }),
      'EX',
      1 * 24 * 60 * 60 // 1 day in seconds
    );
    // Send both cookies
    res
      .cookie("jwt", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds for refreshToken
        path: "/",
      })
      .status(200)
      .json({
        success: true,
        user: user,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

/**
 * Refresh Token Route
 */
router.post("/refresh-token", async (req, res) => {
  try {
    const accessToken = req.cookies?.jwt;
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!accessToken || !refreshToken) {
      return res.status(400).json({ message: "Tokens are required." });
    }
 
    // Decode the access token from Base64 and JWT decode it
    const decodedAccessToken = decodeBase64WithSecret(accessToken);
    const accessPayload = jwt_decode(decodedAccessToken, JWT_SECRET);
 
    // Decode the refresh token from Base64 and JWT decode it
    const decodedRefreshToken = decodeBase64WithSecret(refreshToken);
    const refreshPayload = jwt_decode(decodedRefreshToken, JWT_SECRET);
    // Verify and check if the access token is valid or tampered
    try {
      jwt.verify(decodedAccessToken, JWT_SECRET); // This will verify if the access token has been tampered with
    } catch (e) {
      if (e.name === "JsonWebTokenError") {
        // If the access token has been tampered
        await clearTokensAndSession(res);
        return res.status(403).json({ message: "Access token has been tampered" });
      }
    }
    if (!refreshPayload) {
      await clearTokensAndSession(res);
      return res.status(401).json({ message: "Refresh token missing" });
    }
 
    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(decodedRefreshToken, REFRESH_TOKEN_SECRET);
    } catch (err) {
      // If expired, decode email, fetch user.id, and clear session with user id
      if (err.name === "TokenExpiredError") {
        try {
          const payload = jwt.decode(refreshToken);
          const email = payload?.email;
 
          let userId;
          if (email) {
            const user = await execSelectQuery(`
              SELECT id FROM USERS WHERE email = '${email}'
            `);
            if (user && user.length > 0) userId = user[0].id;
          }
 
          await clearTokensAndSession(res, userId);
        } catch (decodeErr) {
          await clearTokensAndSession(res);
        }
        return res.status(401).json({ message: "Refresh token expired" });
      }
 
      // Any other invalid token case — attempt best-effort logout with userId if we can decode
      try {
        const payload = jwt.decode(refreshToken);
        const email = payload?.email;
        let userId;
        if (email) {
          const user = await execSelectQuery(`
            SELECT id FROM USERS WHERE email = '${email}'
          `);
          if (user && user.length > 0) userId = user[0].id;
        }
        await clearTokensAndSession(res, userId);
      } catch { }
      return res.status(403).json({ message: "Invalid refresh token" });
    }
 
    // From here, refresh token is valid
    const email = decoded?.email;
    if (!email) {
      await clearTokensAndSession(res);
      return res.status(403).json({ message: "Invalid token payload" });
    }
 
    const user = await execSelectQuery(`
      SELECT id, username, email, isExpirePassword, branchId, departmentId, roleId, LastPasswordChange, hierarchy
      FROM USERS
      WHERE email = '${email}'
    `);
 
    if (!user || user.length === 0) {
      await clearTokensAndSession(res);
      return res.status(404).json({ message: "User not found" });
    }
 
    const userData = user[0];
 
 
    // Issue new tokens
    const newAccessToken = generateJWT({
      payload: {
        email: userData.email,
        id: userData.id,
        branchId: userData.branchId,
        departmentId: userData.departmentId,
        roleId: userData.roleId,
        hierarchy: userData.hierarchy
      },
      expInMinutes: 5, // 5 minutes
    });
 
    const isProd = process.env.NODE_ENV === "production";
    const accessTtlMs = 7 * 24 * 60 * 60 * 1000; // 7 days
 
    return res
      .cookie("jwt", newAccessToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: isProd,
        maxAge: accessTtlMs,
        path: "/",
      })
      .status(200)
      .json({ success: true });
  } catch (error) {
    // best-effort cleanup without userId (no token to decode reliably here)
    await clearTokensAndSession(res);
    console.error("Refresh token error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/resend-otp", resentOtpLimiter, async (req, res) => {
  const { email } = req.body;
  try {
    const user = await execSelectQuery(`SELECT id, email FROM USERS WHERE email = '${email}'`);
    if (!user.length) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const otpResponse = await sendOtpByEmail({ userId: user[0].id, email: user[0].email });

    if (!otpResponse.success) {
      return res.status(500).send({ success: false, message: otpResponse.message });
    }

    res.json({ success: true, message: "OTP resent successfully" });
  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/user/logout", auth.optional, async (req, res, next) => {
  const userId = req?.payload?.id;
  //const userId = req?.payload?.id || req?.query?.id;
  LoginLog.findOne({
    where: { userId },
    attributes: ["id"],
    order: [["createdAt", "DESC"]],
  }).then(async (log) => {
    if (log) {
      await LoginLog.update(
        {
          logout: Date.now(),
          loginIp: req.ip || "",
        },
        {
          where: { id: log.id },
        }
      );
    }
    await client.del(`loggedInUser:${userId}`);
    res.clearCookie("jwt");
    res.clearCookie("refreshToken");
    res.json({ success: true });
  });
});

module.exports = router;

