import { NONE, VIEW, VIEW_EDIT, VIEW_EDIT_DELETE } from "config/values";

const optionsPage = [
  {
    value: NONE,
    label: "--- NONE ---",
  },
  {
    value: VIEW,
    label: "View",
  },
  {
    value: VIEW_EDIT,
    label: "Edit",
  },
  {
    value: VIEW_EDIT_DELETE,
    label: "Edit / Delete",
  },
];

const optionsBoolean = [
  {
    value: false,
    label: "No",
  },
  {
    value: true,
    label: "Yes",
  },
];

export { optionsPage, optionsBoolean, VIEW, VIEW_EDIT, VIEW_EDIT_DELETE };
