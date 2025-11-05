const hasBokId = await handleVerifyBOKID(req.body.name);
if (!hasBokId) {
  res.json({ success: false, message: "BOK ID does not exist!" });
  return;
}

module.exports = hasBokId;
