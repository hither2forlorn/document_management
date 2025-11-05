import A from "../actions";

const license = (state = { isLoading: true }, { type, data }) => {
  switch (type) {
    case A.SET_LICENSE:
      return {
        ...state,
        ...data,
        isLoading: false,
      };
    default:
      return {
        ...state,
      };
  }
};

const auth = (state = {}, { type, data }) => {
  switch (type) {
    case A.SET_AUTH:
      return {
        ...state,
        ...data,
      };
    default:
      return state;
  }
};

const clientAuth = (state = {}, { type, data }) => {
  switch (type) {
    case A.SET_CLIENT_AUTH:
      return {
        ...state,
        ...data,
      };
    default:
      return state;
  }
};

const otpAuth = (state = {}, { type, data }) => {
  switch (type) {
    case A.SET_OTP_AUTH:
      return {
        ...state,
        ...data,
      };
    default:
      return state;
  }
};

export default {
  license: license,
  auth: auth,
  clientAuth: clientAuth,
  otpAuth: otpAuth,
};
