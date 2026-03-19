import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const COLORS = ["#0a1d14", "#0e4429", "#1a6a3a", "#26a641", "#3ddc72"];

// Fetch real contribution data from GitHub
async function fetchContributions(username) {
  try {
    // Use GitHub Events API to approximate recent activity
    const [eventsRes, userRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}/events?per_page=100`),
      fetch(`https://api.github.com/users/${username}`),
    ]);
    if (!eventsRes.ok) return null;
    const events = await eventsRes.json();
    const user = await userRes.json();

    // Build a 52-week grid from events
    const grid = {};
    const now = new Date();
    events.forEach(e => {
      const d = new Date(e.created_at);
      const key = d.toISOString().split("T")[0];
      grid[key] = (grid[key] || 0) + 1;
    });

    // Build weeks array (last 52 weeks)
    const weeks = [];
    for (let w = 51; w >= 0; w--) {
      const week = [];
      for (let d = 6; d >= 0; d--) {
        const date = new Date(now);
        date.setDate(date.getDate() - (w * 7 + d));
        const key = date.toISOString().split("T")[0];
        const count = grid[key] || 0;
        const level = count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 6 ? 3 : 4;
        week.push({ date: key, count, level });
      }
      weeks.push(week);
    }

    const totalContribs = Object.values(grid).reduce((s, v) => s + v, 0);
    return { weeks, totalContribs, publicRepos: user.public_repos };
  } catch { return null; }
}

export default function ContributionGraph({ githubUsername, fallback = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!githubUsername) return;
    setLoading(true);
    fetchContributions(githubUsername)
      .then(d => setData(d))
      .finally(() => setLoading(false));
  }, [githubUsername]);

  // Fallback random graph if no GitHub
  const getFallbackWeeks = () => {
    return Array.from({ length: 52 }, () =>
      Array.from({ length: 7 }, () => ({ level: Math.floor(Math.random() * 5), count: 0 }))
    );
  };

  const weeks = data?.weeks || (fallback ? getFallbackWeeks() : null);

  if (!githubUsername && !fallback) {
    return (
      <div style={{ padding:"20px", textAlign:"center", background:"rgba(0,255,135,.02)", border:"1px solid rgba(0,255,135,.08)", borderRadius:"10px" }}>
        <p style={{ fontSize:"12px", color:"var(--text3)", fontFamily:"var(--mono)" }}>Connect GitHub to see real contribution data</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display:"flex", alignItems:"center", gap:"10px", padding:"16px" }}>
        <div style={{ width:"18px", height:"18px", border:"2px solid rgba(0,255,135,.2)", borderTopColor:"var(--green)", borderRadius:"50%", animation:"spin 1s linear infinite" }}/>
        <p style={{ fontSize:"12px", color:"var(--text3)", fontFamily:"var(--mono)" }}>Loading contributions from GitHub...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display:"flex", gap:"2px", overflowX:"auto" }}>
        {(weeks || getFallbackWeeks()).map((week, wi) => (
          <div key={wi} style={{ display:"flex", flexDirection:"column", gap:"2px" }}>
            {week.map((day, di) => (
              <motion.div key={di}
                initial={{ opacity:0, scale:.5 }}
                animate={{ opacity:1, scale:1 }}
                transition={{ delay:(wi*7+di)*0.001 }}
                title={day.date ? `${day.date}: ${day.count} contributions` : ""}
                style={{
                  width:"11px", height:"11px", borderRadius:"2px",
                  background: COLORS[day.level],
                  boxShadow: day.level > 2 ? `0 0 4px ${COLORS[day.level]}` : "none",
                  cursor:"pointer", transition:"transform .1s",
                }}
                whileHover={{ scale:1.5 }}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:"6px", marginTop:"8px", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
          <span style={{ fontSize:"11px", color:"var(--text3)", fontFamily:"var(--mono)" }}>Less</span>
          {COLORS.map((c,i) => <div key={i} style={{ width:"11px", height:"11px", borderRadius:"2px", background:c }}/>)}
          <span style={{ fontSize:"11px", color:"var(--text3)", fontFamily:"var(--mono)" }}>More</span>
        </div>
        {data && (
          <span style={{ fontSize:"11px", color:"var(--text3)", fontFamily:"var(--mono)" }}>
            ~{data.totalContribs} recent events
          </span>
        )}
        {!githubUsername && (
          <span style={{ fontSize:"11px", color:"var(--text3)", fontFamily:"var(--mono)" }}>Connect GitHub for real data</span>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
