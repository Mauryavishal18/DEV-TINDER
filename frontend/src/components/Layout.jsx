import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import useAuth from "../hooks/useAuth";
export default function Layout() {
  const { loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"var(--bg)", gap:"16px" }}>
      <motion.div animate={{ scale:[1,1.1,1], boxShadow:["0 0 20px rgba(0,255,135,0.3)","0 0 40px rgba(0,255,135,0.6)","0 0 20px rgba(0,255,135,0.3)"] }} transition={{ duration:1.5, repeat:Infinity }}
        style={{ width:"52px", height:"52px", borderRadius:"14px", background:"var(--green)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Zap size={22} color="#040d08" fill="#040d08"/>
      </motion.div>
      <p style={{ fontSize:"12px", color:"var(--text3)", fontFamily:"var(--mono)", letterSpacing:"2px" }}>LOADING...</p>
    </div>
  );
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ minHeight:"100vh", display:"flex", flexDirection:"column", position:"relative", zIndex:1 }}>
      <div style={{ position:"fixed", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0 }}>
        {[8,18,30,55,70,82,93].map((l,i)=>(
          <div key={i} style={{ position:"absolute", width:"2px", height:"2px", borderRadius:"50%", background:"var(--green)", left:`${l}%`, top:`${65+i*5}%`, animation:`float ${9+i}s ${i*.8}s ease-in-out infinite` }}/>
        ))}
      </div>
      <Navbar/>
      <main style={{ flex:1, position:"relative", zIndex:1 }}><Outlet/></main>
      <Footer/>
    </motion.div>
  );
}
