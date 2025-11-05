import A from "../actions";

const allFields = (state = {}, { type, data }) => {
  switch (type) {
    case A.SET_ALL_FIELDS:
      return {
        ...state,
        ...data,
      };
    default:
      return {
        ...state,
      };
  }
};

const userProfile = (state = {}, { type, data }) => {
  switch (type) {
    case A.SET_USER_PROFILE:
      return {
        ...state,
        ...data,
      };
    default:
      return {
        ...state,
      };
  }
};

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

export default {
  allFields: allFields,
  userProfile: userProfile,
  license: license,
};
