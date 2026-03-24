import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Calendar, MapPin, Users, Trophy, RefreshCw } from "lucide-react";

// Devpost public RSS → CORS proxy → parse
// Using a curated list + Devpost search
const HACKATHONS = [
  { id:1, name:"Google Solution Challenge 2025", org:"Google", deadline:"March 31, 2025", prize:"$3,000 + Google perks", tags:["AI","Cloud","Mobile"], location:"Online", url:"https://developers.google.com/community/gdsc-solution-challenge", type:"Online", participants:"10,000+" },
  { id:2, name:"GitHub Universe Hackathon", org:"GitHub", deadline:"Ongoing", prize:"GitHub swag + $5,000", tags:["Open Source","AI","DevTools"], location:"Online", url:"https://github.com", type:"Online", participants:"5,000+" },
  { id:3, name:"MLH Local Hack Day", org:"Major League Hacking", deadline:"Monthly", prize:"Mentorship + Prizes", tags:["All Tech","Beginner Friendly"], location:"Online + In-person", url:"https://mlh.io", type:"Hybrid", participants:"Unlimited" },
  { id:4, name:"HackMIT", org:"MIT", deadline:"Application based", prize:"$10,000+", tags:["AI","Hardware","Software"], location:"Cambridge, MA", url:"https://hackmit.org", type:"In-person", participants:"1,000" },
  { id:5, name:"Devpost Hackathons", org:"Devpost", deadline:"Various", prize:"Various", tags:["All Tech"], location:"Online", url:"https://devpost.com/hackathons", type:"Online", participants:"Millions" },
  { id:6, name:"Hack the North", org:"University of Waterloo", deadline:"Application based", prize:"$25,000+", tags:["AI","Web","Mobile"], location:"Waterloo, Canada", url:"https://hackthenorth.com", type:"In-person", participants:"1,000" },
  { id:7, name:"ETHGlobal Hackathons", org:"ETHGlobal", deadline:"Ongoing", prize:"$1M+ distributed", tags:["Web3","DeFi","Ethereum"], location:"Online + In-person", url:"https://ethglobal.com", type:"Hybrid", participants:"5,000+" },
  { id:8, name:"AngelHack Global", org:"AngelHack", deadline:"Various", prize:"$100,000+", tags:["Startup","AI","FinTech"], location:"Online", url:"https://angelhack.com", type:"Online", participants:"10,000+" },
  { id:9, name:"Codeforces Rounds", org:"Codeforces", deadline:"Weekly", prize:"Rating + Prizes", tags:["Competitive Programming","Algorithms"], location:"Online", url:"https://codeforces.com/contests", type:"Online", participants:"Unlimited" },
  { id:10, name:"Smart India Hackathon", org:"Govt. of India", deadline:"Seasonal", prize:"₹1,00,000+", tags:["GovTech","AI","Social Impact"], location:"India", url:"https://sih.gov.in", type:"In-person", participants:"100,000+" },
];

const typeColors = { "Online":"tag-g", "In-person":"tag-b", "Hybrid":"tag-p" };

export default function HackathonPage() {
  const [filter, setFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = HACKATHONS.filter(h=>{
    const q = filter.toLowerCase();
    const match = !q || h.name.toLowerCase().includes(q) || h.tags?.some(t=>t.toLowerCase().includes(q)) || h.org.toLowerCase().includes(q);
    const tMatch = typeFilter==="all" || h.type.toLowerCase().includes(typeFilter.toLowerCase());
    return match && tMatch;
  });

  return (
    <div style={{ maxWidth:"1000px", margin:"0 auto", padding:"36px 28px" }}>
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:"28px" }}>
        <h1 style={{ fontSize:"28px", fontWeight:700, color:"var(--text)", marginBottom:"6px" }}>
          Hackathon <span style={{ color:"var(--green)" }}>Finder</span>
        </h1>
        <p style={{ fontSize:"14px", color:"var(--text2)" }}>Find your next hackathon — form teams with DevTinder connections</p>
      </motion.div>

      <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", marginBottom:"20px" }}>
        <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Search by name, skill, or organizer..." className="inp" style={{ maxWidth:"360px" }}/>
        {["all","Online","In-person","Hybrid"].map(t=>(
          <button key={t} onClick={()=>setTypeFilter(t)} className={typeFilter===t?"btn-prime":"btn-sec"} style={{ padding:"9px 16px", fontSize:"12px" }}>{t}</button>
        ))}
      </div>

      <p style={{ fontSize:"13px", color:"var(--text3)", marginBottom:"14px", fontFamily:"var(--mono)" }}>{filtered.length} hackathons found</p>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"14px" }}>
        {filtered.map((h,i)=>(
          <motion.div key={h.id} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*.04 }}
            className="glass" style={{ padding:"20px", display:"flex", flexDirection:"column", gap:"10px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"start" }}>
              <span className={typeColors[h.type]||"tag-n"} style={{ fontSize:"10px" }}>{h.type}</span>
              <Trophy size={16} color="#f59e0b"/>
            </div>
            <div>
              <h3 style={{ fontSize:"15px", fontWeight:700, color:"var(--text)", marginBottom:"4px" }}>{h.name}</h3>
              <p style={{ fontSize:"12px", color:"var(--green)", fontWeight:600 }}>{h.org}</p>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"5px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                <Calendar size={11} color="var(--text3)"/>
                <span style={{ fontSize:"11px", color:"var(--text3)" }}>Deadline: {h.deadline}</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                <MapPin size={11} color="var(--text3)"/>
                <span style={{ fontSize:"11px", color:"var(--text3)" }}>{h.location}</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                <Users size={11} color="var(--text3)"/>
                <span style={{ fontSize:"11px", color:"var(--text3)" }}>{h.participants} participants</span>
              </div>
            </div>
            <div style={{ padding:"8px 12px", background:"rgba(245,158,11,.08)", border:"1px solid rgba(245,158,11,.2)", borderRadius:"8px" }}>
              <p style={{ fontSize:"12px", color:"#f59e0b", fontWeight:600 }}>💰 {h.prize}</p>
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"5px" }}>
              {h.tags.map(t=><span key={t} className="tag-n" style={{ fontSize:"10px" }}>{t}</span>)}
            </div>
            <a href={h.url} target="_blank" rel="noreferrer" style={{ textDecoration:"none", marginTop:"auto" }}>
              <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:.97 }} className="btn-prime"
                style={{ width:"100%", padding:"10px", fontSize:"12px", display:"flex", alignItems:"center", justifyContent:"center", gap:"6px" }}>
                Register / Learn More <ExternalLink size={11}/>
              </motion.button>
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
