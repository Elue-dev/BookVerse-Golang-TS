import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PulseLoader } from "react-spinners";
import styles from "./auth.module.scss";
import { BiBookReader } from "react-icons/bi";
import toast from "react-hot-toast";
import { httpRequest } from "../../services/httpRequest";
import { errorToast, successToast } from "../../utils/alerts";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FiLock } from "react-icons/fi";

const initialState = {
  new_password: "",
  confirm_password: "",
};

export default function ResetPassword() {
  const [values, setValues] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [visibleSec, setVisibleSec] = useState(false);
  const passwordRef = useRef<any | undefined>();
  const cPasswordRef = useRef<any | undefined>();
  const navigate = useNavigate();
  const { t, u } = useParams();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const resetUserPassword = async (e: FormEvent) => {
    e.preventDefault();
    toast.dismiss();

    const { new_password, confirm_password } = values;

    if (new_password.length < 6)
      return errorToast("Password should be at least 6 characters");

    if (new_password != confirm_password)
      return errorToast("New password credentials do not match");

    setLoading(true);

    try {
      const response = await httpRequest.post(
        `/auth/reset-password/${t}/${u}`,
        {
          new_password,
          confirm_password,
        }
      );

      if (response.status === 200) {
        successToast("Your password has been successfully reset!");
      }

      setLoading(false);
      navigate("/auth");
    } catch (error: any) {
      setLoading(false);
      errorToast(error?.response?.data.message);
    }
  };

  const handlePasswordVisibility = () => {
    setVisible(!visible);
    if (passwordRef.current?.type === "password") {
      passwordRef.current?.setAttribute("type", "text");
    } else {
      passwordRef.current?.setAttribute("type", "password");
    }
  };

  const handlePasswordVisibilitySec = () => {
    setVisibleSec(!visibleSec);
    if (cPasswordRef.current?.type === "password") {
      cPasswordRef.current?.setAttribute("type", "text");
    } else {
      cPasswordRef.current?.setAttribute("type", "password");
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
            <h3 style={{ textAlign: "center" }}>Reset Password</h3>
          </div>
          <form onSubmit={resetUserPassword}>
            <label>
              <span>New Password</span>
              <div className={styles["password__visibility__toggler"]}>
                <FiLock />
                <input
                  type="password"
                  name="new_password"
                  value={values.new_password}
                  ref={passwordRef}
                  onChange={handleInputChange}
                  placeholder="At least 6 characters"
                />
                <span onClick={handlePasswordVisibility}>
                  {visible ? (
                    <AiOutlineEye size={20} />
                  ) : (
                    <AiOutlineEyeInvisible size={20} />
                  )}
                </span>
              </div>
            </label>

            <br />

            <label>
              <span>Confirm New Password</span>
              <div className={styles["password__visibility__toggler"]}>
                <FiLock />
                <input
                  type="password"
                  name="confirm_password"
                  value={values.confirm_password}
                  ref={cPasswordRef}
                  onChange={handleInputChange}
                  placeholder="At least 6 characters"
                />
                <span onClick={handlePasswordVisibilitySec}>
                  {visibleSec ? (
                    <AiOutlineEye size={20} />
                  ) : (
                    <AiOutlineEyeInvisible size={20} />
                  )}
                </span>
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
