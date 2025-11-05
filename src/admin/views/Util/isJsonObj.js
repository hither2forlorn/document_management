function isJsonObj(data) {
  try {
    var testIfJson = JSON.parse(data);
    if (typeof testIfJson == "object") {
      //Json
      return true;
    } else {
      return false;
      //Not Json
    }
  } catch {
    return false;
  }
}

export default isJsonObj;
