import { useEffect, useMemo, useRef, useState } from "react";
import { BrainCircuit } from "lucide-react";
import type { Mode, Patient, Room, ViewMode } from "./types";
import { cloneRooms } from "./data/hospital";
import { applyEmergency, computeMetrics, generatePatients, randomizeQueues, recomputePatients, resetRooms } from "./lib/simulation";
import { DigitalTwin } from "./components/DigitalTwin";
import { KpiGrid } from "./components/KpiGrid";
import { ControlDock } from "./components/ControlDock";
import { QueuePanel } from "./components/QueuePanel";
import { PatientRoutePanel } from "./components/PatientRoutePanel";
import { ComparisonCharts } from "./components/ComparisonCharts";
import { ViewTabs } from "./components/ViewTabs";
import { OperationsPanel } from "./components/OperationsPanel";
import { ReportPanel } from "./components/ReportPanel";
import { CompetitionBrief } from "./components/CompetitionBrief";

export default function App() {
  const [rooms, setRooms] = useState<Room[]>(() => cloneRooms());
  const [patients, setPatients] = useState<Patient[]>(() => generatePatients(cloneRooms(), "normal", 20260605));
  const [selectedPatientId, setSelectedPatientId] = useState(1);
  const [running, setRunning] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [emergency, setEmergency] = useState(false);
  const [mode, setMode] = useState<Mode>("normal");
  const [viewMode, setViewMode] = useState<ViewMode>("patient");
  const [demoActive, setDemoActive] = useState(false);
  const [demoStep, setDemoStep] = useState("");
  const frameRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number>(0);
  const progressAccumulatorRef = useRef<number>(0);

  useEffect(() => {
    if (!running) {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      return;
    }
    const animate = (time: number) => {
      const delta = lastFrameRef.current ? time - lastFrameRef.current : 16;
      lastFrameRef.current = time;
      progressAccumulatorRef.current += delta;
      if (progressAccumulatorRef.current >= 500) {
        const step = progressAccumulatorRef.current;
        progressAccumulatorRef.current = 0;
        setPatients((current) => current.map((patient) => ({ ...patient, progress: (patient.progress + step / 18000) % 1 })));
      }
      frameRef.current = window.requestAnimationFrame(animate);
    };
    frameRef.current = window.requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [running]);

  useEffect(() => {
    setPatients((current) => recomputePatients(current, rooms, mode, aiEnabled));
  }, [rooms, mode, aiEnabled]);

  const metrics = useMemo(() => computeMetrics(rooms, patients, aiEnabled), [rooms, patients, aiEnabled]);
  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) ?? patients[0];

  function handleGenerate() {
    const next = generatePatients(rooms, mode, Date.now());
    setPatients(next);
    setSelectedPatientId(1);
  }

  function handleAi() {
    setAiEnabled((value) => !value);
  }

  function handleRandomQueue() {
    setRooms((current) => randomizeQueues(current));
  }

  function handleEmergency() {
    setEmergency((value) => {
      const next = !value;
      setRooms((current) => (next ? applyEmergency(current) : randomizeQueues(resetRooms(), 20260605)));
      return next;
    });
  }

  function handleReset() {
    const baseRooms = resetRooms();
    setRooms(baseRooms);
    setMode("normal");
    setAiEnabled(true);
    setEmergency(false);
    setRunning(false);
    setDemoActive(false);
    setDemoStep("");
    setViewMode("patient");
    setPatients(generatePatients(baseRooms, "normal", 20260605));
    setSelectedPatientId(1);
  }

  function handleMode(nextMode: Mode) {
    setMode(nextMode);
  }

  async function handleDemoMode() {
    if (demoActive) return;
    const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));
    setDemoActive(true);
    setRunning(true);
    setViewMode("operations");

    setDemoStep("1단계: 환자 1000명 생성");
    const baseRooms = resetRooms();
    setRooms(baseRooms);
    setPatients(generatePatients(baseRooms, "normal", 20260605));
    setAiEnabled(false);
    await wait(1200);

    setDemoStep("2단계: 채혈실 병목 발생");
    setRooms((current) =>
      current.map((room) => (room.id === "blood_room" ? { ...room, queue: room.queue + 48 } : room))
    );
    await wait(1400);

    setDemoStep("3단계: AI 자동 개입");
    setAiEnabled(true);
    await wait(1400);

    setDemoStep("4단계: 환자 재배치");
    setRooms((current) =>
      current.map((room) => {
        if (room.id === "blood_room") return { ...room, queue: Math.max(18, room.queue - 34) };
        if (room.type === "exam" && room.queue < 20) return { ...room, queue: room.queue + 5 };
        return room;
      })
    );
    await wait(1400);

    setDemoStep("5단계: KPI 개선 결과");
    setViewMode("patient");
    await wait(1800);
    setDemoActive(false);
  }

  return (
    <main className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(40,211,255,0.18),_transparent_32%),#070b12]">
      <header className="border-b border-line bg-bg/90 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-[1700px] flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-cyan">
              <BrainCircuit className="h-4 w-4" />
              Medical AI Competition Frontend MVP
            </p>
            <h1 className="mt-2 text-2xl font-bold text-ink xl:text-3xl">AI 기반 병원 디지털 트윈 환자 동선 최적화 시스템</h1>
            <p className="mt-2 text-sm font-semibold text-muted">
              키오스크/WiFi/BLE/App 자동 체크인 이후, 검사실 대기열과 위치를 기반으로 총 체류시간이 가장 짧은 검사 순서를 추천합니다.
            </p>
          </div>
          <div className="rounded-lg border border-cyan/40 bg-cyan/10 px-4 py-3 text-sm font-bold text-cyan">
            목표 함수: Total Time = Walking + Waiting + Exam
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1700px] gap-4 p-4">
        <CompetitionBrief demoStep={demoStep} />
        <KpiGrid metrics={metrics} />
        <ControlDock
          running={running}
          aiEnabled={aiEnabled}
          emergency={emergency}
          demoActive={demoActive}
          mode={mode}
          onGenerate={handleGenerate}
          onStart={() => setRunning((value) => !value)}
          onAi={handleAi}
          onEmergency={handleEmergency}
          onRandomQueue={handleRandomQueue}
          onReset={handleReset}
          onDemo={handleDemoMode}
          onMode={handleMode}
        />
        <ViewTabs value={viewMode} onChange={setViewMode} />

        <section className="grid gap-4 xl:grid-cols-[1.55fr_0.85fr]">
          <DigitalTwin rooms={rooms} patients={patients} selectedPatient={selectedPatient} aiEnabled={aiEnabled} />
          <div className="grid gap-4">
            {viewMode === "patient" ? (
              <PatientRoutePanel patient={selectedPatient} patients={patients} selectedPatientId={selectedPatientId} onSelect={setSelectedPatientId} />
            ) : (
              <OperationsPanel metrics={metrics} />
            )}
            <QueuePanel rooms={rooms} />
          </div>
        </section>

        <ReportPanel metrics={metrics} demoStep={demoStep} />
        <ComparisonCharts metrics={metrics} />
      </div>
    </main>
  );
}
