module.exports = {
  env: {
    jest: true,
  },
  plugins: ["react", "react-hooks"],
  rules: {
    "no-use-before-define": "off",
    "react/jsx-filename-extension": "off",
    "react/prop-types": "off",
    "comma-dangle": "off",
  },
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
  },
  globals: {
    fetch: false,
  },
};
