export const BASE_URL = "http://localhost:3000";

// Groq - Totally Free, Super Fast AI
// Get free key: https://console.groq.com
export const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

 // Replace with your key
export const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
export const GROQ_MODEL = "llama-3.1-8b-instant"; // Free & fast

export const TECH_SKILLS = [
  { name: "JavaScript", icon: "⚡" }, { name: "TypeScript", icon: "📘" },
  { name: "React", icon: "⚛️" }, { name: "Next.js", icon: "▲" },
  { name: "Node.js", icon: "🟢" }, { name: "Express", icon: "🚂" },
  { name: "Python", icon: "🐍" }, { name: "Go", icon: "🔵" },
  { name: "Rust", icon: "🦀" }, { name: "Java", icon: "☕" },
  { name: "MongoDB", icon: "🍃" }, { name: "PostgreSQL", icon: "🐘" },
  { name: "Redis", icon: "🔴" }, { name: "Docker", icon: "🐳" },
  { name: "Kubernetes", icon: "☸️" }, { name: "AWS", icon: "☁️" },
  { name: "GraphQL", icon: "◈" }, { name: "TensorFlow", icon: "🧠" },
  { name: "Vue", icon: "💚" }, { name: "Angular", icon: "🔺" },
];

export const AVATARS = [
  { seed: "felix", label: "Felix" }, { seed: "aneka", label: "Aneka" },
  { seed: "riley", label: "Riley" }, { seed: "charlie", label: "Charlie" },
  { seed: "destiny", label: "Destiny" }, { seed: "emeka", label: "Emeka" },
  { seed: "Vishal", label: "Vishal" }, { seed: "sarah", label: "Sarah" },
  { seed: "alex", label: "Alex" }, { seed: "morgan", label: "Morgan" },
  { seed: "jordan", label: "Jordan" }, { seed: "taylor", label: "Taylor" },
];

export const getAvatarUrl = (seed) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
