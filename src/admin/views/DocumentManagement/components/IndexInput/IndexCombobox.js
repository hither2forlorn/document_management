import { CustomSelect } from "admin/components";
import React from "react";
import { Label, Input, FormGroup, Col } from "reactstrap";

export default function IndexCombobox({ row, props, onChange, getValueOfIndex, attribute, listValues, errors, ...rest }) {
  return (
    <React.Fragment key={row.id}>
      <Col md={props.fromBulkAttachmentUploads ? 12 : 4}>
        <FormGroup>
          <CustomSelect
            label={row.label}
            name={row.id}
            options={props.provinces}
            required={row.isRequired}
            onChange={(e) => onChange(e, null, null, row?.condition)}
            value={getValueOfIndex(listValues, row.id)}
            defaultValueOnlyForCombobox={getValueOfIndex(listValues, row.id)}
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
