import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, Tooltip } from "reactstrap";
import { TagCloud } from "react-tagcloud";
import { getAllTags } from "../api/tag";

const UsedTags = (props) => {
  const [tag, setTag] = useState([]);
  const [toolTipOpen, setToolTipOpen] = useState(false);

  useEffect(() => {
    getAllTags((err, data) => {
      if (!err) {
        tagData(data);
      }
    });
  }, []);

  function tagData(data) {
    const value = data.data;
    setTag(value);
  }

  function toggle() {
    setToolTipOpen(!toolTipOpen);
  }

  return (
    <Card className="bg-default shadow-lg">
      <CardHeader>
        <p className="h5">Most Used Tags</p>
      </CardHeader>
      <CardBody className="p-5">
        {/* <Tooltip
          placement="left"
          isOpen={toolTipOpen}
          target="TooltipExample"
          toggle={toggle}
        >
          {(tagName = tag.map((tag) => {}))}
        </Tooltip> */}
        {/* <p>
          Somewhere in here is a{" "}
          <span
            style={{ textDecoration: "underline", color: "blue" }}
            href="#"
            id="TooltipExample"
          >
            tooltip
          </span>
          .
        </p> */}
        <TagCloud
          minSize={15}
          maxSize={35}
          tags={tag}
          shuffle={true}
          //   href="#"
          //   id="TooltipExample"
        />
      </CardBody>
    </Card>
  );
};

export default UsedTags;
