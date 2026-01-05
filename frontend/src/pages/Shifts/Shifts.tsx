import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Clock, 
  Play, 
  TrendingUp,
  Hash,
  Timer,
  Plus,
  Search,
  Calendar,
  User
} from 'lucide-react';
import { shiftsService } from '../../services/shifts.service';
import { platformsService } from '../../services/platforms.service';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { UserRole } from '../../types/user.types';
import './Shifts.css';

export default function Shifts() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const timeFormat = useAppStore((state) => state.timeFormat);
  const [selectedPlatform, setSelectedPlatform] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isConfirmEndModalOpen, setIsConfirmEndModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [viewMode, setViewMode] = useState<'my' | 'all'>('my');

  // Check if user is operator, teamlead or admin
  useEffect(() => {
    if (user && user.role !== UserRole.OPERATOR && user.role !== UserRole.ADMIN && user.role !== UserRole.TEAMLEAD) {
      navigate('/dashboard');
    }
  }, [user?.role, navigate]);

  // Set viewMode from navigation state
  useEffect(() => {
    const state = location.state as { viewMode?: 'my' | 'all' };
    if (state?.viewMode) {
      setViewMode(state.viewMode);
    }
  }, [location.state]);

  // Определяем, является ли пользователь тимлидом или админом
  const isTeamLeadOrAdmin = user?.role === UserRole.TEAMLEAD || user?.role === UserRole.ADMIN;

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.custom-select-wrapper')) {
        setIsPlatformDropdownOpen(false);
      }
    };

    if (isPlatformDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isPlatformDropdownOpen]);

  // Fetch current shift
  const { data: currentShift } = useQuery({
    queryKey: ['current-shift'],
    queryFn: async () => {
      const result = await shiftsService.getMyCurrentShift();
      return result;
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  // Fetch my shifts
  const { data: myShiftsData } = useQuery({
    queryKey: ['my-shifts'],
    queryFn: async () => {
      const result = await shiftsService.getMyShifts();
      return result;
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  // Fetch all shifts (for teamlead/admin)
  const { data: allShiftsData, isLoading: isLoadingAllShifts } = useQuery({
    queryKey: ['all-shifts'],
    queryFn: async () => {
      const result = await shiftsService.getAll({ limit: 1000 });
      return result;
    },
    enabled: isTeamLeadOrAdmin,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  // Fetch platforms
  const { data: platformsData } = useQuery({
    queryKey: ['platforms'],
    queryFn: () => platformsService.getAll({ status: 'active', limit: 100 }),
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  // Start shift mutation
  const startShiftMutation = useMutation({
    mutationFn: (platformId: number) => shiftsService.startShift({ platformId }),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['current-shift'] });
      queryClient.refetchQueries({ queryKey: ['my-shifts'] });
      setSelectedPlatform(null);
      setIsCreateModalOpen(false);
      setIsConfirmModalOpen(false);
      setErrorMessage('');
    },
    onError: (error: any) => {
      console.error('Failed to start shift:', error);
      const message = error?.response?.data?.message || 'Failed to start shift. Please try again.';
      setErrorMessage(message);
    },
  });

  // End shift mutation
  const endShiftMutation = useMutation({
    mutationFn: (shiftId: number) => shiftsService.endShift(shiftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-shift'] });
      queryClient.invalidateQueries({ queryKey: ['my-shifts'] });
      setIsConfirmEndModalOpen(false);
    },
  });

  const handleStartShift = () => {
    if (!selectedPlatform) {
      alert(t('shifts.selectPlatform'));
      return;
    }
    setIsConfirmModalOpen(true);
  };

  const handleConfirmStartShift = () => {
    if (!selectedPlatform) return;
    startShiftMutation.mutate(selectedPlatform);
  };

  const handleEndShift = () => {
    if (!currentShift) return;
    setIsConfirmEndModalOpen(true);
  };

  const handleConfirmEndShift = () => {
    if (!currentShift) return;
    endShiftMutation.mutate(currentShift.id);
  };

  const calculateDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : currentTime;
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { hours, minutes, seconds };
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString(i18n.language, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: timeFormat === '12h',
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(i18n.language, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const platforms = platformsData?.items || [];
  
  // Определяем какие смены показывать
  const shiftsToShow = viewMode === 'my' 
    ? (myShiftsData?.items || [])
    : (allShiftsData?.items || []);

  // Filter shifts
  const filteredShifts = shiftsToShow.filter((shift: any) => {
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? shift.status === 'active' :
      shift.status === 'completed';
    
    const matchesSearch = 
      searchQuery === '' ||
      shift.platform?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shift.operator?.username?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const activeShiftsCount = shiftsToShow.filter((s: any) => s.status === 'active').length;
  const completedShiftsCount = shiftsToShow.filter((s: any) => s.status === 'completed').length;

  const selectedPlatformObj = platforms.find(p => p.id === selectedPlatform);

  return (
    <div className="shifts-page">
      <div className="shifts-header">
        <div>
          <h1 className="shifts-title">{t('shifts.title')}</h1>
          <p className="shifts-subtitle">{t('shifts.subtitle')}</p>
          {currentShift && viewMode === 'my' && (
            <div className="current-shift-badge">
              <span className="pulse-dot"></span>
              {t('shifts.activeShiftOn')} {currentShift.platformName}
            </div>
          )}
        </div>
        <div className="shifts-header-actions">
          {currentShift && viewMode === 'my' && (
            <button 
              className="btn-end-shift" 
              onClick={handleEndShift}
              disabled={endShiftMutation.isPending}
            >
              {t('shifts.endShift')}
            </button>
          )}
          {!currentShift && viewMode === 'my' && (
            <button className="btn-secondary" onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={18} />
              {t('shifts.newShift')}
            </button>
          )}
        </div>
      </div>

      {/* View Mode Switcher for TeamLead/Admin */}
      {isTeamLeadOrAdmin && (
        <div className="view-mode-switcher">
          <button 
            className={`view-mode-btn ${viewMode === 'my' ? 'active' : ''}`}
            onClick={() => setViewMode('my')}
          >
            <User size={18} />
            {t('shifts.myShifts')}
          </button>
          <button 
            className={`view-mode-btn ${viewMode === 'all' ? 'active' : ''}`}
            onClick={() => setViewMode('all')}
          >
            <Clock size={18} />
            {t('shifts.operatorsShifts')}
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="shifts-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder={t('shifts.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <button 
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            {t('shifts.allShifts')} <span className="count">{shiftsToShow.length}</span>
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'active' ? 'active' : ''}`}
            onClick={() => setStatusFilter('active')}
          >
            {t('shifts.active')} <span className="count">{activeShiftsCount}</span>
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('completed')}
          >
            {t('shifts.completed')} <span className="count">{completedShiftsCount}</span>
          </button>
        </div>
      </div>

      {/* Shifts Grid */}
      <div className="shifts-grid">
        {viewMode === 'all' && isLoadingAllShifts ? (
          <div className="empty-state">
            <Clock size={48} />
            <p>{t('common.loading')}</p>
          </div>
        ) : filteredShifts.length === 0 ? (
          <div className="empty-state">
            <Clock size={48} />
            <p>{t('shifts.noShiftsFound')}</p>
          </div>
        ) : (
          filteredShifts.map((shift: any) => {
            // Всегда вычисляем duration из времени для точности (с секундами)
            const duration = calculateDuration(shift.startTime, shift.endTime);
            const isActive = shift.status === 'active';
            
            return (
              <div key={shift.id} className="shift-card">
                <div className="shift-card-header">
                  <div className="shift-platform">
                    <div className="platform-icon">
                      {shift.platform?.name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <div className="platform-name">{shift.platform?.name || 'Unknown'}</div>
                      <div className="shift-date">
                        <Calendar size={12} />
                        {formatDate(shift.startTime)}
                      </div>
                    </div>
                  </div>
                  <span className={`shift-status ${isActive ? 'active' : 'completed'}`}>
                    {isActive ? (
                      <>
                        <div className="pulse-dot"></div>
                        {t('shifts.active')}
                      </>
                    ) : (
                      t('shifts.completed')
                    )}
                  </span>
                </div>

                <div className="shift-card-body">
                  {/* Показываем оператора только в режиме "Смены операторов" */}
                  {viewMode === 'all' && shift.operator && (
                    <div className="shift-info-row">
                      <div className="shift-info-item operator-info">
                        <User size={16} />
                        <span className="operator-name">{shift.operator.username}</span>
                        {shift.operator.email && (
                          <span className="operator-email">{shift.operator.email}</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="shift-stats-row">
                    <div className="shift-stat">
                      <Timer size={16} />
                      <div>
                        <div className="stat-value">
                          {`${String(duration.hours).padStart(2, '0')}:${String(duration.minutes).padStart(2, '0')}:${String(duration.seconds).padStart(2, '0')}`}
                        </div>
                        <div className="stat-label">{t('shifts.duration')}</div>
                      </div>
                    </div>
                    <div className="shift-stat">
                      <TrendingUp size={16} />
                      <div>
                        <div className="stat-value">${shift.totalAmount || 0}</div>
                        <div className="stat-label">{t('shifts.amount')}</div>
                      </div>
                    </div>
                    <div className="shift-stat">
                      <Hash size={16} />
                      <div>
                        <div className="stat-value">{shift.operationsCount || 0}</div>
                        <div className="stat-label">{t('shifts.operations')}</div>
                      </div>
                    </div>
                  </div>

                  <div className="shift-time-info">
                    <span>{t('shifts.started')}: {formatTime(shift.startTime)}</span>
                    {shift.endTime && <span>{t('shifts.ended')}: {formatTime(shift.endTime)}</span>}
                  </div>
                </div>

                {isActive && shift.id === currentShift?.id && (
                  <div className="shift-card-footer">
                    <button 
                      className="btn-end-shift-small"
                      onClick={handleEndShift}
                      disabled={endShiftMutation.isPending}
                    >
                      {t('shifts.endShift')}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create Shift Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('shifts.startNewShift')}</h2>
              <button className="modal-close" onClick={() => setIsCreateModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="platform-select-section">
                <label className="platform-label">{t('shifts.choosePlatform')}</label>
                <div className="custom-select-wrapper">
                  <button
                    className="custom-select-button"
                    onClick={() => setIsPlatformDropdownOpen(!isPlatformDropdownOpen)}
                    disabled={startShiftMutation.isPending}
                  >
                    <span className={selectedPlatformObj ? '' : 'placeholder'}>
                      {selectedPlatformObj ? selectedPlatformObj.name : 'Select platform...'}
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  {isPlatformDropdownOpen && (
                    <div className="custom-select-dropdown">
                      {platforms.map((platform) => (
                        <div
                          key={platform.id}
                          className={`custom-select-option ${selectedPlatform === platform.id ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedPlatform(platform.id);
                            setIsPlatformDropdownOpen(false);
                          }}
                        >
                          {platform.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-start-shift"
                onClick={handleStartShift}
                disabled={!selectedPlatform || startShiftMutation.isPending}
              >
                <Play size={18} />
                {startShiftMutation.isPending ? 'Loading...' : 'Start Shift'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Start Shift Modal */}
      {isConfirmModalOpen && (
        <div className="modal-overlay" onClick={() => {
          setIsConfirmModalOpen(false);
          setErrorMessage('');
        }}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <h3>{t('shifts.confirmStartTitle')}</h3>
            </div>
            <div className="confirm-modal-body">
              <p>{t('shifts.confirmStartMessage')} <strong>{selectedPlatformObj?.name}</strong>?</p>
              {errorMessage && (
                <div className="error-message">
                  {errorMessage}
                </div>
              )}
            </div>
            <div className="confirm-modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setErrorMessage('');
                }}
                disabled={startShiftMutation.isPending}
              >
                {t('common.cancel')}
              </button>
              <button 
                className="btn-confirm"
                onClick={handleConfirmStartShift}
                disabled={startShiftMutation.isPending}
              >
                <Play size={18} />
                {startShiftMutation.isPending ? t('shifts.starting') : t('shifts.yesStart')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm End Shift Modal */}
      {isConfirmEndModalOpen && (
        <div className="modal-overlay" onClick={() => setIsConfirmEndModalOpen(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <h3>{t('shifts.confirmEndTitle')}</h3>
            </div>
            <div className="confirm-modal-body">
              <p>{t('shifts.confirmEndMessage')} <strong>{currentShift?.platform?.name}</strong>?</p>
              <p style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-tertiary)' }}>
                {t('shifts.cannotUndo')}
              </p>
            </div>
            <div className="confirm-modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setIsConfirmEndModalOpen(false)}
                disabled={endShiftMutation.isPending}
              >
                {t('common.cancel')}
              </button>
              <button 
                className="btn-end-shift"
                onClick={handleConfirmEndShift}
                disabled={endShiftMutation.isPending}
              >
                {endShiftMutation.isPending ? t('shifts.ending') : t('shifts.yesEnd')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
