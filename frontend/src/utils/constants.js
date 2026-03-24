// ─────────────────────────────────────────────────────────
// All secrets come from .env file ONLY
// Never hardcode API keys here!
// ─────────────────────────────────────────────────────────

export const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8080";

// Groq AI — key comes from .env (VITE_GROQ_API_KEY)
export const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";
export const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
export const GROQ_MODEL = "llama-3.1-8b-instant";

export const TECH_SKILLS = [
  { name: "JavaScript", icon: "⚡" }, { name: "TypeScript", icon: "📘" },
  { name: "React", icon: "⚛️" },     { name: "Next.js", icon: "▲" },
  { name: "Node.js", icon: "🟢" },   { name: "Express", icon: "🚂" },
  { name: "Python", icon: "🐍" },    { name: "Go", icon: "🔵" },
  { name: "Rust", icon: "🦀" },      { name: "Java", icon: "☕" },
  { name: "MongoDB", icon: "🍃" },   { name: "PostgreSQL", icon: "🐘" },
  { name: "Redis", icon: "🔴" },     { name: "Docker", icon: "🐳" },
  { name: "Kubernetes", icon: "☸️" },{ name: "AWS", icon: "☁️" },
  { name: "GraphQL", icon: "◈" },    { name: "TensorFlow", icon: "🧠" },
  { name: "Vue", icon: "💚" },       { name: "Angular", icon: "🔺" },
  { name: "Flutter", icon: "💙" },   { name: "Swift", icon: "🍎" },
  { name: "Kotlin", icon: "🎯" },    { name: "C++", icon: "⚙️" },
];

export const AVATARS = [
  { seed: "IronCode",    label: "Iron Code"   },
  { seed: "CyberByte",   label: "Cyber Byte"  },
  { seed: "NeonHawk",    label: "Neon Hawk"   },
  { seed: "QuantumX",    label: "Quantum X"   },
  { seed: "DataViper",   label: "Data Viper"  },
  { seed: "CodeStorm",   label: "Code Storm"  },
  { seed: "ByteForce",   label: "Byte Force"  },
  { seed: "NanoBot",     label: "Nano Bot"    },
  { seed: "PhantomDev",  label: "Phantom Dev" },
  { seed: "StarBuild",   label: "Star Build"  },
  { seed: "GhostStack",  label: "Ghost Stack" },
  { seed: "TurboNode",   label: "Turbo Node"  },
];

// Cloudinary config - hardcoded for reliability
export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dtjfafddc";
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "devtinder_unsigned";

export const getAvatarUrl = (seed) =>
  `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed || "dev")}&backgroundColor=0a1628,0d1f2d,1a0a2e,0d2818&backgroundType=gradientLinear`;
