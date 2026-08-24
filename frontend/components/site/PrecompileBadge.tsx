const COLOR: Record<string, string> = {
  green: "border-ritual-green/40 text-ritual-green bg-ritual-green/10",
  pink: "border-ritual-pink/40 text-ritual-pink bg-ritual-pink/10",
  lime: "border-ritual-lime/40 text-ritual-lime bg-ritual-lime/10",
  gold: "border-ritual-gold/40 text-ritual-gold bg-ritual-gold/10",
};

export function PrecompileBadge({
  address,
  label,
  color = "green",
}: {
  address: string;
  label: string;
  color?: keyof typeof COLOR;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded border font-mono ${COLOR[color]}`}
    >
      {address}
      <span className="font-body text-gray-400">· {label}</span>
    </span>
  );
}
