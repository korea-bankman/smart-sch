import { ArrowRight, CheckCircle2, Clock3, Footprints, MapPinned, Navigation, ShieldCheck, Stethoscope, TimerReset } from "lucide-react";
import type { Patient, Room } from "../types";
import { examLabels, examToRoom } from "../data/hospital";
import { congestionLabel, minutes } from "../lib/ui";

type Props = {
  patient: Patient | undefined;
  rooms: Room[];
  onOpenDetail: () => void;
};

export function PatientCompanionPanel({ patient, rooms, onOpenDetail }: Props) {
  if (!patient) {
    return (
      <section className="glass rounded-xl p-5">
        <p className="text-sm font-bold text-muted">환자 정보를 불러오는 중입니다.</p>
      </section>
    );
  }

  const firstExam = patient.aiOrder[0];
  const nextRoom = rooms.find((room) => room.id === examToRoom[firstExam]);
  const saved = Math.max(0, patient.before.total - patient.after.total);
  const nextFloor = nextRoom ? `${nextRoom.floor}층` : "확인 중";
  const nextCongestion = nextRoom ? congestionLabel(nextRoom.queue) : "확인 중";
  const elevatorQueue = rooms.filter((room) => room.type === "core").reduce((sum, room) => sum + room.queue, 0);
  const elevatorWait = patient.mode === "wheelchair" ? 7 + elevatorQueue * 0.8 : patient.mode === "elderly" ? 4 + elevatorQueue * 0.45 : 2 + elevatorQueue * 0.25;

  return (
    <section className="glass overflow-hidden rounded-xl">
      <div className="border-b border-line bg-cyan/10 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-cyan">Patient Mobile Guide Preview</p>
        <h2 className="mt-2 text-xl font-bold text-ink">
          {patient.name}님, 다음 검사는 {examLabels[firstExam]}입니다
        </h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-muted">
          실시간 대기열을 반영해 총 체류시간이 가장 짧은 순서로 안내합니다.
        </p>
      </div>

      <div className="grid gap-3 p-4">
        <div className="rounded-xl border border-cyan/40 bg-cyan/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-cyan">지금 이동할 곳</p>
              <p className="mt-1 text-2xl font-bold text-ink">{nextRoom?.name ?? examLabels[firstExam]}</p>
              <p className="mt-2 text-sm font-semibold text-muted">
                {nextFloor} · 현재 {nextRoom?.queue ?? 0}명 대기 · {nextCongestion}
              </p>
            </div>
            <MapPinned className="h-10 w-10 shrink-0 text-cyan" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <PatientMetric icon={Clock3} label="예상 체류" value={minutes(patient.after.total)} />
          <PatientMetric icon={Footprints} label="이동 시간" value={minutes(patient.after.walking)} />
          <PatientMetric icon={ShieldCheck} label="절감 시간" value={minutes(saved)} />
        </div>

        <div className="rounded-xl border border-yellow/40 bg-yellow/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-yellow">층간 이동 안내</p>
              <p className="mt-1 text-sm font-bold text-ink">엘리베이터 예상 대기 {minutes(elevatorWait)}</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-muted">
                {patient.mode === "wheelchair"
                  ? "휠체어 모드가 적용되어 엘리베이터 우선 경로로 안내합니다."
                  : patient.mode === "elderly"
                    ? "고령자 모드가 적용되어 이동 부담이 적은 순서로 안내합니다."
                    : "층간 이동이 필요한 경우 가장 가까운 엘리베이터 코어로 안내합니다."}
              </p>
            </div>
            <TimerReset className="h-8 w-8 shrink-0 text-yellow" />
          </div>
        </div>

        <div className="rounded-xl border border-line bg-panel2 p-4">
          <p className="text-xs font-bold text-muted">오늘의 AI 추천 검사 순서</p>
          <div className="mt-3 grid gap-2">
            {patient.aiOrder.map((exam, index) => {
              const room = rooms.find((item) => item.id === examToRoom[exam]);
              return (
                <div key={`${exam}-${index}`} className="flex items-center gap-2 rounded-lg border border-line bg-bg/60 px-3 py-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cyan/15 text-xs font-bold text-cyan">{index + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-ink">{examLabels[exam]}</span>
                    <span className="block truncate text-xs font-semibold text-muted">
                      {room?.floor ?? "-"}층 · 대기 {room?.queue ?? 0}명 · 평균 {room?.examMinutes ?? 0}분
                    </span>
                  </span>
                  {index < patient.aiOrder.length - 1 && <ArrowRight className="h-4 w-4 shrink-0 text-muted" />}
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenDetail}
          className="h-11 rounded-lg border border-green/40 bg-green/10 text-sm font-bold text-green hover:bg-green/20"
        >
          왜 이 순서인지 보기
        </button>
        <div className="grid grid-cols-2 gap-2">
          <PatientAction icon={Navigation} label="길찾기 시작" tone="border-cyan/40 bg-cyan/10 text-cyan" />
          <PatientAction icon={CheckCircle2} label="도착 확인" tone="border-green/40 bg-green/10 text-green" />
          <PatientAction icon={Stethoscope} label="검사 완료" tone="border-line bg-panel2 text-muted" />
          <PatientAction icon={ArrowRight} label="다음 검사 보기" tone="border-line bg-panel2 text-muted" />
        </div>
      </div>
    </section>
  );
}

function PatientMetric({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-panel2 p-3">
      <Icon className="h-4 w-4 text-cyan" />
      <p className="mt-2 text-xs font-bold text-muted">{label}</p>
      <p className="mt-1 text-sm font-bold text-ink">{value}</p>
    </div>
  );
}

function PatientAction({ icon: Icon, label, tone }: { icon: typeof Navigation; label: string; tone: string }) {
  return (
    <button type="button" className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border text-sm font-bold ${tone}`}>
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
