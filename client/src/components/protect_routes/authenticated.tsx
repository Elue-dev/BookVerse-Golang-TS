import { selectIsLoggedIn } from "../../redux/slices/auth.slice";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ReactNode } from "react";

export default function Authenticated({ children }: { children: ReactNode }) {
  const isLoggedIn = useSelector(selectIsLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to="/auth" />;
  }

  return children;
}
