# Tharun B.L — Portfolio

Frontend Developer × AI Builder, Coimbatore, India.

## Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · [Motion](https://motion.dev). Nothing else at runtime.

## Structure

```
data/portfolio.ts          all factual content (projects, skills, timeline)
components/motion/         motion tokens (durations, eases, springs, accents) + primitives
components/background/     Field — one canvas "machine" whose pose is driven by scroll
components/cursor/         pointer system (data-cursor="LABEL", data-cursor-magnet)
components/navigation/     index + progress; bottom sheet on phones
components/hero|about|projects|lab|experience|contact/
```

Every animation pulls from `components/motion/tokens.ts`. Reduced motion is respected globally
(`MotionConfig reducedMotion="user"`) and scroll-linked transforms are dropped per component.

## Run

```bash
npm install
npm run dev
```
