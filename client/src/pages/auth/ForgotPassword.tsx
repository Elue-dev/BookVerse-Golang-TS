import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PulseLoader } from "react-spinners";
import { MdAlternateEmail } from "react-icons/md";
import styles from "./auth.module.scss";
import { BiBookReader } from "react-icons/bi";
import toast from "react-hot-toast";
import { httpRequest } from "../../services/httpRequest";
import { errorToast, successToast } from "../../utils/alerts";

const initialState = {
  username: "",
  email: "",
  emailOrUsername: "",
  password: "",
};

export default function ForgotPassword() {
  const [values, setValues] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<any | undefined>(null);
  const navigate = useNavigate();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const sendPasswordResetEmail = async (e: FormEvent) => {
    e.preventDefault();
    toast.dismiss();

    if (!values.email)
      return errorToast(
        "Please provide the Email associated with your account"
      );

    setLoading(true);

    try {
      const response = await httpRequest.post("/auth/forgot-password", {
        email: values.email,
      });

      if (response.status === 200) {
        successToast(
          `An email has been sent to ${values.email} with instructions to reset your password`
        );
      }

      setLoading(false);
      navigate("/auth");
    } catch (error: any) {
      setLoading(false);
      errorToast(error?.response?.data.message);
    }
  };

  return (
    <main>
      <div className={styles.auth}>
        <div className={styles.logo}>
          <Link to="/">
            <BiBookReader />
            <p>BookVerse</p>
          </Link>
        </div>
        <div className={styles["auth__contents"]}>
          <div className={styles.heading}>
            <h3 style={{ textAlign: "center" }}>Forgot Password</h3>
          </div>
          <form onSubmit={sendPasswordResetEmail}>
            <label>
              <span>Email</span>
              <div className={styles["auth__icon"]}>
                <MdAlternateEmail />
                <input
                  type={"email"}
                  name={"email"}
                  value={values.email}
                  ref={emailRef}
                  onChange={handleInputChange}
                  placeholder={"Enter your email"}
                />
              </div>
            </label>
            <br />

            {loading ? (
              <button type="button" disabled>
                <PulseLoader loading={loading} size={10} color={"#fff"} />
              </button>
            ) : (
              <button type="submit">Proceed</button>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
