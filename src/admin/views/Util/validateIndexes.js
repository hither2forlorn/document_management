import { conditions } from "constants/conditional";
import { toast } from "react-toastify";

/**
 * Hanlde Error message
 *
 * @param {*} message
 * @param {*} row
 * @param {*} errorMessages
 * @returns
 */
function handleErrorMessage(message, row, errorMessages) {
  toast.warning(message);
  errorMessages = {
    ...errorMessages,
    [row.id]: [...(errorMessages?.[row.id] || []), message],
  };

  return errorMessages;
}

/**
 *
 * @param {*} documentTypeId
 * @param {*} indexValues
 * @param {*} documentTypes
 * @returns exit
 */
function validateIndexValues(documentTypeId, indexValues, documentTypes) {
  let exit = false,
    errorMessages = {};
  if (!documentTypeId) return { exit: false };
  // // find documentIndxes from all documents
  const documentType = _.find(documentTypes, { id: Number(documentTypeId) });
  // required field
  documentType?.document_indices?.map((row) => {
    if (row?.validation && typeof row.validation === "string") {
      if (row.validation) {
        let validation = {};

        // validation for  indexes
        try {
          validation = JSON.parse(row?.validation);
        } catch (error) {
          console.log(error);
        }
        Object.entries(validation)?.map(([key, validateValue]) => {
          const current_value = indexValues.length == 0 ? undefined : indexValues.find((row) => row.documentIndexId);
          // Required
          if (key == "required" && (current_value == undefined || current_value == "")) {
            exit = true;
            errorMessages = handleErrorMessage("Field Required", row, errorMessages);
          }
        });
      }
    }
  });

  // extract id of indexVales from submitted fields
  const submittedIndexes = indexValues?.map((row) => row?.documentIndexId);

  documentType.document_indices?.map((row) => {
    // get row value
    const current_index = indexValues.find((element) => element.documentIndexId == row.id);

    // validate submitted indicies
    if (submittedIndexes.includes(row.id))
      if (row?.validation && typeof row.validation === "string") {
        if (row.validation) {
          // validation for  indexes
          const validation = JSON.parse(row?.validation || {});
          Object.entries(validation)?.map(([key, validateValue]) => {
            // max length
            if (key == "maxlength" && current_index?.value?.length > Number(validateValue)) {
              exit = true;
              errorMessages = handleErrorMessage(`Max length ${validateValue} of ${row?.label}`, row, errorMessages);
            }

            // Required
            if (key == "required" && (current_index?.value == undefined || current_index?.value == "")) {
              exit = true;
              errorMessages = handleErrorMessage("Field Required", row, errorMessages);
            }

            // min length
            if (key == "minlength" && current_index?.value?.length < Number(validateValue)) {
              exit = true;
              errorMessages = handleErrorMessage(`Min length ${validateValue} of ${row?.label}`, row, errorMessages);
            }
          });
        }
      }

    // Conditional logic for indicies
    if (row.condition && typeof row.condition == "string") {
      if (row.condition) {
        let parse = JSON.parse(row?.condition || {});
        if (typeof parse == "object") {
          if (Object.keys(parse).length == 0) {
            parse = [];
          }
          parse?.map((data, index) => {
            const conditionIn = indexValues.find((row) => row.documentIndexId === Number(data.conditionIn));
            const conditionFor = indexValues.find((row) => row.documentIndexId === Number(data.documentConditionsField));
            switch (parseInt(data?.condition)) {
              case conditions.LessThen: // 1
                if (conditionIn?.value < conditionFor?.value) {
                  exit = true;
                  errorMessages = handleErrorMessage("Input date should be greater", row, errorMessages);
                }
                break;

              case conditions.GreaterThen: // 2
                if (conditionIn?.value > conditionFor?.value) {
                  exit = true;
                  errorMessages = handleErrorMessage("Input date should be less", row, errorMessages);
                }
                break;

              default:
                console.log("Sorry, we are out.");
                break;
            }
          });
        }
      }
    }
  });

  return { exit, errorMessages };
}

export default validateIndexValues;
