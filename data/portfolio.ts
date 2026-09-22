import {
  Project,
  SkillGroup,
  ApproachItem,
  ExperienceItem,
  EducationItem,
  CertificationItem,
} from "@/types";

export const PERSONAL_INFO = {
  name: "Tharun B.L",
  title: "Frontend Developer × AI Builder",
  headlineLine1: "BUILDING",
  headlineLine2: "DIGITAL EXPERIENCES",
  headlineLine3: "WITH CODE + AI",
  location: "Coimbatore, India",
  tagTL: "INDIA\nFRONTEND",
  tagTR: "AI · PRODUCT\n2026",
  statement:
    "I build modern digital experiences at the intersection of frontend engineering, AI, and product design.",
  metaRow: [
    "Coimbatore, India",
    "CSE Student",
    "Building with code + AI",
  ],
  status: "Available for opportunities",
  email: "b.l.tharun1465@gmail.com",
  github: "https://github.com/Spyro007-06",
  linkedin: "https://www.linkedin.com/in/tharun-b-l-143655398/",
};

export const PROJECTS: Project[] = [
  {
    idx: "01",
    count: "04",
    tag: "AI / FINANCE / PRODUCT",
    title: "AI FINANCIAL AGENT",
    subtitle: "Buy or wait?",
    category: "AI AGENT",
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
    mock: "financial",
  },
  {
    idx: "02",
    count: "04",
    tag: "VOICE / RAG / AI",
    title: "VOICE-ENABLED RAG",
    subtitle: "Ask it anything, out loud",
    category: "AI / VOICE",
    year: "2026",
    desc: "A voice-enabled retrieval-augmented generation system that lets users interact with a knowledge base using natural voice input — connecting speech, retrieval, and AI generation into a more natural way to search and interact with information.",
    flow: {
      label: "Core flow",
      steps: ["Voice", "Transcribe", "Retrieve", "Generate"],
    },
    pointsLabel: "What I explored",
    points: [
      "Voice interaction",
      "RAG architecture",
      "Semantic retrieval",
      "AI-generated responses",
      "Source-grounded answers",
    ],
    link: "https://github.com/Spyro007-06/Voice-enabled-RAG",
    mock: "voice",
  },
  {
    idx: "03",
    count: "04",
    tag: "IDENTITY / DESIGN / WEB",
    title: "HH GOA 2026",
    subtitle: "Identity, built for the community.",
    category: "CREATIVE TOOL",
    year: "2026",
    desc: "A photo-to-design web experience for creating personalized HH Goa 2026 profile frames and Builder ID cards. Upload a photo, choose a design, enter identity details, and instantly generate a personalized visual to share.",
    flow: {
      label: "Core experience",
      steps: ["Upload", "Customize", "Preview", "Share"],
    },
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
    mock: "idcard",
  },
  {
    idx: "04",
    count: "04",
    tag: "MUSIC / PERSONALIZATION / PRODUCT",
    title: "PERSONALIZED MUSIC PLATFORM",
    subtitle: "Music that learns your taste.",
    category: "WEB APP",
    year: "2026",
    desc: "A Spotify-inspired music platform focused on personalization rather than a large catalog — aiming to make recommendations feel increasingly relevant by learning from listening history and the preferences shared when someone first joins.",
    flow: {
      label: "Personalization loop",
      steps: [
        "Preferences",
        "Listening history",
        "Understanding",
        "Recommendations",
      ],
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
    mock: "music",
  },
];

export const SKILLS: SkillGroup[] = [
  {
    group: "Frontend",
    items: [
      { name: "HTML", info: "Semantic, accessible markup." },
      { name: "CSS", info: "Layout systems, animation, responsive design." },
      { name: "JavaScript", info: "Interactive, dynamic client-side logic." },
      {
        name: "Responsive Design",
        info: "Interfaces that hold up across screen sizes.",
      },
      {
        name: "Interactive UI",
        info: "Hover, scroll, and input-driven interaction.",
      },
      {
        name: "Animation",
        info: "Motion that supports the interface, not just decorates it.",
      },
      {
        name: "UI / UX",
        info: "Designing interactions that feel considered.",
      },
    ],
  },
  {
    group: "AI / Intelligent Systems",
    items: [
      {
        name: "LLM Applications",
        info: "Applying language models to real product problems.",
      },
      {
        name: "RAG",
        info: "Retrieval-augmented generation for grounded answers.",
      },
      {
        name: "AI Agents",
        info: "Systems that reason toward a decision, not just respond.",
      },
      {
        name: "Recommendation Systems",
        info: "Personalizing results from behavior and preference.",
      },
      {
        name: "Voice AI",
        info: "Speech as an interface, not just a novelty.",
      },
      {
        name: "Prompt Engineering",
        info: "Shaping model behavior deliberately, not by accident.",
      },
    ],
  },
  {
    group: "Development",
    items: [
      { name: "Git", info: "Version control as part of the daily workflow." },
      {
        name: "GitHub",
        info: "Shipping and tracking real project history.",
      },
      {
        name: "REST APIs",
        info: "Connecting frontend to real data and services.",
      },
      {
        name: "Frontend ↔ Backend Integration",
        info: "Wiring the interface to the systems behind it.",
      },
      { name: "Debugging", info: "Finding root causes, not just symptoms." },
      {
        name: "Rapid Prototyping",
        info: "Getting an idea into a clickable state fast.",
      },
    ],
  },
  {
    group: "Tools / Workflow",
    items: [
      { name: "VS Code", info: "Daily driver." },
      {
        name: "GitHub",
        info: "Source control and project history.",
      },
      {
        name: "AI Coding Tools",
        info: "Used deliberately, not as a crutch.",
      },
      {
        name: "Vibe Coding",
        info: "Fast, exploratory building when an idea needs to exist quickly.",
      },
      {
        name: "Rapid Product Prototyping",
        info: "Concept to clickable, fast.",
      },
    ],
  },
];

export const APPROACH: ApproachItem[] = [
  {
    idx: "01",
    title: "Start with the problem",
    copy: "I prefer understanding the problem before deciding what technology to use.",
  },
  {
    idx: "02",
    title: "Make complex things simple",
    copy: "Good products hide complexity instead of making users deal with it.",
  },
  {
    idx: "03",
    title: "Build, test, iterate",
    copy: "I learn fastest by turning ideas into working products and improving them through iteration.",
  },
  {
    idx: "04",
    title: "AI is a tool, not the product",
    copy: "I use AI where it creates real value — not simply because AI can be added.",
  },
];

export const EXPERIENCE: ExperienceItem[] = [
  {
    year: "2026 — Present",
    role: "Frontend Developer",
    org: "AHAL AI",
    desc: "Working on frontend experiences for an AI-powered platform focused on understanding projects, codebases, documentation, and technical context.",
    focus: [
      "Frontend development",
      "AI product interfaces",
      "Interactive experiences",
      "Product thinking",
    ],
  },
];

export const EDUCATION: EducationItem[] = [
  {
    institution: "Sri Shakthi Institute of Engineering and Technology",
    field: "Computer Science",
    period: "2025 — Present",
  },
];

export const CERTIFICATIONS: CertificationItem[] = [
  {
    title: "Microsoft Excel — Productivity & Data Analysis",
    status: "Verified",
  },
];

export const INTERESTS = [
  "AI",
  "Frontend",
  "Product",
  "Design",
  "RAG",
  "Voice AI",
  "AI Agents",
  "Recommendation Systems",
  "Web Experiences",
];

export const EXPLORING = [
  "AI Agents",
  "RAG Systems",
  "Recommendation Systems",
  "AI Product Design",
  "Frontend Interactions",
  "Intelligent User Experiences",
];

export const LIKES_BUILDING = [
  "AI-powered applications",
  "Modern web interfaces",
  "Intelligent user experiences",
  "Developer tools",
  "Recommendation systems",
  "AI agents",
  "Voice-enabled applications",
  "Experimental product ideas",
];
