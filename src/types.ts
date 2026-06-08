export type ExamId = "blood" | "imaging" | "ecg" | "respiratory" | "injection" | "endoscopy";

export type RoomId =
  | "imaging_center"
  | "administration_1f"
  | "pharmacy"
  | "cooperation"
  | "blood_room"
  | "cardiac_test"
  | "respiratory_test"
  | "injection_room"
  | "digestive_center"
  | "endoscopy_center"
  | "cardio_center"
  | "neuro_center"
  | "administration_2f"
  | "family_medicine"
  | "diabetes_center"
  | "breast_thyroid"
  | "ent_center"
  | "eye_center"
  | "joint_spine"
  | "elevator_1f"
  | "elevator_2f"
  | "elevator_3f"
  | "checkin";

export type Mode = "normal" | "elderly" | "wheelchair";

export type ViewMode = "patient" | "operations";

export type AudienceMode = "simulation" | "staff" | "patient";

export type Vec3 = {
  x: number;
  y: number;
  z: number;
};

export type Room = {
  id: RoomId;
  name: string;
  floor: 1 | 2 | 3;
  position: Vec3;
  size: [number, number, number];
  queue: number;
  examMinutes: number;
  examId?: ExamId;
  type: "exam" | "service" | "core" | "entry";
};

export type Patient = {
  id: number;
  name: string;
  age: number;
  mode: Mode;
  exams: ExamId[];
  fixedOrder: ExamId[];
  aiOrder: ExamId[];
  before: TimeBreakdown;
  after: TimeBreakdown;
  route: Vec3[];
  progress: number;
};

export type TimeBreakdown = {
  waiting: number;
  walking: number;
  exam: number;
  total: number;
};

export type SimulationState = {
  rooms: Room[];
  patients: Patient[];
  selectedPatientId: number;
  aiEnabled: boolean;
  running: boolean;
  emergency: boolean;
  mode: Mode;
};

export type Metrics = {
  currentPatients: number;
  averageWaiting: number;
  averageWalking: number;
  averageStay: number;
  beforeWaiting: number;
  beforeWalking: number;
  beforeStay: number;
  waitingReductionRate: number;
  reductionRate: number;
  utilizationBefore: number;
  utilizationAfter: number;
  utilizationIncreaseRate: number;
  complaintReduction: number;
  averageTurnover: number;
  queueVarianceBefore: number;
  queueVarianceAfter: number;
  busiestRoom: Room;
  bottleneckRooms: Room[];
  elevatorQueue: number;
};
