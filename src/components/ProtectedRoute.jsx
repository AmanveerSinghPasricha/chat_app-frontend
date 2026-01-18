import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token");

  // If not logged in, redirect
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, allow page
  return children;
}
