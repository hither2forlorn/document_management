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
  errors,
  ...rest
}) {
  console.log(errors);
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
            onChange={(e) => onChange(e, null, null, row?.condition)}
            type={type}
            name={row.id}
            value={getValueOfIndex(listValues, row.id)}
            required={row.isRequired}
            {...(typeof attribute == "object" ? attribute : {})}
            {...rest}
          />
          <Input type="hidden" name="documentIndexId" value={row.id} />
          {errors ? (
            <span className="text mt-2 text-danger">
              {errors?.map((err) => {
                return err;
              })}
            </span>
          ) : null}
        </FormGroup>
      </Col>
    </React.Fragment>
  );
}
