import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Bot, Bell, Shield, CreditCard, Mic, Clock,
  MessageSquare, Phone, Save, Volume2, Check, ArrowRight,
  X, Zap, ChevronRight, CheckCircle, Crown, Lock, Loader2,
  Plus, Trash2, Star, Wallet, Building
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import API from '../api/axios'

const tabs = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'agent', label: 'Agent', icon: Bot },
  { key: 'payments', label: 'Payments', icon: Wallet },
  { key: 'voice', label: 'Voice', icon: Mic },
  { key: 'notifications', label: 'Alerts', icon: Bell },
  { key: 'rules', label: 'Rules', icon: Shield },
  { key: 'billing', label: 'Billing', icon: CreditCard },
]

const personalityConfig = {
  Formal: { label: 'Formal', emoji: '🎩', desc: 'Professional and polished tone' },
  Friendly: { label: 'Friendly', emoji: '😊', desc: 'Warm and casual vibe' },
  Pidgin: { label: 'Pidgin', emoji: '🇬🇭', desc: 'Local pidgin language style' },
}

const PROVIDER_OPTIONS = [
  { key: 'mtn', label: 'MTN Mobile Money', emoji: '💛' },
  { key: 'telecel', label: 'Telecel Cash', emoji: '🔴' },
  { key: 'vodafone', label: 'Vodafone Cash', emoji: '❤️' },
  { key: 'airteltigo', label: 'AirtelTigo Money', emoji: '💙' },
  { key: 'bank', label: 'Bank Account', emoji: '🏦' },
]

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  // ═══ Profile state ═══
  const [profileData, setProfileData] = useState({ first_name: '', last_name: '', phone: '', email: '', business_name: '' })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileErrors, setProfileErrors] = useState({})

  useEffect(() => {
    if (user) setProfileData({ first_name: user.first_name || '', last_name: user.last_name || '', phone: user.phone || '', email: user.email || '', business_name: user.business_name || '' })
  }, [user])

  const handleProfileChange = e => {
    const { name, value } = e.target
    setProfileData(p => ({ ...p, [name]: value }))
    setProfileSaved(false)
    if (profileErrors[name]) setProfileErrors(p => { const n = { ...p }; delete n[name]; return n })
  }

  const handleSaveProfile = async () => {
    setProfileSaving(true); setProfileErrors({})
    try {
      const { data } = await API.patch('/auth/me/', { first_name: profileData.first_name, last_name: profileData.last_name, phone: profileData.phone, business_name: profileData.business_name })
      updateUser(data); setProfileSaved(true); setTimeout(() => setProfileSaved(false), 3000)
    } catch (err) {
      const be = err.response?.data || {}; const m = {}
      Object.keys(be).forEach(k => { m[k] = Array.isArray(be[k]) ? be[k][0] : be[k] })
      setProfileErrors(m)
    } finally { setProfileSaving(false) }
  }

  // ═══ Agent state ═══
  const [agentSettings, setAgentSettings] = useState(null)
  const [agentLoading, setAgentLoading] = useState(false)
  const [personality, setPersonality] = useState('Friendly')
  const [greeting, setGreeting] = useState('')
  const [negotiationStyle, setNegotiationStyle] = useState('balanced')
  const [agentSaving, setAgentSaving] = useState(false)
  const [agentSaved, setAgentSaved] = useState(false)

  const fetchAgentSettings = useCallback(async () => {
    setAgentLoading(true)
    try {
      const { data } = await API.get('/agent/settings/')
      setAgentSettings(data)
      setPersonality(data.personality || 'Friendly')
      setGreeting(data.custom_greeting || '')
      setNegotiationStyle(data.negotiation_style || 'balanced')
    } catch (e) { console.error(e) }
    finally { setAgentLoading(false) }
  }, [])

  useEffect(() => { if (activeTab === 'agent') fetchAgentSettings() }, [activeTab, fetchAgentSettings])

  const handleSaveAgent = async () => {
    setAgentSaving(true)
    try {
      await API.patch('/agent/settings/personality/', { personality, custom_greeting: greeting, negotiation_style: negotiationStyle })
      setAgentSaved(true); setTimeout(() => setAgentSaved(false), 3000)
    } catch (e) { console.error(e) }
    finally { setAgentSaving(false) }
  }

  // ═══ Rules state ═══
  const [rules, setRules] = useState({ call_hours_start: '08:00', call_hours_end: '20:00', followup_delay_hours: 3, max_followups: 2, wakeup_threshold_ghs: 500 })
  const [rulesSaving, setRulesSaving] = useState(false)
  const [rulesSaved, setRulesSaved] = useState(false)

  useEffect(() => {
    if (activeTab === 'rules' && !agentSettings) fetchAgentSettings()
  }, [activeTab, agentSettings, fetchAgentSettings])

  useEffect(() => {
    if (agentSettings) setRules({ call_hours_start: agentSettings.call_hours_start || '08:00', call_hours_end: agentSettings.call_hours_end || '20:00', followup_delay_hours: agentSettings.followup_delay_hours || 3, max_followups: agentSettings.max_followups || 2, wakeup_threshold_ghs: agentSettings.wakeup_threshold_ghs || 500 })
  }, [agentSettings])

  const handleSaveRules = async () => {
    setRulesSaving(true)
    try {
      await API.patch('/agent/settings/rules/', rules)
      setRulesSaved(true); setTimeout(() => setRulesSaved(false), 3000)
    } catch (e) { console.error(e) }
    finally { setRulesSaving(false) }
  }

  // ═══ Notifications state ═══
  const [notifs, setNotifs] = useState({ notify_hot_leads: true, notify_new_inquiry: true, notify_wakeup_calls: false, notify_daily_summary: true, notify_price_drops: true })
  const [notifSaving, setNotifSaving] = useState(false)

  useEffect(() => {
    if (activeTab === 'notifications' && !agentSettings) fetchAgentSettings()
  }, [activeTab, agentSettings, fetchAgentSettings])

  useEffect(() => {
    if (agentSettings) setNotifs({ notify_hot_leads: agentSettings.notify_hot_leads ?? true, notify_new_inquiry: agentSettings.notify_new_inquiry ?? true, notify_wakeup_calls: agentSettings.notify_wakeup_calls ?? false, notify_daily_summary: agentSettings.notify_daily_summary ?? true, notify_price_drops: agentSettings.notify_price_drops ?? true })
  }, [agentSettings])

  const toggleNotif = async (key) => {
    const updated = { ...notifs, [key]: !notifs[key] }
    setNotifs(updated)
    setNotifSaving(true)
    try { await API.patch('/agent/settings/notifications/', updated) } catch (e) { console.error(e); setNotifs(notifs) }
    finally { setNotifSaving(false) }
  }

  // ═══ Payment Methods state ═══
  const [paymentMethods, setPaymentMethods] = useState([])
  const [pmLoading, setPmLoading] = useState(false)
  const [showAddPm, setShowAddPm] = useState(false)
  const [pmForm, setPmForm] = useState({ provider: 'mtn', account_number: '', account_name: '', bank_name: '', is_primary: false })
  const [pmSaving, setPmSaving] = useState(false)
  const [pmErrors, setPmErrors] = useState({})

  const fetchPaymentMethods = useCallback(async () => {
    setPmLoading(true)
    try {
      const { data } = await API.get('/agent/payment-methods/')
      setPaymentMethods(data.results || data || [])
    } catch (e) { console.error(e) }
    finally { setPmLoading(false) }
  }, [])

  useEffect(() => { if (activeTab === 'payments') fetchPaymentMethods() }, [activeTab, fetchPaymentMethods])

  const handleAddPm = async () => {
    setPmSaving(true); setPmErrors({})
    try {
      await API.post('/agent/payment-methods/', pmForm)
      setShowAddPm(false); setPmForm({ provider: 'mtn', account_number: '', account_name: '', bank_name: '', is_primary: false })
      fetchPaymentMethods()
    } catch (err) {
      const be = err.response?.data || {}; const m = {}
      Object.keys(be).forEach(k => { m[k] = Array.isArray(be[k]) ? be[k][0] : be[k] })
      setPmErrors(m)
    } finally { setPmSaving(false) }
  }

  const handleDeletePm = async (id) => {
    if (!confirm('Delete this payment method?')) return
    try { await API.delete(`/agent/payment-methods/${id}/`); fetchPaymentMethods() } catch (e) { console.error(e) }
  }

  const handleSetPrimary = async (id) => {
    try { await API.post(`/agent/payment-methods/${id}/set-primary/`); fetchPaymentMethods() } catch (e) { console.error(e) }
  }

  // Voice state
  const [selectedVoice, setSelectedVoice] = useState(null)

  // Compute initials from actual user data
  const initials = user?.initials || (
    (user?.first_name && user?.last_name)
      ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
      : user?.first_name
        ? user.first_name[0].toUpperCase()
        : '??'
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">Settings</h2>
        <p className="text-sm text-zinc-500 mt-0.5">Manage your account and agent configuration</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs - horizontal scroll on mobile */}
        <div className="lg:w-56 shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 -mx-1 px-1 scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2.5 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <tab.icon size={17} />{tab.label}
              </button>
            ))}
          </nav>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 bg-white rounded-xl border border-zinc-200 p-4 sm:p-6"
        >

          {/* ═══ PROFILE ═══ */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Profile Information</h3>
              </div>
              {profileErrors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{profileErrors.general}</div>
              )}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold text-white">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || '—'}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
                  </p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[['first_name', 'First Name'], ['last_name', 'Last Name'], ['phone', 'Phone']].map(([k, l]) => (
                  <div key={k}>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">{l}</label>
                    <input
                      name={k}
                      value={profileData[k]}
                      onChange={handleProfileChange}
                      className={`w-full px-4 py-2.5 rounded-xl border ${profileErrors[k] ? 'border-red-400' : 'border-zinc-200'} text-sm outline-none focus:border-emerald-500`}
                    />
                    {profileErrors[k] && <p className="text-xs text-red-500 mt-1">{profileErrors[k]}</p>}
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Email <span className="text-zinc-400 font-normal">(cannot change)</span>
                  </label>
                  <input value={profileData.email} disabled className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm bg-zinc-50 text-zinc-400 cursor-not-allowed" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Business Name</label>
                <input name="business_name" value={profileData.business_name} onChange={handleProfileChange} className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none focus:border-emerald-500" />
              </div>
              <button onClick={handleSaveProfile} disabled={profileSaving} className={`inline-flex items-center gap-2 font-semibold px-6 py-2.5 rounded-xl transition-colors ${profileSaved ? 'bg-emerald-100 text-emerald-700' : profileSaving ? 'bg-emerald-400 text-white cursor-wait' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
                {profileSaved ? <><CheckCircle size={16} /> Saved!</> : profileSaving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Changes</>}
              </button>
            </div>
          )}

          {/* ═══ AGENT ═══ */}
          {activeTab === 'agent' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Agent Configuration</h3>
                <p className="text-sm text-zinc-500 mt-0.5">Customize how your AI agent talks to buyers</p>
              </div>
              {agentLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /></div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">Agent Personality</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {Object.entries(personalityConfig).map(([key, cfg]) => (
                        <button key={key} onClick={() => { setPersonality(key); setAgentSaved(false) }} className={`p-4 rounded-xl border-2 text-center transition-all ${personality === key ? 'border-emerald-600 bg-emerald-50' : 'border-zinc-200 hover:border-zinc-300'}`}>
                          <span className="text-2xl">{cfg.emoji}</span>
                          <p className={`text-sm font-semibold mt-1 ${personality === key ? 'text-emerald-700' : 'text-zinc-700'}`}>{cfg.label}</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">{cfg.desc}</p>
                          {personality === key && <span className="mt-2 inline-block text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Active</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Custom Greeting</label>
                    <textarea rows={3} value={greeting} onChange={e => { setGreeting(e.target.value); setAgentSaved(false) }} className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none focus:border-emerald-500 resize-none" placeholder="Leave empty for default greeting" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Negotiation Style</label>
                    <div className="space-y-2">
                      {[{ key: 'balanced', label: 'Balanced', desc: 'Fair but firm' }, { key: 'aggressive', label: 'Aggressive', desc: 'Holds price firmly' }, { key: 'flexible', label: 'Flexible', desc: 'Offers discounts more readily' }].map(s => (
                        <button key={s.key} onClick={() => { setNegotiationStyle(s.key); setAgentSaved(false) }} className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${negotiationStyle === s.key ? 'border-emerald-600 bg-emerald-50' : 'border-zinc-200 hover:border-zinc-300'}`}>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${negotiationStyle === s.key ? 'border-emerald-600' : 'border-zinc-300'}`}>
                            {negotiationStyle === s.key && <div className="w-2 h-2 bg-emerald-600 rounded-full" />}
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${negotiationStyle === s.key ? 'text-emerald-700' : 'text-zinc-700'}`}>{s.label}</p>
                            <p className="text-[11px] text-zinc-400">{s.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={handleSaveAgent} disabled={agentSaving} className={`inline-flex items-center gap-2 font-semibold px-6 py-2.5 rounded-xl transition-colors ${agentSaved ? 'bg-emerald-100 text-emerald-700' : agentSaving ? 'bg-emerald-400 text-white cursor-wait' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
                    {agentSaved ? <><CheckCircle size={16} /> Saved!</> : agentSaving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Configuration</>}
                  </button>
                </>
              )}
            </div>
          )}

          {/* ═══ PAYMENTS ═══ */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">Payment Methods</h3>
                  <p className="text-sm text-zinc-500 mt-0.5">How buyers pay you — MoMo, bank, etc.</p>
                </div>
                <button onClick={() => setShowAddPm(true)} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
                  <Plus size={16} /> Add
                </button>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <p className="text-xs text-emerald-700">💡 When a buyer confirms an order, your AI agent will automatically share your payment details and ask them to send the money.</p>
              </div>

              {pmLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /></div>
              ) : paymentMethods.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Wallet size={40} className="text-zinc-300 mb-3" />
                  <p className="text-sm font-medium text-zinc-600">No payment methods yet</p>
                  <p className="text-xs text-zinc-400 mt-1">Add your MoMo or bank details so buyers can pay you</p>
                  <button onClick={() => setShowAddPm(true)} className="mt-4 text-sm font-semibold text-emerald-600 hover:text-emerald-700">+ Add Payment Method</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentMethods.map(pm => {
                    const prov = PROVIDER_OPTIONS.find(p => p.key === pm.provider)
                    return (
                      <div key={pm.id} className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 transition-all ${pm.is_primary ? 'border-emerald-500 bg-emerald-50/50' : 'border-zinc-200'}`}>
                        <span className="text-xl sm:text-2xl">{prov?.emoji || '📱'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-zinc-900">{pm.provider_display || prov?.label}</p>
                            {pm.is_primary && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">PRIMARY</span>}
                          </div>
                          <p className="text-xs text-zinc-500 mt-0.5 truncate">{pm.account_number} · {pm.account_name}</p>
                          {pm.bank_name && <p className="text-xs text-zinc-400">{pm.bank_name}</p>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {!pm.is_primary && (
                            <button onClick={() => handleSetPrimary(pm.id)} className="p-1.5 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Set as primary">
                              <Star size={15} />
                            </button>
                          )}
                          <button onClick={() => handleDeletePm(pm.id)} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <AnimatePresence>
                {showAddPm && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-4 mt-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-zinc-900">Add Payment Method</h4>
                        <button onClick={() => { setShowAddPm(false); setPmErrors({}) }} className="text-zinc-400 hover:text-zinc-600"><X size={18} /></button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-2">Provider</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {PROVIDER_OPTIONS.map(p => (
                            <button key={p.key} onClick={() => setPmForm(f => ({ ...f, provider: p.key, bank_name: p.key === 'bank' ? f.bank_name : '' }))} className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left text-sm transition-all ${pmForm.provider === p.key ? 'border-emerald-600 bg-emerald-50' : 'border-zinc-200 hover:border-zinc-300'}`}>
                              <span>{p.emoji}</span><span className="font-medium truncate">{p.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">{pmForm.provider === 'bank' ? 'Account Number' : 'Phone Number'}</label>
                        <input value={pmForm.account_number} onChange={e => setPmForm(f => ({ ...f, account_number: e.target.value }))} placeholder={pmForm.provider === 'bank' ? '1234567890' : '0551234567'} className={`w-full px-4 py-2.5 rounded-xl border ${pmErrors.account_number ? 'border-red-400' : 'border-zinc-200'} text-sm outline-none focus:border-emerald-500`} />
                        {pmErrors.account_number && <p className="text-xs text-red-500 mt-1">{pmErrors.account_number}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">Account Name (name that shows when sending money)</label>
                        <input value={pmForm.account_name} onChange={e => setPmForm(f => ({ ...f, account_name: e.target.value }))} placeholder="Ernest Yaw Baah" className={`w-full px-4 py-2.5 rounded-xl border ${pmErrors.account_name ? 'border-red-400' : 'border-zinc-200'} text-sm outline-none focus:border-emerald-500`} />
                        {pmErrors.account_name && <p className="text-xs text-red-500 mt-1">{pmErrors.account_name}</p>}
                      </div>

                      {pmForm.provider === 'bank' && (
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1.5">Bank Name</label>
                          <input value={pmForm.bank_name} onChange={e => setPmForm(f => ({ ...f, bank_name: e.target.value }))} placeholder="GCB Bank" className={`w-full px-4 py-2.5 rounded-xl border ${pmErrors.bank_name ? 'border-red-400' : 'border-zinc-200'} text-sm outline-none focus:border-emerald-500`} />
                          {pmErrors.bank_name && <p className="text-xs text-red-500 mt-1">{pmErrors.bank_name}</p>}
                        </div>
                      )}

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={pmForm.is_primary} onChange={e => setPmForm(f => ({ ...f, is_primary: e.target.checked }))} className="w-4 h-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500" />
                        <span className="text-sm text-zinc-700">Set as primary payment method</span>
                      </label>

                      {pmErrors.non_field_errors && <p className="text-xs text-red-500">{pmErrors.non_field_errors}</p>}

                      <button onClick={handleAddPm} disabled={pmSaving || !pmForm.account_number || !pmForm.account_name} className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-colors ${pmSaving ? 'bg-emerald-400 text-white cursor-wait' : 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-zinc-200 disabled:text-zinc-400'}`}>
                        {pmSaving ? <><Loader2 size={14} className="inline animate-spin mr-2" />Adding...</> : 'Add Payment Method'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ═══ VOICE ═══ */}
          {activeTab === 'voice' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Voice Settings</h3>
                <p className="text-sm text-zinc-500 mt-0.5">Configure voice for AI calls</p>
              </div>
              <div className="bg-zinc-50 rounded-xl p-4 sm:p-5 border border-zinc-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Mic size={22} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">Your Voice Clone</p>
                    <p className="text-xs text-zinc-500">Status: Not configured</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 bg-white border border-zinc-200 px-4 py-2 rounded-lg text-sm text-zinc-700 hover:bg-zinc-50"><Volume2 size={15} /> Preview</button>
                  <button className="flex items-center gap-2 bg-white border border-zinc-200 px-4 py-2 rounded-lg text-sm text-zinc-700 hover:bg-zinc-50"><Mic size={15} /> Record</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Or choose a preset voice</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['Male - Professional', 'Male - Casual', 'Female - Professional', 'Female - Casual'].map(v => (
                    <button key={v} onClick={() => setSelectedVoice(v)} className={`p-3 rounded-xl border text-sm text-left transition-all ${selectedVoice === v ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-zinc-200 text-zinc-600 hover:border-emerald-400'}`}>
                      <Volume2 size={14} className={`inline mr-2 ${selectedVoice === v ? 'text-emerald-500' : 'text-zinc-400'}`} />{v}{selectedVoice === v && <Check size={14} className="inline ml-2 text-emerald-500" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ NOTIFICATIONS ═══ */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Notification Preferences</h3>
                <p className="text-sm text-zinc-500 mt-0.5">Control when and how you get alerted</p>
              </div>
              {[
                { key: 'notify_hot_leads', label: 'Hot lead alerts', desc: 'Immediate notification when buyer wants to buy' },
                { key: 'notify_new_inquiry', label: 'New inquiry notifications', desc: 'Notification for every new conversation' },
                { key: 'notify_wakeup_calls', label: 'Wake-up calls', desc: 'Phone call when urgent deal is happening' },
                { key: 'notify_daily_summary', label: 'Daily summary', desc: 'End-of-day digest via WhatsApp' },
                { key: 'notify_price_drops', label: 'Price drop confirmations', desc: 'Notification when broadcast is sent' },
              ].map(n => (
                <div key={n.key} className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0">
                  <div className="mr-4">
                    <p className="text-sm font-medium text-zinc-900">{n.label}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{n.desc}</p>
                  </div>
                  <button onClick={() => toggleNotif(n.key)} className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${notifs[n.key] ? 'bg-emerald-600' : 'bg-zinc-200'}`}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifs[n.key] ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ═══ RULES ═══ */}
          {activeTab === 'rules' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Agent Rules</h3>
                <p className="text-sm text-zinc-500 mt-0.5">Set boundaries for your AI agent</p>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5"><Clock size={14} className="inline mr-1.5 -mt-0.5" />Call Hours</label>
                  <div className="flex items-center gap-2">
                    <input type="time" value={rules.call_hours_start} onChange={e => setRules(r => ({ ...r, call_hours_start: e.target.value }))} className="px-3 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none focus:border-emerald-500" />
                    <span className="text-sm text-zinc-400">to</span>
                    <input type="time" value={rules.call_hours_end} onChange={e => setRules(r => ({ ...r, call_hours_end: e.target.value }))} className="px-3 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none focus:border-emerald-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5"><MessageSquare size={14} className="inline mr-1.5 -mt-0.5" />Follow-up Delay (hours)</label>
                  <select value={rules.followup_delay_hours} onChange={e => setRules(r => ({ ...r, followup_delay_hours: Number(e.target.value) }))} className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none focus:border-emerald-500 bg-white">
                    {[1, 2, 3, 6, 12, 24, 48].map(h => <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Max Follow-ups Without Reply</label>
                  <select value={rules.max_followups} onChange={e => setRules(r => ({ ...r, max_followups: Number(e.target.value) }))} className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none focus:border-emerald-500 bg-white">
                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} time{n > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5"><Phone size={14} className="inline mr-1.5 -mt-0.5" />Wake-up Call Threshold (GHS)</label>
                  <input type="number" value={rules.wakeup_threshold_ghs} onChange={e => setRules(r => ({ ...r, wakeup_threshold_ghs: Number(e.target.value) }))} className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none focus:border-emerald-500" />
                  <p className="text-xs text-zinc-400 mt-1">Only call you for deals above this amount</p>
                </div>
              </div>
              <button onClick={handleSaveRules} disabled={rulesSaving} className={`inline-flex items-center gap-2 font-semibold px-6 py-2.5 rounded-xl transition-colors ${rulesSaved ? 'bg-emerald-100 text-emerald-700' : rulesSaving ? 'bg-emerald-400 text-white cursor-wait' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
                {rulesSaved ? <><CheckCircle size={16} /> Saved!</> : rulesSaving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Rules</>}
              </button>
            </div>
          )}

          {/* ═══ BILLING ═══ */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Billing & Plan</h3>
                <p className="text-sm text-zinc-500 mt-0.5">Subscription details coming soon</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
                <div className="flex items-center gap-2">
                  <Crown size={14} className="text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Current Plan</span>
                </div>
                <h4 className="text-xl font-bold text-zinc-900 mt-1">Free Beta</h4>
                <p className="text-sm text-zinc-500 mt-0.5">Full access during beta period</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}