"use client";

import { useMemo } from "react";

export type ScheduleDateTimeValue = {
  date: string;
  time: string;
};

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const TIME_OPTIONS = (() => {
  const slots: string[] = [];
  for (let h = 8; h <= 18; h++) {
    for (const m of ["00", "15", "30", "45"]) {
      if (h === 18 && m !== "00") continue;
      slots.push(`${String(h).padStart(2, "0")}:${m}`);
    }
  }
  return slots;
})();

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function todayParts() {
  const d = new Date();
  return {
    year: String(d.getFullYear()),
    month: pad2(d.getMonth() + 1),
    day: pad2(d.getDate()),
  };
}

function parseDate(date: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return null;
  return { year: match[1], month: match[2], day: match[3] };
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

export function defaultScheduleDateTime(): ScheduleDateTimeValue {
  const t = todayParts();
  return { date: `${t.year}-${t.month}-${t.day}`, time: "10:00" };
}

export function scheduleDateTimeToIso(value: ScheduleDateTimeValue): string | null {
  if (!value.date || !value.time) return null;
  const parsed = new Date(`${value.date}T${value.time}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function ScheduleDateTimeField({
  value,
  onChange,
}: {
  value: ScheduleDateTimeValue;
  onChange: (value: ScheduleDateTimeValue) => void;
}) {
  const parsed = parseDate(value.date) ?? todayParts();
  const year = Number(parsed.year);
  const month = Number(parsed.month);

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    return [current, current + 1];
  }, []);

  const dayOptions = useMemo(() => {
    const max = daysInMonth(year, month);
    return Array.from({ length: max }, (_, i) => pad2(i + 1));
  }, [year, month]);

  const today = todayParts();

  function setParts(parts: { year: string; month: string; day: string }) {
    let day = parts.day;
    const maxDay = daysInMonth(Number(parts.year), Number(parts.month));
    if (Number(day) > maxDay) day = pad2(maxDay);

    const date = `${parts.year}-${parts.month}-${day}`;
    if (date < `${today.year}-${today.month}-${today.day}`) {
      onChange({ date: `${today.year}-${today.month}-${today.day}`, time: value.time });
      return;
    }
    onChange({ date, time: value.time });
  }

  function formatTimeLabel(time: string) {
    const [h, m] = time.split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${pad2(m)} ${suffix}`;
  }

  return (
    <div className="space-y-2">
      <CalendarGrid
        year={year}
        month={month}
        selectedDay={parsed.day}
        minDate={`${today.year}-${today.month}-${today.day}`}
        onPick={(day) => setParts({ year: parsed.year, month: parsed.month, day })}
      />
      <div className="grid grid-cols-3 gap-2">
        <div>
          <span className="mb-1 block text-[11px] font-medium text-muted">Month</span>
          <select
            className="input-hr"
            value={parsed.month}
            onChange={(e) =>
              setParts({ year: parsed.year, month: e.target.value, day: parsed.day })
            }
            aria-label="Interview month"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span className="mb-1 block text-[11px] font-medium text-muted">Day</span>
          <select
            className="input-hr"
            value={parsed.day}
            onChange={(e) =>
              setParts({ year: parsed.year, month: parsed.month, day: e.target.value })
            }
            aria-label="Interview day"
          >
            {dayOptions.map((d) => (
              <option key={d} value={d}>
                {Number(d)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span className="mb-1 block text-[11px] font-medium text-muted">Year</span>
          <select
            className="input-hr"
            value={parsed.year}
            onChange={(e) =>
              setParts({ year: e.target.value, month: parsed.month, day: parsed.day })
            }
            aria-label="Interview year"
          >
            {yearOptions.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <span className="mb-1 block text-[11px] font-medium text-muted">Time</span>
        <select
          className="input-hr"
          value={value.time}
          onChange={(e) => onChange({ ...value, time: e.target.value })}
          aria-label="Interview time"
        >
          {TIME_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {formatTimeLabel(t)}
            </option>
          ))}
        </select>
      </div>
      <p className="text-[11px] text-muted">
        Selected:{" "}
        <span className="font-medium text-foreground">
          {value.date
            ? new Date(`${value.date}T${value.time}`).toLocaleString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })
            : "—"}
        </span>
      </p>
    </div>
  );
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function CalendarGrid({
  year,
  month,
  selectedDay,
  minDate,
  onPick,
}: {
  year: number;
  month: number;
  selectedDay: string;
  minDate: string;
  onPick: (day: string) => void;
}) {
  const firstDow = new Date(year, month - 1, 1).getDay();
  const days = daysInMonth(year, month);
  const cells: (string | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: days }, (_, i) => pad2(i + 1)),
  ];

  return (
    <div className="rounded-xl border border-border-subtle bg-card p-3">
      <p className="mb-2 text-center text-xs font-semibold text-muted">
        {MONTHS.find((m) => m.value === pad2(month))?.label} {year}
      </p>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <span key={`e-${i}`} />;
          const date = `${year}-${pad2(month)}-${day}`;
          const disabled = date < minDate;
          const selected = day === selectedDay;
          return (
            <button
              key={date}
              type="button"
              disabled={disabled}
              onClick={() => onPick(day)}
              className={[
                "rounded-md py-1.5 text-xs font-semibold transition",
                selected
                  ? "bg-primary text-primary-foreground"
                  : disabled
                    ? "text-muted/40"
                    : "hover:bg-primary/10 text-foreground",
              ].join(" ")}
            >
              {Number(day)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
