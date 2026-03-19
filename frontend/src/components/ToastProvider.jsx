import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";
const Ctx = createContext(null);
const S = {
  success:{bg:"rgba(0,255,135,0.1)",border:"rgba(0,255,135,0.3)",color:"#00ff87",Icon:CheckCircle},
  error:{bg:"rgba(239,68,68,0.1)",border:"rgba(239,68,68,0.3)",color:"#f87171",Icon:XCircle},
  info:{bg:"rgba(56,189,248,0.1)",border:"rgba(56,189,248,0.3)",color:"#38bdf8",Icon:Info},
  warning:{bg:"rgba(251,146,60,0.1)",border:"rgba(251,146,60,0.3)",color:"#fb923c",Icon:AlertTriangle},
};
export function ToastProvider({children}){
  const [toasts,setToasts]=useState([]);
  const toast=useCallback((msg,type="info",ms=3500)=>{
    const id=Date.now();
    setToasts(p=>[...p,{id,msg,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),ms);
  },[]);
  const dismiss=id=>setToasts(p=>p.filter(t=>t.id!==id));
  return(
    <Ctx.Provider value={toast}>
      {children}
      <div style={{position:"fixed",top:"80px",right:"20px",zIndex:9999,display:"flex",flexDirection:"column",gap:"8px",pointerEvents:"none"}}>
        <AnimatePresence>
          {toasts.map(t=>{
            const{bg,border,color,Icon}=S[t.type]||S.info;
            return(
              <motion.div key={t.id} initial={{opacity:0,x:60}} animate={{opacity:1,x:0}} exit={{opacity:0,x:60}}
                style={{display:"flex",alignItems:"center",gap:"10px",padding:"12px 16px",borderRadius:"12px",background:bg,border:`1px solid ${border}`,backdropFilter:"blur(16px)",minWidth:"280px",maxWidth:"380px",pointerEvents:"all",cursor:"pointer"}}
                onClick={()=>dismiss(t.id)}>
                <Icon size={15} color={color}/>
                <span style={{fontSize:"13px",color:"var(--text)",flex:1}}>{t.msg}</span>
                <X size={12} color="var(--text3)"/>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
export const useToast=()=>useContext(Ctx);
