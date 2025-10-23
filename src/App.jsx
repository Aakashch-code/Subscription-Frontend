import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, TrendingUp, Calendar, Activity, AlertCircle, Loader2 } from 'lucide-react';

export default function SubscriptionTracker() {
  // ========== CONFIGURATION ==========
  const BACKEND_URL = 'http://localhost:8080/api/subscriptions';
  
  const [subscriptions, setSubscriptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    billingCycle: 'Monthly',
    nextBillingDate: '',
    category: ''
  });

  const categories = ['Entertainment', 'Music', 'Software', 'Fitness', 'Education', 'Cloud Storage', 'Other'];
  const billingCycles = ['Monthly', 'Yearly', 'Weekly'];

  // ========== API FUNCTIONS ==========
  
  // Fetch all subscriptions
  const fetchSubscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}`);
      if (!response.ok) throw new Error('Failed to fetch subscriptions');
      const data = await response.json();
      setSubscriptions(data);
    } catch (err) {
      setError(err.message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create new subscription
  const createSubscription = async (data) => {
    try {
      const response = await fetch(`${BACKEND_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create subscription');
      await fetchSubscriptions();
    } catch (err) {
      setError(err.message);
      console.error('Create error:', err);
    }
  };

  // Update subscription
  const updateSubscription = async (id, data) => {
    try {
      const response = await fetch(`${BACKEND_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update subscription');
      await fetchSubscriptions();
    } catch (err) {
      setError(err.message);
      console.error('Update error:', err);
    }
  };

  // Delete subscription
  const deleteSubscription = async (id) => {
    try {
      const response = await fetch(`${BACKEND_URL}/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete subscription');
      await fetchSubscriptions();
    } catch (err) {
      setError(err.message);
      console.error('Delete error:', err);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // ========== HANDLERS ==========
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.amount || !formData.nextBillingDate || !formData.category) {
      setError('Please fill all fields');
      return;
    }
    
    const subscriptionData = {
      ...formData,
      amount: parseFloat(formData.amount)
    };

    if (editingId) {
      await updateSubscription(editingId, subscriptionData);
      setEditingId(null);
    } else {
      await createSubscription(subscriptionData);
    }

    setFormData({
      name: '',
      amount: '',
      billingCycle: 'Monthly',
      nextBillingDate: '',
      category: ''
    });
    setIsModalOpen(false);
  };

  const handleEdit = (subscription) => {
    setFormData({ 
      name: subscription.name,
      amount: subscription.amount.toString(),
      billingCycle: subscription.billingCycle,
      nextBillingDate: subscription.nextBillingDate,
      category: subscription.category
    });
    setEditingId(subscription.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      await deleteSubscription(id);
    }
  };

  const calculateTotals = () => {
    const monthly = subscriptions.reduce((sum, sub) => {
      const amount = parseFloat(sub.amount);
      if (sub.billingCycle === 'Monthly') return sum + amount;
      if (sub.billingCycle === 'Yearly') return sum + (amount / 12);
      if (sub.billingCycle === 'Weekly') return sum + (amount * 4.33);
      return sum;
    }, 0);

    return {
      monthly: monthly.toFixed(2),
      yearly: (monthly * 12).toFixed(2)
    };
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-zinc-100 p-4 md:p-8">
      <style>{`
        /* 🌌 === Glassmorphism Charcoal UI === 🌌 */

:root {
  --glass-bg: rgba(15, 15, 25, 0.65);
  --glass-border: rgba(255, 255, 255, 0.08);
  --charcoal: #34495e;
  --charcoal-glow: rgba(52, 73, 94, 0.3);
  --text-light: #f5f7fa;
  --text-muted: #a0a8b5;
  --transition: all 0.35s ease;
  --shadow-charcoal: 0 0 15px var(--charcoal-glow);
}

/* ======= CARD STYLES ======= */

.glass-card,
.stat-card {
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: 1rem;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.25);
  transition: var(--transition);
  color: var(--text-light);
  padding: 1.2rem;
}

.glass-card:hover,
.stat-card:hover {
  border-color: var(--charcoal-glow);
  box-shadow: 0 0 25px var(--charcoal-glow);
  transform: translateY(-4px);
}

/* ======= INPUT FIELDS ======= */

.input-field {
  background: rgba(30, 30, 45, 0.85);
  border: 1px solid var(--glass-border);
  color: var(--text-light);
  border-radius: 0.6rem;
  padding: 0.6rem 1rem;
  transition: var(--transition);
  font-size: 0.95rem;
}

.input-field:focus {
  border-color: var(--charcoal-glow);
  box-shadow: 0 0 10px var(--charcoal-glow);
  background: rgba(30, 30, 45, 0.95);
  outline: none;
}

/* ======= BUTTONS ======= */

.btn-primary,
.btn-secondary {
  background: linear-gradient(145deg, rgba(52, 73, 94, 0.1), rgba(15, 15, 25, 0.8));
  border: 1px solid var(--glass-border);
  color: var(--text-light);
  border-radius: 0.75rem;
  padding: 0.6rem 1.2rem;
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition);
  letter-spacing: 0.3px;
}

.btn-primary:hover,
.btn-secondary:hover {
  border-color: var(--charcoal);
  box-shadow: 0 0 20px var(--charcoal-glow);
  transform: translateY(-2px);
  background: linear-gradient(145deg, rgba(52, 73, 94, 0.15), rgba(25, 25, 35, 0.9));
}

/* ======= ICON BUTTON ======= */

.btn-icon {
  background: rgba(52, 73, 94, 0.05);
  border: 1px solid var(--glass-border);
  color: var(--text-light);
  border-radius: 0.75rem;
  padding: 0.5rem;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  border-color: var(--charcoal);
  background: rgba(52, 73, 94, 0.1);
  box-shadow: 0 0 15px var(--charcoal-glow);
  transform: scale(1.05);
}

/* ======= DROPDOWNS ======= */

select {
  background: rgba(30, 30, 45, 0.8);
  color: var(--text-light);
  border: 1px solid var(--glass-border);
  border-radius: 0.6rem;
  padding: 0.5rem 1rem;
  transition: var(--transition);
}

select:hover {
  border-color: var(--charcoal);
  box-shadow: var(--shadow-charcoal);
}

select option {
  background: #1e1e2a;
  color: var(--text-light);
}

/* ======= TITLES ======= */

h1, h2, h3 {
  background: linear-gradient(90deg, #ffffff, var(--charcoal));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 1px;
  font-weight: 700;
  text-shadow: 0 0 20px rgba(52, 73, 94, 0.15);
}

/* ======= EXTRA: GLOW BORDER EFFECT ======= */

.glow-border {
  position: relative;
  overflow: hidden;
}

.glow-border::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, rgba(52,73,94,0.6), rgba(255,255,255,0.2));
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  transition: opacity 0.3s ease;
  opacity: 0;
}

.glow-border:hover::before {
  opacity: 1;
}
      `}</style>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            Subscription Manager
          </h1>
          <p className="text-sm md:text-base text-zinc-400">Track and manage your recurring expenses</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 glass-card rounded-xl p-4 border border-red-500/30 bg-red-500/10">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-sm text-red-300">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">×</button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="stat-card rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-400 mb-2 uppercase tracking-wider font-semibold">Monthly Spend</p>
                <p className="text-3xl md:text-4xl font-bold text-white">₹{totals.monthly}</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-800">
                <TrendingUp className="w-6 h-6 text-zinc-400" />
              </div>
            </div>
          </div>

          <div className="stat-card rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-400 mb-2 uppercase tracking-wider font-semibold">Annual Spend</p>
                <p className="text-3xl md:text-4xl font-bold text-white">₹{totals.yearly}</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-800">
                <Calendar className="w-6 h-6 text-zinc-400" />
              </div>
            </div>
          </div>

          <div className="stat-card rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-400 mb-2 uppercase tracking-wider font-semibold">Active Services</p>
                <p className="text-3xl md:text-4xl font-bold text-white">{subscriptions.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-800">
                <Activity className="w-6 h-6 text-zinc-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-white">All Subscriptions</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Subscription
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No subscriptions yet</h3>
            <p className="text-sm text-zinc-400">Add your first subscription to get started</p>
          </div>
        ) : (
          /* Subscriptions Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subscriptions.map(sub => (
              <div key={sub.id} className="glass-card rounded-2xl p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{sub.name}</h3>
                    <span className="text-xs px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-600 font-medium">
                      {sub.category}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(sub)}
                      className="btn-icon"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(sub.id)}
                      className="btn-icon text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-zinc-600">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Amount</span>
                    <span className="text-base font-semibold text-white">₹{sub.amount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Billing</span>
                    <span className="text-sm text-white">{sub.billingCycle}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Next Due</span>
                    <span className="text-sm text-white">{sub.nextBillingDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="glass-card rounded-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-semibold text-white mb-6">
                {editingId ? 'Edit Subscription' : 'New Subscription'}
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs text-zinc-400 mb-2 uppercase tracking-wider font-semibold">Service Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
                    placeholder="Enter service name"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-2 uppercase tracking-wider font-semibold">Amount (₹)</label>
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="input-field w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-2 uppercase tracking-wider font-semibold">Billing Cycle</label>
                  <select
                    name="billingCycle"
                    value={formData.billingCycle}
                    onChange={handleInputChange}
                    className="input-field w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
                  >
                    {billingCycles.map(cycle => (
                      <option key={cycle} value={cycle}>{cycle}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-2 uppercase tracking-wider font-semibold">Next Billing Date</label>
                  <input
                    type="date"
                    name="nextBillingDate"
                    value={formData.nextBillingDate}
                    onChange={handleInputChange}
                    className="input-field w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-2 uppercase tracking-wider font-semibold">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="input-field w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 btn-primary px-4 py-3 rounded-xl text-sm font-semibold"
                  >
                    {editingId ? 'Update' : 'Create'}
                  </button>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingId(null);
                      setFormData({
                        name: '',
                        amount: '',
                        billingCycle: 'Monthly',
                        nextBillingDate: '',
                        category: ''
                      });
                    }}
                    className="flex-1 btn-secondary px-4 py-3 rounded-xl text-sm font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}