type BarChartDatum = {
  label: string;
  value: number;
};

type BarChartProps = {
  data: BarChartDatum[];
  height?: number;
  formatValue?: (value: number) => string;
};

export function BarChart({ data, height = 180, formatValue }: BarChartProps) {
  if (data.length === 0) {
    return (
      <p className="py-10 text-sm text-neutral-500">Sem dados para exibir.</p>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div>
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((d) => {
          const h = Math.max((d.value / max) * 100, 2);
          return (
            <div
              key={d.label}
              className="group relative flex flex-1 flex-col items-center justify-end"
              title={formatValue ? formatValue(d.value) : String(d.value)}
            >
              <span className="pointer-events-none absolute -top-7 z-10 hidden whitespace-nowrap rounded-md border border-graphite-border bg-graphite-light px-2 py-1 text-[10px] font-semibold text-white group-hover:block">
                {formatValue ? formatValue(d.value) : d.value}
              </span>
              <div
                className="w-full rounded-t-md bg-brand/80 transition-all duration-500 hover:bg-brand"
                style={{ height: `${h}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2">
        {data.map((d) => (
          <span
            key={d.label}
            className="flex-1 truncate text-center text-[10px] font-medium uppercase tracking-wider text-neutral-500"
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

type LineChartProps = {
  data: { label: string; value: number }[];
  height?: number;
  formatValue?: (value: number) => string;
};

export function LineChart({ data, height = 180, formatValue }: LineChartProps) {
  if (data.length === 0) {
    return (
      <p className="py-10 text-sm text-neutral-500">Sem dados para exibir.</p>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const width = 600;
  const pad = 30;

  const stepX = (width - pad * 2) / Math.max(data.length - 1, 1);
  const points = data.map((d, i) => {
    const x = pad + i * stepX;
    const y = height - pad - (d.value / max) * (height - pad * 2);
    return { x, y, ...d };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${height - pad} L${pad},${height - pad} Z`;

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label="Gráfico de vendas"
      >
        {[0.25, 0.5, 0.75, 1].map((f) => {
          const y = height - pad - f * (height - pad * 2);
          return (
            <line
              key={f}
              x1={pad}
              x2={width - pad}
              y1={y}
              y2={y}
              stroke="#2a2a2a"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          );
        })}
        <path d={areaPath} fill="rgba(182,255,0,0.08)" />
        <path d={linePath} fill="none" stroke="#B6FF00" strokeWidth={2.5} strokeLinecap="round" />
        {points.map((p) => (
          <g key={p.label}>
            <circle cx={p.x} cy={p.y} r={4} fill="#B6FF00" />
            {formatValue ? (
              <title>{`${p.label}: ${formatValue(p.value)}`}</title>
            ) : (
              <title>{`${p.label}: ${p.value}`}</title>
            )}
          </g>
        ))}
      </svg>
      <div className="mt-1 flex justify-between px-2">
        <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">
          {data[0]?.label}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">
          {data[data.length - 1]?.label}
        </span>
      </div>
    </div>
  );
}
