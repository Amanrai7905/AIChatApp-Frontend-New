import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const isValidToken =
    typeof token === "string" &&
    token.trim() !== "" &&
    token !== "[object Object]";

  if (!isValidToken) {
    localStorage.removeItem("token");

    return <Navigate to="/" replace state={{ message: "Please login to continue." }} />;
  }

  return children;
}

export default ProtectedRoute;