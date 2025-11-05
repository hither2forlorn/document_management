import React from "react";
import { Label, Input, FormGroup, Col } from "reactstrap";

export default function IndexInputContainer({
  row,
  listValues,
  props,
  onChange,
  getValueOfIndex,
  attribute,
  type,
  className,
  errors,
  ...rest
}) {
  return (
    <React.Fragment key={row.id}>
      <Col md={props.fromBulkAttachmentUploads ? 12 : 4}>
        <FormGroup>
          <Label>
            {row.label}
            {row.isRequired && (
              <span className="text-danger h6 ml-1">
                <b>*</b>
              </span>
            )}
          </Label>
          <Input
            className={`rounded ${className}`}
            onChange={(e) => onChange(e, null, null, row?.condition)}
            type={type}
            name={row.id}
            value={getValueOfIndex(listValues, row.id)}
            required={row.isRequired}
            {...(typeof attribute == "object" ? attribute : {})}
            {...rest}
          />
          <Input type="hidden" name="documentIndexId" value={row.id} />
          <div className=" text text-danger mt-1">
            {errors
              ? errors?.map((err) => (
                  <span>
                    {err}
                    <br />
                  </span>
                ))
              : null}
          </div>
        </FormGroup>
      </Col>
    </React.Fragment>
  );
}
