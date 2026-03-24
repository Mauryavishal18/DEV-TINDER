import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const COLORS = ["#0a1d14", "#0e4429", "#1a6a3a", "#26a641", "#3ddc72"];

async function fetchRealContributions(username) {
  try {
    // Use GitHub's contribution calendar via a free proxy API for full year data
    // This gives all 365 days unlike events API (only last 90 events)
    const [calRes, userRes] = await Promise.all([
      fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`),
      fetch(`https://api.github.com/users/${username}`),
    ]);

    const userData = userRes.ok ? await userRes.json() : {};
    
    if (!calRes.ok) throw new Error("Could not fetch contributions");
    const calData = await calRes.json();

    // calData.contributions = [{ date, count, level }, ...]
    const contributions = calData.contributions || [];
    const now = new Date();

    // Build grid from real data
    const grid = {};
    contributions.forEach(c => { grid[c.date] = c.count; });

    // Build 52-week grid
    const weeks = [];
    for (let w = 51; w >= 0; w--) {
      const week = [];
      for (let d = 6; d >= 0; d--) {
        const date = new Date(now);
        date.setDate(date.getDate() - (w * 7 + d));
        const key = date.toISOString().split("T")[0];
        const count = grid[key] || 0;
        let level = 0;
        if (count > 0) level = 1;
        if (count >= 3) level = 2;
        if (count >= 6) level = 3;
        if (count >= 10) level = 4;
        week.push({ date: key, count, level });
      }
      weeks.push(week);
    }

    const totalCommits = contributions.reduce((a, c) => a + c.count, 0);

    // Calculate streak
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      if (grid[key] > 0) streak++;
      else if (i > 0) break;
    }

    return { weeks, totalCommits, streak, username, name: userData.name || username };
  } catch (err) {
    console.error("Contribution fetch error:", err);
    return null;
  }
}

export default function ContributionGraph({ githubUsername }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    if (!githubUsername) return;
    setLoading(true);
    fetchRealContributions(githubUsername)
      .then(setData)
      .finally(() => setLoading(false));
  }, [githubUsername]);

  if (!githubUsername) {
    return (
      <div>
        <div style={{ display: "flex", gap: "2px", overflowX: "auto", opacity: 0.25 }}>
          {Array.from({ length: 52 }, (_, w) => (
            <div key={w} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {Array.from({ length: 7 }, (_, d) => (
                <div key={d} className="csq" style={{ background: COLORS[0] }} />
              ))}
            </div>
          ))}
        </div>
        <p style={{ fontSize: "11px", color: "var(--text3)", marginTop: "10px", fontFamily: "var(--mono)", textAlign: "center" }}>
          Connect GitHub to see your real contribution graph
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "20px 0" }}>
        <div style={{ width: "16px", height: "16px", border: "2px solid rgba(0,255,135,0.2)", borderTopColor: "var(--green)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ fontSize: "12px", color: "var(--text3)", fontFamily: "var(--mono)" }}>Fetching contributions from GitHub...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!data) {
    return <p style={{ fontSize: "12px", color: "var(--text3)", fontFamily: "var(--mono)" }}>Could not load contribution data</p>;
  }

  return (
    <div style={{ position: "relative" }}>
      {/* Stats row */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "12px" }}>
        <div>
          <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--green)", fontFamily: "var(--mono)" }}>{data.totalCommits}</span>
          <span style={{ fontSize: "12px", color: "var(--text3)", marginLeft: "6px" }}>commits (last ~{data.weeks.length} weeks)</span>
        </div>
        <div>
          <span style={{ fontSize: "20px", fontWeight: 700, color: "#f59e0b", fontFamily: "var(--mono)" }}>{data.streak}</span>
          <span style={{ fontSize: "12px", color: "var(--text3)", marginLeft: "6px" }}>day streak</span>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: "flex", gap: "2px", overflowX: "auto", position: "relative" }}>
        {data.weeks.map((week, wi) => (
          <div key={wi} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {week.map((day, di) => (
              <div key={di}
                className="csq"
                style={{
                  background: COLORS[day.level],
                  boxShadow: day.level > 2 ? `0 0 4px ${COLORS[day.level]}` : "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  const rect = e.target.getBoundingClientRect();
                  setTooltip({ day, x: rect.x, y: rect.y });
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: "fixed",
          left: tooltip.x + 14,
          top: tooltip.y - 36,
          background: "rgba(7,21,16,0.97)",
          border: "1px solid rgba(0,255,135,0.2)",
          borderRadius: "8px",
          padding: "6px 10px",
          fontSize: "11px",
          color: "var(--text)",
          fontFamily: "var(--mono)",
          zIndex: 9999,
          pointerEvents: "none",
          whiteSpace: "nowrap",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        }}>
          {tooltip.day.count > 0
            ? `${tooltip.day.count} commit${tooltip.day.count > 1 ? "s" : ""} on ${tooltip.day.date}`
            : `No contributions on ${tooltip.day.date}`}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px" }}>
        <span style={{ fontSize: "11px", color: "var(--text3)", fontFamily: "var(--mono)" }}>Less</span>
        {COLORS.map((c, i) => <div key={i} style={{ width: "11px", height: "11px", borderRadius: "2px", background: c }} />)}
        <span style={{ fontSize: "11px", color: "var(--text3)", fontFamily: "var(--mono)" }}>More</span>
        <span style={{ fontSize: "11px", color: "var(--green)", fontFamily: "var(--mono)", marginLeft: "8px" }}>@{data.username}</span>
      </div>
    </div>
  );
}
