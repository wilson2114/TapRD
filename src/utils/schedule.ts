import { Client } from '../types/client';

type BusinessHour = NonNullable<Client['hours']>[number];

export interface GroupedBusinessHour {
  label: string;
  hoursText: string;
  isOpen: boolean;
  includesToday: boolean;
}

const DAY_INDEX_MAP: Record<string, number> = {
  domingo: 0,
  domingos: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  miércoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
  sábado: 6,
  sabados: 6,
  sábados: 6
};

function normalizeDayName(day: string): string {
  return day.trim().toLowerCase();
}

function getDayIndex(day: string): number | null {
  const norm = normalizeDayName(day);
  if (norm in DAY_INDEX_MAP) return DAY_INDEX_MAP[norm];
  for (const [key, idx] of Object.entries(DAY_INDEX_MAP)) {
    if (norm.startsWith(key)) return idx;
  }
  return null;
}

function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr) return null;
  const clean = timeStr.trim().toUpperCase();
  const match = clean.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3];

  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

function formatHourRange(hour: BusinessHour): string {
  if (!hour.isOpen) return 'Cerrado';
  if (hour.display && hour.display.trim()) return hour.display.trim();
  const open = hour.openTime || '09:00 AM';
  const close = hour.closeTime || '06:00 PM';
  return `${open} – ${close}`;
}

/**
 * Determina si el negocio se encuentra abierto actualmente según su horario configurado.
 */
export function getCurrentOpenStatus(hours?: BusinessHour[]): {
  known: boolean;
  isOpenNow: boolean;
  todayText?: string;
} {
  if (!hours || hours.length === 0) {
    return { known: false, isOpenNow: false };
  }

  const now = new Date();
  const todayIdx = now.getDay();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const todayEntry = hours.find((h) => getDayIndex(h.day) === todayIdx);
  if (!todayEntry) {
    return { known: false, isOpenNow: false };
  }

  const todayText = formatHourRange(todayEntry);
  if (!todayEntry.isOpen) {
    return { known: true, isOpenNow: false, todayText };
  }

  let openMin = parseTimeToMinutes(todayEntry.openTime);
  let closeMin = parseTimeToMinutes(todayEntry.closeTime);

  if ((openMin === null || closeMin === null) && todayEntry.display) {
    const parts = todayEntry.display.split(/\s*[–-]\s*/);
    if (parts.length === 2) {
      openMin = parseTimeToMinutes(parts[0]);
      closeMin = parseTimeToMinutes(parts[1]);
    }
  }

  if (openMin !== null && closeMin !== null) {
    const isOpenNow =
      closeMin >= openMin
        ? nowMinutes >= openMin && nowMinutes <= closeMin
        : nowMinutes >= openMin || nowMinutes <= closeMin;
    return { known: true, isOpenNow, todayText };
  }

  return { known: true, isOpenNow: true, todayText };
}

/**
 * Agrupa días consecutivos que comparten exactamente el mismo horario
 * (ej. "Lunes a Viernes: 09:00 AM – 06:00 PM") para reducir el desplazamiento vertical.
 */
export function groupBusinessHours(hours?: BusinessHour[]): GroupedBusinessHour[] {
  if (!hours || hours.length === 0) return [];

  const todayIdx = new Date().getDay();
  const groups: GroupedBusinessHour[] = [];

  let i = 0;
  while (i < hours.length) {
    const start = hours[i];
    const startSignature = `${start.isOpen ? '1' : '0'}|${formatHourRange(start)}`;
    let endIdx = i;
    let includesToday = getDayIndex(start.day) === todayIdx;

    while (endIdx + 1 < hours.length) {
      const next = hours[endIdx + 1];
      const nextSignature = `${next.isOpen ? '1' : '0'}|${formatHourRange(next)}`;
      if (nextSignature !== startSignature) break;
      endIdx++;
      if (getDayIndex(next.day) === todayIdx) {
        includesToday = true;
      }
    }

    const end = hours[endIdx];
    const label =
      endIdx === i
        ? start.day
        : endIdx === i + 1
          ? `${start.day} y ${end.day}`
          : `${start.day} a ${end.day}`;

    groups.push({
      label,
      hoursText: formatHourRange(start),
      isOpen: start.isOpen,
      includesToday
    });

    i = endIdx + 1;
  }

  return groups;
}
