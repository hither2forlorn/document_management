import { takeActionWorkflow } from "./api";
import { toast } from "react-toastify";

export const getUser = (userId, users) => {
  let user = {};
  if (users) {
    users.forEach((u) => {
      if (u.id === userId) {
        user = u;
      }
    });
  }
  return user.name || "";
};

export const skipOne = (workflowMasterId, getData = () => {}) => {
  takeActionWorkflow(
    {
      action: "skip",
      data: {
        comment: "",
        workflowMasterId,
      },
    },
    (err, json) => {
      if (err) toast.error("Error!");
      else {
        toast.success("Success!");
        getData();
      }
    }
  );
};
