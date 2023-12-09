import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PulseLoader } from "react-spinners";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FiLock, FiUser } from "react-icons/fi";
import { IoMdLogIn } from "react-icons/io";
import { TbUserPlus } from "react-icons/tb";
import { MdAlternateEmail } from "react-icons/md";
import styles from "./auth.module.scss";
import { BiBookReader } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import {
  SAVE_URL,
  selectPreviousURL,
  SET_ACTIVE_USER,
  SET_USER_TOKEN,
} from "../../redux/slices/auth.slice";
import toast from "react-hot-toast";
import { httpRequest } from "../../services/httpRequest";
import { errorToast, successToast } from "../../utils/alerts";
import { validateEmail } from "../../helpers";

const initialState = {
  username: "",
  email: "",
  emailOrUsername: "",
  password: "",
};

export default function Auth() {
  const [values, setValues] = useState(initialState);
  const [authState, setAuthState] = useState("login");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const passwordRef = useRef<any | undefined>();
  const emailRef = useRef<any | undefined>(null);

  const nameRef = useRef<any | undefined>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const previousURL: any = useSelector(selectPreviousURL);

  useEffect(() => {
    setValues(initialState);
  }, [authState]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const loginUser = async (e: FormEvent) => {
    e.preventDefault();
    toast.dismiss();

    if (!values.emailOrUsername || !values.password)
      return errorToast("Please provide your Email or Username and Password");

    if (!/^[A-Za-z0-9@\s._-]+$/.test(values.emailOrUsername)) {
      return errorToast("Your username or email contains unwanted characters");
    }

    setLoading(true);

    const credentials = {
      emailOrUsername: values.emailOrUsername,
      password: values.password,
    };

    try {
      const response = await httpRequest.post("/auth/login", credentials);

      setLoading(false);
      dispatch(SET_ACTIVE_USER(response.data.data));
      dispatch(SET_USER_TOKEN(response.data.token));

      if (response && previousURL?.includes("book")) {
        navigate(-1);
        dispatch(SAVE_URL(null));
      } else {
        navigate("/");
      }
    } catch (error: any) {
      setLoading(false);
      errorToast(error?.response?.data.message);
    }
  };

  const registerUser = async (e: FormEvent) => {
    e.preventDefault();
    toast.dismiss();

    if (!values.username || !values.password || !values.email)
      return errorToast("Username, Email and Password are ALL required.");

    if (values.username.length < 5)
      return errorToast("Username should have a minimum of 5 characters.");

    if (values.username && !/^[A-Za-z0-9\s]+$/.test(values.username))
      return errorToast("Your username contains unwanted characters");

    if (!validateEmail(values.email))
      return errorToast("Please enter a valid email format");

    if (values.password.length < 6)
      return errorToast("Password should be at least 6 characters");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", values.username);
      formData.append("email", values.email);
      formData.append("password", values.password);

      const response = await httpRequest.post("/auth/signup", formData);

      if (response) {
        setLoading(false);
        successToast("Account successfully created! Please Login.");
        setAuthState("login");
        setValues(initialState);
      }
    } catch (error: any) {
      setLoading(false);
      errorToast(error.response.data.message);
    }
  };

  useEffect(() => {
    authState === "login"
      ? emailRef.current?.focus()
      : nameRef.current?.focus();
  }, [authState]);

  const handlePasswordVisibility = () => {
    setVisible(!visible);
    if (passwordRef.current?.type === "password") {
      passwordRef.current?.setAttribute("type", "text");
    } else {
      passwordRef.current?.setAttribute("type", "password");
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
            <div
              onClick={() => setAuthState("login")}
              className={authState === "login" ? `${styles.active}` : ""}
            >
              <IoMdLogIn />
              Login
            </div>
            <div
              onClick={() => setAuthState("register")}
              className={authState === "register" ? `${styles.active}` : ""}
            >
              <TbUserPlus /> Register
            </div>
          </div>
          <form onSubmit={authState === "login" ? loginUser : registerUser}>
            {authState === "register" && (
              <label>
                <span>Username</span>
                <div className={styles["auth__icon"]}>
                  <FiUser />
                  <input
                    type="text"
                    name="username"
                    value={values.username}
                    ref={nameRef}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                  />
                </div>
              </label>
            )}
            <br />
            <label>
              <span>
                {authState === "login" ? "Email or Username" : "Email"}
              </span>
              <div className={styles["auth__icon"]}>
                <MdAlternateEmail />
                <input
                  type={authState === "login" ? "text" : "email"}
                  name={authState === "login" ? "emailOrUsername" : "email"}
                  value={
                    authState === "login"
                      ? values.emailOrUsername
                      : values.email
                  }
                  ref={emailRef}
                  onChange={handleInputChange}
                  placeholder={
                    authState === "login"
                      ? "Email or Username"
                      : "Enter your email"
                  }
                />
              </div>
            </label>
            <br />
            <label>
              <span>Password</span>
              <div className={styles["password__visibility__toggler"]}>
                <FiLock />
                <input
                  type="password"
                  name="password"
                  value={values.password}
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

            {/* <Link to="/auth/forgot-password">
              <p style={{ textAlign: "right", margin: ".8rem 0" }}>
                Forgot Password?
              </p>
            </Link> */}

            {authState === "login" && <br />}

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
