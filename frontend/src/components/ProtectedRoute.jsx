import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const { loading } = useAuth();
  const user = useSelector(s => s.user);

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"var(--bg)", gap:"16px" }}>
      <motion.div animate={{ scale:[1,1.1,1], boxShadow:["0 0 20px rgba(0,255,135,.3)","0 0 40px rgba(0,255,135,.6)","0 0 20px rgba(0,255,135,.3)"] }} transition={{ duration:1.5, repeat:Infinity }}
        style={{ width:"52px", height:"52px", borderRadius:"14px", background:"var(--green)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Zap size={22} color="#040d08" fill="#040d08"/>
      </motion.div>
      <p style={{ fontSize:"12px", color:"var(--text3)", fontFamily:"var(--mono)", letterSpacing:"2px" }}>LOADING...</p>
    </div>
  );

  return user ? children : <Navigate to="/login" replace />;
}
