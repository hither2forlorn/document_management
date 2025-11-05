import { server } from "admin/config/server";
import Axios from "axios";
import { toast } from "react-toastify";

var url = "/bok-lms";
var cbs_url = "/bok-cbs";
async function getBOKIDs(id, source, attachmentModalBata, documentIndexBata) {
  try {
    const result = await server.get(`${documentIndexBata ? cbs_url : url}`, {
      params: { id: id, attachmentModalBata },
      cancelToken: source.token,
    });
    return result.data;
  } catch (thrown) {
    if (Axios.isCancel(thrown)) {
      console.log("Request canceled", thrown.message);
    } else {
      // handle error
      toast.error("Error :", thrown.message);
    }
  }
}

// Retrieve data from cbs
async function getBOKIDsFromCBS(id, tbokid, tbokidDetails, source) {
  try {
    const result = await server.get(`${cbs_url}/pullBOKIDaFromCBS`, {
      params: { id, tbokid, tbokidDetails },
      cancelToken: source.token,
    });
    return result.data;
  } catch (thrown) {
    if (Axios.isCancel(thrown)) {
      console.log("Request canceled", thrown.message);
    } else {
      // handle error
      toast.error("Error :", thrown.message);
    }
  }
}

const url3 = url + "/verify/";
async function verifyBOKID(id) {
  try {
    const result = await server.get(`${url3}`, { params: { id } });
    return result.data;
  } catch (error) {
    toast.error("Error :", error);
  }
}

const url2 = "/bok-cbs";
async function getCustomerDetails(id) {
  try {
    const result = await server.get(`${url2}`, { params: { id } });
    return result.data;
  } catch (error) {
    toast.error("Error :", error);
  }
}

const url5 = "/get-bok-cbs/";
async function getCBSCustogmerDetails(id) {
  try {
    const result = await server.get(`${url5}`, { params: { id } });
    return result.data;
  } catch (error) {
    toast.error("Error :", error);
  }
}

const url4 = "/select-bok-cbs/";
async function selectCBSCustomerDetails(id) {
  try {
    const result = await server.get(`${url4}`, { params: { id } });
    return result.data;
  } catch (error) {
    toast.error("Error :", error);
  }
}

export { verifyBOKID, getCustomerDetails, getBOKIDs, getBOKIDsFromCBS };
