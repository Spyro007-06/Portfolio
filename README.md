# Tharun B.L — Portfolio

> Frontend Developer × AI Builder based in Coimbatore, India.
> Building modern digital experiences at the intersection of frontend engineering, AI products, and interactive design.

## ⚡ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI Engine**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Custom Design Tokens & Grain Effects
- **Animation**: [GSAP](https://greensock.com/gsap/) + [GSAP ScrollTrigger](https://greensock.com/scrolltrigger/)
- **Smooth Scrolling**: [Lenis](https://lenis.darkroom.engineering/) (synced with ScrollTrigger ticker)
- **Visuals & Atmosphere**: HTML5 Canvas API (multi-depth particle simulation with photo exclusion zone) + SVG organic light trails
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 🏛️ Architecture Highlights

- **Cinematic Background (`CinematicBackground`)**:
  - Independent layer (`pointer-events: none`, `-z-10`) containing background image, volumetric atmosphere gradient blobs, SVG light trails, multi-depth particle simulation, and vignette.
  - State machine tracking active section (Hero, Statement, About, Approach, Skills, Work, Philosophy, Experience, Beyond, Contact) and smoothly interpolating brightness, contrast, and color balance.
  - **Hero Photo Protection**: Dynamic bounding box detection in the Canvas loop to deflect particles away from the hero portrait zone.

- **Hero Photo Component (`HeroPhoto`)**:
  - Protected foreground element with technical corner registration brackets.
  - Isolated from background parallax, particle rendering, and filters.

- **Pinned Project Scenes (`ProjectScene` / `WorkSection`)**:
  - Sticky pinned sequence transitions.
  - Interactive 3D tilt preview mockups:
    1. **AI Financial Agent (Buy or Wait?)**: Real-time balance and buffer retain calculator.
    2. **Voice-enabled RAG**: Interactive mic pulse, equalizer wave, pipeline steps, citation cards, and grounded answer.
    3. **HH Goa 2026**: Builder ID creator with template selector and dynamic photo frame.
    4. **Personalized Music Platform**: Recommendation engine with mood discovery and equalizer.

- **Custom Cursor (`CustomCursor`)**:
  - Desktop-only pointer tracker with interactive modes (`DEFAULT`, `VIEW`, `OPEN`, `EXPLORE`, `GITHUB`).
  - Automatically disabled on touch devices and reduced-motion settings.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (tested on v24)
- npm, pnpm, or yarn

### Installation

```bash
git clone https://github.com/Spyro007-06/portfolio.git
cd portfolio
npm install
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the portfolio.

### Building for Production

```bash
npm run build
npm run start
```

---

## 🌐 Deployment to Vercel

1. Push your repository to GitHub.
2. Import the repository into [Vercel](https://vercel.com/).
3. Vercel automatically detects Next.js:
   - **Framework Preset**: Next.js
   - **Build Command**: `next build`
   - **Output Directory**: `.next`
4. Deploy!