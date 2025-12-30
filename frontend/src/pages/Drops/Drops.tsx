import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  UserX, 
  Search, 
  Plus, 
  RefreshCw, 
  Edit2, 
  Snowflake,
  CheckCircle,
  MessageSquare,
  User,
  Calendar
} from 'lucide-react';
import { dropsService, Drop, DropStatus } from '../../services/drops.service';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/user.types';
import './Drops.css';

export default function Drops() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'frozen'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDrop, setSelectedDrop] = useState<Drop | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    comment: '',
    userId: 0,
  });

  // Fetch drops
  const { data, refetch } = useQuery({
    queryKey: ['drops', searchQuery, statusFilter],
    queryFn: async () => {
      const params: any = { 
        search: searchQuery,
        limit: 100 
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      const response = await dropsService.getAll(params);
      return response;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: { name: string; comment?: string; userId?: number }) => 
      dropsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drops'] });
      setIsCreateModalOpen(false);
      resetForm();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      dropsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drops'] });
      setIsEditModalOpen(false);
      setSelectedDrop(null);
      resetForm();
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: DropStatus }) => 
      dropsService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drops'] });
    },
  });

  const resetForm = () => {
    setFormData({ name: '', comment: '', userId: 0 });
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
    resetForm();
  };

  const handleEdit = (drop: Drop) => {
    setSelectedDrop(drop);
    setFormData({
      name: drop.name,
      comment: drop.comment || '',
      userId: drop.userId || 0,
    });
    setIsEditModalOpen(true);
  };

  const handleSubmitCreate = () => {
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }
    createMutation.mutate({
      name: formData.name,
      comment: formData.comment || undefined,
      userId: formData.userId || undefined,
    });
  };

  const handleSubmitEdit = () => {
    if (!selectedDrop) return;
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }
    updateMutation.mutate({
      id: selectedDrop.id,
      data: {
        name: formData.name,
        comment: formData.comment || undefined,
        userId: formData.userId || undefined,
      },
    });
  };

  const handleToggleStatus = (drop: Drop) => {
    const newStatus = drop.status === DropStatus.ACTIVE ? DropStatus.FROZEN : DropStatus.ACTIVE;
    const action = newStatus === DropStatus.FROZEN ? t('drops.confirmFreeze') : t('drops.confirmActivate');
    if (confirm(`${t('drops.confirmStatusChange')} (${action})?`)) {
      updateStatusMutation.mutate({ id: drop.id, status: newStatus });
    }
  };

  const getStatusBadgeClass = (status: DropStatus) => {
    return status === DropStatus.ACTIVE ? 'status-active' : 'status-frozen';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(t('common.locale'), {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const drops = data?.items || [];
  const filteredDrops = drops.filter((drop) => {
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? drop.status === DropStatus.ACTIVE :
      drop.status === DropStatus.FROZEN;
    
    return matchesStatus;
  });

  const activeCount = drops.filter(d => d.status === DropStatus.ACTIVE).length;
  const frozenCount = drops.filter(d => d.status === DropStatus.FROZEN).length;

  const canEdit = user?.role === UserRole.ADMIN || user?.role === UserRole.TEAMLEAD;

  return (
    <div className="drops-page">
      <div className="drops-header">
        <div>
          <h1 className="drops-title">Drops Management</h1>
          <p className="drops-subtitle">Manage physical persons (drops) for bank accounts</p>
        </div>
        {canEdit && (
          <button className="btn-primary" onClick={handleCreate}>
            <Plus size={18} />
            Add Drop
          </button>
        )}
      </div>

      <div className="drops-filters">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          <button
            className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All <span className="count">{drops.length}</span>
          </button>
          <button
            className={`filter-tab ${statusFilter === 'active' ? 'active' : ''}`}
            onClick={() => setStatusFilter('active')}
          >
            Active <span className="count">{activeCount}</span>
          </button>
          <button
            className={`filter-tab ${statusFilter === 'frozen' ? 'active' : ''}`}
            onClick={() => setStatusFilter('frozen')}
          >
            Frozen <span className="count">{frozenCount}</span>
          </button>
        </div>

        <button className="btn-secondary" onClick={() => refetch()}>
          <RefreshCw size={18} />
          {t('common.refresh')}
        </button>
      </div>

      <div className="drops-grid">
        {filteredDrops.length === 0 ? (
          <div className="empty-state">
            <UserX size={48} />
            <p>No drops found</p>
          </div>
        ) : (
          filteredDrops.map((drop) => (
            <div key={drop.id} className="drop-card">
              <div className="drop-card-header">
                <div className="drop-info">
                  <div className="drop-avatar">
                    {drop.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="drop-details">
                    <h3 className="drop-name">{drop.name}</h3>
                    {drop.user && (
                      <span className="drop-user">
                        <User size={12} />
                        {drop.user.username}
                      </span>
                    )}
                  </div>
                </div>
                <div className="drop-actions">
                  <button
                    className={`status-badge-button ${getStatusBadgeClass(drop.status)}`}
                    onClick={() => handleToggleStatus(drop)}
                    disabled={updateStatusMutation.isPending || !canEdit}
                  >
                    {drop.status === DropStatus.ACTIVE ? (
                      <>
                        <CheckCircle size={14} />
                        Active
                      </>
                    ) : (
                      <>
                        <Snowflake size={14} />
                        Frozen
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="drop-card-body">
                {drop.comment && (
                  <div className="drop-comment">
                    <MessageSquare size={14} />
                    <span>{drop.comment}</span>
                  </div>
                )}

                <div className="drop-meta">
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span>Created: {formatDate(drop.createdAt)}</span>
                  </div>
                </div>

                {canEdit && (
                  <button 
                    className="btn-edit"
                    onClick={() => handleEdit(drop)}
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Drop</h2>
              <button className="modal-close" onClick={() => setIsCreateModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter drop name or alias"
                />
              </div>
              <div className="form-group">
                <label>Comment</label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Optional comment"
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleSubmitCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Drop'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedDrop && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Drop</h2>
              <button className="modal-close" onClick={() => setIsEditModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter drop name or alias"
                />
              </div>
              <div className="form-group">
                <label>Comment</label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Optional comment"
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleSubmitEdit}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Updating...' : 'Update Drop'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
