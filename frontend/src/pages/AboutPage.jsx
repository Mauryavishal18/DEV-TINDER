import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Users, Code, MessageSquare, Bot, Star, ArrowRight, CheckCircle, Github, Layers, Shield } from "lucide-react";

const Step = ({ num, title, desc }) => (
  <motion.div initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ delay: num*0.1 }}
    style={{ display:"flex", gap:"16px", alignItems:"start", padding:"20px", background:"rgba(0,255,135,0.03)", border:"1px solid rgba(0,255,135,0.1)", borderRadius:"12px" }}>
    <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:"var(--green)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--mono)", fontWeight:700, fontSize:"14px", color:"#040d08", flexShrink:0, boxShadow:"0 0 12px rgba(0,255,135,0.4)" }}>{num}</div>
    <div>
      <h3 style={{ fontSize:"15px", fontWeight:700, color:"var(--text)", marginBottom:"6px" }}>{title}</h3>
      <p style={{ fontSize:"13px", color:"var(--text2)", lineHeight:1.6 }}>{desc}</p>
    </div>
  </motion.div>
);

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

export default function AboutPage() {
  return (
    <div style={{ background:"var(--bg)", minHeight:"100vh", position:"relative" }}>
      <div style={{ height:"1px", background:"linear-gradient(90deg,transparent,rgba(0,255,135,0.5),transparent)" }}/>

      {/* Navbar-like header */}
      <nav style={{ background:"rgba(4,13,8,0.97)", backdropFilter:"blur(24px)", borderBottom:"1px solid rgba(0,255,135,0.1)", padding:"0 24px", height:"62px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <Link to="/" style={{ display:"flex", alignItems:"center", gap:"10px", textDecoration:"none" }}>
          <div style={{ width:"36px", height:"36px", borderRadius:"10px", background:"var(--green)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 20px rgba(0,255,135,0.4)" }}><Zap size={17} color="#040d08" fill="#040d08"/></div>
          <span style={{ fontSize:"15px", fontWeight:700, letterSpacing:"2px", color:"var(--text)", fontFamily:"var(--mono)" }}>DEV<span style={{ color:"var(--green)" }}>TINDER</span></span>
        </Link>
        <div style={{ display:"flex", gap:"12px" }}>
          <Link to="/login" style={{ padding:"8px 18px", borderRadius:"8px", fontSize:"12px", color:"var(--text2)", textDecoration:"none", border:"1px solid rgba(0,255,135,0.15)" }}>Sign In</Link>
          <Link to="/signup" style={{ padding:"8px 18px", borderRadius:"8px", fontSize:"12px", color:"#040d08", background:"var(--green)", textDecoration:"none", fontWeight:700 }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth:"1100px", margin:"0 auto", padding:"80px 24px 60px", textAlign:"center", position:"relative", zIndex:1 }}>
        <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:"600px", height:"400px", background:"radial-gradient(ellipse, rgba(0,255,135,0.08) 0%, transparent 70%)", pointerEvents:"none" }}/>
        <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}>
          <span style={{ display:"inline-flex", alignItems:"center", gap:"6px", padding:"6px 16px", borderRadius:"20px", background:"rgba(0,255,135,0.08)", border:"1px solid rgba(0,255,135,0.2)", fontSize:"12px", color:"var(--green)", fontFamily:"var(--mono)", marginBottom:"24px" }}>
            ✦ Professional Developer Platform
          </span>
        </motion.div>
        <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }}
          style={{ fontSize:"clamp(32px,6vw,64px)", fontWeight:700, color:"var(--text)", lineHeight:1.2, marginBottom:"24px" }}>
          Where Developers<br/><span style={{ color:"var(--green)", textShadow:"0 0 40px rgba(0,255,135,0.4)" }}>Find Their Match</span>
        </motion.h1>
        <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.2 }}
          style={{ fontSize:"18px", color:"var(--text2)", maxWidth:"600px", margin:"0 auto 36px", lineHeight:1.7 }}>
          DevTinder is a professional collaboration platform where developers discover each other based on tech stack, connect, and build extraordinary projects together.
        </motion.p>
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.3 }} style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap" }}>
          <Link to="/signup">
            <button className="btn-prime" style={{ padding:"14px 32px", fontSize:"15px", display:"flex", alignItems:"center", gap:"8px" }}>
              Start for Free <ArrowRight size={16}/>
            </button>
          </Link>
          <Link to="/login">
            <button className="btn-sec" style={{ padding:"14px 32px", fontSize:"15px" }}>Sign In</button>
          </Link>
        </motion.div>
      </section>

      {/* What is DevTinder */}
      <section style={{ maxWidth:"1100px", margin:"0 auto", padding:"40px 24px 60px" }}>
        <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
          style={{ padding:"40px", background:"rgba(7,21,16,0.85)", border:"1px solid rgba(0,255,135,0.15)", borderRadius:"20px", marginBottom:"60px" }}>
          <h2 style={{ fontSize:"28px", fontWeight:700, color:"var(--text)", marginBottom:"16px" }}>
            What is <span style={{ color:"var(--green)" }}>DevTinder?</span>
          </h2>
          <p style={{ fontSize:"15px", color:"var(--text2)", lineHeight:1.8, marginBottom:"16px" }}>
            DevTinder is a <strong style={{ color:"var(--text)" }}>professional developer matchmaking platform</strong> — think LinkedIn meets Tinder, but exclusively for developers who want to collaborate on projects.
          </p>
          <p style={{ fontSize:"15px", color:"var(--text2)", lineHeight:1.8, marginBottom:"16px" }}>
            Whether you are a <strong style={{ color:"var(--green)" }}>frontend developer</strong> looking for a backend partner, an <strong style={{ color:"var(--green)" }}>ML engineer</strong> who needs a React developer for their dashboard, or a <strong style={{ color:"var(--green)" }}>student</strong> wanting to work on open-source projects — DevTinder helps you find the right collaborator.
          </p>
          <p style={{ fontSize:"15px", color:"var(--text2)", lineHeight:1.8 }}>
            Simply create your profile, add your tech stack, connect your GitHub and LeetCode profiles to showcase real stats, and start matching with developers whose skills complement yours!
          </p>
        </motion.div>

        {/* Features grid */}
        <h2 style={{ fontSize:"28px", fontWeight:700, color:"var(--text)", textAlign:"center", marginBottom:"8px" }}>
          Everything You <span style={{ color:"var(--green)" }}>Need</span>
        </h2>
        <p style={{ fontSize:"14px", color:"var(--text2)", textAlign:"center", marginBottom:"36px" }}>Built for developers, by a developer</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:"16px", marginBottom:"60px" }}>
          <Feature icon={<Users size={20} color="var(--green)"/>} title="Smart Matching" desc="Match with developers based on tech stack compatibility. Find people who complement your skills, not just duplicate them."/>
          <Feature icon={<Github size={20} color="var(--green)"/>} title="Real GitHub Stats" desc="Connect your GitHub to show real repos, stars, contribution graphs, and your most used languages — no fake numbers."/>
          <Feature icon={<Code size={20} color="var(--green)"/>} title="LeetCode Integration" desc="Show off your problem-solving skills with real LeetCode stats — total solved, Easy/Medium/Hard breakdown, and global ranking."/>
          <Feature icon={<MessageSquare size={20} color="var(--green)"/>} title="Real-time Chat" desc="Chat with your connections in real-time with Socket.io. Share code snippets with syntax highlighting directly in the chat."/>
          <Feature icon={<Bot size={20} color="var(--green)"/>} title="Dev AI Assistant" desc="Get instant help from our AI assistant powered by Groq (Llama 3). Ask about code reviews, system design, or career advice."/>
          <Feature icon={<Shield size={20} color="var(--green)"/>} title="Secure & Private" desc="JWT authentication, bcrypt password hashing, rate limiting, and Helmet.js security headers keep your account safe."/>
          <Feature icon={<Layers size={20} color="var(--green)"/>} title="Developer Portfolio" desc="Your profile is a public portfolio showing your skills, contribution graph, platforms, and endorsements from other developers."/>
          <Feature icon={<Star size={20} color="var(--green)"/>} title="Endorsements" desc="Get endorsed by developers you have collaborated with. Real reviews build real reputation in the developer community."/>
        </div>

        {/* How to use */}
        <h2 style={{ fontSize:"28px", fontWeight:700, color:"var(--text)", textAlign:"center", marginBottom:"8px" }}>
          How to <span style={{ color:"var(--green)" }}>Get Started</span>
        </h2>
        <p style={{ fontSize:"14px", color:"var(--text2)", textAlign:"center", marginBottom:"36px" }}>Up and running in 5 minutes</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:"12px", maxWidth:"700px", margin:"0 auto 60px" }}>
          <Step num={1} title="Create your account" desc="Sign up with your email. Pick an avatar or upload your own photo. Fill in your basic developer profile info."/>
          <Step num={2} title="Add your tech stack" desc="Select the technologies you work with from our comprehensive list — React, Node.js, Python, Go, Docker, AWS, and 15+ more."/>
          <Step num={3} title="Connect your profiles" desc="Link your GitHub to show real stats and your contribution graph. Add LeetCode to display your problem-solving skills."/>
          <Step num={4} title="Explore the feed" desc="Browse developer profiles. Click 'Connect' to send a connection request, or 'Pass' to move to the next developer."/>
          <Step num={5} title="Start collaborating!" desc="When two developers both Connect with each other, it is a MATCH! You can then chat in real-time and start building together."/>
          <Step num={6} title="Use Dev AI anytime" desc="Stuck on a problem? Ask our AI assistant for code reviews, debugging help, system design advice, or FAANG interview prep."/>
        </div>

        {/* Tech stack */}
        <div style={{ padding:"32px", background:"rgba(7,21,16,0.85)", border:"1px solid rgba(0,255,135,0.15)", borderRadius:"20px", textAlign:"center", marginBottom:"60px" }}>
          <h3 style={{ fontSize:"20px", fontWeight:700, color:"var(--text)", marginBottom:"8px" }}>Built with Modern Tech</h3>
          <p style={{ fontSize:"13px", color:"var(--text2)", marginBottom:"20px" }}>Production-level full-stack application</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"10px", justifyContent:"center" }}>
            {["React 18","Vite","Tailwind CSS","Framer Motion","Redux Toolkit","Node.js","Express","MongoDB","Socket.io","JWT Auth","Groq AI","Helmet"].map(t => (
              <span key={t} style={{ padding:"6px 14px", borderRadius:"8px", fontSize:"12px", background:"rgba(0,255,135,0.06)", border:"1px solid rgba(0,255,135,0.15)", color:"var(--text2)", fontFamily:"var(--mono)" }}>{t}</span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          style={{ textAlign:"center", padding:"60px 40px", background:"linear-gradient(135deg, rgba(0,255,135,0.05), rgba(0,255,135,0.02))", border:"1px solid rgba(0,255,135,0.2)", borderRadius:"24px" }}>
          <h2 style={{ fontSize:"32px", fontWeight:700, color:"var(--text)", marginBottom:"12px" }}>
            Ready to Find Your <span style={{ color:"var(--green)" }}>Dev Match?</span>
          </h2>
          <p style={{ fontSize:"15px", color:"var(--text2)", marginBottom:"28px" }}>Join DevTinder today. Free forever.</p>
          <Link to="/signup">
            <button className="btn-prime" style={{ padding:"15px 40px", fontSize:"16px", display:"inline-flex", alignItems:"center", gap:"10px" }}>
              <Zap size={18} fill="#040d08"/> Get Started Free
            </button>
          </Link>
          <p style={{ fontSize:"12px", color:"var(--text3)", marginTop:"16px", fontFamily:"var(--mono)" }}>
            No credit card required · Completely free · Built by{" "}
            <a href="https://github.com/Mauryavishal18" target="_blank" rel="noreferrer" style={{ color:"var(--green)", textDecoration:"none" }}>Vishal Maurya</a>
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop:"1px solid rgba(0,255,135,0.08)", padding:"20px 24px", textAlign:"center" }}>
        <p style={{ fontSize:"12px", color:"var(--text3)", fontFamily:"var(--mono)" }}>
          © 2024 DevTinder · Built with ♥ by <a href="https://github.com/Mauryavishal18" target="_blank" rel="noreferrer" style={{ color:"var(--green)", textDecoration:"none" }}>Vishal Maurya</a>
        </p>
      </footer>
    </div>
  );
}
