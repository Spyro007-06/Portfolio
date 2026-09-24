"use client";

// CameraRig — scroll never moves the camera directly:
//   scroll progress → (Motion spring, FilmDriver) → film → spline sample → camera
// On top of the shot: the pointer lets you look around a little (spring-smoothed), and scroll
// velocity adds a slight lens breathe and roll that settle back as the velocity spring decays.

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import { PerspectiveCamera, Vector3 } from "three";
import { camPos, film, pointer, settings, velocity } from "../signals";
import { focus } from "./focus";
import { sample } from "./path";

export default function CameraRig() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const tmp = useMemo(() => ({ pos: new Vector3(), look: new Vector3(), side: new Vector3(), up: new Vector3(0, 1, 0) }), []);

  useFrame(() => {
    const t = film.get();
    const fov = sample(t, tmp.pos, tmp.look);
    camera.position.copy(tmp.pos);
    focus.copy(tmp.look); // depth of field holds on the shot's subject, not on the pointer
    camPos.x.set(tmp.pos.x);
    camPos.y.set(tmp.pos.y);
    camPos.z.set(tmp.pos.z);

    // look-around: offset the target sideways/up in camera space, never more than a few degrees
    if (settings.live) {
      const dist = tmp.pos.distanceTo(tmp.look);
      tmp.side.subVectors(tmp.look, tmp.pos).cross(tmp.up).normalize();
      tmp.look.addScaledVector(tmp.side, pointer.x.get() * dist * 0.06);
      tmp.look.y -= pointer.y.get() * dist * 0.04;
    }
    camera.lookAt(tmp.look);

    const v = settings.reduced ? 0 : velocity.get();
    camera.rotateZ(Math.max(-1, Math.min(1, v / 5000)) * 0.025); // roll into fast moves
    const breathe = Math.min(5, Math.abs(v) / 900); // lens widens at speed
    // Portrait mobile compensation (Section 22): ensure horizontal visibility matches cinematic framing
    const portraitBoost = camera.aspect < 1 ? Math.min(22, (1 / camera.aspect - 1) * 14) : 0;
    const targetFov = fov + breathe + portraitBoost;
    if (Math.abs(camera.fov - targetFov) > 0.01) {
      camera.fov = targetFov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
