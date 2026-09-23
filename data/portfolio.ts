// Single source of truth for all factual content. Presentation copy lives in components;
// nothing in here should be invented — only facts from the original portfolio.

export type Accent = "blue" | "acid" | "orange" | "bone";

export const PERSON = {
  name: "Tharun B.L",
  short: "TBL",
  title: "Frontend Developer × AI Builder",
  location: "Coimbatore, India",
  coords: "11.01°N 76.95°E",
  status: "Available for opportunities",
  email: "b.l.tharun1465@gmail.com",
  github: "https://github.com/Spyro007-06",
  linkedin: "https://www.linkedin.com/in/tharun-b-l-143655398/",
  statement:
    "I build modern digital experiences at the intersection of frontend engineering, AI, and product design.",
};

export type Project = {
  id: string;
  idx: string;
  title: string;
  subtitle: string;
  category: string;
  domain: string;
  year: string;
  desc: string;
  flow?: { label: string; steps: string[] };
  pointsLabel: string;
  points: string[];
  link: string | null;
  accent: Accent;
};

export const PROJECTS: Project[] = [
  {
    id: "financial",
    idx: "01",
    title: "AI Financial Agent",
    subtitle: "Buy or wait?",
    category: "AI Agent",
    domain: "AI / Finance / Product",
    year: "2026",
    desc: 'An AI-powered financial agent designed to answer a deceptively simple question: "Can I afford this?" Instead of looking only at the current account balance, it considers recurring expenses, upcoming payments, essential spending, confirmed income, payment options, and the user\'s financial safety margin before making a recommendation.',
    pointsLabel: "What I explored",
    points: [
      "Financial reasoning",
      "AI decision-making",
      "Context-aware recommendations",
      "User-specific affordability analysis",
    ],
    link: null,
    accent: "blue",
  },
  {
    id: "voice",
    idx: "02",
    title: "Voice-enabled RAG",
    subtitle: "Ask it anything, out loud.",
    category: "AI / Voice",
    domain: "Voice / RAG / AI",
    year: "2026",
    desc: "A voice-enabled retrieval-augmented generation system that lets users interact with a knowledge base using natural voice input — connecting speech, retrieval, and AI generation into a more natural way to search and interact with information.",
    flow: { label: "Core flow", steps: ["Voice", "Transcribe", "Retrieve", "Generate"] },
    pointsLabel: "What I explored",
    points: [
      "Voice interaction",
      "RAG architecture",
      "Semantic retrieval",
      "AI-generated responses",
      "Source-grounded answers",
    ],
    link: "https://github.com/Spyro007-06/Voice-enabled-RAG",
    accent: "acid",
  },
  {
    id: "hhgoa",
    idx: "03",
    title: "HH Goa 2026",
    subtitle: "Identity, built for the community.",
    category: "Creative Tool",
    domain: "Identity / Design / Web",
    year: "2026",
    desc: "A photo-to-design web experience for creating personalized HH Goa 2026 profile frames and Builder ID cards. Upload a photo, choose a design, enter identity details, and instantly generate a personalized visual to share.",
    flow: { label: "Core experience", steps: ["Upload", "Customize", "Preview", "Share"] },
    pointsLabel: "What this includes",
    points: [
      "PFP frame",
      "Builder ID",
      "Template selection",
      "Dynamic photo",
      "Name + role",
      "Builder title",
      "QR code",
      "Live preview",
    ],
    link: "https://github.com/Spyro007-06/HH_Goa_Task_1",
    accent: "orange",
  },
  {
    id: "music",
    idx: "04",
    title: "Personalized Music Platform",
    subtitle: "Music that learns your taste.",
    category: "Web App",
    domain: "Music / Personalization / Product",
    year: "2026",
    desc: "A Spotify-inspired music platform focused on personalization rather than a large catalog — aiming to make recommendations feel increasingly relevant by learning from listening history and the preferences shared when someone first joins.",
    flow: {
      label: "Personalization loop",
      steps: ["Preferences", "Listening history", "Understanding", "Recommendations"],
    },
    pointsLabel: "Shown in the interface",
    points: [
      "Made for you",
      "Based on your listening",
      "Recently played",
      "Mood discovery",
      "Personalized picks",
    ],
    link: null,
    accent: "bone",
  },
];

export type Skill = { name: string; info: string; rel: string[]; used?: string[] };
export type SkillGroup = { group: string; accent: Accent; items: Skill[] };

// `rel` = related skills (by name), `used` = project ids where the skill appears.
export const SKILLS: SkillGroup[] = [
  {
    group: "Frontend",
    accent: "blue",
    items: [
      { name: "HTML", info: "Semantic, accessible markup.", rel: ["CSS", "JavaScript", "Responsive Design"] },
      { name: "CSS", info: "Layout systems, animation, responsive design.", rel: ["HTML", "Animation", "Responsive Design"] },
      { name: "JavaScript", info: "Interactive, dynamic client-side logic.", rel: ["Interactive UI", "REST APIs", "Debugging"] },
      { name: "Responsive Design", info: "Interfaces that hold up across screen sizes.", rel: ["CSS", "UI / UX"] },
      { name: "Interactive UI", info: "Hover, scroll, and input-driven interaction.", rel: ["Animation", "JavaScript", "UI / UX"], used: ["hhgoa", "music"] },
      { name: "Animation", info: "Motion that supports the interface, not just decorates it.", rel: ["CSS", "Interactive UI", "UI / UX"] },
      { name: "UI / UX", info: "Designing interactions that feel considered.", rel: ["Interactive UI", "Rapid Prototyping", "Recommendation Systems"], used: ["hhgoa", "music"] },
    ],
  },
  {
    group: "AI Systems",
    accent: "acid",
    items: [
      { name: "LLM Applications", info: "Applying language models to real product problems.", rel: ["Prompt Engineering", "RAG", "AI Agents"], used: ["financial", "voice"] },
      { name: "RAG", info: "Retrieval-augmented generation for grounded answers.", rel: ["LLM Applications", "Voice AI", "REST APIs"], used: ["voice"] },
      { name: "AI Agents", info: "Systems that reason toward a decision, not just respond.", rel: ["LLM Applications", "Prompt Engineering"], used: ["financial"] },
      { name: "Recommendation Systems", info: "Personalizing results from behavior and preference.", rel: ["UI / UX", "LLM Applications"], used: ["music"] },
      { name: "Voice AI", info: "Speech as an interface, not just a novelty.", rel: ["RAG", "Interactive UI"], used: ["voice"] },
      { name: "Prompt Engineering", info: "Shaping model behavior deliberately, not by accident.", rel: ["LLM Applications", "AI Agents", "AI Coding Tools"] },
    ],
  },
  {
    group: "Development",
    accent: "orange",
    items: [
      { name: "Git", info: "Version control as part of the daily workflow.", rel: ["GitHub", "VS Code"] },
      { name: "GitHub", info: "Shipping and tracking real project history.", rel: ["Git"], used: ["voice", "hhgoa"] },
      { name: "REST APIs", info: "Connecting frontend to real data and services.", rel: ["Frontend ↔ Backend", "JavaScript", "RAG"] },
      { name: "Frontend ↔ Backend", info: "Wiring the interface to the systems behind it.", rel: ["REST APIs", "Debugging"] },
      { name: "Debugging", info: "Finding root causes, not just symptoms.", rel: ["JavaScript", "Frontend ↔ Backend", "VS Code"] },
      { name: "Rapid Prototyping", info: "Getting an idea into a clickable state fast.", rel: ["Vibe Coding", "UI / UX", "AI Coding Tools"] },
    ],
  },
  {
    group: "Workflow",
    accent: "bone",
    items: [
      { name: "VS Code", info: "Daily driver.", rel: ["Git", "Debugging"] },
      { name: "AI Coding Tools", info: "Used deliberately, not as a crutch.", rel: ["Prompt Engineering", "Vibe Coding", "Rapid Prototyping"] },
      { name: "Vibe Coding", info: "Fast, exploratory building when an idea needs to exist quickly.", rel: ["Rapid Prototyping", "AI Coding Tools"] },
    ],
  },
];

export const PRINCIPLES = [
  { title: "Start with the problem", copy: "Understand the problem before deciding what technology to use." },
  { title: "Make complex things simple", copy: "Good products hide complexity instead of making users deal with it." },
  { title: "Build, test, iterate", copy: "Turn ideas into working products, then improve them through iteration." },
  { title: "AI is a tool, not the product", copy: "Use AI where it creates real value — not simply because it can be added." },
];

export type Timeline = {
  kind: "Work" | "Education";
  period: string;
  start: string;
  role: string;
  org: string;
  desc: string;
  focus: string[];
  accent: Accent;
};

export const TIMELINE: Timeline[] = [
  {
    kind: "Work",
    period: "2026 — Present",
    start: "2026",
    role: "Frontend Developer",
    org: "AHAL AI",
    desc: "Working on frontend experiences for an AI-powered platform focused on understanding projects, codebases, documentation, and technical context.",
    focus: ["Frontend development", "AI product interfaces", "Interactive experiences", "Product thinking"],
    accent: "orange",
  },
  {
    kind: "Education",
    period: "2025 — Present",
    start: "2025",
    role: "Computer Science & Engineering",
    org: "Sri Shakthi Institute of Engineering and Technology",
    desc: "CSE student — learning the fundamentals underneath the interfaces, while building AI-powered applications and web experiences alongside.",
    focus: ["Computer Science", "Microsoft Excel — Productivity & Data Analysis (verified)"],
    accent: "blue",
  },
];

export const EXPLORING = [
  "AI Agents",
  "RAG Systems",
  "Recommendation Systems",
  "AI Product Design",
  "Frontend Interactions",
  "Intelligent User Experiences",
];
