import { useState } from "react";
import { AlertTriangle, Bot, CheckCircle2, Clock3, RotateCcw, Send, Shuffle, Siren, UserCheck } from "lucide-react";
import type { Metrics, Patient, Room } from "../types";
import { DigitalTwin } from "./DigitalTwin";
import { OperationsPanel } from "./OperationsPanel";
import { QueuePanel } from "./QueuePanel";
import { minutes } from "../lib/ui";
import { examLabels } from "../data/hospital";

type Props = {
  rooms: Room[];
  patients: Patient[];
  selectedPatient: Patient | undefined;
  metrics: Metrics;
  aiEnabled: boolean;
  running: boolean;
  onAi: () => void;
  onEmergency: () => void;
  onRandomQueue: () => void;
  onReset: () => void;
  onOpenDetail: () => void;
};

export function StaffModeScreen(props: Props) {
  const [notice, setNotice] = useState("직원 조치 결과가 여기에 표시됩니다.");
  const patient = props.selectedPatient;
  const longWaitPatients = props.patients.filter((item) => item.after.waiting >= 120).length;
  const aiMovedPatients = props.patients.filter((item) => item.fixedOrder.join(",") !== item.aiOrder.join(",")).length;

  function runAction(message: string, action?: () => void) {
    action?.();
    setNotice(message);
  }

  return (
    <div className="grid gap-3">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <StaffStat label="전체 환자" value={`${props.metrics.currentPatients.toLocaleString()}명`} sub="시뮬레이션 대상" icon={UserCheck} />
        <StaffStat label="병목 알림" value={`${props.metrics.bottleneckRooms.length}건`} sub="혼잡 검사실 기준" icon={Siren} tone="text-red" />
        <StaffStat label="최혼잡" value={props.metrics.busiestRoom.name} sub={`${props.metrics.busiestRoom.queue}명 대기`} icon={AlertTriangle} tone="text-yellow" />
        <StaffStat label="재배치 후보" value={`${aiMovedPatients}명`} sub="AI 순서 변경 대상" icon={Bot} tone="text-cyan" />
        <StaffStat label="장기대기 예상" value={`${longWaitPatients}명`} sub="120분 이상 추정" icon={Clock3} tone="text-red" />
      </section>

      <section className="grid min-w-0 gap-3 xl:grid-cols-[0.85fr_1.1fr_0.85fr]">
        <div className="dashboard-scroll min-w-0 xl:h-[720px] xl:overflow-y-auto xl:pr-1">
          <QueuePanel rooms={props.rooms} />
        </div>

        <div className="grid min-w-0 gap-3">
          <OperationsPanel metrics={props.metrics} />
          {patient && (
            <section className="glass rounded-xl p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-ink">선택 환자 조치</h2>
                <span className="rounded-md border border-cyan/40 bg-cyan/10 px-2 py-1 text-xs font-bold text-cyan">
                  P-{String(patient.id).padStart(3, "0")}
                </span>
              </div>
              <div className="mt-4 rounded-xl border border-line bg-panel2 p-4">
                <p className="text-lg font-bold text-ink">{patient.name} · {patient.age}세</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-muted">
                  기존 {patient.fixedOrder.map((exam) => examLabels[exam]).join(" -> ")}
                </p>
                <p className="mt-1 text-sm font-semibold leading-6 text-green">
                  추천 {patient.aiOrder.map((exam) => examLabels[exam]).join(" -> ")}
                </p>
                <p className="mt-2 text-xs font-bold text-muted">
                  예상 절감 {minutes(Math.max(0, patient.before.total - patient.after.total))}
                </p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <ActionButton
                  icon={CheckCircle2}
                  label="AI 추천 승인"
                  tone="border-green/40 bg-green/10 text-green"
                  onClick={() => runAction(`P-${String(patient.id).padStart(3, "0")} AI 추천 경로를 승인했습니다.`, props.onAi)}
                />
                <ActionButton
                  icon={Send}
                  label="안내 메시지 전송"
                  tone="border-cyan/40 bg-cyan/10 text-cyan"
                  onClick={() => runAction(`${patient.name}님에게 새 검사 순서 안내 메시지를 전송했습니다.`, props.onOpenDetail)}
                />
                <ActionButton
                  icon={Shuffle}
                  label="경로 다시 계산"
                  tone="border-line bg-panel2 text-muted"
                  onClick={() => runAction("검사실 대기열을 갱신하고 추천 경로를 다시 계산했습니다.", props.onRandomQueue)}
                />
                <ActionButton
                  icon={RotateCcw}
                  label="운영상태 초기화"
                  tone="border-line bg-panel2 text-muted"
                  onClick={() => runAction("운영상태를 초기값으로 되돌렸습니다.", props.onReset)}
                />
              </div>
            </section>
          )}
        </div>

        <div className="grid min-w-0 gap-3">
          <DigitalTwin
            rooms={props.rooms}
            patients={props.patients}
            selectedPatient={props.selectedPatient}
            aiEnabled={props.aiEnabled}
            running={props.running}
            variant="compact"
          />
          <section className="glass rounded-xl p-4">
            <h2 className="text-sm font-bold text-ink">직원 조치</h2>
            <div className="mt-3 grid gap-2">
              <ActionButton icon={Siren} label="응급환자 등록" tone="border-red/40 bg-red/10 text-red" onClick={() => runAction("응급환자 유입 상황을 등록하고 영상의학센터 대기열을 갱신했습니다.", props.onEmergency)} />
              <ActionButton icon={Shuffle} label="대기열 갱신" tone="border-yellow/40 bg-yellow/10 text-yellow" onClick={() => runAction("검사실별 대기열이 최신 시뮬레이션 값으로 갱신되었습니다.", props.onRandomQueue)} />
              <ActionButton icon={Bot} label={props.aiEnabled ? "AI 적용 중" : "AI 적용"} tone="border-cyan/40 bg-cyan/10 text-cyan" onClick={() => runAction(props.aiEnabled ? "AI 최적화 적용을 해제했습니다." : "AI 최적화를 적용했습니다.", props.onAi)} />
            </div>
            <div className="mt-3 rounded-lg border border-cyan/30 bg-cyan/10 p-3">
              <p className="text-xs font-bold text-cyan">최근 조치</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-muted">{notice}</p>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function StaffStat({ label, value, sub, icon: Icon, tone = "text-cyan" }: { label: string; value: string; sub: string; icon: typeof UserCheck; tone?: string }) {
  return (
    <article className="glass rounded-xl p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-muted">{label}</p>
          <p className="mt-2 truncate text-lg font-bold text-ink">{value}</p>
          <p className="mt-1 truncate text-xs font-bold text-muted">{sub}</p>
        </div>
        <Icon className={`h-5 w-5 shrink-0 ${tone}`} />
      </div>
    </article>
  );
}

function ActionButton({ icon: Icon, label, tone, onClick }: { icon: typeof CheckCircle2; label: string; tone: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-bold ${tone}`}>
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
