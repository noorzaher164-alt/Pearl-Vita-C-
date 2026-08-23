'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

/**
 * Recharts wrappers locked to the AECC palette.
 *
 * The guide fixes the series order — Plum → Dusty Rose → Rose Gold → Mauve → Soft Rose
 * — and forbids any library default (no blue grid lines, no default tooltip chrome), so
 * every axis, grid line and tooltip is restyled here rather than at each call site.
 */

export const SERIES = ['#48132F', '#9F656B', '#CB8C78', '#AF949E', '#D7A7A5'] as const;

const AXIS = {
  stroke: '#AF949E',
  fontSize: 11,
  fontFamily: 'var(--font-ui), Manrope, Arial, sans-serif',
};

const GRID = 'rgba(72,19,47,0.08)';

const tooltipStyle = {
  contentStyle: {
    background: '#FFFFFF',
    border: '1px solid rgba(72,19,47,0.12)',
    borderRadius: 12,
    boxShadow: '0 10px 35px rgba(75,22,50,.08)',
    fontSize: 12,
    fontFamily: 'var(--font-ui), Manrope, Arial, sans-serif',
    color: '#3B2732',
  },
  labelStyle: { color: '#48132F', fontWeight: 600, marginBottom: 4 },
  itemStyle: { color: '#765F69' },
  cursor: { fill: 'rgba(215,167,165,0.18)' },
} as const;

export function BrandBarChart({
  data,
  xKey,
  bars,
  height = 260,
  layout = 'horizontal',
}: {
  data: Record<string, string | number>[];
  xKey: string;
  bars: { key: string; label: string }[];
  height?: number;
  layout?: 'horizontal' | 'vertical';
}) {
  const vertical = layout === 'vertical';
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={data} layout={layout} margin={{ top: 8, right: 8, bottom: 4, left: vertical ? 8 : -16 }}>
          <CartesianGrid stroke={GRID} vertical={vertical} horizontal={!vertical} />
          {vertical ? (
            <>
              <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey={xKey}
                tick={AXIS}
                axisLine={false}
                tickLine={false}
                width={130}
              />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} tick={AXIS} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS} axisLine={false} tickLine={false} />
            </>
          )}
          <Tooltip {...tooltipStyle} />
          {bars.length > 1 ? (
            <Legend wrapperStyle={{ fontSize: 12, color: '#765F69', paddingTop: 8 }} />
          ) : null}
          {bars.map((bar, index) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              name={bar.label}
              fill={SERIES[index % SERIES.length]}
              radius={vertical ? [0, 6, 6, 0] : [6, 6, 0, 0]}
              maxBarSize={vertical ? 22 : 40}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BrandAreaChart({
  data,
  xKey,
  areaKey,
  label,
  height = 240,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  areaKey: string;
  label: string;
  height?: number;
}) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -16 }}>
          <defs>
            <linearGradient id="aeccArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#48132F" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#48132F" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey={xKey} tick={AXIS} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS} axisLine={false} tickLine={false} domain={[0, 100]} />
          <Tooltip {...tooltipStyle} />
          <Area
            type="monotone"
            dataKey={areaKey}
            name={label}
            stroke="#48132F"
            strokeWidth={2}
            fill="url(#aeccArea)"
            dot={{ r: 3, fill: '#CB8C78', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#48132F', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BrandPieChart({
  data,
  height = 260,
}: {
  data: { name: string; value: number }[];
  height?: number;
}) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="55%"
            outerRadius="82%"
            paddingAngle={2}
            stroke="#FFFFFF"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={SERIES[index % SERIES.length]} />
            ))}
          </Pie>
          <Tooltip {...tooltipStyle} />
          <Legend
            wrapperStyle={{ fontSize: 12, color: '#765F69', paddingTop: 8 }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
