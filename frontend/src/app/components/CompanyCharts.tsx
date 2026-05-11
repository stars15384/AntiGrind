import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import i18n from '../../i18n';
import type { WorkHourRecord } from '../../types';

interface CompanyChartsProps {
  workHourRecords: WorkHourRecord[];
}

const COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444'];

function t(key: string, fallback?: string): string {
  const result = i18n.t(key);
  return result !== key ? result : (fallback || key);
}

function ChartCard({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow">
      <h3 style={{ fontFamily: 'var(--font-serif)' }} className="text-lg font-semibold mb-4 text-[var(--foreground)]">
        {title}
      </h3>
      {children}
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.98)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  fontSize: '13px',
  color: 'var(--foreground)',
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
  if (active && payload && payload.length) {
    return (
      <div style={tooltipStyle} className="p-3">
        <p className="font-medium text-[var(--foreground)] mb-1">{payload[0].name}</p>
        <p className="text-[var(--primary)] font-semibold">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export function WorkHoursPieChart({ workHourRecords }: CompanyChartsProps) {
  const data = [
    { name: t('company.chart_hours_healthy', '\u226440h'), value: 0 },
    { name: t('company.chart_hours_moderate', '40-50h'), value: 0 },
    { name: t('company.chart_hours_heavy', '50-60h'), value: 0 },
    { name: t('company.chart_hours_overload', '>60h'), value: 0 },
  ];

  workHourRecords.forEach((record) => {
    if (record.weekly_hours <= 40) data[0].value++;
    else if (record.weekly_hours <= 50) data[1].value++;
    else if (record.weekly_hours <= 60) data[2].value++;
    else data[3].value++;
  });

  const hasData = data.some((d) => d.value > 0);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if ((percent || 0) < 0.08) return null;
    const RADIAN = Math.PI / 180;
    const radius = (Number(outerRadius) + Number(innerRadius)) / 2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ChartCard title={t('company.work_hours', '工作时长记录')}>
      {!hasData ? (
        <p className="text-[var(--muted-foreground)] text-center py-12">{t('common.no_data', '暂无数据')}</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                label={renderCustomLabel}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[var(--muted)]/30">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index] }} />
                <span className="text-xs text-[var(--muted-foreground)] truncate">{item.name}</span>
                <span className="text-xs font-medium text-[var(--foreground)] ml-auto">{total > 0 ? `${Math.round(item.value / total * 100)}%` : '0%'}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </ChartCard>
  );
}

export function WeekendPolicyBarChart({ workHourRecords }: CompanyChartsProps) {
  const policyMap: Record<string, number> = {};

  workHourRecords.forEach((record) => {
    policyMap[record.weekend_policy] = (policyMap[record.weekend_policy] || 0) + 1;
  });

  const data = Object.entries(policyMap).map(([key, value]) => ({
    name: getTermTranslation(key, 'weekend_policy'),
    value,
  }));

  const hasData = data.length > 0;

  return (
    <ChartCard title={t('company.weekend_policy', '周末政策')}>
      {!hasData ? (
        <p className="text-[var(--muted-foreground)] text-center py-12">{t('common.no_data', '暂无数据')}</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.4 }} />
            <Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export function OvertimeCompensationChart({ workHourRecords }: CompanyChartsProps) {
  const compensationMap: Record<string, number> = {};
  const compColors: Record<string, string> = {
    legal: '#22c55e',
    fixed_subsidy: '#eab308',
    time_off: '#3b82f6',
    none: '#ef4444',
  };

  workHourRecords.forEach((record) => {
    compensationMap[record.overtime_compensation] =
      (compensationMap[record.overtime_compensation] || 0) + 1;
  });

  const data = Object.entries(compensationMap).map(([key, value]) => ({
    name: getTermTranslation(key, 'overtime_compensation'),
    value,
    color: compColors[key] || '#94a3b8',
  }));

  const hasData = data.length > 0;
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <ChartCard title={t('company.overtime_compensation', '加班补偿')}>
      {!hasData ? (
        <p className="text-[var(--muted-foreground)] text-center py-12">{t('common.no_data', '暂无数据')}</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={2}
                stroke="#fff"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--muted)]/20 hover:bg-[var(--muted)]/40 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-[var(--foreground)]">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-[var(--foreground)]">
                  {item.value} <span className="text-[var(--muted-foreground)] font-normal">({total > 0 ? Math.round(item.value / total * 100) : 0}%)</span>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </ChartCard>
  );
}

function getTermTranslation(term: string, category: 'weekend_policy' | 'overtime_compensation'): string {
  const weekendPolicyMap: Record<string, string> = {
    double_rest: '\u53cc\u4f11',
    big_small_week: '\u5927\u5c0f\u5468',
    single_rest: '\u5355\u4f11',
    no_rest: '\u65e0\u4f11',
  };

  const overtimeMap: Record<string, string> = {
    legal: '\u6cd5\u5b9a\u6807\u51c6',
    fixed_subsidy: '\u56fa\u5b9a\u8865\u8d34',
    time_off: '\u8c03\u4f11',
    none: '\u65e0\u8865\u507f',
  };

  switch (category) {
    case 'weekend_policy':
      return weekendPolicyMap[term] || term;
    case 'overtime_compensation':
      return overtimeMap[term] || term;
    default:
      return term;
  }
}

export function CompanyCharts({ workHourRecords }: CompanyChartsProps) {
  if (!workHourRecords || workHourRecords.length === 0) {
    return null;
  }

  return (
    <section className="mt-10">
      <h3 style={{ fontFamily: 'var(--font-serif)' }} className="text-2xl font-bold text-[var(--foreground)] mb-6">
        工作文化分析
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <WorkHoursPieChart workHourRecords={workHourRecords} />
        <WeekendPolicyBarChart workHourRecords={workHourRecords} />
        <OvertimeCompensationChart workHourRecords={workHourRecords} />
      </div>
    </section>
  );
}

export default CompanyCharts;
