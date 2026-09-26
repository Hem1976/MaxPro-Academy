interface BarItem {
  label: string;
  value: number;
  max?: number;
}

interface MetricsChartProps {
  title: string;
  items: BarItem[];
  emptyMessage?: string;
}

export function MetricsChart({
  title,
  items,
  emptyMessage = "No data yet",
}: MetricsChartProps) {
  const maxValue = Math.max(
    ...items.map((i) => (i.max != null ? i.max : i.value)),
    1,
  );

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item) => {
            const scale = item.max ?? maxValue;
            const fill = Math.round((item.value / Math.max(scale, 1)) * 100);
            return (
              <li key={item.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium text-foreground">{item.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${fill}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
