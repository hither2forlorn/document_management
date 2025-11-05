import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { addFavourite, getFavourite } from "./api/favouriteList";
import { addArchive } from "./api/archiveList";
import { toast } from "react-toastify";

import { Card, CardBody, Form, Label, Input } from "reactstrap";

const FavouriteList = (props) => {
  const [isChecked, setIsChecked] = useState(false);
  const [isArchecked, setIsArchecked] = useState(props.documentData.isArchived || false);
  useEffect(() => {
    props.documentData &&
      getFavourite(props.documentData.id, (err, result) => {
        if (err) {
          console.log("Fav Fetch Error");
        } else {
          setIsArchecked(props.documentData.isArchived ? true : false);
          setIsChecked(result.data === "true" ? true : false);
        }
      });
  }, [props.documentData]);

  const handleSubmit = (event) => {
    setIsChecked(event.target.checked);
    const docsId = {
      documentId: props.documentData.id,
      isfavourite: event.target.checked,
    };

    addFavourite(docsId, (err, data) => {
      if (err) {
        return toast.error("Error!");
      }
      // toast.success(data.message);
    });
  };

  const handleArchive = (event) => {
    if (!window.confirm("Do you want to Archive this document?")) {
      return;
    }

    const docsId = {
      documentId: props.documentData.id,
      isArchived: event.target.checked,
    };
    addArchive(docsId, (err, data) => {
      if (err) {
        toast.error("Error!");
      } else if (!data?.success) {
        toast.error(data?.message);
      } else {
        setIsArchecked(true);
        toast.success(data.message);
      }
    });
  };

  return (
    <>
      <Card className="shadow">
        <CardBody>
          <Form className="ml-4">
            <Label check>
              <Input
                type="checkbox"
                value={isChecked}
                onChange={(e) => handleSubmit(e)}
                checked={isChecked ? true : false}
                className="mt-0"
              />
              Add to Favourite List
              {isChecked ? <i className="fas  fa-star ml-1 text-warning" /> : <i className="fas  fa-star ml-1" />}
            </Label>
          </Form>
          {props.permissions.archived ? (
            <Form className="ml-4">
              <Label check>
                <Input
                  type="checkbox"
                  checked={isArchecked}
                  disabled={isArchecked}
                  onChange={handleArchive}
                  className="mt-0"
                />
                Archived Now
                {isArchecked ? <i className="fas  fa-archive ml-1 text-primary" /> : <i className="fas  fa-archive ml-1" />}
              </Label>
            </Form>
          ) : null}
        </CardBody>
      </Card>
    </>
  );
};
const mapStateToProps = (state) => state.allFields;
export default connect(mapStateToProps)(FavouriteList);
