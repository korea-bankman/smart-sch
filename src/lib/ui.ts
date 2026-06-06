import type { Room } from "../types";

export function congestionColor(queue: number) {
  if (queue >= 26) return "#ff5b5b";
  if (queue >= 11) return "#f6c851";
  return "#35d07f";
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
  if (room.type === "core") return "#28d3ff";
  if (room.type === "exam") return congestionColor(room.queue);
  if (room.type === "entry") return "#35d07f";
  return "#8fa2ba";
}
