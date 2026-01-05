import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, TrendingUp, DollarSign, ArrowRightLeft, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/user.types';
import { usersService } from '../../services/users.service';
import { shiftsService } from '../../services/shifts.service';
import { bankAccountsService } from '../../services/bank-accounts.service';
import { cashWithdrawalsService, CashWithdrawal } from '../../services/cash-withdrawals.service';
import './TeamLeadDashboard.css';

export default function TeamLeadDashboard() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<'requisites' | 'operators' | 'withdrawals' | 'conversions'>('requisites');

  // Проверка доступа
  if (user?.role !== UserRole.TEAMLEAD && user?.role !== UserRole.ADMIN) {
    return (
      <div className="access-denied">
        <h2>{t('errors.accessDenied')}</h2>
        <p>{t('errors.teamleadOnly')}</p>
      </div>
    );
  }

  return (
    <div className="teamlead-dashboard">
      <div className="teamlead-header">
        <div className="teamlead-title">
          <Award size={32} className="title-icon" />
          <div>
            <h1>{t('teamlead.dashboard')}</h1>
            <p className="subtitle">{t('teamlead.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="teamlead-tabs">
        <button
          className={`teamlead-tab ${activeTab === 'requisites' ? 'active' : ''}`}
          onClick={() => setActiveTab('requisites')}
        >
          <TrendingUp size={20} />
          <span>{t('teamlead.requisites')}</span>
        </button>
        <button
          className={`teamlead-tab ${activeTab === 'operators' ? 'active' : ''}`}
          onClick={() => setActiveTab('operators')}
        >
          <Users size={20} />
          <span>{t('teamlead.operators')}</span>
        </button>
        <button
          className={`teamlead-tab ${activeTab === 'withdrawals' ? 'active' : ''}`}
          onClick={() => setActiveTab('withdrawals')}
        >
          <DollarSign size={20} />
          <span>{t('teamlead.withdrawals')}</span>
        </button>
        <button
          className={`teamlead-tab ${activeTab === 'conversions' ? 'active' : ''}`}
          onClick={() => setActiveTab('conversions')}
        >
          <ArrowRightLeft size={20} />
          <span>{t('teamlead.conversions')}</span>
        </button>
      </div>

      <div className="teamlead-content">
        {activeTab === 'requisites' && <RequisitesSection />}
        {activeTab === 'operators' && <OperatorsSection />}
        {activeTab === 'withdrawals' && <WithdrawalsSection />}
        {activeTab === 'conversions' && <ConversionsSection />}
      </div>
    </div>
  );
}

// Секция управления приоритетами реквизитов
function RequisitesSection() {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const rowRefs = useRef<Map<number, HTMLTableRowElement>>(new Map());
  const positionsRef = useRef<Map<number, DOMRect>>(new Map());

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await bankAccountsService.getAll();
      setAccounts(data.items || []);
    } catch (error) {
      console.error('Failed to load accounts:', error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePriorityChange = async (accountId: number, newPriority: number) => {
    if (isNaN(newPriority)) return;
    
    setUpdating(accountId);

    try {
      // Сохраняем старые позиции BEFORE update
      positionsRef.current.clear();
      rowRefs.current.forEach((row, id) => {
        if (row) {
          positionsRef.current.set(id, row.getBoundingClientRect());
        }
      });

      await bankAccountsService.updatePriority(accountId.toString(), newPriority);
      await loadAccounts();
      
      // Ждём полного рендера DOM перед анимацией
      setTimeout(() => {
        requestAnimationFrame(() => {
          rowRefs.current.forEach((row, id) => {
            if (row) {
              const oldPos = positionsRef.current.get(id);
              const newPos = row.getBoundingClientRect();
              
              if (oldPos) {
                const deltaY = oldPos.top - newPos.top;
                
                if (Math.abs(deltaY) > 1) {
                  // Мгновенно перемещаем в старую позицию
                  row.style.transform = `translateY(${deltaY}px)`;
                  row.style.transition = 'none';
                  
                  // Запускаем анимацию к новой позиции
                  requestAnimationFrame(() => {
                    row.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    row.style.transform = 'translateY(0)';
                    
                    setTimeout(() => {
                      row.style.transition = '';
                      row.style.transform = '';
                    }, 800);
                  });
                }
              }
            }
          });
        });
      }, 10);
    } catch (error) {
      console.error('Failed to update priority:', error);
      await loadAccounts();
    } finally {
      setUpdating(null);
    }
  };

  const handlePriorityInput = (accountId: number, newValue: string) => {
    // Разрешаем пустое поле и любые цифры при вводе
    // Блокируем только если явно больше 99
    if (newValue !== '') {
      const numValue = parseInt(newValue);
      if (!isNaN(numValue) && numValue > 99) {
        return; // Не даем ввести больше 99
      }
    }
    
    // Локальное обновление при вводе (сохраняем как есть)
    setAccounts(prevAccounts => 
      prevAccounts.map(account => 
        account.id === accountId 
          ? { ...account, priority: newValue === '' ? '' as any : parseInt(newValue) || '' as any }
          : account
      )
    );
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      working: { label: t('bankAccounts.statusWorking'), className: 'status-working' },
      not_working: { label: t('bankAccounts.statusNotWorking'), className: 'status-not-working' },
      blocked: { label: t('bankAccounts.statusBlocked'), className: 'status-blocked' },
    };
    return statusMap[status] || { label: status, className: '' };
  };

  if (loading) {
    return (
      <div className="section requisites-section">
        <div className="section-header">
          <h2>{t('teamlead.requisitesTitle')}</h2>
          <p className="section-description">{t('teamlead.requisitesDescription')}</p>
        </div>
        <div className="section-content">
          <p className="placeholder">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section requisites-section">
      <div className="section-header">
        <h2>{t('teamlead.requisitesTitle')}</h2>
        <p className="section-description">{t('teamlead.requisitesDescription')}</p>
      </div>
      <div className="section-content">
        <div className="requisites-table">
          <table>
            <thead>
              <tr>
                <th>Приоритет</th>
                <th>Банк</th>
                <th>CBU</th>
                <th>Alias</th>
                <th>Статус</th>
                <th>Доступно / Лимит</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => {
                const status = getStatusBadge(account.status);
                const initialLimitAmount = account.initialLimitAmount || 0;
                const currentLimitAmount = account.currentLimitAmount || 0;
                const withdrawnAmount = account.withdrawnAmount || 0;
                const available = currentLimitAmount;
                const limitAmount = initialLimitAmount;
                const usagePercent = initialLimitAmount > 0 ? (withdrawnAmount / initialLimitAmount) * 100 : 0;
                return (
                  <tr 
                    key={account.id}
                    ref={(el) => {
                      if (el) {
                        rowRefs.current.set(account.id, el);
                      } else {
                        rowRefs.current.delete(account.id);
                      }
                    }}
                    className={updating === account.id ? 'updating-row' : ''}
                  >
                    <td>
                      <input
                        type="number"
                        value={account.priority === '' ? '' : (account.priority || 1)}
                        onChange={(e) => handlePriorityInput(account.id, e.target.value)}
                        onBlur={(e) => {
                          const value = parseInt(e.target.value) || 1;
                          const validValue = Math.max(1, Math.min(99, value));
                          handlePriorityChange(account.id, validValue);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur();
                          }
                        }}
                        disabled={updating === account.id}
                        className="priority-input"
                        min="1"
                        max="99"
                      />
                    </td>
                    <td>{account.bank?.name || account.bankName || '-'}</td>
                    <td className="cbu-cell">{account.cbu || '-'}</td>
                    <td>{account.alias || '-'}</td>
                    <td>
                      <span className={`status-badge ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="amount-cell">
                      ${available.toFixed(2)} / ${limitAmount.toFixed(2)}
                      {updating === account.id && (
                        <span className="saving-indicator"> (сохранение...)</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
// Секция контроля операторов
function OperatorsSection() {
  const { t } = useTranslation();
  const [operators, setOperators] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, shiftsData] = await Promise.all([
        usersService.getAll({ role: 'operator', limit: 100 }),
        shiftsService.getAll({ status: 'active', limit: 100 }),
      ]);
      
      setOperators(usersData.items || []);
      setShifts(shiftsData.items || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getCurrentShift = (operatorId: string) => {
    return shifts.find(shift => shift.operator?.id === parseInt(operatorId));
  };

  if (loading) {
    return (
      <div className="section operators-section">
        <div className="section-header">
          <h2>{t('teamlead.operatorsTitle')}</h2>
          <p className="section-description">{t('teamlead.operatorsDescription')}</p>
        </div>
        <div className="section-content">
          <p className="placeholder">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section operators-section">
      <div className="section-header">
        <h2>{t('teamlead.operatorsTitle')}</h2>
        <p className="section-description">{t('teamlead.operatorsDescription')}</p>
      </div>
      <div className="section-content">
        <div className="operators-grid">
          {operators.map((operator) => {
            const currentShift = getCurrentShift(operator.id);
            const isWorking = !!currentShift;
            
            return (
              <div key={operator.id} className={`operator-card ${isWorking ? 'working' : ''}`}>
                <div className="operator-header">
                  <div className="operator-info">
                    <h3>{operator.username}</h3>
                    <p className="operator-email">{operator.email}</p>
                  </div>
                  <div className={`operator-status ${isWorking ? 'active' : 'inactive'}`}>
                    {isWorking ? t('teamlead.working') : t('teamlead.offline')}
                  </div>
                </div>
                
                {isWorking && currentShift ? (
                  <div className="shift-info">
                    <div className="shift-detail">
                      <span className="shift-label">{t('teamlead.platform')}:</span>
                      <span className="shift-value">{currentShift.platformName}</span>
                    </div>
                    <div className="shift-detail">
                      <span className="shift-label">{t('teamlead.duration')}:</span>
                      <span className="shift-value">{formatDuration(currentShift.currentDuration)}</span>
                    </div>
                    <div className="shift-detail">
                      <span className="shift-label">{t('teamlead.operations')}:</span>
                      <span className="shift-value">{currentShift.operationsCount}</span>
                    </div>
                    <div className="shift-detail">
                      <span className="shift-label">{t('teamlead.totalAmount')}:</span>
                      <span className="shift-value">${currentShift.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="no-shift">
                    <p>{t('teamlead.noActiveShift')}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {operators.length === 0 && (
          <p className="placeholder">{t('teamlead.noOperators')}</p>
        )}
      </div>
    </div>
  );
}

// Секция обналички песо
function WithdrawalsSection() {
  const { t } = useTranslation();
  const [withdrawals, setWithdrawals] = useState<CashWithdrawal[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState<any | null>(null);
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
  const [banks, setBanks] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    amountPesos: '',
    comment: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accountsData, withdrawalsData] = await Promise.all([
        bankAccountsService.getAll(),
        cashWithdrawalsService.getAll(),
      ]);
      const accounts = accountsData.items || [];
      
      console.log('Loaded accounts:', accounts);
      if (accounts.length > 0) {
        console.log('First account structure:', accounts[0]);
        console.log('First account keys:', Object.keys(accounts[0]));
      }
      
      setBankAccounts(accounts);
      setWithdrawals(withdrawalsData);
      
      // Получаем уникальные банки по bankName (используем alias для определения банка)
      const banksMap = new Map();
      accounts.forEach((acc: any) => {
        if (acc.bankName) {
          // Создаем уникальный ID на основе имени банка
          const bankId = acc.bankName;
          if (!banksMap.has(bankId)) {
            banksMap.set(bankId, {
              id: bankId,
              name: acc.bankName
            });
          }
        }
      });
      
      const uniqueBanks = Array.from(banksMap.values());
      
      console.log('Unique banks:', uniqueBanks);
      
      setBanks(uniqueBanks);
      
      // Выбираем первый банк по умолчанию
      if (uniqueBanks.length > 0) {
        console.log('Setting default bank:', uniqueBanks[0]);
        setSelectedBankId(uniqueBanks[0].id);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setBankAccounts([]);
      setWithdrawals([]);
      setBanks([]);
    } finally {
      setLoading(false);
    }
  };

  const openWithdrawModal = (account: any) => {
    setSelectedBankAccount(account);
    setFormData({ amountPesos: '', comment: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBankAccount || !formData.amountPesos) {
      toast.error(t('common.fillRequired'));
      return;
    }

    try {
      await cashWithdrawalsService.withdraw({
        bankAccountId: selectedBankAccount.id,
        amountPesos: parseFloat(formData.amountPesos),
        comment: formData.comment,
      });
      
      toast.success(t('teamlead.withdrawalCreated'));
      setIsModalOpen(false);
      setSelectedBankAccount(null);
      setFormData({ amountPesos: '', comment: '' });
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('teamlead.withdrawalError'));
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getWithdrawalsForAccount = (accountId: number) => {
    return withdrawals.filter(w => w.bankAccountId === accountId);
  };

  const getStatusBadge = (status: string) => {
    return status === 'converted' ? 'status-success' : 'status-pending';
  };

  const filteredAccounts = selectedBankId 
    ? bankAccounts.filter(acc => acc.bankName === selectedBankId)
    : [];

  if (loading) {
    return (
      <div className="section withdrawals-section">
        <div className="section-header">
          <h2>{t('teamlead.withdrawalsTitle')}</h2>
          <p className="section-description">{t('teamlead.withdrawalsDescription')}</p>
        </div>
        <div className="section-content">
          <p className="placeholder">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section withdrawals-section">
      <div className="section-header">
        <h2>{t('teamlead.withdrawalsTitle')}</h2>
        <p className="section-description">{t('teamlead.withdrawalsDescription')}</p>
      </div>

      {/* Bank Selector */}
      <div className="bank-selector">
        {banks.length > 0 ? (
          banks.map((bank) => (
            <button
              key={bank.id}
              className={`bank-selector-btn ${selectedBankId === bank.id ? 'active' : ''}`}
              onClick={() => setSelectedBankId(bank.id)}
            >
              🏦 {bank.name}
            </button>
          ))
        ) : (
          <p className="placeholder">{t('common.loading')}</p>
        )}
      </div>
      
      <div className="section-content">
        {filteredAccounts.length > 0 ? (
          <div className="bank-accounts-grid">
            {filteredAccounts.map((account) => {
              const accountWithdrawals = getWithdrawalsForAccount(account.id);
              const availableBalance = account.withdrawnAmount || 0;
              
              return (
                <div key={account.id} className="bank-account-card">
                  <div className="bank-account-header">
                    <div className="bank-account-info">
                      <h3>💳 {account.alias || `Счет #${account.id}`}</h3>
                      <p className="bank-account-details">
                        <span>CBU: {account.cbu}</span>
                      </p>
                      <p className="bank-account-balance">
                        {t('teamlead.availableForWithdrawal')}: <strong>${availableBalance.toLocaleString()} ARS</strong>
                      </p>
                    </div>
                    <button 
                      className="btn btn-primary btn-withdraw"
                      onClick={() => openWithdrawModal(account)}
                      disabled={availableBalance <= 0}
                    >
                      <DollarSign size={18} />
                      {t('teamlead.withdraw')}
                    </button>
                  </div>

                  <div className="bank-account-history">
                    <h4>{t('teamlead.withdrawalHistory')}</h4>
                    {accountWithdrawals.length > 0 ? (
                      <div className="withdrawal-history-list">
                        {accountWithdrawals.map((withdrawal) => (
                          <div key={withdrawal.id} className="withdrawal-history-item">
                            <div className="withdrawal-info">
                              <span className="withdrawal-date">{formatDate(withdrawal.createdAt)}</span>
                              <span className="withdrawal-user">
                                {withdrawal.withdrawnByUser?.username || `User #${withdrawal.withdrawnByUserId}`}
                              </span>
                              <span className="withdrawal-amount">${withdrawal.amountPesos.toLocaleString()}</span>
                              <span className="withdrawal-rate">@ {withdrawal.withdrawalRate.toFixed(2)}</span>
                              <span className={`status-badge ${getStatusBadge(withdrawal.status)}`}>
                                {withdrawal.status === 'converted' ? t('teamlead.converted') : t('teamlead.pending')}
                              </span>
                            </div>
                            {withdrawal.comment && (
                              <p className="withdrawal-comment">{withdrawal.comment}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="history-empty">{t('teamlead.historyEmpty')}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="placeholder">
            {selectedBankId ? t('teamlead.noAccountsForBank') : t('teamlead.selectBank')}
          </p>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedBankAccount && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('teamlead.withdrawFrom')} {selectedBankAccount.bank?.name}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            <div className="bank-info">
              <p><strong>{t('teamlead.dropAccount')}:</strong> {selectedBankAccount.alias || `#${selectedBankAccount.id}`}</p>
              <p><strong>CBU:</strong> {selectedBankAccount.cbu}</p>
              <p><strong>{t('teamlead.availableForWithdrawal')}:</strong> ${(selectedBankAccount.withdrawnAmount || 0).toLocaleString()} ARS</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t('teamlead.amountPesos')} *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amountPesos}
                  onChange={(e) => setFormData({ ...formData, amountPesos: e.target.value })}
                  placeholder="100000.00"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>{t('teamlead.comment')}</label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder={t('teamlead.commentPlaceholder')}
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t('teamlead.withdraw')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Секция конвертации в USDT
function ConversionsSection() {
  const { t } = useTranslation();
  const [withdrawals, setWithdrawals] = useState<CashWithdrawal[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<CashWithdrawal | null>(null);
  const [exchangeRate, setExchangeRate] = useState('');

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const data = await cashWithdrawalsService.getAll();
      setWithdrawals(data);
    } catch (error) {
      console.error('Failed to load withdrawals:', error);
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWithdrawal || !exchangeRate) {
      toast.error(t('common.fillRequired'));
      return;
    }

    try {
      await cashWithdrawalsService.convertToUsdt(selectedWithdrawal.id, {
        exchangeRate: parseFloat(exchangeRate),
      });
      
      toast.success(t('teamlead.conversionCreated'));
      setIsModalOpen(false);
      setSelectedWithdrawal(null);
      setExchangeRate('');
      loadWithdrawals();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('teamlead.conversionError'));
    }
  };

  const openConvertModal = (withdrawal: CashWithdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setExchangeRate(withdrawal.withdrawalRate.toString());
    setIsModalOpen(true);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('ru-RU');
  };

  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');

  return (
    <div className="section conversions-section">
      <div className="section-header">
        <h2>{t('teamlead.conversionsTitle')}</h2>
        <p className="section-description">{t('teamlead.conversionsDescription')}</p>
      </div>
      
      <div className="section-content">
        {loading ? (
          <p className="placeholder">{t('common.loading')}</p>
        ) : pendingWithdrawals.length > 0 ? (
          <div className="conversions-table">
            <table>
              <thead>
                <tr>
                  <th>{t('teamlead.date')}</th>
                  <th>{t('teamlead.bankAccount')}</th>
                  <th>{t('teamlead.amountPesos')}</th>
                  <th>{t('teamlead.suggestedRate')}</th>
                  <th>{t('teamlead.expectedUsdt')}</th>
                  <th>{t('teamlead.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {pendingWithdrawals.map((withdrawal) => {
                  const expectedUsdt = withdrawal.amountPesos / withdrawal.withdrawalRate;
                  return (
                    <tr key={withdrawal.id}>
                      <td>{formatDate(withdrawal.createdAt)}</td>
                      <td>#{withdrawal.bankAccountId}</td>
                      <td className="amount-cell">${withdrawal.amountPesos.toLocaleString()}</td>
                      <td>{withdrawal.withdrawalRate.toFixed(2)}</td>
                      <td className="amount-cell">{expectedUsdt.toFixed(2)} USDT</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => openConvertModal(withdrawal)}
                        >
                          <ArrowRightLeft size={16} />
                          {t('teamlead.convert')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="placeholder">{t('teamlead.noPendingWithdrawals')}</p>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedWithdrawal && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('teamlead.convertToUsdt')}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            <div className="conversion-info">
              <p><strong>{t('teamlead.amountPesos')}:</strong> ${selectedWithdrawal.amountPesos.toLocaleString()}</p>
              <p><strong>{t('teamlead.suggestedRate')}:</strong> {selectedWithdrawal.withdrawalRate.toFixed(2)}</p>
            </div>

            <form onSubmit={handleConvert}>
              <div className="form-group">
                <label>{t('teamlead.exchangeRate')} *</label>
                <input
                  type="number"
                  step="0.01"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  placeholder="1050.00"
                  required
                  autoFocus
                />
                {exchangeRate && (
                  <p className="helper-text">
                    {t('teamlead.willReceive')}: <strong>{(selectedWithdrawal.amountPesos / parseFloat(exchangeRate)).toFixed(2)} USDT</strong>
                  </p>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t('teamlead.convert')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
