import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { token } = useContext(AuthContext);

  if (!token) {
    // Om användaren inte är inloggad, skicka till login
    return <Navigate to="/login" replace />;
  }

  return children; // Visa skyddad komponent
};

export default ProtectedRoute;
