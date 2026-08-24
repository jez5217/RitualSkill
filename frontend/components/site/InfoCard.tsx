import { PrecompileBadge } from "./PrecompileBadge";

export function InfoCard({
  title,
  address,
  color,
  children,
}: {
  title: string;
  address: string;
  color?: "green" | "pink" | "lime" | "gold";
  children: React.ReactNode;
}) {
  return (
    <div className="bg-ritual-elevated border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
        <h3 className="font-display text-base text-gray-100">{title}</h3>
        <PrecompileBadge address={address} label="reference only" color={color} />
      </div>
      <p className="text-sm text-gray-500 leading-relaxed">{children}</p>
    </div>
  );
}
