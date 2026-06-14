import { useMemo, useState } from "react";
import { Accessibility, ArrowUpDown, Building2, CheckCircle2, ChevronRight, CircleDot, Clock3, Footprints, LocateFixed, MapPin, Navigation, Search, Sparkles, Waypoints } from "lucide-react";
import type { LucideIcon } from "lucide-react";
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

const floorMapImages: Partial<Record<1 | 2 | 3, string>> = {
  1: "/floors/floor_1f.png",
  2: "/floors/floor_2f.png",
  3: "/floors/floor_3f.png"
};

const roomMapPoints: Record<string, { x: number; y: number }> = {
  checkin: { x: 25, y: 60 },
  imaging_center: { x: 70, y: 73 },
  administration_1f: { x: 35, y: 25 },
  pharmacy: { x: 41, y: 21 },
  cooperation: { x: 16, y: 40 },
  elevator_1f: { x: 43, y: 36 },

  blood_room: { x: 20, y: 38 },
  respiratory_test: { x: 23, y: 32 },
  cardiac_test: { x: 31, y: 25 },
  injection_room: { x: 64, y: 7 },
  digestive_center: { x: 64, y: 64 },
  endoscopy_center: { x: 65, y: 79 },
  cardio_center: { x: 64, y: 30 },
  neuro_center: { x: 64, y: 51 },
  administration_2f: { x: 35, y: 42 },
  elevator_2f: { x: 43, y: 37 },

  family_medicine: { x: 19, y: 47 },
  diabetes_center: { x: 28, y: 40 },
  breast_thyroid: { x: 36, y: 31 },
  ent_center: { x: 69, y: 19 },
  eye_center: { x: 66, y: 40 },
  joint_spine: { x: 66, y: 55 },
  elevator_3f: { x: 43, y: 42 }
};

const routeStartPoints: Record<1 | 2 | 3, { x: number; y: number }> = {
  1: { x: 25, y: 60 },
  2: { x: 43, y: 37 },
  3: { x: 43, y: 42 }
};

const routeCorridorPoints: Record<1 | 2 | 3, { x: number; y: number }> = {
  1: { x: 49, y: 39 },
  2: { x: 43, y: 42 },
  3: { x: 43, y: 44 }
};

const xRange = [-3.45, 1.95];
const zRange = [-3.45, 2.85];

function projectPoint(room: Room) {
  const mapPoint = roomMapPoints[room.id];
  if (mapPoint) return mapPoint;

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

function routeLabel(room: Room | undefined, floor: 1 | 2 | 3) {
  if (room) return room.floor === 1 ? "GATE1에서 출발" : `${room.floor}층 엘리베이터에서 출발`;
  if (floor === 1) return "GATE1·체크인";
  if (floor === 2) return "2층 엘리베이터";
  return "3층 엘리베이터";
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
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(nextRoomId);
  const [query, setQuery] = useState("");
  const [navigationActive, setNavigationActive] = useState(false);

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId);
  const focusedRooms = rooms.filter((room) => room.floor === focusedFloor);
  const normalizedQuery = query.trim().toLowerCase();
  const selectedPoint = selectedRoom ? projectPoint(selectedRoom) : undefined;
  const selectedRoomOnFocusedFloor = Boolean(selectedRoom && selectedRoom.floor === focusedFloor);
  const floorMapImage = floorMapImages[focusedFloor];
  const nextExamLabel = nextExam ? examLabels[nextExam] : "다음 검사";
  const floorCore = focusedRooms.find((room) => room.type === "core");
  const corePoint = floorCore ? projectPoint(floorCore) : { x: 36, y: 50 };
  const routeStartPoint = routeStartPoints[focusedFloor];
  const routeCorridorPoint = routeCorridorPoints[focusedFloor] ?? corePoint;
  const routeBendPoint = selectedPoint ? { x: routeCorridorPoint.x, y: selectedPoint.y } : routeCorridorPoint;
  const routePointList = selectedRoomOnFocusedFloor && selectedPoint ? [routeStartPoint, routeCorridorPoint, routeBendPoint, selectedPoint] : [];
  const routePath = routePointList.length
    ? routePointList.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")
    : "";
  const walkingMinutes = selectedRoom ? estimateWalkingMinutes(selectedRoom, mode) : 0;
  const elevatorMinutes = selectedRoom ? (selectedRoom.floor === 1 ? 0 : mode === "wheelchair" ? 7 : mode === "elderly" ? 5 : 3) : 0;
  const totalMovingMinutes = walkingMinutes + elevatorMinutes;
  const floorHotRooms = focusedRooms.filter((room) => room.type !== "core" && room.queue >= 26).length;
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
  const routeGuideSteps = selectedRoom
    ? [
        { label: "출발", value: "정문·자동 체크인", icon: LocateFixed },
        {
          label: selectedRoom.floor === 1 ? "이동" : "층간 이동",
          value: selectedRoom.floor === 1 ? "1층 중앙 복도 이용" : `중앙 엘리베이터로 ${selectedRoom.floor}층 이동`,
          icon: selectedRoom.floor === 1 ? Footprints : ArrowUpDown
        },
        { label: "도착", value: `${selectedRoom.name} 대기 등록`, icon: MapPin }
      ]
    : [
        { label: "1", value: "층을 먼저 선택", icon: Building2 },
        { label: "2", value: "검사실을 직접 선택", icon: MapPin },
        { label: "3", value: "길찾기 시작", icon: Navigation }
      ];

  function changeFloor(floor: 1 | 2 | 3) {
    setFocusedFloor(floor);
    setSelectedRoomId(undefined);
    setNavigationActive(false);
  }

  function selectRoom(room: Room) {
    setSelectedRoomId(room.id);
    setFocusedFloor(room.floor);
    setNavigationActive(false);
  }

  function startNavigation() {
    if (!selectedRoom) return;
    setNavigationActive(true);
  }

  return (
    <section className="glass rounded-xl p-3 sm:p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-cyan/10 text-cyan sm:h-10 sm:w-10">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-cyan">Smart Navigation</p>
              <h2 className="text-lg font-black text-ink sm:text-xl">전체 병원 안내 지도</h2>
            </div>
          </div>
          <p className="mt-2 hidden max-w-3xl text-xs font-semibold leading-5 text-muted sm:block">
            환자용 화면에서는 병원 안내도 기반 평면도를 사용하고, 현재 위치·엘리베이터·목적지·이동 경로만 강조해 보여줍니다.
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

      <div className="mt-3 grid gap-2 2xl:hidden sm:mt-4 sm:gap-3">
        <div className="rounded-xl border border-cyan/25 bg-cyan/10 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-wide text-cyan">Patient Route</p>
              <p className="mt-1 truncate text-sm font-black text-ink">
                {selectedRoom ? `정문 → ${selectedRoom.name}` : `${floorNames[focusedFloor]} 탐색 중`}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-muted">
                {selectedRoom ? `${selectedRoom.floor}층 · 예상 ${totalMovingMinutes}분 · ${congestionLabel(selectedRoom)}` : "검사실을 누르면 경로와 안내가 생성됩니다."}
              </p>
            </div>
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-cyan/30 bg-bg/60 text-cyan">
              {selectedRoom ? <Navigation className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {([1, 2, 3] as const).map((floor) => (
            <button
              key={floor}
              type="button"
              onClick={() => changeFloor(floor)}
              className={`h-9 rounded-lg border text-xs font-black transition sm:h-10 ${
                focusedFloor === floor ? "border-cyan bg-cyan/20 text-cyan" : "border-line bg-panel2 text-muted"
              }`}
            >
              {floor}층
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-line bg-panel2 px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="검사실 검색"
            className="min-w-0 flex-1 bg-transparent text-sm font-bold text-ink outline-none placeholder:text-muted/70"
          />
        </div>
        {!normalizedQuery && (
          <div className="dashboard-scroll flex gap-2 overflow-x-auto pb-1">
            {quickDestinations.map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => {
                  selectRoom(room);
                }}
                className={`min-w-[138px] rounded-lg border px-3 py-2 text-left ${
                  selectedRoom?.id === room.id ? "border-white bg-white text-bg" : "border-line bg-panel2 text-ink"
                }`}
              >
                <span className="block truncate text-xs font-black">{room.id === nextRoomId ? "다음 검사 · " : ""}{room.name}</span>
                <span className={`text-[11px] font-semibold ${selectedRoom?.id === room.id ? "text-bg/70" : "text-muted"}`}>
                  {room.floor}층 · 대기 {room.queue}명
                </span>
              </button>
            ))}
          </div>
        )}
        {normalizedQuery && (
          <div className="dashboard-scroll flex gap-2 overflow-x-auto pb-1">
            {matchedRooms.map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => {
                  selectRoom(room);
                }}
                className={`min-w-[132px] rounded-lg border px-3 py-2 text-left ${
                  selectedRoom?.id === room.id ? "border-white bg-white text-bg" : "border-line bg-panel2 text-ink"
                }`}
              >
                <span className="block truncate text-xs font-black">{room.name}</span>
                <span className={`text-[11px] font-semibold ${selectedRoom?.id === room.id ? "text-bg/70" : "text-muted"}`}>
                  {room.floor}층 · {estimateWalkingMinutes(room, mode)}분
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 grid gap-3 sm:mt-4 sm:gap-4 2xl:grid-cols-[250px_minmax(0,1fr)_290px]">
        <aside className="hidden gap-3 2xl:order-1 2xl:grid">
          <div className="rounded-xl border border-cyan/25 bg-cyan/10 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-cyan">Destination Shortcuts</p>
            <div className="mt-3 grid gap-2">
              {quickDestinations.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => {
                    selectRoom(room);
                  }}
                  className={`rounded-lg border px-3 py-2 text-left transition ${
                    selectedRoom?.id === room.id ? "border-white bg-white text-bg" : "border-line bg-bg text-ink hover:border-cyan/50"
                  }`}
                >
                  <span className="block truncate text-xs font-black">{room.name}</span>
                  <span className={`text-[11px] font-semibold ${selectedRoom?.id === room.id ? "text-bg/70" : "text-muted"}`}>
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
                  onClick={() => changeFloor(floor)}
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
                    selectRoom(room);
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

        <article className="order-1 min-w-0 overflow-hidden rounded-2xl border border-line bg-[#08162b] p-2 shadow-2xl sm:p-3 2xl:order-2">
          <div className="flex flex-col gap-2 border-b border-line pb-2 sm:pb-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-cyan">Hospital Wayfinding Board</p>
              <h3 className="text-xl font-black text-ink sm:text-2xl">{floorNames[focusedFloor]}</h3>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-bold sm:gap-2 sm:text-[11px]">
              <Badge text={`다음 검사 ${nextExamLabel}`} tone="cyan" />
              <Badge text={selectedRoomOnFocusedFloor && selectedRoom ? `선택 ${selectedRoom.name}` : "층 보기 모드"} tone="green" />
              <Badge text={`혼잡 ${floorHotRooms}곳`} tone={floorHotRooms > 0 ? "yellow" : "green"} />
            </div>
          </div>

          <div className="relative mx-auto mt-2 aspect-[750/880] w-full max-w-[760px] overflow-hidden rounded-xl border border-line bg-[#f6fbff] sm:mt-3" style={{ touchAction: "pan-y" }}>
            {floorMapImage && (
              <>
                <img src={floorMapImage} alt={`${floorNames[focusedFloor]} 평면도`} className="absolute inset-0 h-full w-full object-fill opacity-95" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,18,37,0.03),rgba(47,103,178,0.05))]" />
              </>
            )}
            <div
              className={`absolute inset-0 ${floorMapImage ? "opacity-10" : "opacity-40"}`}
              style={{
                backgroundImage:
                  "linear-gradient(rgba(47,103,178,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(47,103,178,0.08) 1px, transparent 1px)",
                backgroundSize: "34px 34px"
              }}
            />
            {!floorMapImage && focusedFloor === 3 && (
              <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <path d="M8 18 H88 V84 H24 V73 H8 Z" fill="#eef8ff" stroke="#9bb1cf" strokeWidth="0.8" />
                <path d="M13 47 H82" fill="none" stroke="rgba(47,103,178,0.18)" strokeWidth="7" strokeLinecap="round" />
                <path d="M39 20 V79" fill="none" stroke="rgba(47,103,178,0.16)" strokeWidth="5" strokeLinecap="round" />
                <rect x="14" y="24" width="19" height="16" rx="2" fill="#dceff9" stroke="#b3c6d8" />
                <rect x="39" y="20" width="19" height="16" rx="2" fill="#dceff9" stroke="#b3c6d8" />
                <rect x="60" y="27" width="24" height="17" rx="2" fill="#dceff9" stroke="#b3c6d8" />
                <rect x="60" y="47" width="24" height="14" rx="2" fill="#dceff9" stroke="#b3c6d8" />
                <rect x="59" y="65" width="25" height="16" rx="2" fill="#dceff9" stroke="#b3c6d8" />
                <rect x="30" y="34" width="10" height="11" rx="2" fill="#f2f7ff" stroke="#9bb1cf" />
                <text x="23.5" y="33" textAnchor="middle" fontSize="3.2" fontWeight="800" fill="#20324c">가정의학</text>
                <text x="48.5" y="29" textAnchor="middle" fontSize="3.2" fontWeight="800" fill="#20324c">당뇨내분비</text>
                <text x="72" y="37" textAnchor="middle" fontSize="3.2" fontWeight="800" fill="#20324c">이비인후</text>
                <text x="72" y="56" textAnchor="middle" fontSize="3.2" fontWeight="800" fill="#20324c">눈건강</text>
                <text x="71.5" y="74" textAnchor="middle" fontSize="3.2" fontWeight="800" fill="#20324c">관절척추</text>
                <text x="43" y="42" textAnchor="middle" fontSize="3" fontWeight="800" fill="#2f67b2">E/V</text>
              </svg>
            )}
            {!floorMapImage && focusedFloor !== 3 && (
              <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <filter id="map-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="0.8" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <path
                  d="M7 18 H90 V36 H82 V47 H93 V79 H62 V90 H19 V76 H8 Z"
                  fill="rgba(47,103,178,0.08)"
                  stroke="rgba(113,170,230,0.34)"
                  strokeWidth="0.7"
                />
                <path
                  d="M10 47 H88"
                  fill="none"
                  stroke="rgba(80,151,224,0.34)"
                  strokeWidth="6.8"
                  strokeLinecap="round"
                  filter="url(#map-glow)"
                />
                <path
                  d="M35 15 V89"
                  fill="none"
                  stroke="rgba(80,151,224,0.28)"
                  strokeWidth="5.4"
                  strokeLinecap="round"
                  filter="url(#map-glow)"
                />
                <path
                  d="M16 26 H32 M40 26 H68 M74 26 H88 M16 66 H32 M40 66 H58 M66 66 H88 M51 18 V42 M51 54 V82 M70 18 V42 M70 54 V83"
                  fill="none"
                  stroke="rgba(180,214,250,0.2)"
                  strokeWidth="0.65"
                  strokeLinecap="round"
                />
                <rect x="31" y="41" width="8" height="13" rx="2" fill="rgba(47,103,178,0.22)" stroke="rgba(125,196,255,0.55)" strokeWidth="0.7" />
                <path d="M31 41 L39 54 M39 41 L31 54" stroke="rgba(191,226,255,0.34)" strokeWidth="0.45" />
              </svg>
            )}
            {!floorMapImage && <div className="absolute left-[9%] top-[39%] hidden rounded-full border border-cyan/30 bg-bg/80 px-3 py-1 text-[11px] font-black text-cyan sm:block">MAIN CORRIDOR</div>}
            <div className="absolute bottom-3 left-3 rounded-full border border-line bg-bg/90 px-2 py-1 text-[10px] font-bold text-muted shadow-lg sm:bottom-4 sm:left-4 sm:px-3 sm:text-[11px]">
              {routeLabel(selectedRoom, focusedFloor)}
            </div>
            <div className="absolute right-3 top-3 rounded-full border border-line bg-bg/90 px-2 py-1 text-[10px] font-bold text-muted shadow-lg sm:right-4 sm:top-4 sm:px-3 sm:text-[11px]">Floor {focusedFloor}</div>
            <div className="absolute left-3 top-3 z-20 rounded-full border border-line bg-bg/90 px-2 py-1.5 shadow-xl sm:left-4 sm:top-4 sm:px-3">
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-cyan" />
                <span className="text-xs font-black text-ink sm:text-sm">{selectedRoom ? `${totalMovingMinutes}분` : "목적지 선택"}</span>
              </div>
            </div>
            <div className="absolute bottom-4 right-4 z-20 hidden items-end gap-2 rounded-xl border border-line bg-bg/85 p-3 shadow-xl sm:flex">
              <div className="grid gap-1">
                {([3, 2, 1] as const).map((floor) => (
                  <button
                    key={floor}
                    type="button"
                    onClick={() => changeFloor(floor)}
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
              {routePath && (
                <>
                  <path d={routePath} fill="none" stroke="rgba(6,18,37,0.26)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.18" />
                  <path
                    d={routePath}
                    fill="none"
                    stroke={navigationActive ? "rgba(49,201,149,0.95)" : "rgba(47,103,178,0.72)"}
                    strokeWidth={navigationActive ? 1.45 : 1.15}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={navigationActive ? "1 0" : "2.2 2.2"}
                  />
                  {navigationActive && (
                    <path d={routePath} fill="none" stroke="rgba(49,201,149,0.34)" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.36" />
                  )}
                </>
              )}
              <circle cx={routeStartPoint.x} cy={routeStartPoint.y} r="2.1" fill="#2f67b2" opacity="0.95" />
              {selectedRoomOnFocusedFloor && selectedPoint && <circle cx={selectedPoint.x} cy={selectedPoint.y} r="2.1" fill="#37d67a" opacity="0.95" />}
              {navigationActive && routePointList.length > 0 && (
                <circle r="1.45" fill="#31c995" stroke="#ffffff" strokeWidth="0.45">
                  <animateMotion dur="2.8s" repeatCount="indefinite" path={routePath} />
                </circle>
              )}
            </svg>

            {!selectedRoom && (
              <div className="pointer-events-none absolute inset-x-4 bottom-4 z-20 rounded-xl border border-line bg-bg/90 p-3 shadow-2xl backdrop-blur sm:inset-x-auto sm:bottom-5 sm:left-5 sm:w-[310px]">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-cyan" />
                  <p className="text-xs font-black text-ink">검사실을 선택하세요</p>
                </div>
                <p className="mt-1 text-[11px] font-semibold leading-4 text-muted">
                  현재는 {floorNames[focusedFloor]} 전체 보기입니다. 지도 위 검사실을 누르면 정문에서 목적지까지의 경로가 표시됩니다.
                </p>
              </div>
            )}

            {focusedRooms.map((room) => {
              const point = projectPoint(room);
              const isSelected = selectedRoom?.id === room.id;
              const isNext = room.id === nextRoomId;
              const isPdfMap = Boolean(floorMapImage);
              const showLabel = !isPdfMap || isSelected || isNext || room.type === "core";
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => selectRoom(room)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 border text-left shadow-xl transition hover:z-30 hover:scale-[1.04] ${
                    isPdfMap
                      ? showLabel
                        ? "rounded-full px-2.5 py-1.5"
                        : "grid h-6 w-6 place-items-center rounded-full px-0 py-0"
                      : "rounded-xl px-3 py-2"
                  } ${isSelected ? "z-30 border-white bg-white text-bg ring-4 ring-cyan/25" : `${congestionStyle(room)} hover:border-white/70`} ${
                    isNext ? "animate-pulse" : ""
                  }`}
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                >
                  <span className="flex items-center gap-1">
                    <CircleDot className={`${showLabel ? "h-3 w-3" : "h-2.5 w-2.5"} shrink-0 ${isSelected ? "text-bg" : ""}`} />
                    <span className={`${showLabel ? "block" : "hidden"} max-w-[96px] truncate text-[9px] font-black sm:max-w-[132px] sm:text-[10px]`}>{room.name}</span>
                  </span>
                  <span className={`mt-1 ${showLabel ? "hidden sm:block" : "hidden"} text-[9px] font-bold sm:text-[10px] ${isSelected ? "text-bg/70" : "text-muted"}`}>
                    {roomTypeLabel(room)} · {congestionLabel(room)} · {room.queue}명
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-panel2 px-3 py-2">
            <div className="flex flex-wrap gap-2 text-[10px] font-bold text-muted sm:text-[11px]">
              <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-green" />여유 0~10명</span>
              <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-yellow" />보통 11~25명</span>
              <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-red" />혼잡 26명 이상</span>
              <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-cyan" />엘리베이터</span>
            </div>
            <p className="text-[10px] font-bold text-muted sm:text-[11px]">
              {selectedRoom
                ? navigationActive
                  ? `길찾기 중: ${routeLabel(selectedRoom, focusedFloor)} → ${selectedRoom.name}`
                  : `미리보기 경로: ${routeLabel(selectedRoom, focusedFloor)} → ${selectedRoom.name}`
                : "검사실을 선택하면 경로선이 표시됩니다."}
            </p>
          </div>
        </article>

        <aside className="order-3 grid content-start gap-2 sm:gap-3">
          <div className="rounded-xl border border-cyan/35 bg-cyan/10 p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <LocateFixed className="h-4 w-4 text-cyan" />
              <p className="text-sm font-bold text-ink">선택 위치</p>
            </div>
            <h3 className="mt-2 text-xl font-black text-ink sm:mt-3 sm:text-2xl">{selectedRoom ? selectedRoom.name : floorNames[focusedFloor]}</h3>
            <p className="mt-1 text-xs font-bold text-cyan">
              {selectedRoom ? `${selectedRoom.floor}층 · ${roomTypeLabel(selectedRoom)} · 대기 ${selectedRoom.queue}명` : "검사실을 선택하면 상세 안내와 경로가 표시됩니다."}
            </p>
            <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-muted sm:mt-3 sm:line-clamp-none">
              {selectedRoom ? roomHints[selectedRoom.id] ?? "중앙 복도와 엘리베이터 코어를 기준으로 안내되는 병원 전체 지도 위치입니다." : floorDescriptions[focusedFloor]}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <MetricCard label="예상 이동" value={selectedRoom ? `${totalMovingMinutes}분` : "-"} />
            <MetricCard label="층간 이동" value={selectedRoom ? (selectedRoom.floor === 1 ? "없음" : `${selectedRoom.floor}층`) : `${focusedFloor}층`} />
            <MetricCard label="혼잡도" value={selectedRoom ? congestionLabel(selectedRoom) : "층 보기"} />
          </div>

          <div className="rounded-xl border border-line bg-panel2 p-4">
            <div className="flex items-center gap-2">
              <Waypoints className="h-4 w-4 text-green" />
              <p className="text-sm font-bold text-ink">길 안내 요약</p>
            </div>
            <div className="mt-3 grid gap-2">
              {routeGuideSteps.map((step, index) => (
                <GuideStep key={`${step.label}-${step.value}`} index={index + 1} label={step.label} text={step.value} Icon={step.icon} active={Boolean(selectedRoom) && index === routeGuideSteps.length - 1} />
              ))}
            </div>
            <button
              type="button"
              onClick={startNavigation}
              disabled={!selectedRoom}
              className={`mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border text-sm font-bold transition ${
                selectedRoom ? "border-cyan/40 bg-cyan/10 text-cyan hover:bg-cyan/20" : "cursor-not-allowed border-line bg-panel2 text-muted"
              }`}
            >
              <Navigation className="h-4 w-4" />
              {selectedRoom ? (navigationActive ? "길찾기 진행 중" : "길찾기 시작") : "검사실 선택 필요"}
            </button>
            {navigationActive && selectedRoom && (
              <div className="mt-3 rounded-lg border border-green/40 bg-green/10 p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green" />
                  <p className="text-xs font-black text-green">이동 안내 시작</p>
                </div>
                <p className="mt-1 text-xs font-semibold leading-5 text-muted">
                  현재 위치에서 중앙 복도를 따라 이동한 뒤 {selectedRoom.floor === 1 ? selectedRoom.name : `엘리베이터로 ${selectedRoom.floor}층 이동 후 ${selectedRoom.name}`}까지 안내합니다. 예상 이동 시간은 {totalMovingMinutes}분입니다.
                </p>
              </div>
            )}
          </div>

          <div className="hidden rounded-xl border border-green/30 bg-green/10 p-4 sm:block">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-green" />
              <p className="text-sm font-bold text-ink">AI 추천과 연결</p>
            </div>
            <p className="mt-2 text-xs font-semibold leading-5 text-muted">
              현재 AI 추천 다음 검사는 <span className="font-black text-green">{nextExamLabel}</span>입니다. 지도는 추천된 검사실을 우선 강조하고, 검사 순서가 바뀌면 목적지도 함께 바뀝니다.
            </p>
          </div>

          <div className="rounded-xl border border-purple-400/30 bg-purple-400/10 p-3 sm:p-4">
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

function Badge({ text, tone }: { text: string; tone: "cyan" | "green" | "yellow" }) {
  const classes =
    tone === "cyan"
      ? "border-cyan/40 bg-cyan/10 text-cyan"
      : tone === "yellow"
        ? "border-yellow/40 bg-yellow/10 text-yellow"
        : "border-green/40 bg-green/10 text-green";
  return <span className={`rounded-md border px-2 py-1 ${classes}`}>{text}</span>;
}

function GuideStep({ index, label, text, Icon, active = false }: { index: number; label: string; text: string; Icon: LucideIcon; active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 rounded-lg border p-3 ${active ? "border-green/40 bg-green/10" : "border-line bg-bg"}`}>
      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-black ${active ? "bg-green text-bg" : "bg-cyan/15 text-cyan"}`}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-black uppercase tracking-wide text-muted">{index}. {label}</span>
        <span className="block truncate text-xs font-bold text-ink">{text}</span>
      </span>
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
