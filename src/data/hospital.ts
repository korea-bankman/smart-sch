import type { ExamId, Room, RoomId, Vec3 } from "../types";

export const FLOOR_HEIGHT = 2.6;

export const examLabels: Record<ExamId, string> = {
  blood: "채혈",
  imaging: "영상검사",
  ecg: "심전도",
  respiratory: "호흡기검사",
  injection: "주사",
  endoscopy: "내시경"
};

export const fixedExamOrder: ExamId[] = ["blood", "ecg", "respiratory", "injection", "endoscopy", "imaging"];

export const rooms: Room[] = [
  { id: "checkin", name: "자동 체크인", floor: 1, position: { x: -3.0, y: 0, z: 1.1 }, size: [0.7, 0.22, 0.5], queue: 0, examMinutes: 1, type: "entry" },
  { id: "imaging_center", name: "영상의학센터", floor: 1, position: { x: 1.25, y: 0, z: 2.35 }, size: [1.65, 0.35, 1.2], queue: 38, examMinutes: 14, examId: "imaging", type: "exam" },
  { id: "administration_1f", name: "원무팀", floor: 1, position: { x: -1.45, y: 0, z: -1.15 }, size: [0.82, 0.3, 0.55], queue: 4, examMinutes: 4, type: "service" },
  { id: "pharmacy", name: "외래약국", floor: 1, position: { x: -0.85, y: 0, z: -1.7 }, size: [0.8, 0.3, 0.55], queue: 7, examMinutes: 5, type: "service" },
  { id: "cooperation", name: "진료협력센터", floor: 1, position: { x: -3.0, y: 0, z: 0.05 }, size: [0.8, 0.3, 0.55], queue: 3, examMinutes: 6, type: "service" },
  { id: "elevator_1f", name: "엘리베이터", floor: 1, position: { x: -2.35, y: 0, z: -0.35 }, size: [0.35, 0.7, 0.35], queue: 2, examMinutes: 2, type: "core" },

  { id: "blood_room", name: "채혈실", floor: 2, position: { x: -2.55, y: FLOOR_HEIGHT, z: -1.05 }, size: [0.85, 0.35, 0.6], queue: 48, examMinutes: 6, examId: "blood", type: "exam" },
  { id: "cardiac_test", name: "외래심장검사실", floor: 2, position: { x: -1.4, y: FLOOR_HEIGHT, z: -1.45 }, size: [0.95, 0.35, 0.6], queue: 22, examMinutes: 9, examId: "ecg", type: "exam" },
  { id: "respiratory_test", name: "호흡기검사실", floor: 2, position: { x: -1.0, y: FLOOR_HEIGHT, z: -2.25 }, size: [0.95, 0.35, 0.6], queue: 18, examMinutes: 8, examId: "respiratory", type: "exam" },
  { id: "injection_room", name: "주사센터", floor: 2, position: { x: 0.75, y: FLOOR_HEIGHT, z: -3.05 }, size: [1.1, 0.35, 0.6], queue: 24, examMinutes: 12, examId: "injection", type: "exam" },
  { id: "digestive_center", name: "소화기센터", floor: 2, position: { x: 1.15, y: FLOOR_HEIGHT, z: 1.15 }, size: [1.15, 0.35, 0.65], queue: 20, examMinutes: 10, type: "service" },
  { id: "endoscopy_center", name: "소화기내시경센터", floor: 2, position: { x: 1.15, y: FLOOR_HEIGHT, z: 2.25 }, size: [1.35, 0.35, 0.75], queue: 8, examMinutes: 18, examId: "endoscopy", type: "exam" },
  { id: "cardio_center", name: "심장혈관센터", floor: 2, position: { x: 0.9, y: FLOOR_HEIGHT, z: -1.95 }, size: [1.0, 0.35, 0.6], queue: 9, examMinutes: 11, type: "service" },
  { id: "neuro_center", name: "뇌신경센터", floor: 2, position: { x: 1.05, y: FLOOR_HEIGHT, z: 0.2 }, size: [1.15, 0.35, 0.65], queue: 13, examMinutes: 11, type: "service" },
  { id: "administration_2f", name: "원무팀", floor: 2, position: { x: -1.9, y: FLOOR_HEIGHT, z: -0.1 }, size: [0.7, 0.3, 0.45], queue: 5, examMinutes: 4, type: "service" },
  { id: "elevator_2f", name: "엘리베이터", floor: 2, position: { x: -2.35, y: FLOOR_HEIGHT, z: -0.35 }, size: [0.35, 0.7, 0.35], queue: 4, examMinutes: 2, type: "core" },

  { id: "family_medicine", name: "가정의학센터", floor: 3, position: { x: -2.4, y: FLOOR_HEIGHT * 2, z: -1.45 }, size: [1.05, 0.35, 0.65], queue: 8, examMinutes: 11, type: "service" },
  { id: "diabetes_center", name: "당뇨내분비센터", floor: 3, position: { x: -1.05, y: FLOOR_HEIGHT * 2, z: -2.0 }, size: [1.1, 0.35, 0.65], queue: 10, examMinutes: 12, type: "service" },
  { id: "breast_thyroid", name: "유방갑상선센터", floor: 3, position: { x: 0.3, y: FLOOR_HEIGHT * 2, z: -2.0 }, size: [1.1, 0.35, 0.65], queue: 16, examMinutes: 13, type: "service" },
  { id: "ent_center", name: "이비인후두경부센터", floor: 3, position: { x: 1.3, y: FLOOR_HEIGHT * 2, z: -0.8 }, size: [1.2, 0.35, 0.65], queue: 15, examMinutes: 13, type: "service" },
  { id: "eye_center", name: "눈건강센터", floor: 3, position: { x: 1.35, y: FLOOR_HEIGHT * 2, z: 0.55 }, size: [1.1, 0.35, 0.65], queue: 12, examMinutes: 12, type: "service" },
  { id: "joint_spine", name: "관절척추센터", floor: 3, position: { x: 1.25, y: FLOOR_HEIGHT * 2, z: 1.95 }, size: [1.2, 0.35, 0.65], queue: 22, examMinutes: 14, type: "service" },
  { id: "elevator_3f", name: "엘리베이터", floor: 3, position: { x: -2.35, y: FLOOR_HEIGHT * 2, z: -0.35 }, size: [0.35, 0.7, 0.35], queue: 3, examMinutes: 2, type: "core" }
];

export const examToRoom: Record<ExamId, RoomId> = {
  blood: "blood_room",
  imaging: "imaging_center",
  ecg: "cardiac_test",
  respiratory: "respiratory_test",
  injection: "injection_room",
  endoscopy: "endoscopy_center"
};

export function getRoom(id: RoomId, source: Room[] = rooms): Room {
  const room = source.find((item) => item.id === id);
  if (!room) throw new Error(`Unknown room: ${id}`);
  return room;
}

export function cloneRooms(): Room[] {
  return rooms.map((room) => ({ ...room, position: { ...room.position }, size: [...room.size] as [number, number, number] }));
}

export function vectorDistance(a: Vec3, b: Vec3) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}
