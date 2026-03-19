import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
export default function ProtectedRoute({ children }) {
  const user = useSelector(s => s.user);
  return user ? children : <Navigate to="/login" replace />;
}
