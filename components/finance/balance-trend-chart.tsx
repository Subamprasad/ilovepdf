import { formatCurrency, type MonthlyPoint } from "@/lib/finance";

interface BalanceTrendChartProps {
  points: MonthlyPoint[];
}

const CHART_HEIGHT = 240;
const CHART_WIDTH = 640;
const PADDING = 32;

const toCoordinates = (points: MonthlyPoint[]) => {
  if (points.length === 0) {
    return [];
  }

  const balances = points.map((point) => point.balance);
  const min = Math.min(...balances);
  const max = Math.max(...balances);
  const spread = Math.max(1, max - min);

  return points.map((point, index) => {
    const x =
      points.length === 1 ? CHART_WIDTH / 2 : PADDING + (index / (points.length - 1)) * (CHART_WIDTH - PADDING * 2);
    const y = CHART_HEIGHT - PADDING - ((point.balance - min) / spread) * (CHART_HEIGHT - PADDING * 2);
    return { ...point, x, y };
  });
};

export function BalanceTrendChart({ points }: BalanceTrendChartProps) {
  if (points.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-500">
        No data available yet for balance trend.
      </section>
    );
  }

  const coordinates = toCoordinates(points);
  const linePath = coordinates.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = `${linePath} L ${coordinates[coordinates.length - 1].x} ${CHART_HEIGHT - PADDING} L ${coordinates[0].x} ${CHART_HEIGHT - PADDING} Z`;

  return (
    <section className="rounded-2xl border border-slate-900/10 bg-white/85 p-6 shadow-[0_14px_40px_rgba(15,33,55,0.08)] backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Balance Trend</h2>
        <span className="text-xs uppercase tracking-[0.14em] text-slate-500">Monthly</span>
      </div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="h-[240px] min-w-[520px] w-full"
          role="img"
          aria-label="Balance trend chart"
        >
          <defs>
            <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#0f766e" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#0f766e" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <line
            x1={PADDING}
            y1={CHART_HEIGHT - PADDING}
            x2={CHART_WIDTH - PADDING}
            y2={CHART_HEIGHT - PADDING}
            stroke="#CBD5E1"
            strokeWidth="1"
          />
          <path d={areaPath} fill="url(#trendFill)" />
          <path d={linePath} fill="none" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" />
          {coordinates.map((point) => (
            <g key={point.key}>
              <circle cx={point.x} cy={point.y} r="5" fill="#0f766e" stroke="#ffffff" strokeWidth="2" />
              <text x={point.x} y={CHART_HEIGHT - 10} textAnchor="middle" className="fill-slate-500 text-[12px]">
                {point.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <p className="text-sm text-slate-600">
          Current balance: <span className="font-semibold text-slate-900">{formatCurrency(points[points.length - 1].balance)}</span>
        </p>
        <p className="text-sm text-slate-600">
          Net this month: <span className="font-semibold text-slate-900">{formatCurrency(points[points.length - 1].net)}</span>
        </p>
      </div>
    </section>
  );
}

