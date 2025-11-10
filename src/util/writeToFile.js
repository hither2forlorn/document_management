const fs = require("fs");
/**
 * Output content to file
 * @param {String} content
 * @param {String} location
 */
function writeToFile(content, location = "test.txt", append) {
  if (append) {
    var text = fs.readFileSync(location).toString("utf-8");
    var array = text.split("\n");

    temp_content = '"' + content + '"';
    if (array.includes(temp_content)) return;

    fs.appendFileSync(location, JSON.stringify(content) + "\n", (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("File write success", location);
    });
  } else
    fs.writeFileSync(location, JSON.stringify(content) + "\n", (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("File write success", location);
    });
}

module.exports = writeToFile;
