import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { Pause, Play, RotateCcw, SkipForward, X } from "lucide-react";
import type { ReactNode } from "react";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Metrics, Patient, Room, Vec3 } from "../types";
import { examLabels, examToRoom, FLOOR_HEIGHT } from "../data/hospital";
import { minutes, roomTone } from "../lib/ui";

type Props = {
  open: boolean;
  rooms: Room[];
  patients: Patient[];
  metrics: Metrics;
  onClose: () => void;
};

type SceneDef = {
  title: string;
  label: string;
  seconds: number;
  narration: string[];
};

const scenes: SceneDef[] = [
  {
    title: "The Problem",
    label: "혼잡 발생",
    seconds: 12,
    narration: ["Morning outpatient volume is increasing.", "Patient queues are beginning to form.", "Bottleneck detected."]
  },
  {
    title: "Staff Awareness",
    label: "직원 감지",
    seconds: 10,
    narration: ["Blood Draw Room congestion detected.", "Estimated delay: +18 minutes.", "AI prepares a redistribution plan."]
  },
  {
    title: "AI Analysis",
    label: "AI 분석",
    seconds: 13,
    narration: ["AI analyzes queue status, travel distance and examination schedules.", "Alternative routes are evaluated in real time."]
  },
  {
    title: "Patient Experience",
    label: "환자 안내",
    seconds: 10,
    narration: ["The patient receives a clear next step.", "Navigation starts from the mobile guide."]
  },
  {
    title: "3D Patient Journey",
    label: "3D 이동",
    seconds: 14,
    narration: ["Walk 30 meters ahead.", "Use the central elevator.", "Proceed to ECG Room.", "Arrival confirmed."]
  },
  {
    title: "System Impact",
    label: "운영 개선",
    seconds: 12,
    narration: ["Queues begin to decrease.", "Patients redistribute across available rooms.", "Hospital-wide stay time improves."]
  },
  {
    title: "Executive Summary",
    label: "최종 요약",
    seconds: 11,
    narration: ["SMART HOSPITAL AI", "Real-time patient flow optimization"]
  }
];

const totalSeconds = scenes.reduce((sum, scene) => sum + scene.seconds, 0);

const floorOutline: Array<[number, number]> = [
  [-3.7, -4.25],
  [-0.2, -4.25],
  [-0.2, -4.55],
  [3.35, -4.55],
  [3.35, -0.8],
  [2.65, -0.05],
  [2.65, 3.5],
  [3.2, 3.5],
  [3.2, 4.25],
  [0.0, 3.9],
  [-0.05, 1.15],
  [-3.35, 1.15],
  [-3.35, -0.2],
  [-3.85, -0.2],
  [-3.85, -2.05],
  [-2.45, -3.35]
];

function sceneAt(seconds: number) {
  let cursor = 0;
  for (let index = 0; index < scenes.length; index += 1) {
    const next = cursor + scenes[index].seconds;
    if (seconds < next) {
      return { index, progress: (seconds - cursor) / scenes[index].seconds, sceneStart: cursor };
    }
    cursor = next;
  }
  return { index: scenes.length - 1, progress: 1, sceneStart: totalSeconds - scenes[scenes.length - 1].seconds };
}

function makeShape() {
  const shape = new THREE.Shape();
  floorOutline.forEach(([x, z], index) => {
    if (index === 0) shape.moveTo(x, z);
    else shape.lineTo(x, z);
  });
  shape.closePath();
  return shape;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smooth(t: number) {
  return t * t * (3 - 2 * t);
}

function getRoomQueue(room: Room, sceneIndex: number, progress: number) {
  if (room.id === "blood_room") {
    if (sceneIndex === 0) return Math.round(lerp(18, 42, smooth(progress)));
    if (sceneIndex < 5) return 42;
    if (sceneIndex === 5) return Math.round(lerp(42, 18, smooth(progress)));
    return 18;
  }
  if (room.id === "imaging_center") {
    if (sceneIndex === 0) return Math.round(lerp(15, 31, smooth(progress)));
    if (sceneIndex < 5) return 31;
    if (sceneIndex === 5) return Math.round(lerp(31, 17, smooth(progress)));
    return 17;
  }
  if (room.type === "exam") {
    if (sceneIndex >= 5) return Math.max(8, Math.round(room.queue * 0.72));
    return room.queue;
  }
  return room.queue;
}

function queueColor(queue: number) {
  if (queue >= 26) return "#ff5b5b";
  if (queue >= 11) return "#f6c851";
  return "#35d07f";
}

function FloorPlate({ floor }: { floor: 1 | 2 }) {
  const shape = useMemo(makeShape, []);
  const y = (floor - 1) * FLOOR_HEIGHT;
  return (
    <group position={[0, y, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial color={floor === 1 ? "#12243a" : "#112a24"} transparent opacity={0.58} roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial color={floor === 1 ? "#28d3ff" : "#35d07f"} transparent opacity={0.09} />
      </mesh>
      <Text position={[-3.35, 0.22, -4.05]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.36} color={floor === 1 ? "#28d3ff" : "#35d07f"}>
        {floor}F
      </Text>
    </group>
  );
}

function CinematicRoom({ room, sceneIndex, progress }: { room: Room; sceneIndex: number; progress: number }) {
  const queue = getRoomQueue(room, sceneIndex, progress);
  const color = room.type === "exam" ? queueColor(queue) : roomTone(room);
  const isBottleneck = room.id === "blood_room" || room.id === "imaging_center";
  const pulse = isBottleneck && sceneIndex <= 2 ? 0.35 + Math.sin(progress * Math.PI * 10) * 0.18 : 0.14;
  return (
    <group position={[room.position.x, room.position.y + 0.2, room.position.z]}>
      <mesh castShadow>
        <boxGeometry args={room.size} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={room.type === "exam" ? 0.42 : 0.1} roughness={0.48} />
      </mesh>
      {room.type === "exam" && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.18, 0]}>
            <circleGeometry args={[Math.min(1.35, 0.3 + queue / 42), 64]} />
            <meshBasicMaterial color={color} transparent opacity={pulse} />
          </mesh>
          <Text position={[0, 0.55, 0]} fontSize={0.13} color="#e7eef8" anchorX="center">
            {room.name}
          </Text>
          <Text position={[0, 0.36, 0]} fontSize={0.13} color={color} anchorX="center">
            {queue} patients
          </Text>
        </>
      )}
    </group>
  );
}

function ElevatorCore({ progress }: { progress: number }) {
  const car = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!car.current) return;
    car.current.position.y = -1.05 + (Math.sin(clock.elapsedTime * 1.2 + progress * 3) + 1) * 1.05;
  });
  return (
    <group position={[-2.35, 1.3, -0.35]}>
      <mesh castShadow>
        <boxGeometry args={[0.52, 3.2, 0.52]} />
        <meshStandardMaterial color="#28d3ff" transparent opacity={0.38} emissive="#28d3ff" emissiveIntensity={0.3} />
      </mesh>
      <mesh ref={car} castShadow>
        <boxGeometry args={[0.64, 0.4, 0.64]} />
        <meshStandardMaterial color="#e7eef8" emissive="#28d3ff" emissiveIntensity={0.75} transparent opacity={0.9} />
      </mesh>
      <Text position={[0, 1.9, 0]} fontSize={0.17} color="#28d3ff" anchorX="center">
        CENTRAL ELEVATOR
      </Text>
    </group>
  );
}

function PatientSwarm({ sceneIndex, progress }: { sceneIndex: number; progress: number }) {
  const bodyMesh = useRef<THREE.InstancedMesh>(null);
  const headMesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const count = 110;

  useFrame(({ clock }) => {
    if (!bodyMesh.current || !headMesh.current) return;
    for (let index = 0; index < count; index += 1) {
      const lane = index % 7;
      const floor = index % 5 === 0 ? 1 : 2;
      const baseY = floor === 1 ? 0.42 : FLOOR_HEIGHT + 0.42;
      const baseX = -3.05 + lane * 0.88;
      const speed = sceneIndex < 5 ? 0.65 : 1.05;
      const z = -3.45 + ((clock.elapsedTime * speed + index * 0.31) % 6.95);
      const spread = Math.sin(index * 1.7) * 0.08;
      const scale = sceneIndex === 0 ? lerp(0.72, 1.08, progress) : 0.88;
      color.set(sceneIndex < 3 ? "#f6c851" : sceneIndex >= 5 ? "#35d07f" : "#28d3ff");

      dummy.position.set(baseX + spread, baseY - 0.1, z);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      bodyMesh.current.setMatrixAt(index, dummy.matrix);
      bodyMesh.current.setColorAt(index, color);

      dummy.position.set(baseX + spread, baseY + 0.13 * scale, z);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      headMesh.current.setMatrixAt(index, dummy.matrix);
      headMesh.current.setColorAt(index, color);
    }
    bodyMesh.current.instanceMatrix.needsUpdate = true;
    headMesh.current.instanceMatrix.needsUpdate = true;
    if (bodyMesh.current.instanceColor) bodyMesh.current.instanceColor.needsUpdate = true;
    if (headMesh.current.instanceColor) headMesh.current.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={bodyMesh} args={[undefined, undefined, count]} castShadow>
        <capsuleGeometry args={[0.045, 0.24, 6, 10]} />
        <meshStandardMaterial vertexColors color="#28d3ff" emissive="#28d3ff" emissiveIntensity={0.18} roughness={0.45} />
      </instancedMesh>
      <instancedMesh ref={headMesh} args={[undefined, undefined, count]} castShadow>
        <sphereGeometry args={[0.072, 12, 12]} />
        <meshStandardMaterial vertexColors color="#28d3ff" emissive="#28d3ff" emissiveIntensity={0.22} roughness={0.4} />
      </instancedMesh>
    </group>
  );
}

function makeLine(points: Vec3[], color: string) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points.map((point) => new THREE.Vector3(point.x, point.y + 0.55, point.z)));
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.92 });
  return new THREE.Line(geometry, material);
}

function RouteStory({ sceneIndex }: { sceneIndex: number }) {
  const routes = useMemo(() => {
    const original: Vec3[] = [
      { x: -3, y: 0, z: 1.1 },
      { x: -2.35, y: 0, z: -0.35 },
      { x: -2.35, y: FLOOR_HEIGHT, z: -0.35 },
      { x: -2.55, y: FLOOR_HEIGHT, z: -1.05 },
      { x: -1.4, y: FLOOR_HEIGHT, z: -1.45 },
      { x: 1.25, y: 0, z: 2.35 }
    ];
    const optimized: Vec3[] = [
      { x: -3, y: 0, z: 1.1 },
      { x: -2.35, y: 0, z: -0.35 },
      { x: -2.35, y: FLOOR_HEIGHT, z: -0.35 },
      { x: -1.4, y: FLOOR_HEIGHT, z: -1.45 },
      { x: 1.25, y: 0, z: 2.35 },
      { x: -2.55, y: FLOOR_HEIGHT, z: -1.05 }
    ];
    return { original: makeLine(original, "#ff5b5b"), optimized: makeLine(optimized, "#35d07f") };
  }, []);

  if (sceneIndex < 2) return null;
  return (
    <>
      <primitive object={routes.original} />
      <primitive object={routes.optimized} />
    </>
  );
}

function AvatarJourney({ sceneIndex, progress }: { sceneIndex: number; progress: number }) {
  const group = useRef<THREE.Group>(null);
  const route = useMemo<Vec3[]>(
    () => [
      { x: -3.05, y: 0, z: 1.1 },
      { x: -2.35, y: 0, z: -0.35 },
      { x: -2.35, y: FLOOR_HEIGHT, z: -0.35 },
      { x: -1.4, y: FLOOR_HEIGHT, z: -1.45 }
    ],
    []
  );

  useFrame(({ clock }) => {
    if (!group.current) return;
    const activeProgress = sceneIndex === 4 ? progress : sceneIndex > 4 ? 1 : 0;
    const scaled = activeProgress * (route.length - 1);
    const index = Math.min(route.length - 2, Math.floor(scaled));
    const local = scaled - index;
    const a = route[index];
    const b = route[index + 1];
    group.current.position.set(lerp(a.x, b.x, local), lerp(a.y, b.y, local) + 0.58, lerp(a.z, b.z, local));
    group.current.rotation.y = Math.sin(clock.elapsedTime * 4) * 0.18;
  });

  return (
    <group ref={group}>
      <mesh position={[0, -0.16, 0]} castShadow>
        <capsuleGeometry args={[0.11, 0.42, 8, 18]} />
        <meshStandardMaterial color="#28d3ff" emissive="#28d3ff" emissiveIntensity={0.65} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.18, 0]} castShadow>
        <sphereGeometry args={[0.17, 24, 24]} />
        <meshStandardMaterial color="#ffffff" emissive="#28d3ff" emissiveIntensity={1.25} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.28, 0.36, 48]} />
        <meshBasicMaterial color="#35d07f" transparent opacity={0.62} />
      </mesh>
      <Text position={[0, 0.52, 0]} fontSize={0.13} color="#ffffff" anchorX="center">
        P-023
      </Text>
    </group>
  );
}

function AIEffects({ sceneIndex, progress }: { sceneIndex: number; progress: number }) {
  const ring = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ring.current) return;
    const scale = 1.2 + Math.sin(clock.elapsedTime * 2.6) * 0.12 + progress * 0.6;
    ring.current.scale.set(scale, scale, scale);
    ring.current.rotation.z = clock.elapsedTime * 0.35;
  });
  if (sceneIndex < 2 || sceneIndex > 5) return null;
  return (
    <mesh ref={ring} position={[-0.5, FLOOR_HEIGHT + 0.18, -1.2]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.25, 1.34, 96]} />
      <meshBasicMaterial color="#28d3ff" transparent opacity={0.42} />
    </mesh>
  );
}

function CameraRig({ sceneIndex, progress }: { sceneIndex: number; progress: number }) {
  const { camera } = useThree();
  const targets = [
    { pos: new THREE.Vector3(6.5, 7.2, 7.8), look: new THREE.Vector3(0, 1.2, -0.4) },
    { pos: new THREE.Vector3(4.4, 4.6, 5.2), look: new THREE.Vector3(-1.1, 1.4, -0.9) },
    { pos: new THREE.Vector3(5.7, 3.8, 3.6), look: new THREE.Vector3(-0.5, 1.8, -1.1) },
    { pos: new THREE.Vector3(3.6, 3.1, 5.7), look: new THREE.Vector3(-1.7, 1.8, -0.7) },
    { pos: new THREE.Vector3(2.4, 2.9, 3.2), look: new THREE.Vector3(-2.1, 1.3, -0.7) },
    { pos: new THREE.Vector3(6.2, 6.1, 6.2), look: new THREE.Vector3(0, 1.2, -0.7) },
    { pos: new THREE.Vector3(5.6, 5.0, 7.2), look: new THREE.Vector3(0, 1.2, -0.5) }
  ];

  useFrame(() => {
    const current = targets[sceneIndex];
    const next = targets[Math.min(targets.length - 1, sceneIndex + 1)];
    const t = smooth(Math.min(1, progress * 0.9));
    const pos = current.pos.clone().lerp(next.pos, t * 0.16);
    const look = current.look.clone().lerp(next.look, t * 0.22);
    camera.position.lerp(pos, 0.045);
    camera.lookAt(look);
  });
  return null;
}

function CinematicWorld({ rooms, sceneIndex, progress }: { rooms: Room[]; sceneIndex: number; progress: number }) {
  const visibleRooms = useMemo(() => rooms.filter((room) => room.floor <= 2), [rooms]);
  return (
    <>
      <ambientLight intensity={0.56} />
      <directionalLight position={[5, 8, 6]} intensity={1.45} castShadow />
      <pointLight position={[-3, 4, -2]} color="#28d3ff" intensity={3.8} />
      <pointLight position={[2.8, 3.4, 2.2]} color="#35d07f" intensity={sceneIndex >= 5 ? 4.2 : 1.4} />
      <FloorPlate floor={1} />
      <FloorPlate floor={2} />
      <ElevatorCore progress={progress} />
      {visibleRooms.map((room) => (
        <CinematicRoom key={room.id} room={room} sceneIndex={sceneIndex} progress={progress} />
      ))}
      <PatientSwarm sceneIndex={sceneIndex} progress={progress} />
      <RouteStory sceneIndex={sceneIndex} />
      <AvatarJourney sceneIndex={sceneIndex} progress={progress} />
      <AIEffects sceneIndex={sceneIndex} progress={progress} />
      <CameraRig sceneIndex={sceneIndex} progress={progress} />
    </>
  );
}

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const animate = (time: number) => {
      const t = Math.min(1, (time - start) / 1100);
      setDisplay(lerp(0, value, smooth(t)));
      if (t < 1) frame = window.requestAnimationFrame(animate);
    };
    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [value]);
  return (
    <>
      {display.toFixed(value >= 100 ? 0 : 1)}
      {suffix}
    </>
  );
}

function ScenePanel({ sceneIndex, progress, metrics }: { sceneIndex: number; progress: number; metrics: Metrics }) {
  const scene = scenes[sceneIndex];
  const textIndex = Math.min(scene.narration.length - 1, Math.floor(progress * scene.narration.length));
  const isFinal = sceneIndex === 6;
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between px-5 pb-36 pt-32 md:px-8">
      <div className="max-w-xl">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-cyan">{scene.title}</p>
        <h2 className="mt-3 text-3xl font-black text-ink md:text-5xl">{scene.label}</h2>
        <p className="mt-4 text-lg font-bold leading-8 text-white/85">{scene.narration[textIndex]}</p>
      </div>

      {sceneIndex === 0 && (
        <div className="max-w-md rounded-2xl border border-red/40 bg-red/15 p-4 shadow-2xl backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-wide text-red">Bottleneck detected</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <DemoMetric label="Blood Draw queue" value={`${Math.round(lerp(18, 42, smooth(progress)))}명`} />
            <DemoMetric label="Imaging queue" value={`${Math.round(lerp(15, 31, smooth(progress)))}명`} />
          </div>
        </div>
      )}

      {sceneIndex === 1 && (
        <div className="max-w-lg rounded-2xl border border-cyan/40 bg-bg/80 p-4 shadow-2xl backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-wide text-cyan">Staff Control Center</p>
          <div className="mt-3 grid gap-2">
            <DemoMetric label="Current queue" value="42명" />
            <DemoMetric label="Expected wait" value="+18분" />
            <DemoMetric label="Affected patients" value="128명" />
            <div className="rounded-xl border border-green/40 bg-green/10 p-3">
              <p className="text-sm font-bold text-green">AI suggests: Reassign 28 patients</p>
              <p className="mt-1 text-xs font-semibold text-muted">Expected time saving: 21 minutes</p>
            </div>
          </div>
        </div>
      )}

      {sceneIndex === 2 && (
        <div className="max-w-xl rounded-2xl border border-cyan/40 bg-bg/80 p-4 shadow-2xl backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-wide text-cyan">AI Route Evaluation</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <RouteCard tone="text-red" title="Original" body="Blood Draw -> ECG -> Imaging" time="11:52 AM" />
            <RouteCard tone="text-green" title="Optimized" body="ECG -> Imaging -> Blood Draw" time="11:31 AM" />
          </div>
        </div>
      )}

      {sceneIndex === 3 && (
        <div className="ml-auto w-full max-w-sm rounded-[28px] border border-cyan/40 bg-[#07111f]/95 p-4 shadow-2xl backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-wide text-cyan">Patient Mobile App</p>
          <h3 className="mt-3 text-2xl font-black text-ink">P-023</h3>
          <div className="mt-4 grid gap-2">
            <DemoMetric label="Next Examination" value={examLabels.ecg} />
            <DemoMetric label="Estimated wait" value="4분" />
            <DemoMetric label="Walking time" value="3분" />
            <DemoMetric label="Time saved" value="21분" />
          </div>
          <div className="mt-4 rounded-xl border border-green/40 bg-green/15 px-4 py-3 text-center text-sm font-black text-green">Start Navigation</div>
        </div>
      )}

      {sceneIndex === 4 && (
        <div className="max-w-md rounded-2xl border border-cyan/40 bg-bg/80 p-4 shadow-2xl backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-wide text-cyan">Live Guidance</p>
          <div className="mt-3 grid gap-2">
            <DemoMetric label="Status" value={progress < 0.72 ? "Walking" : progress < 0.9 ? "Arrived" : "Waiting"} />
            <DemoMetric label="Instruction" value={progress < 0.36 ? "Walk 30 meters ahead" : progress < 0.68 ? "Use central elevator" : "Proceed to ECG Room"} />
          </div>
        </div>
      )}

      {sceneIndex === 5 && (
        <div className="max-w-lg rounded-2xl border border-green/40 bg-green/10 p-4 shadow-2xl backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-wide text-green">System Impact</p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <DemoMetric label="Before AI" value="98분" />
            <DemoMetric label="After AI" value="76분" />
            <DemoMetric label="Reduction" value="22.4%" />
          </div>
        </div>
      )}

      {isFinal && (
        <div className="mx-auto mb-10 w-full max-w-5xl rounded-3xl border border-cyan/40 bg-bg/85 p-6 text-center shadow-2xl backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.45em] text-cyan">SMART HOSPITAL AI</p>
          <h2 className="mt-3 text-4xl font-black text-ink md:text-6xl">Real-time patient flow optimization</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-5">
            <DemoMetric label="Wait reduction" value={<Counter value={metrics.waitingReductionRate} suffix="%" />} />
            <DemoMetric label="Stay reduction" value={<Counter value={metrics.reductionRate} suffix="%" />} />
            <DemoMetric label="Congestion reduction" value={<Counter value={28.6} suffix="%" />} />
            <DemoMetric label="Complaint reduction" value={<Counter value={metrics.complaintReduction} suffix="%" />} />
            <DemoMetric label="Accessibility" value="Supported" />
          </div>
          <div className="mx-auto mt-6 grid h-16 w-16 place-items-center rounded-2xl border border-cyan/40 bg-cyan/10 text-xl font-black text-cyan">H</div>
        </div>
      )}
    </div>
  );
}

function DemoMetric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-panel2/90 p-3">
      <p className="text-xs font-bold text-muted">{label}</p>
      <p className="mt-1 text-lg font-black text-ink">{value}</p>
    </div>
  );
}

function RouteCard({ title, body, time, tone }: { title: string; body: string; time: string; tone: string }) {
  return (
    <div className="rounded-xl border border-line bg-panel2/90 p-4">
      <p className={`text-xs font-black uppercase tracking-wide ${tone}`}>{title}</p>
      <p className="mt-2 text-sm font-bold leading-6 text-ink">{body}</p>
      <p className="mt-3 text-lg font-black text-white">{time}</p>
    </div>
  );
}

export function CinematicDemo({ open, rooms, patients, metrics, onClose }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);

  useEffect(() => {
    if (!open) return;
    setPlaying(true);
    setElapsed(0);
  }, [open]);

  useEffect(() => {
    if (!open || !playing) {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastRef.current = 0;
      return;
    }
    const tick = (time: number) => {
      const delta = lastRef.current ? (time - lastRef.current) / 1000 : 0;
      lastRef.current = time;
      setElapsed((value) => {
        const next = Math.min(totalSeconds, value + delta);
        if (next >= totalSeconds) setPlaying(false);
        return next;
      });
      rafRef.current = window.requestAnimationFrame(tick);
    };
    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [open, playing]);

  const { index: sceneIndex, progress, sceneStart } = sceneAt(elapsed);
  const percent = (elapsed / totalSeconds) * 100;
  const patient = patients[22];
  const originalRoute = patient?.fixedOrder.map((exam) => examLabels[exam]).join(" -> ") ?? "Blood Draw -> ECG -> Imaging";
  const optimizedRoute = patient?.aiOrder.map((exam) => examLabels[exam]).join(" -> ") ?? `${examLabels.ecg} -> ${examLabels.imaging} -> ${examLabels.blood}`;

  if (!open) return null;

  function restart() {
    setElapsed(0);
    setPlaying(true);
  }

  function skipScene() {
    const nextStart = Math.min(totalSeconds, sceneStart + scenes[sceneIndex].seconds + 0.01);
    setElapsed(nextStart);
  }

  return (
    <div className="fixed inset-0 z-[80] bg-[#03070d] text-ink">
      <div className="absolute inset-0">
        <Canvas camera={{ position: [6.5, 7.2, 7.8], fov: 44 }} shadows>
          <Suspense fallback={null}>
            <CinematicWorld rooms={rooms} sceneIndex={sceneIndex} progress={progress} />
          </Suspense>
        </Canvas>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_35%,_rgba(3,7,13,0.35)_72%,_rgba(3,7,13,0.8)_100%)]" />
      <ScenePanel sceneIndex={sceneIndex} progress={progress} metrics={metrics} />

      {sceneIndex === 2 && (
        <div className="pointer-events-none absolute right-8 top-28 z-20 hidden max-w-md rounded-2xl border border-line bg-bg/80 p-4 shadow-2xl backdrop-blur lg:block">
          <p className="text-xs font-bold uppercase tracking-wide text-cyan">Selected Patient P-023</p>
          <div className="mt-3 grid gap-2">
            <DemoMetric label="Original route" value={originalRoute} />
            <DemoMetric label="Optimized route" value={optimizedRoute} />
          </div>
        </div>
      )}

      <div className="absolute left-0 right-0 top-0 z-30 border-b border-line bg-bg/65 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan">Cinematic Story Demo</p>
            <p className="mt-1 text-sm font-bold text-muted">
              {"Hospital Congestion -> Staff Detection -> AI Optimization -> Patient Guidance -> Improved Outcomes"}
            </p>
          </div>
          <div className="pointer-events-auto flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setPlaying((value) => !value)} className="inline-flex h-10 items-center gap-2 rounded-lg border border-cyan/40 bg-cyan/10 px-3 text-sm font-bold text-cyan">
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? "Pause Demo" : "Play Demo"}
            </button>
            <button type="button" onClick={restart} className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-panel2 px-3 text-sm font-bold text-muted hover:text-ink">
              <RotateCcw className="h-4 w-4" />
              Restart Demo
            </button>
            <button type="button" onClick={skipScene} className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-panel2 px-3 text-sm font-bold text-muted hover:text-ink">
              <SkipForward className="h-4 w-4" />
              Skip Scene
            </button>
            <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-panel2 text-muted hover:text-ink" aria-label="Close cinematic demo">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-30 border-t border-line bg-bg/70 px-4 py-3 backdrop-blur">
        <div className="mx-auto max-w-[1600px]">
          <div className="flex items-center justify-between gap-3 text-xs font-bold text-muted">
            <span>
              Scene {sceneIndex + 1}/{scenes.length}: {scenes[sceneIndex].title}
            </span>
            <span>
              {Math.floor(elapsed)}s / {totalSeconds}s
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-panel2">
            <div className="h-full rounded-full bg-cyan transition-[width]" style={{ width: `${percent}%` }} />
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {scenes.map((scene, index) => (
              <button
                key={scene.title}
                type="button"
                onClick={() => {
                  const nextElapsed = scenes.slice(0, index).reduce((sum, item) => sum + item.seconds, 0);
                  setElapsed(nextElapsed);
                }}
                className={`pointer-events-auto h-8 truncate rounded-md border px-2 text-[11px] font-bold ${
                  index === sceneIndex ? "border-cyan bg-cyan/15 text-cyan" : "border-line bg-panel2 text-muted"
                }`}
              >
                {scene.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
