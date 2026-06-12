import type { Room } from "../types";

export function congestionColor(queue: number) {
  if (queue >= 26) return "#ef6363";
  if (queue >= 11) return "#f3bd4e";
  return "#31c995";
}

export function congestionLabel(queue: number) {
  if (queue >= 26) return "혼잡";
  if (queue >= 11) return "보통";
  return "여유";
}

export function minutes(value: number) {
  return `${value.toFixed(1)}분`;
}

export function roomTone(room: Room) {
  if (room.type === "core") return "#2f67b2";
  if (room.type === "exam") return congestionColor(room.queue);
  if (room.type === "entry") return "#31c995";
  return "#9bb1cf";
}
