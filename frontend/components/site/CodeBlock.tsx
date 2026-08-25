import { CopyButton } from "@/components/site/CopyButton";

export function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="bg-ritual-surface border border-gray-800 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-800">
        <span className="text-[10px] uppercase tracking-wide text-gray-400">{label ?? "shell"}</span>
        <CopyButton text={code} />
      </div>
      <pre className="px-3 py-2.5 overflow-x-auto">
        <code className="text-xs font-mono text-gray-300 whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}
