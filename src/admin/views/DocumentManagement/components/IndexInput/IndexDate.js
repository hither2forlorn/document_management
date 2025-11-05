import React from "react";
import { Label, Input, FormGroup, Col } from "reactstrap";

export default function IndexDate({ row, props, onChange, getValueOfIndex, attribute, listValues, errors, ...rest }) {
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
            required={row.isRequired}
            onChange={(e) => onChange(e, null, null, row?.condition)}
            type="date"
            name={row.id}
            value={getValueOfIndex(listValues, row.id)}
            {...(typeof attribute == "object" ? attribute : {})}
            {...rest}
          />
          <Input type="hidden" name="documentIndexId" value={row.id} />
          {errors ? (
            <span className="mt-2 text text-danger">
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
