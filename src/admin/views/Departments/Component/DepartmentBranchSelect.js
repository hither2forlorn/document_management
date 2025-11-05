import React, { useState } from "react";
import ReactSelect, { StylesConfig } from "../../../components/ReactSelect";




export default function DepartmentBranchSelect({ branches, setSelectedValues, selectedBranches }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const handleSelectChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    setSelectedValues(selectedOption);
  };
  return (
    <div>
      <ReactSelect
        // name="department"
        options={branches}
        // required={true}
        // errors={errors}
        // object={object}
        value={selectedBranches}
        getFieldValue="id"
        onChange={handleSelectChange}
        isMulti
        getOptionLabel={(e) => e.name}
        getOptionValue={(e) => e.id}
      />
    </div>
  );
}
