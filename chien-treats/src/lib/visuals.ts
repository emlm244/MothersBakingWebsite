import { generateFlavorArt as generate } from "../../packages/data";

export function generateFlavorArt(label: string, hex: string, w = 480, h = 320) {
  return generate(label, hex, w, h);
}
