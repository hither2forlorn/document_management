import { server } from "admin/config/server";
import { toast } from "react-toastify";

const sendOTP = (TYPE, data) => {
  server
    .post(`/send-otp/${TYPE}`, data)
    .then((res) => {
      if (res.data.success) {
        toast.success(res.data.message);
      } else {
        toast.warn(res.data.message);
      }
    })
    .catch((e) => {
      console.log(e, "eeee");
      toast.error("Error!!!");
    });
};

export { sendOTP };
