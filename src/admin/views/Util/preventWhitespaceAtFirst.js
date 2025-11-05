export const preventWhitespaceAtFirst = (str) => {
  if (/^\s/.test(str.value)) str.value = "";
};
