import { formatCurrency, type CategoryPoint } from "@/lib/finance";

interface SpendingBreakdownProps {
  items: CategoryPoint[];
}

const BAR_COLORS = ["#f97316", "#0ea5e9", "#22c55e", "#f43f5e", "#a855f7", "#14b8a6"];

export function SpendingBreakdown({ items }: SpendingBreakdownProps) {
  if (items.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-500">
        No expense entries yet. Add expense transactions to see your category distribution.
      </section>
    );
  }

  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <section className="rounded-2xl border border-slate-900/10 bg-white/85 p-6 shadow-[0_14px_40px_rgba(15,33,55,0.08)] backdrop-blur">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Spending Breakdown</h2>
        <span className="text-xs uppercase tracking-[0.14em] text-slate-500">By Category</span>
      </div>
      <ul className="space-y-4">
        {items.slice(0, 6).map((item, index) => {
          const percentage = total === 0 ? 0 : (item.amount / total) * 100;

          return (
            <li key={item.category}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{item.category}</span>
                <span className="text-slate-500">
                  {formatCurrency(item.amount)} ({percentage.toFixed(0)}%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-[width] duration-700"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: BAR_COLORS[index % BAR_COLORS.length]
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

