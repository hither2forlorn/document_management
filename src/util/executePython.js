let { PythonShell } = require("python-shell");

var options = {
  mode: "text",
  pythonPath: "python",
  pythonOptions: [],
  scriptPath: "",
  args: [],
};

/**
 *
 * @param {*} pyFilePath send file path to execute python
 * @param {*} data send data or string to python
 * Execute pyhon scripts. Location of pthon file must be in root directory
 */
async function executePython(pyFilePath, data) {
  let result = "";
  let pyshell = new PythonShell(pyFilePath);

  return await new Promise((resolve, reject) => {
    var json = JSON.stringify(data);
    // Json stringify also for unicode.
    json = json.replace(/[\u007F-\uFFFF]/g, function (chr) {
      return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).substr(-4);
    });

    // send data to python script
    pyshell.send(json);

    // recieve log of python script
    pyshell.on("message", function (message) {
      result = JSON.stringify(message);
      // thre space to seperate data
      if (message != "") result += message + "   ";
    });

    pyshell.on("stderr", function (stderr) {
      console.log(stderr);
    });

    pyshell.end(function (err, code, signal) {
      if (err) reject(err);
      // console.log("====================== ");
      // console.log(result);
      resolve(result);
    });
  });
}

module.exports = executePython;
