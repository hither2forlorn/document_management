import {
  addDocument,
  getDocument,
  getArchivedDocuments,
  previewDocument,
  editDocument,
  searchDocuments,
  deleteDocument,
  approveDocument,
  resubmitDocument,
  getPendingDocuments,
  provideTimelyAccess,
  checkoutDocument,
  archiveDocument,
} from "./document";

import { getAttachments, previewAttachment, downloadAttachment, deleteAttachment } from "./attachment";

import { addDocumentIndexValue, getDocumentIndexValue } from "./documentIndexValue";
import { getIndexType } from "../../IndexType/api";

export {
  addDocument,
  getDocument,
  getArchivedDocuments,
  previewDocument,
  editDocument,
  searchDocuments,
  deleteDocument,
  approveDocument,
  resubmitDocument,
  getPendingDocuments,
  provideTimelyAccess,
  checkoutDocument,
  getAttachments,
  previewAttachment,
  downloadAttachment,
  deleteAttachment,
  addDocumentIndexValue,
  getDocumentIndexValue,
  getIndexType,
  archiveDocument,
};
