// Where the lens is pointed: written by CameraRig each frame, read by depth of field.
// Lives outside signals.ts so the DOM bundle never imports three.
import { Vector3 } from "three";

export const focus = new Vector3();
