// Every word the site shows lives here. Facts come from CONTENT.md and the Olympian Codex brief —
// nothing is invented: projects without a public destination simply have no link.
import { brandIcons as bi } from './brand-icons';

export const person = {
  name: 'Tharun B.L',
  role: 'Frontend Developer',
  location: 'Coimbatore, India',
  email: 'b.l.tharun1465@gmail.com',
  github: 'https://github.com/Spyro007-06',
  linkedin: 'https://www.linkedin.com/in/tharun-b-l-143655398/',
  // Drop a PDF into public/ and point this at it (e.g. '/Tharun-BL-CV.pdf') to turn "Request CV" into "Download CV".
  cv: null as string | null,
};

export const cvLink = person.cv
  ? { href: person.cv, label: 'Download CV', download: true }
  : { href: `mailto:${person.email}?subject=CV%20request`, label: 'Request CV', download: false };

export const chapters = [
  { id: 'home', n: '00', title: 'The Mortal Realm', nav: 'Home' },
  { id: 'about', n: '01', title: 'The Hall of Wisdom', nav: 'About' },
  { id: 'skills', n: '02', title: 'The Forge', nav: 'Skills' },
  { id: 'projects', n: '03', title: 'The Pantheon of Creations', nav: 'Projects' },
  { id: 'journey', n: '04', title: 'The Ascent', nav: 'Journey' },
  { id: 'contact', n: '05', title: 'The Gates of Olympus', nav: 'Contact' },
] as const;

export const hero = {
  label: 'The Olympian Codex',
  line: 'Building digital experiences that feel like stepping into another world.',
  cta: 'Explore my world',
};

export const about = {
  heading: ['A Developer', 'with a Mythical', 'Mindset'],
  body: 'I’m Tharun — a second-year Artificial Intelligence and Data Science engineering student in Coimbatore, passionate about creating meaningful digital experiences. I like taking complicated ideas and turning them into interfaces that feel simple, fast and intuitive, and I learn fastest by building real things, then iterating.',
  qualities: [
    { icon: 'compass', label: 'Curiosity' },
    { icon: 'target', label: 'Problem Solving' },
    { icon: 'spark', label: 'Creative Thinking' },
    { icon: 'people', label: 'Teamwork' },
  ],
  quote: 'I don’t just want to build something that works — I want to understand why it should exist.',
};

// Official mark from motion.dev (simple-icons has no Motion icon).
const motionMark = {
  viewBox: '0 0 25.4 9',
  path: 'M 9.587 0 L 4.57 9 L 0 9 L 3.917 1.972 C 4.524 0.883 6.039 0 7.301 0 Z M 20.794 2.25 C 20.794 1.007 21.817 0 23.079 0 C 24.341 0 25.364 1.007 25.364 2.25 C 25.364 3.493 24.341 4.5 23.079 4.5 C 21.817 4.5 20.794 3.493 20.794 2.25 Z M 10.443 0 L 15.013 0 L 9.997 9 L 5.427 9 Z M 15.841 0 L 20.411 0 L 16.494 7.028 C 15.887 8.117 14.372 9 13.11 9 L 10.825 9 Z',
};

const brand = (icon: { path: string; hex: string }, fill = `#${icon.hex}`) => ({ viewBox: '0 0 24 24', path: icon.path, fill });

export const skills = {
  heading: ['Tools of the', 'Modern Artisan'],
  body: 'I use modern technologies to bring ideas to life and solve real-world problems with clean, scalable and user-friendly solutions.',
  tools: [
    { name: 'React', role: 'UI library', mark: brand(bi.react) },
    { name: 'TypeScript', role: 'Type safety', mark: brand(bi.typescript) },
    { name: 'JavaScript', role: 'Interactivity', mark: brand(bi.javascript) },
    { name: 'Tailwind CSS', role: 'Styling', mark: brand(bi.tailwindcss) },
    { name: 'shadcn/ui', role: 'Components', mark: brand(bi.shadcnui, '#F1E8D7') },
    { name: 'Motion for React', role: 'Animation', mark: { ...motionMark, fill: '#F1E8D7' } },
    { name: 'Git', role: 'Version control', mark: brand(bi.git) },
    { name: 'Vite', role: 'Build tool', mark: brand(bi.vite) },
  ],
};

export type Project = {
  title: string;
  tagline: string;
  description: string;
  labels: string[];
  art: string;
  alt: string;
  link?: { href: string; label: string };
};

export const projects = {
  heading: ['Ideas to', 'Impact'],
  body: 'A collection of projects where I turn ideas into functional, beautiful and user-friendly web applications.',
  all: { href: person.github, label: 'View all projects' },
  items: [
    {
      title: 'Placement Prep Platform',
      tagline: 'Learning · Practice · Assessment',
      description: 'A placement-preparation platform that brings learning, practice and assessment together in one place.',
      labels: ['Learning', 'Practice', 'Assessment'],
      art: 'p-placement',
      alt: 'Representative artwork: an ancient library hall whose marble stairs rise toward a bright doorway',
    },
    {
      title: 'SIH Agri AI',
      tagline: 'Farmer Support & Advisory',
      description: 'An AI project focused on supporting farmers with timely, practical advisory.',
      labels: ['Farmer support', 'Advisory', 'AI'],
      art: 'p-agri',
      alt: 'Representative artwork: terraced farm fields at golden hour with a small temple on the hill',
    },
    {
      title: 'HH Goa 2026',
      tagline: 'Photo-to-Design Web Tool',
      description: 'Upload a photo, choose a design and add your details to instantly generate a personalized HH Goa 2026 profile frame and Builder ID card to share.',
      labels: ['Upload', 'Customize', 'Preview', 'Share'],
      art: 'p-goa',
      alt: 'Representative artwork: a lantern-lit fortress on the Goan coast at dusk',
      link: { href: 'https://github.com/Spyro007-06/HH_Goa_Task_1', label: 'View on GitHub' },
    },
  ] satisfies Project[],
};

export const journey = {
  heading: ['From Mortal', 'to Builder'],
  body: 'A journey of curiosity, challenges, learning and growth — still in progress.',
  milestones: [
    {
      title: 'Student',
      epithet: 'The Dreamer',
      text: 'Second-year Artificial Intelligence and Data Science engineering student at Sri Shakthi Institute of Engineering and Technology — learning and growing.',
      meta: '2025 — Present',
      art: 'm-student',
    },
    {
      title: 'Builder',
      epithet: 'The Craftsman',
      text: 'Projects, experimentation and practical problem-solving — including frontend work at AHAL AI.',
      meta: 'AHAL AI · 2026 — Present',
      art: 'm-builder',
    },
    {
      title: 'Future',
      epithet: 'The Architect',
      text: 'An aspiring full-stack developer, building meaningful, scalable products.',
      meta: 'The next chapter',
      art: 'm-future',
    },
  ],
};

export const contact = {
  heading: ['Let’s Build', 'Something', 'Extraordinary.'],
  body: 'Have an interesting idea, product, experiment or collaboration in mind? I’m always open to new opportunities and interesting projects.',
  closing: 'The journey continues.',
};
