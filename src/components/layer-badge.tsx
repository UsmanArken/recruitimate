const layers = {
  talent: { emoji: "🧠", label: "Talent Intelligence", color: "bg-violet-500/10 text-violet-700" },
  interview: { emoji: "🎤", label: "Interview Intelligence", color: "bg-sky-500/10 text-sky-700" },
  decision: { emoji: "📊", label: "Decision Intelligence", color: "bg-emerald-500/10 text-emerald-700" },
} as const;

export function LayerBadge({ layer }: { layer: keyof typeof layers }) {
  const l = layers[layer];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${l.color}`}>
      <span>{l.emoji}</span>
      {l.label}
    </span>
  );
}
