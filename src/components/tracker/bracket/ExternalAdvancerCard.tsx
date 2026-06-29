import type { ExternalBracketAdvancer } from "@/lib/round-of-32-bracket";
import { BracketFlagCircle } from "./BracketNodes";

type ExternalAdvancerCardProps = {
  advancer: ExternalBracketAdvancer;
};

export function ExternalAdvancerCard({ advancer }: ExternalAdvancerCardProps) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
      <div className="flex items-center gap-3">
        <BracketFlagCircle flag={advancer.flagEmoji} compact />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-900">
            {advancer.teamName}
          </p>
          <p className="text-xs text-slate-500">
            Advanced to {advancer.advancedTo}
          </p>
          <p className="text-xs text-slate-500">{advancer.nextFixture}</p>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-200">
          Advanced
        </span>
      </div>
    </div>
  );
}
