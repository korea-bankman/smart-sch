import { useMemo, useState } from "react";
import { Accessibility, Building2, ChevronRight, CircleDot, Clock3, LocateFixed, Search, Sparkles, Waypoints } from "lucide-react";
import type { ExamId, Mode, Room } from "../types";
import { examLabels, examToRoom } from "../data/hospital";

type Props = {
  rooms: Room[];
  nextExam?: ExamId;
  mode: Mode;
};

const floorNames: Record<1 | 2 | 3, string> = {
  1: "1층 외래·영상",
  2: "2층 검사·시술",
  3: "3층 전문센터"
};

const floorDescriptions: Record<1 | 2 | 3, string> = {
  1: "출입구, 원무, 영상의학, 약국을 중심으로 첫 방문 환자가 가장 많이 지나는 층",
  2: "채혈, 심장검사, 호흡기검사, 주사센터 등 AI 동선 최적화가 집중되는 층",
  3: "가정의학, 내분비, 유방갑상선, 이비인후, 눈건강, 관절척추 센터 안내 층"
};

const roomHints: Partial<Record<string, string>> = {
  checkin: "정문 진입 후 키오스크·WiFi·모바일 앱 체크인이 시작되는 지점입니다.",
  imaging_center: "1층 중앙 복도 우측에 위치합니다. CT/MRI/X-ray 등 영상검사 안내 구역입니다.",
  blood_room: "2층 엘리베이터 하차 후 좌측 검사 구역입니다. 오전 시간대 병목이 자주 발생하는 핵심 검사실입니다.",
  cardiac_test: "2층 검사 복도 중간에 위치합니다. 심전도 및 외래 심장검사를 안내합니다.",
  respiratory_test: "2층 검사 복도 안쪽에 위치합니다. 호흡기 기능 검사 구역입니다.",
  injection_room: "2층 우측 하단에 위치합니다. 주사 처치 및 대기 공간입니다.",
  endoscopy_center: "2층 우측 상단에 위치합니다. 내시경 검사 대기 구역입니다.",
  elevator_1f: "1층 중앙 엘리베이터 코어입니다.",
  elevator_2f: "2층 중앙 엘리베이터 코어입니다.",
  elevator_3f: "3층 중앙 엘리베이터 코어입니다."
};

const xRange = [-3.45, 1.95];
const zRange = [-3.45, 2.85];

function projectPoint(room: Room) {
  const x = ((room.position.x - xRange[0]) / (xRange[1] - xRange[0])) * 100;
  const y = ((room.position.z - zRange[0]) / (zRange[1] - zRange[0])) * 100;
  return {
    x: Math.max(8, Math.min(90, x)),
    y: Math.max(12, Math.min(86, y))
  };
}

function congestionStyle(room: Room) {
  if (room.type === "core") return "border-cyan/70 bg-cyan/20 text-cyan shadow-cyan/20";
  if (room.queue >= 26) return "border-red/70 bg-red/20 text-red shadow-red/20";
  if (room.queue >= 11) return "border-yellow/70 bg-yellow/20 text-yellow shadow-yellow/20";
  return "border-green/60 bg-green/20 text-green shadow-green/20";
}

function congestionLabel(room: Room) {
  if (room.type === "core") return "이동";
  if (room.queue >= 26) return "혼잡";
  if (room.queue >= 11) return "보통";
  return "여유";
}

function roomTypeLabel(room: Room) {
  if (room.type === "exam") return "검사실";
  if (room.type === "core") return "엘리베이터";
  if (room.type === "entry") return "체크인";
  return "안내";
}

function floorCongestion(rooms: Room[], floor: 1 | 2 | 3) {
  const floorRooms = rooms.filter((room) => room.floor === floor && room.type !== "core");
  const totalQueue = floorRooms.reduce((sum, room) => sum + room.queue, 0);
  const hotRooms = floorRooms.filter((room) => room.queue >= 26).length;
  return { totalQueue, hotRooms, roomCount: floorRooms.length };
}

function estimateWalkingMinutes(room: Room, mode: Mode) {
  const base = room.floor === 1 ? 3.5 : room.floor === 2 ? 5.5 : 7.5;
  const congestionPenalty = room.queue >= 26 ? 1.5 : room.queue >= 11 ? 0.8 : 0.3;
  const accessibilityPenalty = mode === "wheelchair" ? 3.5 : mode === "elderly" ? 2.2 : 0;
  return Math.round(base + congestionPenalty + accessibilityPenalty);
}

export function FullHospitalMap({ rooms, nextExam, mode }: Props) {
  const nextRoomId = nextExam ? examToRoom[nextExam] : undefined;
  const nextRoom = rooms.find((room) => room.id === nextRoomId);
  const [focusedFloor, setFocusedFloor] = useState<1 | 2 | 3>(nextRoom?.floor ?? 2);
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(nextRoomId ?? "checkin");
  const [query, setQuery] = useState("");

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? nextRoom ?? rooms[0];
  const focusedRooms = rooms.filter((room) => room.floor === focusedFloor);
  const normalizedQuery = query.trim().toLowerCase();
  const selectedPoint = projectPoint(selectedRoom);
  const nextExamLabel = nextExam ? examLabels[nextExam] : "다음 검사";
  const floorCore = focusedRooms.find((room) => room.type === "core");
  const corePoint = floorCore ? projectPoint(floorCore) : { x: 36, y: 50 };
  const routePoints = `14,78 ${corePoint.x},78 ${corePoint.x},${corePoint.y} ${selectedPoint.x},${selectedPoint.y}`;
  const walkingMinutes = estimateWalkingMinutes(selectedRoom, mode);
  const elevatorMinutes = selectedRoom.floor === 1 ? 0 : mode === "wheelchair" ? 7 : mode === "elderly" ? 5 : 3;
  const totalMovingMinutes = walkingMinutes + elevatorMinutes;
  const quickDestinations = useMemo(() => {
    const ids = [nextRoomId, "blood_room", "imaging_center", "cardiac_test", "injection_room", "respiratory_test"].filter(Boolean);
    return ids
      .map((id) => rooms.find((room) => room.id === id))
      .filter((room): room is Room => Boolean(room))
      .filter((room, index, list) => list.findIndex((item) => item.id === room.id) === index)
      .slice(0, 5);
  }, [nextRoomId, rooms]);

  const matchedRooms = useMemo(() => {
    const source = rooms.filter((room) => room.type !== "core");
    if (!normalizedQuery) return source.sort((a, b) => b.queue - a.queue).slice(0, 6);
    return source
      .filter((room) => room.name.toLowerCase().includes(normalizedQuery) || `${room.floor}층`.includes(normalizedQuery))
      .slice(0, 8);
  }, [normalizedQuery, rooms]);

  const elevatorWait = mode === "wheelchair" ? "휠체어 모드: 엘리베이터 대기 7~9분과 넓은 회전 동선을 반영합니다." : mode === "elderly" ? "고령자 모드: 보행속도 35% 감속과 여유 이동시간을 반영합니다." : "일반 모드: 표준 보행속도와 중앙 엘리베이터 기준으로 안내합니다.";

  return (
    <section className="glass rounded-xl p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-cyan/10 text-cyan">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-cyan">Smart Navigation</p>
              <h2 className="text-xl font-black text-ink">전체 병원 안내 지도</h2>
            </div>
          </div>
          <p className="mt-2 max-w-3xl text-xs font-semibold leading-5 text-muted">
            환자용 화면에서는 전체 병원 구조를 모식도로 제공하고, AI가 추천한 다음 검사 위치를 층별 안내판 위에 바로 강조합니다.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <div className="hidden items-center gap-2 rounded-xl border border-line bg-white/95 px-3 py-2 shadow-lg shadow-black/20 md:flex">
            <img src="/brand/sch-cheonan-seal-transparent.png" alt="" aria-hidden="true" className="h-9 w-9 object-contain" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-wide text-[#2f67b2]">SCH Cheonan</p>
              <p className="text-[10px] font-bold text-[#43658f]">Patient Wayfinding</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 rounded-xl border border-line bg-panel2 p-2 text-[11px] font-bold">
            <Legend label="여유" className="bg-green" />
            <Legend label="보통" className="bg-yellow" />
            <Legend label="혼잡" className="bg-red" />
            <Legend label="이동" className="bg-cyan" />
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 2xl:grid-cols-[250px_minmax(0,1fr)_290px]">
        <aside className="hidden gap-3 2xl:order-1 2xl:grid">
          <div className="rounded-xl border border-cyan/25 bg-cyan/10 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-cyan">Destination Shortcuts</p>
            <div className="mt-3 grid gap-2">
              {quickDestinations.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => {
                    setSelectedRoomId(room.id);
                    setFocusedFloor(room.floor);
                  }}
                  className={`rounded-lg border px-3 py-2 text-left transition ${
                    selectedRoom.id === room.id ? "border-white bg-white text-bg" : "border-line bg-bg text-ink hover:border-cyan/50"
                  }`}
                >
                  <span className="block truncate text-xs font-black">{room.name}</span>
                  <span className={`text-[11px] font-semibold ${selectedRoom.id === room.id ? "text-bg/70" : "text-muted"}`}>
                    {room.floor}층 · 예상 이동 {estimateWalkingMinutes(room, mode)}분
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-line bg-panel2 p-3">
            <label className="text-xs font-bold text-muted" htmlFor="hospital-map-search">진료과·검사실 검색</label>
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-line bg-bg px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-muted" />
              <input
                id="hospital-map-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="채혈실, 영상의학센터..."
                className="w-full min-w-0 bg-transparent text-sm font-bold text-ink outline-none placeholder:text-muted/70"
              />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 2xl:grid-cols-1">
            {([1, 2, 3] as const).map((floor) => {
              const summary = floorCongestion(rooms, floor);
              return (
                <button
                  key={floor}
                  type="button"
                  onClick={() => setFocusedFloor(floor)}
                  className={`rounded-xl border p-3 text-left transition ${
                    focusedFloor === floor ? "border-cyan bg-cyan/15 shadow-lg shadow-cyan/10" : "border-line bg-panel2 hover:border-cyan/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-black text-ink">{floorNames[floor]}</p>
                    <span className="rounded-md border border-line bg-bg px-2 py-1 text-[11px] font-bold text-muted">{summary.roomCount}곳</span>
                  </div>
                  <p className="mt-1 text-[11px] font-semibold leading-4 text-muted">{floorDescriptions[floor]}</p>
                  <div className="mt-3 flex items-center justify-between text-[11px] font-bold">
                    <span className="text-muted">대기 합계 {summary.totalQueue}명</span>
                    <span className={summary.hotRooms > 0 ? "text-red" : "text-green"}>혼잡 {summary.hotRooms}곳</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-line bg-panel2 p-3">
            <p className="text-xs font-bold text-muted">{normalizedQuery ? "검색 결과" : "혼잡도 상위"}</p>
            <div className="mt-2 grid gap-2">
              {matchedRooms.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => {
                    setSelectedRoomId(room.id);
                    setFocusedFloor(room.floor);
                  }}
                  className="flex items-center justify-between gap-2 rounded-lg border border-line bg-bg px-3 py-2 text-left transition hover:border-cyan/50"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold text-ink">{room.name}</span>
                    <span className="text-[11px] font-semibold text-muted">{room.floor}층 · 대기 {room.queue}명</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
                </button>
              ))}
            </div>
          </div>
        </aside>

        <article className="order-1 min-w-0 overflow-hidden rounded-2xl border border-line bg-[#08162b] p-3 shadow-2xl 2xl:order-2">
          <div className="flex flex-col gap-2 border-b border-line pb-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-cyan">Hospital Wayfinding Board</p>
              <h3 className="text-2xl font-black text-ink">{floorNames[focusedFloor]}</h3>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] font-bold">
              <Badge text={`다음 검사 ${nextExamLabel}`} tone="cyan" />
              <Badge text={`선택 ${selectedRoom.name}`} tone="green" />
            </div>
          </div>

          <div className="relative mt-3 h-[460px] overflow-hidden rounded-xl border border-line bg-[#0a1d38] lg:h-[520px]">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(47,103,178,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(47,103,178,0.08) 1px, transparent 1px)",
                backgroundSize: "34px 34px"
              }}
            />
            <div className="absolute left-[8%] right-[8%] top-[47%] h-[44px] -translate-y-1/2 rounded-full border border-cyan/15 bg-cyan/8" />
            <div className="absolute bottom-[9%] left-[31%] top-[12%] w-[48px] rounded-full border border-cyan/15 bg-cyan/8" />
            <div className="absolute left-[9%] top-[39%] rounded-full border border-cyan/30 bg-bg/80 px-3 py-1 text-[11px] font-black text-cyan">MAIN CORRIDOR</div>
            <div className="absolute bottom-4 left-4 rounded-full border border-line bg-bg/80 px-3 py-1 text-[11px] font-bold text-muted">정문·접수 방향</div>
            <div className="absolute right-4 top-4 rounded-full border border-line bg-bg/80 px-3 py-1 text-[11px] font-bold text-muted">Floor {focusedFloor}</div>
            <div className="absolute left-4 top-4 z-20 rounded-xl border border-line bg-bg/90 p-3 shadow-xl">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Estimated Navigation</p>
              <div className="mt-2 flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-cyan" />
                <span className="text-lg font-black text-ink">{totalMovingMinutes}분</span>
              </div>
              <p className="mt-1 text-[10px] font-bold text-muted">도보 {walkingMinutes}분 · 엘리베이터 {elevatorMinutes}분</p>
            </div>
            <div className="absolute bottom-4 right-4 z-20 flex items-end gap-2 rounded-xl border border-line bg-bg/85 p-3 shadow-xl">
              <div className="grid gap-1">
                {([3, 2, 1] as const).map((floor) => (
                  <button
                    key={floor}
                    type="button"
                    onClick={() => setFocusedFloor(floor)}
                    className={`flex h-10 w-20 items-center justify-between rounded-lg border px-2 text-[11px] font-black transition ${
                      floor === focusedFloor ? "border-cyan bg-cyan/20 text-cyan" : "border-line bg-panel2 text-muted hover:border-cyan/50"
                    }`}
                  >
                    <span>{floor}F</span>
                    <span className="h-2 w-2 rounded-full bg-cyan/70" />
                  </button>
                ))}
              </div>
              <div className="h-[126px] w-3 rounded-full border border-cyan/20 bg-cyan/10" />
            </div>

            <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline points={routePoints} fill="none" stroke="rgba(47,103,178,0.26)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 2" />
              <circle cx="14" cy="78" r="1.7" fill="#2f67b2" opacity="0.9" />
              <circle cx={selectedPoint.x} cy={selectedPoint.y} r="2.1" fill="#37d67a" opacity="0.95" />
            </svg>

            {focusedRooms.map((room) => {
              const point = projectPoint(room);
              const isSelected = room.id === selectedRoom.id;
              const isNext = room.id === nextRoomId;
              const wide = room.name.length > 6 || room.type === "exam";
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border px-3 py-2 text-left shadow-xl transition hover:z-30 hover:scale-[1.04] ${
                    wide ? "w-[148px]" : "w-[116px]"
                  } ${isSelected ? "z-30 border-white bg-white text-bg ring-4 ring-cyan/25" : `${congestionStyle(room)} hover:border-white/70`} ${
                    isNext ? "animate-pulse" : ""
                  }`}
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                >
                  <span className="flex items-center gap-1">
                    <CircleDot className={`h-3 w-3 shrink-0 ${isSelected ? "text-bg" : ""}`} />
                    <span className="block truncate text-[11px] font-black">{room.name}</span>
                  </span>
                  <span className={`mt-1 block text-[10px] font-bold ${isSelected ? "text-bg/70" : "text-muted"}`}>
                    {roomTypeLabel(room)} · {congestionLabel(room)} · {room.queue}명
                  </span>
                </button>
              );
            })}
          </div>
        </article>

        <aside className="order-3 grid content-start gap-3">
          <div className="rounded-xl border border-cyan/35 bg-cyan/10 p-4">
            <div className="flex items-center gap-2">
              <LocateFixed className="h-4 w-4 text-cyan" />
              <p className="text-sm font-bold text-ink">선택 위치</p>
            </div>
            <h3 className="mt-3 text-2xl font-black text-ink">{selectedRoom.name}</h3>
            <p className="mt-1 text-xs font-bold text-cyan">{selectedRoom.floor}층 · {roomTypeLabel(selectedRoom)} · 대기 {selectedRoom.queue}명</p>
            <p className="mt-3 text-xs font-semibold leading-5 text-muted">{roomHints[selectedRoom.id] ?? "중앙 복도와 엘리베이터 코어를 기준으로 안내되는 병원 전체 지도 위치입니다."}</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <MetricCard label="예상 이동" value={`${totalMovingMinutes}분`} />
            <MetricCard label="층간 이동" value={selectedRoom.floor === 1 ? "없음" : `${selectedRoom.floor}층`} />
            <MetricCard label="혼잡도" value={congestionLabel(selectedRoom)} />
          </div>

          <div className="rounded-xl border border-line bg-panel2 p-4">
            <div className="flex items-center gap-2">
              <Waypoints className="h-4 w-4 text-green" />
              <p className="text-sm font-bold text-ink">길 안내 요약</p>
            </div>
            <div className="mt-3 grid gap-2">
              <RouteStep index={1} text="자동 체크인 완료" />
              <RouteStep index={2} text={`${selectedRoom.floor === 1 ? "1층 중앙 복도" : `중앙 엘리베이터로 ${selectedRoom.floor}층 이동`}`} />
              <RouteStep index={3} text={`${selectedRoom.name} 도착 후 대기 등록`} active />
            </div>
          </div>

          <div className="rounded-xl border border-green/30 bg-green/10 p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-green" />
              <p className="text-sm font-bold text-ink">AI 추천과 연결</p>
            </div>
            <p className="mt-2 text-xs font-semibold leading-5 text-muted">
              현재 AI 추천 다음 검사는 <span className="font-black text-green">{nextExamLabel}</span>입니다. 지도는 추천된 검사실을 우선 강조하고, 검사 순서가 바뀌면 목적지도 함께 바뀝니다.
            </p>
          </div>

          <div className="rounded-xl border border-purple-400/30 bg-purple-400/10 p-4">
            <div className="flex items-center gap-2">
              <Accessibility className="h-4 w-4 text-purple-200" />
              <p className="text-sm font-bold text-ink">접근성 안내</p>
            </div>
            <p className="mt-2 text-xs font-semibold leading-5 text-muted">{elevatorWait}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Legend({ label, className }: { label: string; className: string }) {
  return (
    <span className="flex items-center gap-1 whitespace-nowrap text-muted">
      <span className={`h-2.5 w-2.5 rounded-full ${className}`} />
      {label}
    </span>
  );
}

function Badge({ text, tone }: { text: string; tone: "cyan" | "green" }) {
  const classes = tone === "cyan" ? "border-cyan/40 bg-cyan/10 text-cyan" : "border-green/40 bg-green/10 text-green";
  return <span className={`rounded-md border px-2 py-1 ${classes}`}>{text}</span>;
}

function RouteStep({ index, text, active = false }: { index: number; text: string; active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 rounded-lg border p-3 ${active ? "border-green/40 bg-green/10" : "border-line bg-bg"}`}>
      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-black ${active ? "bg-green text-bg" : "bg-cyan/15 text-cyan"}`}>{index}</span>
      <span className="text-xs font-bold text-ink">{text}</span>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-panel2 p-3">
      <p className="text-[10px] font-bold text-muted">{label}</p>
      <p className="mt-1 text-sm font-black text-ink">{value}</p>
    </div>
  );
}
