import { server } from "admin/config/server";
import { toast } from "react-toastify";

const sendEmail = (TYPE, data) => {
  server
    .post(`/send-email/${TYPE}`, data)
    .then((res) => {
      if (res.data.success) {
        toast.success(res.data.message);
      } else {
        toast.warn(res.data.message);
      }
    })
    .catch(() => {
      toast.error("Error!");
    });
};

export { sendEmail };
