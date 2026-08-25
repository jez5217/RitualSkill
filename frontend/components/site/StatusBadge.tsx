import type { FeatureStatus } from "@/lib/featureStatus";
import { STATUS_META } from "@/lib/featureStatus";

/**
 * What kind of "real" a feature is — every interactive card on this site
 * carries one of these, since the site otherwise mixes simulated demos, real
 * in-browser computation, and an actually-deployable contract without
 * distinguishing them.
 */
export function StatusBadge({ status, className }: { status: FeatureStatus; className?: string }) {
  const m = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full border ${m.border} ${m.bg} ${m.text} ${className ?? ""}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}
