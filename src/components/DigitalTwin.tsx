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

function Floor({ floor }: { floor: 1 | 2 | 3 }) {
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
        <meshStandardMaterial color={floor === 3 ? "#152235" : "#101b2d"} transparent opacity={0.78} roughness={0.8} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial color={floor === 1 ? "#28d3ff" : floor === 2 ? "#35d07f" : "#f6c851"} transparent opacity={0.055} />
      </mesh>
      {floor < 3 && (
        <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[7.5, 8.8]} />
          <meshBasicMaterial map={floor === 1 ? texture1 : texture2} transparent opacity={0.26} />
        </mesh>
      )}
      <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial color="#20324c" />
      </mesh>
      <Text position={[-3.45, 0.16, -4.15]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.32} color="#28d3ff">
        {floor}F
      </Text>
    </group>
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
      <Text position={[0, 0.48, 0]} fontSize={0.13} color="#e7eef8" anchorX="center" anchorY="middle">
        {room.name}
      </Text>
      {room.type === "exam" && (
        <Text position={[0, 0.31, 0]} fontSize={0.11} color={color} anchorX="center" anchorY="middle">
          {room.queue}명
        </Text>
      )}
    </group>
  );
}

function CoreShaft() {
  return (
    <group position={[-2.35, 2.6, -0.35]}>
      <mesh castShadow>
        <boxGeometry args={[0.42, 5.4, 0.42]} />
        <meshStandardMaterial color="#28d3ff" transparent opacity={0.6} emissive="#0b7fab" emissiveIntensity={0.2} />
      </mesh>
      <Text position={[0, 2.9, 0]} fontSize={0.18} color="#28d3ff" anchorX="center">
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

function PatientCloud({ patients }: { patients: Patient[] }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const shown = useMemo(() => patients.slice(0, 1000), [patients]);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    shown.forEach((patient, index) => {
      const p = pointAtRoute(patient.route, (patient.progress + clock.elapsedTime * 0.03) % 1);
      dummy.position.copy(p);
      const scale = patient.mode === "wheelchair" ? 1.35 : patient.mode === "elderly" ? 1.15 : 1;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(index, dummy.matrix);
      color.set(patient.mode === "elderly" ? "#f6c851" : patient.mode === "wheelchair" ? "#a78bfa" : "#28d3ff");
      mesh.current?.setColorAt(index, color);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, shown.length]} castShadow>
      <sphereGeometry args={[0.055, 12, 12]} />
      <meshStandardMaterial vertexColors color="#28d3ff" emissive="#28d3ff" emissiveIntensity={0.08} />
    </instancedMesh>
  );
}

function SelectedRoute({ patient, aiEnabled }: { patient: Patient | undefined; aiEnabled: boolean }) {
  const line = useMemo(() => {
    if (!patient || patient.route.length < 2) return null;
    const geometry = new THREE.BufferGeometry().setFromPoints(patient.route.map((p) => new THREE.Vector3(p.x, p.y + 0.5, p.z)));
    const material = new THREE.LineBasicMaterial({ color: aiEnabled ? "#35d07f" : "#ff5b5b" });
    return new THREE.Line(geometry, material);
  }, [patient, aiEnabled]);
  if (!line) return null;
  return <primitive object={line} />;
}

function Scene({ rooms, patients, selectedPatient, aiEnabled }: Props) {
  return (
    <>
      <ambientLight intensity={0.68} />
      <directionalLight position={[6, 9, 6]} intensity={1.5} castShadow />
      <pointLight position={[-3, 5, -2]} color="#28d3ff" intensity={4} />
      <Floor floor={1} />
      <Floor floor={2} />
      <Floor floor={3} />
      <CoreShaft />
      {rooms.map((room) => (
        <RoomBox key={room.id} room={room} />
      ))}
      <SelectedRoute patient={selectedPatient} aiEnabled={aiEnabled} />
      <PatientCloud patients={patients} />
      <OrbitControls target={[0, 2.6, 0]} enableDamping dampingFactor={0.08} />
    </>
  );
}

export function DigitalTwin(props: Props) {
  return (
    <section className="glass h-[620px] overflow-hidden rounded-xl">
      <div className="flex h-12 items-center justify-between border-b border-line px-4">
        <h2 className="text-sm font-bold text-ink">3D 병원 디지털 트윈</h2>
        <div className="flex items-center gap-3 text-xs font-bold text-muted">
          <span className="inline-flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-green" /> 여유</span>
          <span className="inline-flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-yellow" /> 보통</span>
          <span className="inline-flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-red" /> 혼잡</span>
        </div>
      </div>
      <div className="h-[568px]">
        <Canvas camera={{ position: [6.5, 7.2, 8], fov: 42 }} shadows>
          <Suspense fallback={null}>
            <Scene {...props} />
          </Suspense>
        </Canvas>
      </div>
    </section>
  );
}
