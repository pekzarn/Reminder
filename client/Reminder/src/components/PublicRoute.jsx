import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PublicRoute = ({ children }) => {
  const { token } = useContext(AuthContext);

  if (token) {
    // If user is logged in, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children; // Show public component
};

export default PublicRoute;
