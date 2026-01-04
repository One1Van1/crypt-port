import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workingDepositService } from '../../services/workingDepositService';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WorkingDepositChart = () => {
  const queryClient = useQueryClient();
  const [initialDepositInput, setInitialDepositInput] = useState('');
  const [showSetDeposit, setShowSetDeposit] = useState(false);
  const [historyDays, setHistoryDays] = useState(30);

  const { data: sections, isLoading } = useQuery({
    queryKey: ['workingDepositSections'],
    queryFn: workingDepositService.getSections,
  });

  const { data: history, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['workingDepositHistory', historyDays],
    queryFn: () => workingDepositService.getHistory(historyDays),
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

  const isProfitable = (sections.summary.profit || 0) >= 0;

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
      <div className="card mb-6 p-6">
        <h2 className="text-xl font-bold mb-4">Итого</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-500">Начальный депозит</div>
            <div className="text-2xl font-bold">
              {(sections.summary.initialDeposit || 0).toFixed(2)} USDT
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Текущий депозит</div>
            <div className="text-2xl font-bold">
              {(sections.summary.totalUsdt || 0).toFixed(2)} USDT
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">
              {isProfitable ? 'Профит' : 'Дефицит'}
            </div>
            <div
              className={`text-2xl font-bold ${
                isProfitable ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {isProfitable ? '+' : ''}
              {(sections.summary.profit || 0).toFixed(2)} USDT
            </div>
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
        ) : history && history.history && history.history.length > 0 ? (
          <ResponsiveContainer width="100%" height={450}>
            <LineChart 
              data={history.history}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <defs>
                <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
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
                formatter={(value: any) => [`${Number(value).toFixed(2)} USDT`, '']}
                labelFormatter={(label) => `📅 ${label}`}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
                formatter={(value) => <span style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{value}</span>}
              />
              <Line 
                type="monotone" 
                dataKey="totalUsdt" 
                stroke="#6366f1" 
                strokeWidth={3}
                name="💰 Общий депозит"
                dot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                fill="url(#totalGradient)"
              />
              <Line 
                type="monotone" 
                dataKey="initialDeposit" 
                stroke="#94a3b8" 
                strokeWidth={2}
                strokeDasharray="8 4"
                name="📊 Начальный депозит"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke={isProfitable ? '#10b981' : '#ef4444'}
                strokeWidth={3}
                name={isProfitable ? '📈 Профит' : '📉 Убыток'}
                dot={{ r: 4, fill: isProfitable ? '#10b981' : '#ef4444', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pie Chart - Distribution */}
        <div className="card p-6" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 className="text-lg font-bold mb-6" style={{ color: 'var(--text-primary)' }}>🥧 Распределение депозита</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={[
                  { name: '💎 Платформы', value: sections.platformBalances.total || 0, color: '#6366f1' },
                  { name: '🔒 Заблокированные', value: sections.blockedPesos.totalUsdt || 0, color: '#ef4444' },
                  { name: '⏳ Неоплаченные', value: sections.unpaidPesos.totalUsdt || 0, color: '#f59e0b' },
                  { name: '✨ Свободные', value: sections.freeUsdt.total || 0, color: '#10b981' },
                ].filter(item => item.value > 0)}
                cx="50%"
                cy="50%"
                labelLine={{
                  stroke: 'var(--text-tertiary)',
                  strokeWidth: 1
                }}
                label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(1)}%`}
                outerRadius={110}
                innerRadius={60}
                paddingAngle={2}
                dataKey="value"
              >
                {[
                  { name: '💎 Платформы', value: sections.platformBalances.total || 0, color: '#6366f1' },
                  { name: '🔒 Заблокированные', value: sections.blockedPesos.totalUsdt || 0, color: '#ef4444' },
                  { name: '⏳ Неоплаченные', value: sections.unpaidPesos.totalUsdt || 0, color: '#f59e0b' },
                  { name: '✨ Свободные', value: sections.freeUsdt.total || 0, color: '#10b981' },
                ].filter(item => item.value > 0).map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke="var(--bg-primary)"
                    strokeWidth={3}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
                itemStyle={{ color: 'var(--text-primary)' }}
                formatter={(value: any) => [`${Number(value).toFixed(2)} USDT`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Comparison */}
        <div className="card p-6" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 className="text-lg font-bold mb-6" style={{ color: 'var(--text-primary)' }}>📊 Сравнение секций</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={[
                { name: '💎 Платформы', usdt: sections.platformBalances.total || 0, fill: '#6366f1' },
                { name: '🔒 Заблок.', usdt: sections.blockedPesos.totalUsdt || 0, fill: '#ef4444' },
                { name: '⏳ Неопл.', usdt: sections.unpaidPesos.totalUsdt || 0, fill: '#f59e0b' },
                { name: '✨ Свободн.', usdt: sections.freeUsdt.total || 0, fill: '#10b981' },
                { name: '⚠️ Дефицит', usdt: -(sections.deficit.totalUsdt || 0), fill: '#f97316' },
              ]}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <defs>
                <linearGradient id="barGradient1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.7}/>
                </linearGradient>
                <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.7}/>
                </linearGradient>
                <linearGradient id="barGradient3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.7}/>
                </linearGradient>
                <linearGradient id="barGradient4" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.7}/>
                </linearGradient>
                <linearGradient id="barGradient5" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0.7}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
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
                labelStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
                itemStyle={{ color: 'var(--text-secondary)' }}
                formatter={(value: any) => [`${Math.abs(Number(value)).toFixed(2)} USDT`, '']}
                cursor={{ fill: 'var(--bg-hover)', opacity: 0.3 }}
              />
              <Bar 
                dataKey="usdt" 
                radius={[8, 8, 0, 0]}
                maxBarSize={80}
              >
                {[
                  { name: '💎 Платформы', usdt: sections.platformBalances.total || 0, fill: 'url(#barGradient1)' },
                  { name: '🔒 Заблок.', usdt: sections.blockedPesos.totalUsdt || 0, fill: 'url(#barGradient2)' },
                  { name: '⏳ Неопл.', usdt: sections.unpaidPesos.totalUsdt || 0, fill: 'url(#barGradient3)' },
                  { name: '✨ Свободн.', usdt: sections.freeUsdt.total || 0, fill: 'url(#barGradient4)' },
                  { name: '⚠️ Дефицит', usdt: -(sections.deficit.totalUsdt || 0), fill: 'url(#barGradient5)' },
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default WorkingDepositChart;

