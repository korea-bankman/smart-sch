import { useState } from "react";
import { Activity, AlertTriangle, Bot, CheckCircle2, Clock3, Gauge, Radio, RotateCcw, Search, Send, Shuffle, Siren, TrendingDown, UserCheck } from "lucide-react";
import type { Metrics, Patient, Room } from "../types";
import { DigitalTwin } from "./DigitalTwin";
import { OperationsPanel } from "./OperationsPanel";
import { QueuePanel } from "./QueuePanel";
import { minutes } from "../lib/ui";
import { examLabels, examToRoom } from "../data/hospital";
import { getPatientRouteInsight } from "../lib/patientInsights";

type Props = {
  rooms: Room[];
  patients: Patient[];
  selectedPatient: Patient | undefined;
  metrics: Metrics;
  aiEnabled: boolean;
  running: boolean;
  onAi: () => void;
  onEnsureAi: () => void;
  onEmergency: () => void;
  onRandomQueue: () => void;
  onReset: () => void;
  onOpenDetail: () => void;
  onSelectPatient: (id: number) => void;
};

export function StaffModeScreen(props: Props) {
  const [notice, setNotice] = useState("직원 조치 결과가 여기에 표시됩니다.");
  const [query, setQuery] = useState("");
  const patient = props.selectedPatient;
  const patientInsight = patient ? getPatientRouteInsight(patient) : undefined;
  const wait60To119 = props.patients.filter((item) => item.after.waiting >= 60 && item.after.waiting < 120).length;
  const waitOver120 = props.patients.filter((item) => item.after.waiting >= 120).length;
  const averageSaved = props.aiEnabled ? props.patients.reduce((sum, item) => sum + Math.max(0, item.before.total - item.after.total), 0) / Math.max(1, props.patients.length) : 0;
  const congestionRank = props.rooms.filter((room) => room.type === "exam").sort((a, b) => b.queue - a.queue);
  const bottleneckRoom = congestionRank[0];
  const firstAiRoom = patient ? props.rooms.find((room) => room.id === examToRoom[patient.aiOrder[0]]) : undefined;
  const deferredRoom = patient ? props.rooms.find((room) => room.id === examToRoom[patient.fixedOrder[0]]) : undefined;
  const searchResults = props.patients
    .filter((item) => {
      const normalized = query.trim().toLowerCase();
      if (!normalized) return false;
      const patientCode = `p-${String(item.id).padStart(3, "0")}`;
      return item.name.toLowerCase().includes(normalized) || patientCode.includes(normalized) || String(item.id).includes(normalized);
    })
    .slice(0, 5);

  function runAction(message: string, action?: () => void) {
    action?.();
    setNotice(message);
  }

  return (
    <div className="grid gap-3">
      <section className="glass rounded-xl p-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg border border-cyan/30 bg-cyan/10">
                <Radio className="h-4 w-4 text-cyan" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-cyan">Staff Operations Command</p>
                <h2 className="text-lg font-black text-ink">직원용 병원 운영 관제</h2>
              </div>
            </div>
            <p className="mt-2 text-xs font-semibold leading-5 text-muted">
              검사실 대기열, 장기대기 위험군, AI 재배치 효과를 한 화면에서 확인하고 즉시 조치합니다.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:w-[620px]">
            <CommandMetric label="AI 상태" value={props.aiEnabled ? "적용 중" : "미적용"} tone={props.aiEnabled ? "text-cyan" : "text-muted"} icon={Bot} />
            <CommandMetric label="시뮬레이션" value={props.running ? "실행 중" : "정지"} tone={props.running ? "text-green" : "text-muted"} icon={Activity} />
            <CommandMetric label="병목 완화" value={`${props.metrics.bottleneckReliefRate.toFixed(1)}%`} tone="text-green" icon={Gauge} />
            <CommandMetric label="위험군" value={`${props.metrics.riskPatientsAfter}명`} tone="text-red" icon={Clock3} />
          </div>
        </div>
      </section>

      <section className="grid gap-2 md:grid-cols-2 xl:grid-cols-7">
        <StaffStat label="전체 환자" value={`${props.metrics.currentPatients.toLocaleString()}명`} sub="시뮬레이션 대상" icon={UserCheck} />
        <StaffStat label="혼잡순위 1위" value={congestionRank[0]?.name ?? "-"} sub={`${congestionRank[0]?.queue ?? 0}명 대기`} icon={AlertTriangle} tone="text-yellow" />
        <StaffStat label="혼잡순위 2위" value={congestionRank[1]?.name ?? "-"} sub={`${congestionRank[1]?.queue ?? 0}명 대기`} icon={AlertTriangle} tone="text-yellow" />
        <StaffStat label="혼잡순위 3위" value={congestionRank[2]?.name ?? "-"} sub={`${congestionRank[2]?.queue ?? 0}명 대기`} icon={AlertTriangle} tone="text-yellow" />
        <StaffStat label="60~119분 대기" value={`${wait60To119}명`} sub="중복 없는 구간" icon={Clock3} tone="text-yellow" />
        <StaffStat label="120분 이상 대기" value={`${waitOver120}명`} sub="장기대기 위험" icon={Clock3} tone="text-red" />
        <StaffStat label="절감 효과" value={minutes(averageSaved)} sub="환자 1명당 평균" icon={TrendingDown} tone="text-green" />
      </section>

      <section className="grid min-w-0 items-start gap-3 xl:grid-cols-[340px_minmax(0,1fr)_390px]">
        <div className="grid min-w-0 content-start gap-3">
          <OperationsPanel metrics={props.metrics} variant="compact" />
          <div className="min-w-0">
            <QueuePanel rooms={props.rooms} />
          </div>
        </div>

        <div className="grid min-w-0 content-start gap-3">
          <section className="glass overflow-hidden rounded-xl p-3">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-cyan">Staff Command View</p>
                <h2 className="text-lg font-black text-ink">실시간 병원 흐름 관제</h2>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                <span className={`rounded-md border px-2 py-1 ${props.running ? "border-green/40 bg-green/10 text-green" : "border-line bg-panel2 text-muted"}`}>
                  {props.running ? "시뮬레이션 실행 중" : "시뮬레이션 정지"}
                </span>
                <span className={`rounded-md border px-2 py-1 ${props.aiEnabled ? "border-cyan/40 bg-cyan/10 text-cyan" : "border-line bg-panel2 text-muted"}`}>
                  {props.aiEnabled ? "AI 적용 중" : "AI 미적용"}
                </span>
              </div>
            </div>
            <DigitalTwin
              rooms={props.rooms}
              patients={props.patients}
              selectedPatient={props.selectedPatient}
              aiEnabled={props.aiEnabled}
              running={props.running}
              variant="compact"
            />
          </section>

          <section className="glass rounded-xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-cyan">Operator Actions</p>
                <h2 className="text-sm font-bold text-ink">직원 즉시 조치</h2>
              </div>
              <span className="rounded-md border border-cyan/30 bg-cyan/10 px-2 py-1 text-[11px] font-bold text-cyan">
                최근 조치 기록
              </span>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              <ActionButton icon={Siren} label="응급환자 등록" tone="border-red/40 bg-red/10 text-red" onClick={() => runAction("응급환자 유입 상황을 등록하고 영상의학센터 대기열을 갱신했습니다.", props.onEmergency)} />
              <ActionButton icon={Shuffle} label="대기열 갱신" tone="border-yellow/40 bg-yellow/10 text-yellow" onClick={() => runAction("검사실별 대기열이 최신 시뮬레이션 값으로 갱신되었습니다.", props.onRandomQueue)} />
              <ActionButton icon={TrendingDown} label={props.aiEnabled ? "AI 적용 중" : "AI 적용"} tone="border-cyan/40 bg-cyan/10 text-cyan" onClick={() => runAction(props.aiEnabled ? "AI 최적화 적용을 해제했습니다." : "AI 최적화를 적용했습니다.", props.onAi)} />
            </div>
            <div className="mt-3 rounded-lg border border-cyan/30 bg-cyan/10 p-3">
              <p className="text-xs font-bold text-cyan">최근 조치</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-muted">{notice}</p>
            </div>
          </section>
        </div>

        <div className="grid min-w-0 content-start gap-3">
          {patient && (
            <section className="glass rounded-xl p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-ink">선택 환자 조치</h2>
                <span className="rounded-md border border-cyan/40 bg-cyan/10 px-2 py-1 text-xs font-bold text-cyan">
                  P-{String(patient.id).padStart(3, "0")}
                </span>
              </div>
              <div className="mt-4 rounded-xl border border-line bg-panel2 p-3">
                <label className="text-xs font-bold text-muted" htmlFor="staff-patient-search">환자 이름 / 등록번호 검색</label>
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-line bg-bg px-3 py-2">
                  <Search className="h-4 w-4 shrink-0 text-muted" />
                  <input
                    id="staff-patient-search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="예: 강하린 또는 P-001"
                    className="min-w-0 flex-1 border-0 bg-transparent text-sm font-bold text-ink outline-none placeholder:text-muted"
                  />
                </div>
                {query.trim() && (
                  <div className="mt-2 grid gap-1">
                    {searchResults.length > 0 ? (
                      searchResults.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            props.onSelectPatient(item.id);
                            setQuery("");
                            setNotice(`P-${String(item.id).padStart(3, "0")} ${item.name} 환자를 선택했습니다.`);
                          }}
                          className="flex items-center justify-between rounded-lg border border-line bg-bg px-3 py-2 text-left text-xs font-bold text-muted hover:border-cyan hover:text-ink"
                        >
                          <span>P-{String(item.id).padStart(3, "0")} · {item.name}</span>
                          <span>{item.age}세</span>
                        </button>
                      ))
                    ) : (
                      <p className="rounded-lg border border-line bg-bg px-3 py-2 text-xs font-bold text-muted">검색 결과가 없습니다.</p>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-4 rounded-xl border border-line bg-panel2 p-4">
                <p className="text-lg font-bold text-ink">{patient.name} · {patient.age}세</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-muted">
                  기존 {patient.fixedOrder.map((exam) => examLabels[exam]).join(" -> ")}
                </p>
                <p className="mt-1 text-sm font-semibold leading-6 text-green">
                  {props.aiEnabled ? "추천" : "AI 비활성"} {patient.aiOrder.map((exam) => examLabels[exam]).join(" -> ")}
                </p>
                <p className="mt-2 text-xs font-bold text-cyan">
                  추천 결과 {patientInsight?.statusLabel}
                </p>
                <p className="mt-2 text-xs font-bold text-muted">
                  예상 절감 {minutes(props.aiEnabled ? (patientInsight?.savedTotal ?? 0) : 0)}
                </p>
              </div>
              <div className="mt-3 rounded-xl border border-cyan/40 bg-cyan/10 p-4">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-cyan" />
                  <h3 className="text-sm font-bold text-ink">AI 권고 사유</h3>
                </div>
                <div className="mt-3 grid gap-2">
                  <ReasonLine label="병목 검사실" value={`${bottleneckRoom?.name ?? "-"} · ${bottleneckRoom?.queue ?? 0}명 대기`} tone="text-red" />
                  <ReasonLine label="선시행 권고" value={`${firstAiRoom?.name ?? "-"} · 대기 ${firstAiRoom?.queue ?? 0}명`} tone="text-green" />
                  <ReasonLine label="후순위 조정" value={`${deferredRoom?.name ?? "-"} 혼잡 완화 후 방문`} tone="text-yellow" />
                  <ReasonLine label="예상 효과" value={`대기 ${minutes(props.aiEnabled ? (patientInsight?.savedWaiting ?? 0) : 0)} / 이동 ${minutes(props.aiEnabled ? (patientInsight?.savedWalking ?? 0) : 0)} 절감`} tone="text-cyan" />
                </div>
                <p className="mt-3 rounded-lg border border-line bg-bg/70 px-3 py-2 text-xs font-semibold leading-5 text-muted">
                  {props.aiEnabled ? "권고: 현재 병목에 바로 진입하지 않고, 대기가 짧은 검사부터 진행해 총 체류시간을 낮춥니다." : "AI 최적화가 꺼져 있어 현재는 기존 고정 순서 기준으로 운영됩니다."}
                </p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <ActionButton
                  icon={CheckCircle2}
                  label="AI 추천 승인"
                  tone="border-green/40 bg-green/10 text-green"
                  onClick={() => runAction(`P-${String(patient.id).padStart(3, "0")} AI 추천 경로를 승인했습니다.`, props.onEnsureAi)}
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
      </section>
    </div>
  );
}

function StaffStat({ label, value, sub, icon: Icon, tone = "text-cyan" }: { label: string; value: string; sub: string; icon: typeof UserCheck; tone?: string }) {
  return (
    <article className="glass rounded-xl p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-muted">{label}</p>
          <p className="mt-1.5 truncate text-base font-bold text-ink">{value}</p>
          <p className="mt-1 truncate text-xs font-bold text-muted">{sub}</p>
        </div>
        <Icon className={`h-5 w-5 shrink-0 ${tone}`} />
      </div>
    </article>
  );
}

function CommandMetric({ label, value, icon: Icon, tone }: { label: string; value: string; icon: typeof UserCheck; tone: string }) {
  return (
    <article className="rounded-xl border border-line bg-panel2 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[11px] font-bold text-muted">{label}</span>
        <Icon className={`h-4 w-4 shrink-0 ${tone}`} />
      </div>
      <p className={`mt-1 truncate text-sm font-black ${tone}`}>{value}</p>
    </article>
  );
}

function ReasonLine({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-bg/70 px-3 py-2">
      <span className="shrink-0 text-xs font-bold text-muted">{label}</span>
      <span className={`min-w-0 truncate text-right text-xs font-bold ${tone}`}>{value}</span>
    </div>
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
