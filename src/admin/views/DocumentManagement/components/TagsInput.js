import CustomChip from "admin/components/CustomChip";
import React, { useEffect, useState } from "react";
import { Label } from "reactstrap";

import { getSuggestTags } from "admin/views/Dashboard/api/tag";

const TagsInput = (props) => {
  const [tags, setTags] = useState([]);
  const [suggestTag, setSuggestTag] = useState([]);

  useEffect(() => {
    if (props.isEdit && props.defaultValue.length > 0) {
      let data = props.defaultValue;
      const stringType = typeof props.defaultValue;
      if (typeof props.defaultValue == "string") {
        data = JSON.parse(props.defaultValue);
      }

      // warning for invalid tags
      // if (typeof props.defaultValue != "array") {
      //   toast.warn("[Tags] Data is not invalid");
      //   return;
      // }
      setTags(data);
    }
  }, [props?.defaultValue?.length]);

  useEffect(() => {
    getSuggestTags((err, data) => {
      if (!err) {
        setSuggestTag(data.data);
      }
    });
  }, []);

  const addTags = (event, onBlur) => {
    const value = event.target.value;

    if (value !== "" && (event.keyCode === 9 || onBlur)) {
      const currenetTags = [...tags, value];
      setTags(currenetTags);

      // if it came from searchfilter then donot run this statement
      // Only for adding document array
      !props.searchFilterBata && props.selectedTags(currenetTags);

      if (props.searchFilterBata) {
        props.onChange(currenetTags, props.name);
      }

      // empty value
      event.target.value = "";
    }
  };

  const removeTags = (index) => {
    const currenetTags = [...tags.filter((tag) => tags.indexOf(tag) !== index)];
    setTags(currenetTags);

    // if it came from searchfilter then donot run this statement
    // Only for adding document array
    !props.searchFilterBata && props.selectedTags(currenetTags);
    // add changes on every deletes
    if (props.searchFilterBata) {
      props.onChange(currenetTags, props.name);
      // empty value
    }
  };

  // add suggest input tag in tags.
  // function handleInputValue(value) {
  //   if (!tags.includes(value)) setTags([...tags, value]);
  // }

  function handleInputValue(value) {
  if (!tags.includes(value)) {
    const newTags = [...tags, value];
    setTags(newTags);

    //  Notify parent about change
    if (props.searchFilterBata) {
      props?.onChange?.(newTags, props.name);
    } else {
      props?.selectedTags?.(newTags);
    }
  }
}


  return (
    <>
      <Label>
        {props.label ? props.label : ""}

        {props.AddDocumentBata && (
          <>
            {suggestTag.map((row) => (
              <CustomChip
                style={{ marginLeft: "5px" }}
                label={row.value}
                variant="outlined"
                onClick={() => handleInputValue(row.value)}
              />
            ))}
          </>
        )}
        {props.required && (
          <span className="text-danger h6 ml-1">
            <b>*</b>
          </span>
        )}
      </Label>
      <div className="tags-input form-group">
        <ul id="tags">
          {tags?.map((tag, index) => (
            <li key={index} className="tag">
              <span>{tag}</span>
              <span className="tag-close-icon" onClick={() => removeTags(index)}>
                x
              </span>
            </li>
          ))}
        </ul>

        <input
          tabindex="-1"
          name={props.name}
          type={props.type || "text"}
          className="rounded form-control"
          required={(!tags.length > 0 && props.required) || false}
          placeholder="Press Tab to add tags"
          onChange={!props.searchFilterBata ? () => props.onChange(tags, props.name) : undefined}
          onKeyUp={(event) => addTags(event)}
          onBlur={(event) => addTags(event, true)}
          label={props.level}
          onKeyDown={(e) => {
            if (e.keyCode === 9) e.preventDefault();
          }}
        />
      </div>
    </>
  );
};

export default TagsInput;
