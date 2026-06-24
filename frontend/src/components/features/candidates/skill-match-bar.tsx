import { cn } from "@/lib/utils";

interface Props {
  matched: string[];
  missing: string[];
  extra: string[];
}

export function SkillMatchBar({ matched, missing, extra }: Props) {
  const total = matched.length + missing.length + extra.length;
  if (total === 0) return null;

  const matchedPct = (matched.length / total) * 100;
  const missingPct = (missing.length / total) * 100;
  const extraPct = (extra.length / total) * 100;

  return (
    <div className="space-y-4">
      {/* Proportional bar */}
      <div>
        <div className="flex h-2 overflow-hidden rounded-full">
          {matched.length > 0 && (
            <div className="bg-success" style={{ width: `${matchedPct}%` }} />
          )}
          {missing.length > 0 && (
            <div className="bg-risk" style={{ width: `${missingPct}%` }} />
          )}
          {extra.length > 0 && (
            <div className="bg-talent" style={{ width: `${extraPct}%` }} />
          )}
        </div>
        {/* Legend */}
        <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted">
          {matched.length > 0 && (
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              {matched.length} matched
            </span>
          )}
          {missing.length > 0 && (
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-risk" />
              {missing.length} missing
            </span>
          )}
          {extra.length > 0 && (
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-talent" />
              {extra.length} additional
            </span>
          )}
        </div>
      </div>

      {/* Chip groups — always visible */}
      <div className="space-y-3">
        {matched.length > 0 && (
          <ChipGroup
            label="Matched"
            labelClass="text-success"
            chips={matched}
            chipClass="bg-success/10 text-success"
          />
        )}
        {missing.length > 0 && (
          <ChipGroup
            label="Missing"
            labelClass="text-risk"
            chips={missing}
            chipClass="bg-risk/10 text-risk"
          />
        )}
        {extra.length > 0 && (
          <ChipGroup
            label="Additional"
            labelClass="text-talent"
            chips={extra}
            chipClass="bg-talent/10 text-talent"
          />
        )}
      </div>
    </div>
  );
}

function ChipGroup({
  label,
  labelClass,
  chips,
  chipClass,
}: {
  label: string;
  labelClass: string;
  chips: string[];
  chipClass: string;
}) {
  return (
    <div>
      <p className={cn("mb-1.5 text-[10px] font-bold uppercase tracking-wider", labelClass)}>
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((s) => (
          <span key={s} className={cn("rounded-md px-2.5 py-1 text-xs font-medium", chipClass)}>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
