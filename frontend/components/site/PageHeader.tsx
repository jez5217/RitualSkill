export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8">
      <p className="text-xs text-ritual-green uppercase tracking-widest mb-2">{eyebrow}</p>
      <h1 className="font-display text-3xl sm:text-4xl text-gray-100 tracking-tight mb-3">{title}</h1>
      <p className="text-sm text-gray-500 max-w-[65ch] leading-relaxed">{description}</p>
    </div>
  );
}
