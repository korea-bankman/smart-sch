import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Patient, Room, Vec3 } from "../types";
import { roomTone } from "../lib/ui";

type Props = {
  rooms: Room[];
  patients: Patient[];
  selectedPatient: Patient | undefined;
  aiEnabled: boolean;
  running: boolean;
  variant?: "full" | "compact";
};

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

function makeShape() {
  const shape = new THREE.Shape();
  floorOutline.forEach(([x, z], index) => {
    if (index === 0) shape.moveTo(x, z);
    else shape.lineTo(x, z);
  });
  shape.closePath();
  return shape;
}

function Floor({ floor }: { floor: 1 | 2 }) {
  const texture1 = useLoader(THREE.TextureLoader, "/floors/floor_1f.png");
  const texture2 = useLoader(THREE.TextureLoader, "/floors/floor_2f.png");
  texture1.colorSpace = THREE.SRGBColorSpace;
  texture2.colorSpace = THREE.SRGBColorSpace;
  const shape = useMemo(makeShape, []);
  const y = (floor - 1) * 2.6;

  return (
    <group position={[0, y, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial color="#101b2d" transparent opacity={0.78} roughness={0.8} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial color={floor === 1 ? "#2f67b2" : "#31c995"} transparent opacity={0.065} />
      </mesh>
      <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7.5, 8.8]} />
        <meshBasicMaterial map={floor === 1 ? texture1 : texture2} transparent opacity={0.28} />
      </mesh>
      <FloorScanner floor={floor} />
      <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial color="#20324c" />
      </mesh>
      <Text position={[-3.45, 0.16, -4.15]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.32} color="#2f67b2">
        {floor}F
      </Text>
    </group>
  );
}

function FloorScanner({ floor }: { floor: 1 | 2 }) {
  const ref = useRef<THREE.Mesh>(null);
  const y = 0.08;

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pulse = 0.82 + Math.sin(clock.elapsedTime * 1.8 + floor) * 0.08;
    ref.current.scale.set(pulse, pulse, pulse);
    ref.current.rotation.z = clock.elapsedTime * 0.15;
  });

  return (
    <mesh ref={ref} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[2.65, 2.72, 96]} />
      <meshBasicMaterial color={floor === 1 ? "#2f67b2" : "#31c995"} transparent opacity={0.2} />
    </mesh>
  );
}

function RoomBox({ room }: { room: Room }) {
  const color = roomTone(room);
  return (
    <group position={[room.position.x, room.position.y + 0.18, room.position.z]}>
      <mesh castShadow>
        <boxGeometry args={room.size} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={room.type === "exam" ? 0.25 : 0.08} roughness={0.55} />
      </mesh>
      {room.type === "exam" && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.17, 0]}>
          <circleGeometry args={[Math.min(1.15, 0.26 + room.queue / 46), 48]} />
          <meshBasicMaterial color={color} transparent opacity={0.22} />
        </mesh>
      )}
      <Text position={[0, 0.48, 0]} fontSize={0.13} color="#f2f7ff" anchorX="center" anchorY="middle">
        {room.name}
      </Text>
      {room.type === "exam" && (
        <Text position={[0, 0.31, 0]} fontSize={0.11} color={color} anchorX="center" anchorY="middle">
          {room.queue}명
        </Text>
      )}
      {room.type === "exam" && <DoorMarker room={room} color={color} />}
    </group>
  );
}

function DoorMarker({ room, color }: { room: Room; color: string }) {
  return (
    <mesh position={[0, -0.16, -room.size[2] / 2 - 0.06]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[Math.min(0.5, room.size[0] * 0.55), 0.06]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </mesh>
  );
}

function CoreShaft() {
  const car = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!car.current) return;
    car.current.position.y = -1.05 + (Math.sin(clock.elapsedTime * 1.4) + 1) * 1.05;
  });

  return (
    <group position={[-2.35, 1.3, -0.35]}>
      <mesh castShadow>
        <boxGeometry args={[0.46, 2.9, 0.46]} />
        <meshStandardMaterial color="#2f67b2" transparent opacity={0.6} emissive="#1d4f91" emissiveIntensity={0.2} />
      </mesh>
      <mesh ref={car} castShadow>
        <boxGeometry args={[0.58, 0.36, 0.58]} />
        <meshStandardMaterial color="#f2f7ff" emissive="#2f67b2" emissiveIntensity={0.45} transparent opacity={0.86} />
      </mesh>
      <Text position={[0, 1.75, 0]} fontSize={0.16} color="#2f67b2" anchorX="center">
        ELEVATOR / STAIR
      </Text>
    </group>
  );
}

function pointAtRoute(route: Vec3[], progress: number) {
  if (route.length === 0) return new THREE.Vector3();
  if (route.length === 1) return new THREE.Vector3(route[0].x, route[0].y + 0.45, route[0].z);
  const scaled = progress * (route.length - 1);
  const index = Math.min(route.length - 2, Math.floor(scaled));
  const local = scaled - index;
  const a = route[index];
  const b = route[index + 1];
  return new THREE.Vector3(a.x + (b.x - a.x) * local, a.y + (b.y - a.y) * local + 0.42, a.z + (b.z - a.z) * local);
}

function PatientCloud({ patients, running }: { patients: Patient[]; running: boolean }) {
  const bodyMesh = useRef<THREE.InstancedMesh>(null);
  const headMesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const shown = useMemo(() => patients.filter((_, index) => index % 8 === 0).slice(0, 120), [patients]);
  const visualOffset = useRef(0);

  useFrame((_, delta) => {
    if (!bodyMesh.current || !headMesh.current) return;
    if (running) visualOffset.current = (visualOffset.current + delta * 0.045) % 1;
    shown.forEach((patient, index) => {
      const p = pointAtRoute(patient.route, (patient.progress + visualOffset.current) % 1);
      const scale = patient.mode === "wheelchair" ? 1.35 : patient.mode === "elderly" ? 1.15 : 1;
      color.set(patient.mode === "elderly" ? "#f3bd4e" : patient.mode === "wheelchair" ? "#a78bfa" : "#2f67b2");

      dummy.position.set(p.x, p.y - 0.11, p.z);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      bodyMesh.current?.setMatrixAt(index, dummy.matrix);
      bodyMesh.current?.setColorAt(index, color);

      dummy.position.set(p.x, p.y + 0.12 * scale, p.z);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      headMesh.current?.setMatrixAt(index, dummy.matrix);
      headMesh.current?.setColorAt(index, color);
    });
    bodyMesh.current.instanceMatrix.needsUpdate = true;
    headMesh.current.instanceMatrix.needsUpdate = true;
    if (bodyMesh.current.instanceColor) bodyMesh.current.instanceColor.needsUpdate = true;
    if (headMesh.current.instanceColor) headMesh.current.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={bodyMesh} args={[undefined, undefined, shown.length]} castShadow>
        <capsuleGeometry args={[0.045, 0.22, 6, 10]} />
        <meshStandardMaterial vertexColors color="#2f67b2" emissive="#2f67b2" emissiveIntensity={0.12} roughness={0.48} />
      </instancedMesh>
      <instancedMesh ref={headMesh} args={[undefined, undefined, shown.length]} castShadow>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial vertexColors color="#2f67b2" emissive="#2f67b2" emissiveIntensity={0.15} roughness={0.42} />
      </instancedMesh>
    </group>
  );
}

function SelectedRoute({ patient, aiEnabled }: { patient: Patient | undefined; aiEnabled: boolean }) {
  const line = useMemo(() => {
    if (!patient || patient.route.length < 2) return null;
    const geometry = new THREE.BufferGeometry().setFromPoints(patient.route.map((p) => new THREE.Vector3(p.x, p.y + 0.09, p.z)));
    const material = new THREE.LineBasicMaterial({ color: aiEnabled ? "#31c995" : "#ef6363" });
    return new THREE.Line(geometry, material);
  }, [patient, aiEnabled]);
  if (!line) return null;
  return <primitive object={line} />;
}

const guidePaths: Vec3[][] = [
  [
    { x: -3.15, y: 0, z: 1.05 },
    { x: -2.35, y: 0, z: -0.35 },
    { x: 1.25, y: 0, z: 2.35 }
  ],
  [
    { x: -2.35, y: 2.6, z: -0.35 },
    { x: -2.55, y: 2.6, z: -1.05 },
    { x: -1.4, y: 2.6, z: -1.45 },
    { x: 0.75, y: 2.6, z: -3.05 }
  ],
  [
    { x: -2.35, y: 2.6, z: -0.35 },
    { x: -0.3, y: 2.6, z: -0.55 },
    { x: 1.15, y: 2.6, z: 2.25 }
  ]
];

function CorridorGuides() {
  const lines = useMemo(
    () =>
      guidePaths.map((path) => {
        const geometry = new THREE.BufferGeometry().setFromPoints(path.map((point) => new THREE.Vector3(point.x, point.y + 0.07, point.z)));
        const material = new THREE.LineBasicMaterial({ color: "#2f67b2", transparent: true, opacity: 0.32 });
        return new THREE.Line(geometry, material);
      }),
    []
  );

  return (
    <>
      {lines.map((line, index) => (
        <primitive key={index} object={line} />
      ))}
      <Text position={[-2.2, 0.12, 0.45]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.12} color="#2f67b2">
        MAIN CORRIDOR
      </Text>
      <Text position={[-1.3, 2.72, -2.55]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.12} color="#31c995">
        EXAM CORRIDOR
      </Text>
    </>
  );
}

function SelectedPatientHalo({ patient, running }: { patient: Patient | undefined; running: boolean }) {
  const group = useRef<THREE.Group>(null);
  const progress = useRef(0);

  useFrame((_, delta) => {
    if (!group.current || !patient) return;
    if (running) progress.current = (progress.current + delta * 0.06) % 1;
    const point = pointAtRoute(patient.route, (patient.progress + progress.current) % 1);
    group.current.position.copy(point);
    const scale = 1.1 + Math.sin(progress.current * Math.PI * 2) * 0.12;
    group.current.scale.setScalar(scale);
  });

  if (!patient) return null;
  return (
    <group ref={group}>
      <mesh position={[0, -0.12, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.36, 8, 16]} />
        <meshStandardMaterial color="#2f67b2" emissive="#2f67b2" emissiveIntensity={0.75} />
      </mesh>
      <mesh position={[0, 0.17, 0]} castShadow>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshStandardMaterial color="#ffffff" emissive="#2f67b2" emissiveIntensity={1.25} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.24, 0.31, 40]} />
        <meshBasicMaterial color="#2f67b2" transparent opacity={0.55} />
      </mesh>
      <Text position={[0, 0.45, 0]} fontSize={0.11} color="#ffffff" anchorX="center">
        SELECTED
      </Text>
    </group>
  );
}

function Scene({ rooms, patients, selectedPatient, aiEnabled, running }: Props) {
  const visibleRooms = useMemo(() => rooms.filter((room) => room.floor <= 2), [rooms]);

  return (
    <>
      <ambientLight intensity={0.68} />
      <directionalLight position={[6, 9, 6]} intensity={1.5} castShadow />
      <pointLight position={[-3, 5, -2]} color="#2f67b2" intensity={4} />
      <Floor floor={1} />
      <Floor floor={2} />
      <CorridorGuides />
      <CoreShaft />
      {visibleRooms.map((room) => (
        <RoomBox key={room.id} room={room} />
      ))}
      <SelectedRoute patient={selectedPatient} aiEnabled={aiEnabled} />
      <SelectedPatientHalo patient={selectedPatient} running={running} />
      <PatientCloud patients={patients} running={running} />
      <OrbitControls target={[0, 1.35, 0]} enableDamping dampingFactor={0.08} />
    </>
  );
}

export function DigitalTwin(props: Props) {
  const compact = props.variant === "compact";
  return (
    <section className={`glass overflow-hidden rounded-xl ${compact ? "h-[360px]" : "h-[620px]"}`}>
      <div className="flex h-12 items-center justify-between border-b border-line px-4">
        <h2 className="text-sm font-bold text-ink">{compact ? "위치 지도" : "3D 병원 디지털 트윈"}</h2>
        <div className="flex items-center gap-2 text-xs font-bold text-muted">
          <span className="inline-flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-green" /> 여유</span>
          <span className="inline-flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-yellow" /> 보통</span>
          <span className="inline-flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-red" /> 혼잡</span>
        </div>
      </div>
      <div className={compact ? "h-[308px]" : "h-[568px]"}>
        <Canvas camera={{ position: compact ? [5.2, 4.2, 6.2] : [6.4, 5.4, 7.4], fov: compact ? 48 : 44 }} shadows>
          <Suspense fallback={null}>
            <Scene {...props} />
          </Suspense>
        </Canvas>
      </div>
    </section>
  );
}
