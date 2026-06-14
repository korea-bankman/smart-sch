import { useState } from "react";
import { Bell, CheckCircle2, ChevronRight, Headphones, Map, Share2, Stethoscope } from "lucide-react";
import type { Patient, Room } from "../types";
import { PatientCompanionPanel } from "./PatientCompanionPanel";
import { DigitalTwin } from "./DigitalTwin";
import { examLabels } from "../data/hospital";
import { getPatientRouteInsight } from "../lib/patientInsights";
import { minutes } from "../lib/ui";
import { FullHospitalMap } from "./FullHospitalMap";

type Props = {
  patient: Patient | undefined;
  rooms: Room[];
  patients: Patient[];
  aiEnabled: boolean;
  running: boolean;
  onOpenDetail: () => void;
};

export function PatientModeScreen({ patient, rooms, patients, aiEnabled, running, onOpenDetail }: Props) {
  const [patientView, setPatientView] = useState<"guide" | "map">("guide");

  if (!patient) {
    return <section className="glass rounded-xl p-5 text-sm font-bold text-muted">환자 정보를 불러오는 중입니다.</section>;
  }

  const completed = 1;
  const activeOrder = aiEnabled ? patient.aiOrder : patient.fixedOrder;
  const total = activeOrder.length;
  const progress = Math.min(100, (completed / Math.max(1, total)) * 100);
  const nextExam = activeOrder[0];
  const insight = getPatientRouteInsight(patient);

  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(360px,440px)_minmax(0,1fr)] xl:items-start">
      <div className="mx-auto w-full max-w-[430px] rounded-[28px] border border-line bg-[#061225] p-3 shadow-2xl">
        <div className="overflow-hidden rounded-[22px] border border-line bg-bg">
          <div className="border-b border-line bg-cyan/10 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-cyan">Smart SCH Patient</p>
            <h2 className="mt-2 text-2xl font-bold text-ink">{patient.name}님</h2>
            <p className="mt-1 text-sm font-semibold text-muted">오늘의 검사 안내</p>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-bold text-muted">
                <span>진행률</span>
                <span>{completed}/{total}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-bg">
                <div className="h-2 rounded-full bg-cyan" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          <PatientCompanionPanel patient={patient} rooms={rooms} aiEnabled={aiEnabled} onOpenDetail={onOpenDetail} />
        </div>
      </div>

      <div className="grid min-w-0 gap-4">
        <div className="glass rounded-xl p-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPatientView("guide")}
              className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold transition ${
                patientView === "guide" ? "border-cyan bg-cyan/15 text-cyan" : "border-line bg-panel2 text-muted hover:border-cyan/50 hover:text-ink"
              }`}
            >
              <Stethoscope className="h-4 w-4" />
              검사 안내
            </button>
            <button
              type="button"
              onClick={() => setPatientView("map")}
              className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold transition ${
                patientView === "map" ? "border-cyan bg-cyan/15 text-cyan" : "border-line bg-panel2 text-muted hover:border-cyan/50 hover:text-ink"
              }`}
            >
              <Map className="h-4 w-4" />
              전체 병원 지도
            </button>
          </div>
        </div>

        {patientView === "map" ? (
          <FullHospitalMap rooms={rooms} nextExam={nextExam} mode={patient.mode} />
        ) : (
          <>
        <section className="glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink">환자 여정 상태</h2>
            <span className="rounded-md border border-green/40 bg-green/10 px-2 py-1 text-xs font-bold text-green">이동 안내 중</span>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-5">
            {["체크인", aiEnabled ? "AI 추천" : "고정 순서", "이동", "도착 확인", "검사 완료"].map((step, index) => (
              <div key={step} className={`rounded-lg border p-3 ${index <= 2 ? "border-cyan/40 bg-cyan/10" : "border-line bg-panel2"}`}>
                <CheckCircle2 className={`h-4 w-4 ${index <= 2 ? "text-cyan" : "text-muted"}`} />
                <p className="mt-2 text-xs font-bold text-ink">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="glass rounded-xl p-4">
            <h2 className="text-sm font-bold text-ink">알림</h2>
            <div className="mt-3 grid gap-2">
              <Notice
                icon={Bell}
                title={!aiEnabled ? "기존 검사 순서 안내" : insight.sameOrder ? "현재 순서 유지" : "더 빠른 경로 적용됨"}
                body={
                  !aiEnabled
                    ? "AI 최적화가 꺼져 있어 병원 고정 검사 순서로 안내합니다."
                    : insight.sameOrder
                    ? "검사 순서를 바꾸지 않는 것이 현재 대기 상황에서 가장 적합합니다."
                    : `${examLabels[nextExam]} 먼저 진행하면 ${minutes(insight.savedTotal)}을 절약할 수 있습니다.`
                }
              />
              <Notice icon={Headphones} title="접근성 안내" body={patient.mode === "wheelchair" ? "엘리베이터 우선 경로와 여유 이동시간이 적용되었습니다." : "필요 시 직원 호출 또는 보호자 공유를 사용할 수 있습니다."} />
              <Notice icon={Share2} title="보호자 공유" body="현재 안내 경로는 데모용 시뮬레이션 값입니다." />
            </div>
          </div>
          <DigitalTwin rooms={rooms} patients={patients} selectedPatient={patient} aiEnabled={aiEnabled} running={running} variant="compact" />
        </section>
          </>
        )}
      </div>
    </section>
  );
}

function Notice({ icon: Icon, title, body }: { icon: typeof Bell; title: string; body: string }) {
  return (
    <article className="flex items-start gap-3 rounded-lg border border-line bg-panel2 p-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cyan/10 text-cyan">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-ink">{title}</p>
        <p className="mt-1 text-xs font-semibold leading-5 text-muted">{body}</p>
      </div>
      <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted" />
    </article>
  );
}
