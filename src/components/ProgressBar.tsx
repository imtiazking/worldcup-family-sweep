type ProgressBarProps = {
  completed: number;
  total: number;
};

export function ProgressBar({ completed, total }: ProgressBarProps) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm uppercase tracking-wider text-white/50">
            Progress
          </p>
          <p className="font-[family-name:var(--font-bebas)] text-4xl text-wc-gold">
            {completed}/{total}
          </p>
          <p className="text-xs text-white/40">completed</p>
        </div>
        <p className="font-[family-name:var(--font-bebas)] text-2xl text-white/30">
          {Math.round(percentage)}%
        </p>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-wc-navy-light">
        <div
          className="h-full rounded-full bg-gradient-to-r from-wc-gold-dark via-wc-gold to-wc-gold-light transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
