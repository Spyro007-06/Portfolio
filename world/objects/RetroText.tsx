"use client";

// Typography that lives in the world: SDF text (troika via drei).
// Built for absolute screen-space readability (Section 1–4):
// - High-quality antialiased SDF glyph rendering
// - Semantic font hierarchy: display, body, and technical mono with optimized tracking
// - Smooth timeline arrival and rise transitions

import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState, type ComponentProps } from "react";
import { useArrival } from "./arrival";
import { film } from "../signals";
import { progressBetween } from "../timeline";
import TextBackplate from "./TextBackplate";

export const FONTS = {
  display: "/fonts/archivo-800.woff",
  body: "/fonts/archivo-400.woff",
  mono: "/fonts/mono-400.woff",
};

type Props = Omit<ComponentProps<typeof Text>, "font"> & {
  font?: keyof typeof FONTS;
  /** film position where the text arrives; omit to show immediately */
  at?: number;
  /** optional film position where it leaves again */
  until?: number;
  /** optional film range over which the text settles to a faint ghost (final fade) */
  dim?: [number, number];
  opacity?: number;
  rise?: number;
};

export default function RetroText({
  font = "display",
  at,
  until,
  dim,
  opacity = 1,
  rise = 0.6,
  children,
  color = "#fbf8f1",
  letterSpacing,
  fontSize = 1,
  anchorX = "left",
  anchorY = "top",
  sdfGlyphSize = 64,
  ...rest
}: Props) {
  const ref = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const shown = useArrival(at, until);
  const baseY = useRef<number | null>(null);

  useFrame(() => {
    const t = ref.current;
    if (!t) return;
    if (baseY.current === null) baseY.current = t.position.y;
    const s = shown.get();
    // 0.03 linear ≈ a faint trace after sRGB encoding (0.1 linear would still read as mid-grey)
    const ghost = dim ? 1 - 0.97 * progressBetween(film.get(), dim[0], dim[1]) : 1;
    t.fillOpacity = s * opacity * ghost;
    t.visible = s > 0.001;
    t.position.y = baseY.current! - (1 - s) * rise;

    // Fog guard (Section 12): Important portfolio typography must never fade to gray in fog
    if (t.material && t.material.fog !== false) {
      t.material.fog = false;
    }
  });

  // Strict typography hierarchy & tracking (Section 5)
  const defaultTracking = font === "display" ? -0.025 : font === "body" ? 0.01 : 0.05;

  const [box, setBox] = useState<{ w: number; h: number } | null>(null);

  return (
    <group>
      {box && font !== "display" && (
        <TextBackplate 
          w={box.w * 1.05} 
          h={box.h * 1.1} 
          position={[
            anchorX === "center" ? 0 : anchorX === "right" ? -box.w / 2 : box.w / 2,
            anchorY === "middle" ? 0 : anchorY === "bottom" ? box.h / 2 : -box.h / 2,
            -0.08
          ]}
          depth={0.01}
          opacity={0.4}
          edgeOpacity={0.05}
          accentColor={color as string}
        />
      )}
      <Text
        ref={ref}
        font={FONTS[font]}
        color={color}
        anchorX={anchorX}
        anchorY={anchorY}
        letterSpacing={letterSpacing ?? defaultTracking}
        fontSize={fontSize}
        sdfGlyphSize={sdfGlyphSize}
        material-toneMapped={false}
        renderOrder={10}
        onSync={(t) => {
          t.geometry.computeBoundingBox();
          if (t.geometry.boundingBox) {
            const w = t.geometry.boundingBox.max.x - t.geometry.boundingBox.min.x;
            const h = t.geometry.boundingBox.max.y - t.geometry.boundingBox.min.y;
            setBox((prev) => (prev?.w === w && prev?.h === h ? prev : { w, h }));
          }
        }}
        {...rest}
      >
        {children}
      </Text>
    </group>
  );
}
