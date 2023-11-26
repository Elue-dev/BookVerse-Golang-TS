import { ReactNode } from "react";
import { selectIsLoggedIn } from "../../redux/slices/auth.slice";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function Unauthenticated({ children }: { children: ReactNode }) {
  const isLoggedIn = useSelector(selectIsLoggedIn);

  if (isLoggedIn) {
    return <Navigate to="/" />;
  }

  return children;
}
