export function DemoNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-8 border border-ritual-pink/30 bg-ritual-pink/5 text-xs text-gray-400 rounded-lg px-4 py-3 flex gap-2">
      <span className="text-ritual-pink">◇</span>
      <span>{children}</span>
    </div>
  );
}
