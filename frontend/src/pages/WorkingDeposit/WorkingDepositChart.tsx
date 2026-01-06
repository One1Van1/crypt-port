import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workingDepositService } from '../../services/workingDepositService';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WorkingDepositChart = () => {
  const queryClient = useQueryClient();
  const [initialDepositInput, setInitialDepositInput] = useState('');
  const [showSetDeposit, setShowSetDeposit] = useState(false);
  const [historyDays, setHistoryDays] = useState(30);

  const { data: sections, isLoading } = useQuery({
    queryKey: ['workingDepositSections'],
    queryFn: workingDepositService.getSections,
  });

  const { data: profitHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['profitHistory', historyDays],
    queryFn: () => workingDepositService.getProfitHistory(historyDays),
  });

  const setInitialDepositMutation = useMutation({
    mutationFn: (amount: number) => workingDepositService.setInitialDeposit(amount),
    onSuccess: () => {
      toast.success('Initial deposit updated');
      queryClient.invalidateQueries({ queryKey: ['workingDepositSections'] });
      setShowSetDeposit(false);
      setInitialDepositInput('');
    },
    onError: () => {
      toast.error('Failed to update initial deposit');
    },
  });

  const handleSetInitialDeposit = () => {
    const amount = parseFloat(initialDepositInput);
    if (isNaN(amount) || amount < 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setInitialDepositMutation.mutate(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (
    !sections || 
    !sections.summary || 
    !sections.platformBalances || 
    !sections.blockedPesos || 
    !sections.unpaidPesos || 
    !sections.freeUsdt || 
    !sections.deficit
  ) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">No data available</div>
      </div>
    );
  }

  const displayedTotalUsdt = Number(sections.summary.totalUsdt || 0) + Number(sections.deficit.totalUsdt || 0);
  const displayedProfit = displayedTotalUsdt - Number(sections.summary.initialDeposit || 0);
  const isProfitable = displayedProfit >= 0;

  // Debug: log unpaid pesos data
  console.log('📊 Working Deposit Data:', {
    unpaidPesos: sections.unpaidPesos,
    blockedPesos: sections.blockedPesos,
    platformBalances: sections.platformBalances,
    freeUsdt: sections.freeUsdt
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">График Рабочего Депозита</h1>
        <button
          onClick={() => setShowSetDeposit(!showSetDeposit)}
          className="btn btn-primary"
        >
          Установить начальный депозит
        </button>
      </div>

      {showSetDeposit && (
        <div className="card mb-6 p-4">
          <div className="flex gap-2">
            <input
              type="number"
              value={initialDepositInput}
              onChange={(e) => setInitialDepositInput(e.target.value)}
              placeholder="Enter initial deposit in USDT"
              className="input flex-1"
            />
            <button
              onClick={handleSetInitialDeposit}
              disabled={setInitialDepositMutation.isPending}
              className="btn btn-primary"
            >
              {setInitialDepositMutation.isPending ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => setShowSetDeposit(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Summary Card */}
      <div className="card mb-6 p-6" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))', border: '2px solid rgba(99, 102, 241, 0.3)' }}>
        <div className="mb-6 text-center">
          <div className="text-sm" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>💰 Всего денег в системе</div>
          <div className="text-5xl font-bold" style={{ color: 'var(--accent-primary)' }}>
            {displayedTotalUsdt.toFixed(2)} USDT
          </div>
        </div>
        
        <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)', margin: '24px 0' }}></div>
        
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Детали</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
            <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>💼 Начальный депозит</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {(sections.summary.initialDeposit || 0).toFixed(2)} USDT
            </div>
            {sections.summary.initialDeposit === 0 && (
              <div className="mt-2 text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                ⚠️ Не установлен
              </div>
            )}
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
            <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>💰 Текущий депозит</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {displayedTotalUsdt.toFixed(2)} USDT
            </div>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: isProfitable ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `2px solid ${isProfitable ? '#10b981' : '#ef4444'}` }}>
            <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
              {isProfitable ? '📈 Профит' : '📉 Дефицит'}
            </div>
            <div
              className="text-2xl font-bold"
              style={{ color: isProfitable ? '#10b981' : '#ef4444' }}
            >
              {isProfitable ? '+' : ''}
              {displayedProfit.toFixed(2)} USDT
            </div>
            {sections.summary.initialDeposit > 0 && (
              <div className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                ROI: {((displayedProfit / sections.summary.initialDeposit) * 100).toFixed(2)}%
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chart - History Line Chart */}
      <div className="card mb-6 p-6" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>📈 История изменения депозита</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setHistoryDays(7)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                historyDays === 7 
                  ? 'text-white shadow-lg' 
                  : 'hover:opacity-80'
              }`}
              style={{ 
                backgroundColor: historyDays === 7 ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: historyDays === 7 ? '#fff' : 'var(--text-secondary)'
              }}
            >
              7 дней
            </button>
            <button
              onClick={() => setHistoryDays(30)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                historyDays === 30 
                  ? 'text-white shadow-lg' 
                  : 'hover:opacity-80'
              }`}
              style={{ 
                backgroundColor: historyDays === 30 ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: historyDays === 30 ? '#fff' : 'var(--text-secondary)'
              }}
            >
              30 дней
            </button>
            <button
              onClick={() => setHistoryDays(90)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                historyDays === 90 
                  ? 'text-white shadow-lg' 
                  : 'hover:opacity-80'
              }`}
              style={{ 
                backgroundColor: historyDays === 90 ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: historyDays === 90 ? '#fff' : 'var(--text-secondary)'
              }}
            >
              90 дней
            </button>
          </div>
        </div>
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-lg" style={{ color: 'var(--text-secondary)' }}>⏳ Загрузка истории...</div>
          </div>
        ) : profitHistory && profitHistory.history && profitHistory.history.length > 0 ? (
          <ResponsiveContainer width="100%" height={450}>
            <ComposedChart 
              data={profitHistory.history}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <defs>
                {/* Gradient for area fill */}
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
                angle={-45}
                textAnchor="end"
                height={80}
                stroke="var(--border-color)"
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }}
                stroke="var(--border-color)"
                tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
                labelStyle={{ color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '8px' }}
                itemStyle={{ color: 'var(--text-secondary)', padding: '4px 0' }}
                formatter={(value: any, name: any) => {
                  if (name === '💰 Текущий депозит') return [`${Number(value).toFixed(2)} USDT`, name];
                  if (name === '📊 Начальный депозит') return [`${Number(value).toFixed(2)} USDT`, name];
                  return [`${Number(value).toFixed(2)} USDT`, name];
                }}
                labelFormatter={(label) => `📅 ${label}`}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
                formatter={(value) => <span style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{value}</span>}
              />
              
              {/* Area fill for current deposit */}
              <Area
                type="monotone"
                dataKey="totalUsdt"
                fill="url(#areaGradient)"
                stroke="none"
              />
              
              {/* Reference line - Initial Deposit (baseline) */}
              <Line 
                type="monotone" 
                dataKey="initialDeposit" 
                stroke="#94a3b8" 
                strokeWidth={2}
                strokeDasharray="8 4"
                name="📊 Начальный депозит"
                dot={false}
                strokeOpacity={0.7}
              />
              
              {/* Main line - Current Total */}
              <Line 
                type="monotone" 
                dataKey="totalUsdt" 
                stroke="#6366f1" 
                strokeWidth={4}
                name="💰 Текущий депозит"
                dot={{ r: 6, fill: '#6366f1', strokeWidth: 3, stroke: '#fff' }}
                activeDot={{ r: 8, fill: '#6366f1', stroke: '#fff', strokeWidth: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-96" style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <div className="text-lg" style={{ color: 'var(--text-secondary)' }}>Нет исторических данных</div>
            </div>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
        {/* Pie Chart - Distribution */}
        <div className="card p-6" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 className="text-lg font-bold mb-6" style={{ color: 'var(--text-primary)' }}>🥧 Распределение депозита</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              {(() => {
                const rawData = [
                  {
                    key: 'platforms',
                    name: '💎 Платформы',
                    rawValue: sections.platformBalances.total || 0,
                    color: '#6366f1',
                  },
                  {
                    key: 'blocked',
                    name: '🔒 Заблокированные',
                    rawValue: sections.blockedPesos.totalUsdt || 0,
                    color: '#ef4444',
                  },
                  {
                    key: 'unpaid',
                    name: '⏳ Неоплаченные',
                    rawValue: sections.unpaidPesos.totalUsdt || 0,
                    color: '#f59e0b',
                  },
                  {
                    key: 'free',
                    name: '✨ Свободные',
                    rawValue: sections.freeUsdt.total || 0,
                    color: '#10b981',
                  },
                  {
                    key: 'deficit',
                    name: '💱 В обмене',
                    rawValue: sections.deficit.totalUsdt || 0,
                    color: 'var(--text-tertiary)',
                  },
                ].filter(item => item.rawValue > 0);

                const totalRaw = rawData.reduce((sum, item) => sum + item.rawValue, 0);
                const minShare = 0.02;
                const maxShare = 0.06;
                const boostedFree = (rawFree: number) => {
                  if (rawFree <= 0 || totalRaw <= 0) return rawFree;
                  const minValue = totalRaw * minShare;
                  const maxValue = totalRaw * maxShare;
                  return Math.min(Math.max(rawFree, minValue), maxValue);
                };

                const chartData = rawData.map(item => ({
                  ...item,
                  value: item.key === 'free' ? boostedFree(item.rawValue) : item.rawValue,
                }));

                return (
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={{
                      stroke: 'var(--text-tertiary)',
                      strokeWidth: 1,
                    }}
                    label={({ name, payload }: any) => {
                      const rawValue = Number(payload?.rawValue ?? 0);
                      const percent = totalRaw > 0 ? (rawValue / totalRaw) * 100 : 0;
                      return `${name}: ${percent.toFixed(1)}%`;
                    }}
                    outerRadius={110}
                    innerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="var(--bg-primary)"
                        strokeWidth={3}
                      />
                    ))}
                  </Pie>
                );
              })()}
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
                itemStyle={{ color: 'var(--text-primary)' }}
                formatter={(_value: any, _name: any, props: any) => {
                  const rawValue = Number(props?.payload?.rawValue ?? 0);
                  return [`${rawValue.toFixed(2)} USDT`, ''];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Deposit Summary Table */}
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>📊 Детальное распределение</h3>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: '0', backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-primary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-color)' }}>Показатель</th>
                  <th style={{ padding: '16px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-color)' }}>Сумма (USDT)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: '500' }}>💰 Рабочий депозит</td>
                  <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                    {displayedTotalUsdt.toFixed(2)}
                  </td>
                </tr>
                <tr style={{ backgroundColor: isProfitable ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)' }}>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                    {isProfitable ? '📈 Профит' : '📉 Дефицит'}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem', color: isProfitable ? '#10b981' : '#ef4444' }}>
                    {isProfitable ? '+' : ''}{displayedProfit.toFixed(2)}
                  </td>
                </tr>
                <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <td colSpan={2} style={{ padding: '12px 16px', fontWeight: 'bold', color: 'var(--text-primary)', borderTop: '2px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                    Секции:
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 16px', paddingLeft: '32px', color: 'var(--text-secondary)' }}>
                    <span style={{ color: '#6366f1', marginRight: '8px' }}>●</span>
                    💎 Платформы
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: '500' }}>
                    {(sections.platformBalances.total || 0).toFixed(2)}
                  </td>
                </tr>
                <tr style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
                  <td style={{ padding: '12px 16px', paddingLeft: '32px', color: 'var(--text-secondary)' }}>
                    <span style={{ color: '#ef4444', marginRight: '8px' }}>●</span>
                    🔒 Заблокированные песо
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: '500' }}>
                    {(sections.blockedPesos.totalUsdt || 0).toFixed(2)}
                  </td>
                </tr>
                <tr style={{ backgroundColor: 'rgba(245, 158, 11, 0.05)' }}>
                  <td style={{ padding: '12px 16px', paddingLeft: '32px', color: 'var(--text-secondary)' }}>
                    <span style={{ color: '#f59e0b', marginRight: '8px' }}>●</span>
                    ⏳ Неоплаченные песо
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: '500' }}>
                    {(sections.unpaidPesos.totalUsdt || 0).toFixed(2)}
                  </td>
                </tr>
                <tr style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}>
                  <td style={{ padding: '12px 16px', paddingLeft: '32px', color: 'var(--text-secondary)' }}>
                    <span style={{ color: '#10b981', marginRight: '8px' }}>●</span>
                    ✨ Свободные USDT
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: '500' }}>
                    {(sections.freeUsdt.total || 0).toFixed(2)}
                  </td>
                </tr>

                <tr style={{ backgroundColor: 'rgba(148, 163, 184, 0.06)' }}>
                  <td style={{ padding: '12px 16px', paddingLeft: '32px', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--text-tertiary)', marginRight: '8px' }}>●</span>
                    💱 В обмене
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: '500' }}>
                    {(sections.deficit.totalUsdt || 0).toFixed(2)}
                  </td>
                </tr>
            </tbody>
          </table>
        </div>
        </div>
      </div>

      {/* Profit History Table */}
      {profitHistory && profitHistory.history && profitHistory.history.length > 0 && (
        <div className="card p-6 mb-6" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>📊 История профита по дням</h3>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-primary)', fontWeight: 'bold', borderTopLeftRadius: '8px' }}>Дата</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 'bold' }}>Рабочий депозит</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 'bold', borderTopRightRadius: '8px' }}>Профит/Дефицит</th>
                </tr>
              </thead>
              <tbody>
                {profitHistory.history.slice().reverse().slice(0, 10).map((point, index) => {
                  const isProfit = (point.profit || 0) >= 0;
                  return (
                    <tr key={index} style={{ borderBottom: index < 9 ? '1px solid var(--border-color)' : 'none' }}>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{point.date}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: 'var(--text-primary)' }}>
                        {(point.totalUsdt || 0).toFixed(2)} USDT
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: isProfit ? '#10b981' : '#ef4444' }}>
                        {isProfit ? '+' : ''}{(point.profit || 0).toFixed(2)} USDT
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkingDepositChart;

