import type { ExamId, Metrics, Mode, Patient, Room } from "../types";
import { cloneRooms, examLabels, examToRoom, getRoom } from "../data/hospital";
import { estimateOrder, fixedOrderFor, optimizeOrder, variance } from "./optimizer";

const names = ["김도윤", "이서연", "박민준", "최지우", "정하준", "강하린", "윤서아", "임지호", "한유진", "오시우"];
const weightedExamPool: Array<{ exam: ExamId; weight: number }> = [
  { exam: "blood", weight: 34 },
  { exam: "imaging", weight: 30 },
  { exam: "injection", weight: 15 },
  { exam: "ecg", weight: 12 },
  { exam: "respiratory", weight: 8 },
  { exam: "endoscopy", weight: 3 }
];

function random(seed: number) {
  let value = seed % 2147483647;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function pickWeightedExams(count: number, rand: () => number): ExamId[] {
  const candidates = weightedExamPool.map((item) => ({ ...item }));
  const result: ExamId[] = [];
  while (result.length < count && candidates.length) {
    const totalWeight = candidates.reduce((sum, item) => sum + item.weight, 0);
    let cursor = rand() * totalWeight;
    const index = candidates.findIndex((item) => {
      cursor -= item.weight;
      return cursor <= 0;
    });
    const safeIndex = index >= 0 ? index : candidates.length - 1;
    result.push(candidates.splice(safeIndex, 1)[0].exam);
  }
  return result;
}

export function generatePatients(rooms: Room[], mode: Mode, seed = Date.now()): Patient[] {
  const rand = random(seed);
  return Array.from({ length: 1000 }, (_, index) => {
    const exams = pickWeightedExams(2 + Math.floor(rand() * 3), rand);
    const age = 20 + Math.floor(rand() * 68);
    const patientMode: Mode = mode === "normal" && age >= 72 ? "elderly" : mode;
    const fixedOrder = fixedOrderFor(exams);
    const before = estimateOrder(fixedOrder, rooms, patientMode, "fixed");
    const after = optimizeOrder(exams, rooms, patientMode);
    return {
      id: index + 1,
      name: names[Math.floor(rand() * names.length)],
      age,
      mode: patientMode,
      exams,
      fixedOrder,
      aiOrder: after.order,
      before: before.breakdown,
      after: after.breakdown,
      route: after.route,
      progress: rand()
    };
  });
}

export function randomizeQueues(rooms: Room[], seed = Date.now()): Room[] {
  const rand = random(seed);
  return rooms.map((room) => {
    if (room.type !== "exam") return room;
    const delta = Math.floor(rand() * 15) - 6;
    return { ...room, queue: Math.max(0, room.queue + delta) };
  });
}

export function applyEmergency(rooms: Room[]): Room[] {
  return rooms.map((room) => {
    if (room.id === "imaging_center") return { ...room, queue: room.queue + 18 };
    if (room.id === "endoscopy_center") return { ...room, queue: room.queue + 9 };
    return room;
  });
}

export function resetRooms() {
  return cloneRooms();
}

export function recomputePatients(patients: Patient[], rooms: Room[], mode: Mode, aiEnabled: boolean): Patient[] {
  return patients.map((patient) => {
    const fixedOrder = fixedOrderFor(patient.exams);
    const before = estimateOrder(fixedOrder, rooms, mode, "fixed");
    const after = optimizeOrder(patient.exams, rooms, mode);
    return {
      ...patient,
      mode: patient.age >= 72 && mode === "normal" ? "elderly" : mode,
      fixedOrder,
      aiOrder: after.order,
      before: before.breakdown,
      after: after.breakdown,
      route: aiEnabled ? after.route : before.route,
      progress: patient.progress
    };
  });
}

export function computeMetrics(rooms: Room[], patients: Patient[], aiEnabled: boolean): Metrics {
  const active = patients.map((patient) => (aiEnabled ? patient.after : patient.before));
  const beforeWait = average(patients.map((patient) => patient.before.waiting));
  const beforeWalk = average(patients.map((patient) => patient.before.walking));
  const beforeStay = average(patients.map((patient) => patient.before.total));
  const averageWaiting = average(active.map((item) => item.waiting));
  const averageWalking = average(active.map((item) => item.walking));
  const averageStay = average(active.map((item) => item.total));
  const reductionRate = beforeStay > 0 ? ((beforeStay - averageStay) / beforeStay) * 100 : 0;
  const waitingReductionRate = beforeWait > 0 ? ((beforeWait - averageWaiting) / beforeWait) * 100 : 0;
  const examRooms = rooms.filter((room) => room.type === "exam");
  const elevatorQueue = rooms.filter((room) => room.type === "core").reduce((sum, room) => sum + room.queue, 0);
  const busiestRoom = [...examRooms].sort((a, b) => b.queue - a.queue)[0];
  const bottleneckRooms = [...examRooms].sort((a, b) => b.queue - a.queue).slice(0, 3);
  const queueValues = examRooms.map((room) => room.queue);
  const afterQueues = examRooms.map((room) => {
    const assigned = patients.filter((patient) => patient.aiOrder[0] && examToRoom[patient.aiOrder[0]] === room.id).length;
    return Math.max(0, room.queue - Math.round(assigned * 0.16));
  });
  const capacityMinutes = examRooms.reduce((sum, room) => sum + 60 / Math.max(1, room.examMinutes), 0);
  const demandBefore = patients.reduce((sum, patient) => sum + patient.fixedOrder.length, 0) / 8;
  const demandAfter = patients.reduce((sum, patient) => sum + patient.aiOrder.length, 0) / 7.1;
  const utilizationBefore = Math.min(96, (demandBefore / Math.max(1, capacityMinutes)) * 100);
  const utilizationAfter = Math.min(98, utilizationBefore + Math.max(4, reductionRate * 0.62));
  const utilizationIncreaseRate = utilizationBefore > 0 ? ((utilizationAfter - utilizationBefore) / utilizationBefore) * 100 : 0;
  const averageTurnover = average(examRooms.map((room) => 60 / Math.max(1, room.examMinutes)));

  return {
    currentPatients: patients.length,
    averageWaiting: round(averageWaiting),
    averageWalking: round(averageWalking),
    averageStay: round(averageStay),
    beforeWaiting: round(beforeWait),
    beforeWalking: round(beforeWalk),
    beforeStay: round(beforeStay),
    waitingReductionRate: round(Math.max(0, waitingReductionRate)),
    reductionRate: round(Math.max(0, reductionRate)),
    utilizationBefore: round(utilizationBefore),
    utilizationAfter: round(utilizationAfter),
    utilizationIncreaseRate: round(Math.max(0, utilizationIncreaseRate)),
    complaintReduction: round(Math.max(0, reductionRate * 1.45 + waitingReductionRate * 0.35)),
    averageTurnover: round(averageTurnover),
    queueVarianceBefore: variance(queueValues),
    queueVarianceAfter: variance(afterQueues),
    busiestRoom,
    bottleneckRooms,
    elevatorQueue
  };
}

export function routeSummary(patient: Patient) {
  return patient.aiOrder.map((exam) => examLabels[exam]).join(" → ");
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value: number) {
  return Number(value.toFixed(1));
}

export function roomForExam(exam: ExamId, rooms: Room[]) {
  return getRoom(examToRoom[exam], rooms);
}
