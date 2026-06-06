import type { ExamId, Mode, Room, RoomId, TimeBreakdown, Vec3 } from "../types";
import { examToRoom, fixedExamOrder, getRoom, vectorDistance } from "../data/hospital";

type CostResult = {
  order: ExamId[];
  breakdown: TimeBreakdown;
  route: Vec3[];
};

function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items];
  const result: T[][] = [];
  items.forEach((item, index) => {
    const rest = [...items.slice(0, index), ...items.slice(index + 1)];
    permutations(rest).forEach((tail) => result.push([item, ...tail]));
  });
  return result;
}

function floorElevatorId(floor: number): RoomId {
  if (floor === 1) return "elevator_1f";
  if (floor === 2) return "elevator_2f";
  return "elevator_3f";
}

export function routeBetween(startId: RoomId, endId: RoomId, rooms: Room[], mode: Mode): Vec3[] {
  const start = getRoom(startId, rooms);
  const end = getRoom(endId, rooms);
  if (start.floor === end.floor) return [start.position, end.position];

  const startElevator = getRoom(floorElevatorId(start.floor), rooms);
  const endElevator = getRoom(floorElevatorId(end.floor), rooms);
  if (mode === "wheelchair") {
    return [start.position, startElevator.position, endElevator.position, end.position];
  }
  return [start.position, startElevator.position, endElevator.position, end.position];
}

export function walkingMinutesForRoute(route: Vec3[], mode: Mode) {
  let distance = 0;
  for (let i = 0; i < route.length - 1; i += 1) distance += vectorDistance(route[i], route[i + 1]);
  const modeWeight = mode === "elderly" ? 1.45 : mode === "wheelchair" ? 1.25 : 1;
  return distance * 1.9 * modeWeight;
}

function roomCapacity(room: Room) {
  if (room.examMinutes <= 7) return 4;
  if (room.examMinutes <= 12) return 3;
  return 2;
}

function predictedWaitingMinutes(room: Room, arrivalMinute: number) {
  const capacity = roomCapacity(room);
  const patientsProcessedBeforeArrival = (arrivalMinute / room.examMinutes) * capacity;
  const queueAtArrival = Math.max(0, room.queue - patientsProcessedBeforeArrival);
  const rawWait = (queueAtArrival / capacity) * room.examMinutes;
  const congestionPenalty = room.queue >= 26 && arrivalMinute < 20 ? room.examMinutes * 0.45 : 0;
  return rawWait + congestionPenalty;
}

export function estimateOrder(order: ExamId[], rooms: Room[], mode: Mode): CostResult {
  let current: RoomId = "checkin";
  let waiting = 0;
  let walking = 0;
  let exam = 0;
  let elapsed = 0;
  const fullRoute: Vec3[] = [getRoom("checkin", rooms).position];

  order.forEach((examId) => {
    const roomId = examToRoom[examId];
    const room = getRoom(roomId, rooms);
    const route = routeBetween(current, roomId, rooms, mode);
    const walk = walkingMinutesForRoute(route, mode);
    const wait = predictedWaitingMinutes(room, elapsed + walk);
    walking += walk;
    waiting += wait;
    exam += room.examMinutes;
    elapsed += walk + wait + room.examMinutes;
    fullRoute.push(...route.slice(1));
    current = roomId;
  });

  return {
    order,
    route: fullRoute,
    breakdown: {
      waiting: Number(waiting.toFixed(1)),
      walking: Number(walking.toFixed(1)),
      exam: Number(exam.toFixed(1)),
      total: Number((waiting + walking + exam).toFixed(1))
    }
  };
}

export function fixedOrderFor(exams: ExamId[]): ExamId[] {
  return fixedExamOrder.filter((exam) => exams.includes(exam));
}

export function optimizeOrder(exams: ExamId[], rooms: Room[], mode: Mode): CostResult {
  const candidates = permutations(exams).map((order) => estimateOrder(order, rooms, mode));
  return candidates.sort((a, b) => a.breakdown.total - b.breakdown.total)[0];
}

export function variance(values: number[]) {
  if (values.length === 0) return 0;
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
  const varianceValue = values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / values.length;
  return Number(varianceValue.toFixed(1));
}
