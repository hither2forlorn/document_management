import React from "react";
import _ from "lodash";

const SMALL_ATTACHEMENTS = "IMAGE_PDF_DOCS";
const LARGE_ATTACHEMENTS = "AUDIO_VIDEO";

function getHeaderForList(context) {
  return (
    <>
      <th onClick={() => context.sortBy("documentType")}>Type</th>
      <th onClick={() => context.sortBy("name")}>Organization Name</th>
      <th onClick={() => context.sortBy("otherTitle")}>Document Name</th>
      <th onClick={() => context.sortBy("description")}>Document description</th>
      <th onClick={() => context.sortBy("status")}>Status</th>
      <th onClick={() => context.sortBy("locationMap")}>Location</th>
      <th onClick={() => context.sortBy("owner")}>Owner</th>
    </>
  );
}

const paginate = (items, pageNumber, pageSize) => {
  const startIndex = (pageNumber - 1) * pageSize;
  return _(items).slice(startIndex).take(pageSize).value();
};

const findByParentId = (eq) => (arr) => arr.filter((x, i) => arr.find((y, j) => i !== j && eq(x, y)));

export {
  // CONSTANTS
  SMALL_ATTACHEMENTS,
  LARGE_ATTACHEMENTS,
  // METHODS
  getHeaderForList,
  paginate,
  findByParentId
};
