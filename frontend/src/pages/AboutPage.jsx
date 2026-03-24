import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Users, Code, MessageSquare, Bot, Star, ArrowRight, Trophy, Briefcase, FileText, Video, Bell, BarChart2 } from "lucide-react";

const Feature = ({ icon, title, desc }) => (
  <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
    style={{ padding:"24px", background:"rgba(7,21,16,0.85)", border:"1px solid rgba(0,255,135,0.1)", borderRadius:"16px", transition:"all .3s" }}
    onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(0,255,135,0.3)";e.currentTarget.style.transform="translateY(-4px)"}}
    onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(0,255,135,0.1)";e.currentTarget.style.transform="none"}}>
    <div style={{ width:"44px", height:"44px", borderRadius:"12px", background:"rgba(0,255,135,0.1)", border:"1px solid rgba(0,255,135,0.2)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"14px" }}>
      {icon}
    </div>
    <h3 style={{ fontSize:"15px", fontWeight:700, color:"var(--text)", marginBottom:"8px" }}>{title}</h3>
    <p style={{ fontSize:"13px", color:"var(--text2)", lineHeight:1.6 }}>{desc}</p>
  </motion.div>
);

const Step = ({ num, title, desc }) => (
  <motion.div initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ delay:num*0.1 }}
    style={{ display:"flex", gap:"16px", alignItems:"start", padding:"20px", background:"rgba(0,255,135,0.03)", border:"1px solid rgba(0,255,135,0.1)", borderRadius:"12px" }}>
    <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:"var(--green)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--mono)", fontWeight:700, fontSize:"14px", color:"#040d08", flexShrink:0, boxShadow:"0 0 12px rgba(0,255,135,0.4)" }}>{num}</div>
    <div>
      <h3 style={{ fontSize:"15px", fontWeight:700, color:"var(--text)", marginBottom:"6px" }}>{title}</h3>
      <p style={{ fontSize:"13px", color:"var(--text2)", lineHeight:1.6 }}>{desc}</p>
    </div>
  </motion.div>
);

export default function AboutPage() {
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      {/* Hero */}
      <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"80px 28px 60px", textAlign:"center", position:"relative" }}>
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"600px", height:"400px", background:"radial-gradient(ellipse, rgba(0,255,135,0.06) 0%, transparent 70%)", pointerEvents:"none" }}/>
        <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:"8px", padding:"6px 16px", borderRadius:"20px", background:"rgba(0,255,135,0.08)", border:"1px solid rgba(0,255,135,0.2)", fontSize:"12px", color:"var(--green)", fontFamily:"var(--mono)", marginBottom:"20px", letterSpacing:"1px" }}>
            <Zap size={12} fill="var(--green)"/> DEV-TINDER
          </div>
          <h1 style={{ fontSize:"clamp(36px,6vw,64px)", fontWeight:800, color:"var(--text)", marginBottom:"20px", lineHeight:1.1 }}>
            Where Developers<br/><span style={{ color:"var(--green)", textShadow:"0 0 40px rgba(0,255,135,0.4)" }}>Find Each Other</span>
          </h1>
          <p style={{ fontSize:"18px", color:"var(--text2)", maxWidth:"600px", margin:"0 auto 32px", lineHeight:1.7 }}>
            The most advanced developer collaboration platform — with real GitHub stats, LeetCode rankings, AI code review, live chat, video calls, and much more. 
          </p>
          <div style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap" }}>
            <Link to="/signup">
              <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.97 }} className="btn-prime" style={{ padding:"14px 32px", fontSize:"15px", display:"flex", alignItems:"center", gap:"8px" }}>
                Get Started Free <ArrowRight size={16}/>
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.97 }} className="btn-sec" style={{ padding:"14px 32px", fontSize:"15px" }}>
                Sign In
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.3 }}
          style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"16px", marginTop:"60px", maxWidth:"700px", margin:"60px auto 0" }}>
          {[
            { n:"100%", l:"Free to use" },
            { n:"12+", l:"Unique features" },
            { n:"Real", l:"GitHub & LeetCode data" },
            { n:"AI", l:"Powered by Groq Llama 3" },
          ].map(s=>(
            <div key={s.l} style={{ textAlign:"center" }}>
              <div style={{ fontSize:"28px", fontWeight:800, color:"var(--green)", fontFamily:"var(--mono)", textShadow:"0 0 20px rgba(0,255,135,0.3)" }}>{s.n}</div>
              <div style={{ fontSize:"12px", color:"var(--text3)", marginTop:"4px" }}>{s.l}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Features grid */}
      <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"0 28px 80px" }}>
        <motion.h2 initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
          style={{ fontSize:"32px", fontWeight:800, color:"var(--text)", textAlign:"center", marginBottom:"12px" }}>
          Everything You Need
        </motion.h2>
        <p style={{ fontSize:"15px", color:"var(--text2)", textAlign:"center", marginBottom:"40px" }}>12 powerful features built into one platform</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"16px", marginBottom:"60px" }}>
          <Feature icon={<Users size={20} color="var(--green)"/>} title="Developer Matching" desc="Swipe through developers matched by your tech stack. Connect with React devs, backend engineers, ML experts and more."/>
          <Feature icon={<MessageSquare size={20} color="#a78bfa"/>} title="Real-time Chat" desc="Socket.io powered live chat. Share code snippets with syntax highlighting, send images, and collaborate instantly."/>
          <Feature icon={<Video size={20} color="#38bdf8"/>} title="Video Calls (WebRTC)" desc="1-on-1 video calls with your connections. Pair program, do mock interviews, or just hang out — no third-party app needed."/>
          <Feature icon={<Bot size={20} color="#a78bfa"/>} title="Dev AI Assistant" desc="Groq Llama 3 powered AI — completely free. Code reviews, debugging help, system design, FAANG prep. 14,400 requests/day free."/>
          <Feature icon={<Code size={20} color="var(--green)"/>} title="AI Code Review" desc="Paste any code for instant expert review. Find bugs, security issues, performance problems, and get an improved version."/>
          <Feature icon={<Trophy size={20} color="#f59e0b"/>} title="Dev Score Leaderboard" desc="Auto-calculated score from GitHub stars, repos, LeetCode rank, and profile completeness. Compete globally."/>
          <Feature icon={<BarChart2 size={20} color="#fb923c"/>} title="Profile Analytics" desc="See exactly who viewed your profile, when, and track your view trends over 30 days. Know your reach."/>
          <Feature icon={<Briefcase size={20} color="#22c55e"/>} title="Project Collab Board" desc="Post 'I'm building X, need a React dev'. Find co-founders and collaborators like YC co-founder matching."/>
          <Feature icon={<FileText size={20} color="#38bdf8"/>} title="Resume Builder" desc="Auto-generate a professional PDF resume from your DevTinder profile. One click download with AI-written summary."/>
          <Feature icon={<Star size={20} color="#f59e0b"/>} title="Hackathon Finder" desc="Browse upcoming hackathons, prizes, and deadlines. Form teams directly with your DevTinder connections."/>
          <Feature icon={<Briefcase size={20} color="#a78bfa"/>} title="Remote Job Board" desc="Live remote developer jobs from Remotive API. Jobs automatically filtered and highlighted based on your tech stack."/>
          <Feature icon={<Bell size={20} color="#fb923c"/>} title="Real-time Notifications" desc="Live notifications for matches, messages, profile views, endorsements, and collab applications via Socket.io."/>
        </div>

        {/* How it works */}
        <motion.h2 initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
          style={{ fontSize:"32px", fontWeight:800, color:"var(--text)", textAlign:"center", marginBottom:"32px" }}>
          Get Started in Minutes
        </motion.h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"12px", marginBottom:"60px" }}>
          <Step num={1} title="Create Your Profile" desc="Sign up with email, add your skills, bio, GitHub and LeetCode username. Takes under 2 minutes."/>
          <Step num={2} title="Connect Your Platforms" desc="Link GitHub and LeetCode to fetch real stats — repos, stars, problems solved, global ranking. Data saves permanently."/>
          <Step num={3} title="Explore Developers" desc="Browse developer cards filtered by tech stack. Send connection requests and match with your ideal collaborator."/>
          <Step num={4} title="Chat & Collaborate" desc="Message connections in real-time, share code, jump on a video call, or apply to each other's projects on the Collab Board."/>
          <Step num={5} title="Level Up Your Profile" desc="AI Code Review improves your skills. Resume Builder creates your CV. Analytics shows who's viewing your profile."/>
          <Step num={6} title="Find Opportunities" desc="Browse real remote jobs filtered to your stack. Find hackathons to join. Build your Dev Score and rank globally."/>
        </div>

        {/* Tech stack */}
        <div className="glass" style={{ padding:"32px", textAlign:"center", marginBottom:"40px" }}>
          <h3 style={{ fontSize:"18px", fontWeight:700, color:"var(--text)", marginBottom:"16px" }}>Built With</h3>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"10px", justifyContent:"center" }}>
            {["React 18","Node.js","Express","MongoDB","Socket.io","Groq AI","WebRTC","Vite","Redux","JWT","Nodemailer","Multer"].map(t=>(
              <span key={t} style={{ padding:"6px 14px", borderRadius:"20px", background:"rgba(0,255,135,0.06)", border:"1px solid rgba(0,255,135,0.15)", fontSize:"12px", color:"var(--green)", fontFamily:"var(--mono)" }}>{t}</span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign:"center" }}>
          <Link to="/signup">
            <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.97 }} className="btn-prime" style={{ padding:"16px 48px", fontSize:"16px", display:"inline-flex", alignItems:"center", gap:"10px" }}>
              <Zap size={18} fill="#040d08"/> Start Building Your Network
            </motion.button>
          </Link>
          <p style={{ fontSize:"13px", color:"var(--text3)", marginTop:"14px" }}>
            100% free · No credit card · Built by{" "}
            <a href="https://github.com/Mauryavishal18" target="_blank" rel="noreferrer" style={{ color:"var(--green)", textDecoration:"none", fontWeight:600 }}>Vishal Maurya</a>
          </p>
        </div>
      </div>
    </div>
  );
}
