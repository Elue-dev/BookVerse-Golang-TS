import toast from "react-hot-toast";

export const successToast = (payload: string) => {
  return toast.success(payload, {
    duration: 4000,
  });
};

export const errorToast = (payload: string) => {
  return toast.error(payload, {
    duration: 4000,
  });
};
