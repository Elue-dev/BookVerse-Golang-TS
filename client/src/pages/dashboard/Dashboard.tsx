import { ChangeEvent, FormEvent, useRef, useState } from "react";
import {
  getCurrentUser,
  getUserToken,
  REMOVE_ACTIVE_USER,
  SET_ACTIVE_USER,
} from "../../redux/slices/auth.slice";
import { useDispatch, useSelector } from "react-redux";
import { IoMdArrowDropdown } from "react-icons/io";
import { MdOutlineArrowDropUp } from "react-icons/md";
import styles from "./dashboard.module.scss";
import { httpRequest } from "../../services/httpRequest";
import { SERVER_URL } from "../../utils/variables";
import { errorToast, successToast } from "../../utils/alerts";
import { PulseLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { CiLogout } from "react-icons/ci";
import { User } from "../../types/user";
import { RootState } from "../../redux/store";
import UserBooks from "./user_books/Userbooks";
import { toast } from "react-hot-toast";

export default function Dashboard() {
  const currentUser: User | null = useSelector<RootState, User | null>(
    getCurrentUser
  );
  const initialState = {
    username: currentUser?.username,
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
  const [credentials, setCredentials] = useState(initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const token = useSelector(getUserToken);
  const imageRef = useRef<any>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authHeaders = { headers: { authorization: `Bearer ${token}` } };

  const { username, oldPassword, newPassword, confirmPassword } = credentials;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    file && setImage(file);
    file && setImagePreview(URL.createObjectURL(file));
  };

  const updateUserCredentials = async (e: FormEvent) => {
    e.preventDefault();

    if (
      username === currentUser?.username &&
      !image &&
      !newPassword &&
      !oldPassword
    ) {
      return errorToast("You have not made any changes to your credentials");
    }

    if (newPassword !== confirmPassword)
      return errorToast("New password credentials do not match");

    setLoading(true);
    toast.loading("Updating profile...");
    try {
      const formData = new FormData();
      formData.append("username", credentials.username || "");
      formData.append("password", newPassword);
      formData.append("old_password", credentials.oldPassword);
      if (image) {
        formData.append("image", image);
      } else {
        formData.append("image", "");
      }

      const response = await httpRequest.put(
        `${SERVER_URL}/api/users/${currentUser?.id}`,
        formData,
        authHeaders
      );

      if (response) {
        toast.dismiss();
        setLoading(false);
        dispatch(SET_ACTIVE_USER(response.data.data));

        if (newPassword) {
          successToast(
            "Account updated successfully. You changed your password, Please log in again"
          );
          dispatch(REMOVE_ACTIVE_USER());
          navigate("/auth");
        } else {
          successToast("Account has been updated successfully");
        }
      }
    } catch (error: any) {
      setLoading(false);
      toast.dismiss();
      console.log(error);
      errorToast(error.response.data.message);
    }
  };

  const logoutUser = async () => {
    setLogoutLoading(true);
    try {
      dispatch(REMOVE_ACTIVE_USER());
      setLogoutLoading(false);
    } catch (error: any) {
      setLogoutLoading(false);
      errorToast(error.response.data.message);
    }
  };

  return (
    <section className={styles.dashboard}>
      <div className={styles["left__section"]}>
        <div className={styles.card}>
          <p className={styles.logout} onClick={logoutUser}>
            <CiLogout />
            <span>
              {logoutLoading ? (
                <PulseLoader loading={loading} size={10} color={"#fff"} />
              ) : (
                "Log out"
              )}
            </span>
          </p>
          <div>
            <a href={currentUser?.avatar}>
              <img
                src={imagePreview ? imagePreview : currentUser?.avatar}
                alt={currentUser?.username}
              />
            </a>
            <button onClick={() => imageRef?.current?.click()}>
              Change Picture
            </button>
            <input
              type="file"
              onChange={(e) => handleImageChange(e)}
              accept="image/*"
              className={styles["image__upload"]}
              ref={imageRef}
              name="image"
              id="image"
            />
          </div>
          <form onSubmit={updateUserCredentials}>
            <label>
              <span>Username</span>
              <input
                type="text"
                value={username}
                name="username"
                onChange={handleInputChange}
              />
            </label>
            <br />
            <label>
              <span>Email</span>
              <input type="text" value={currentUser?.email} disabled />
            </label>
            <br />
            <div>
              <p
                className={styles["password__reveal"]}
                onClick={() => setShowPassword(!showPassword)}
              >
                Change Password{" "}
                {showPassword ? (
                  <MdOutlineArrowDropUp />
                ) : (
                  <IoMdArrowDropdown />
                )}
              </p>
              {showPassword && (
                <div className={styles["password__sec"]}>
                  <label>
                    <span>Old Password</span>
                    <input
                      type="password"
                      name="oldPassword"
                      value={oldPassword}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    <span>New Password</span>
                    <input
                      type="password"
                      name="newPassword"
                      value={newPassword}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    <span>Confirm New Password</span>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={handleInputChange}
                    />
                  </label>
                </div>
              )}
            </div>

            {loading ? (
              <button type="button" disabled>
                <PulseLoader loading={loading} size={10} color={"#746ab0"} />
              </button>
            ) : (
              <button type="submit" className={styles.submit}>
                Update Credentials
              </button>
            )}
          </form>
        </div>
      </div>
      <div className={styles["right__section"]}>
        <UserBooks currentUser={currentUser} />
      </div>
    </section>
  );
}
