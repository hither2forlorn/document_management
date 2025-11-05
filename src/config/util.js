import React from "react";
import _ from "lodash";
export const getValue = (array, id) => {
  let name = "";
  // console.log(array);
  if (array) {
    const item = _.find(array, { id: id });
    // console.log(item);
    const parentId = item ? item.parentId : null;
    if (item) {
      if (parentId) {
        name = getValue(array, parentId) + " > " + item.name;
        return name;
      } else {
        return item.name;
      }
    } else {
      return "";
    }
  }
};

export const getOptions = (options) => {
  if (!options) return null;
  return options.map((row, i) => {
    let padding = "";
    let level = row.level || 0;
    while (level-- > 0) {
      padding += "---";
    }
    return (
      <option key={i} value={row.id} title={row?.hierarchy}>
        {padding + " " + row.name}
      </option>
    );
  });
};

export const printDiv = ({ title, content, links, styles }) => {
  var mywindow = window.open("", "PRINT");
  mywindow.document.write("<html><head><title>");
  mywindow.document.write(title);
  mywindow.document.write("</title>");
  if (links) {
    for (const link of links) {
      mywindow.document.write(`<link href=${link.href} rel = "stylesheet" />`);
    }
  }
  if (styles) {
    for (const style of styles) {
      mywindow.document.write(`<style type="text/css">${style.innerHTML}</style>`);
    }
  }
  mywindow.document.write("</head><body>");
  mywindow.document.write(content);
  mywindow.document.write("</body></html>");
  mywindow.document.close(); // necessary for IE >= 10
  mywindow.focus(); // necessary for IE >= 10*/
  mywindow.print();
  mywindow.close();
};
