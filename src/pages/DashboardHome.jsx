import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, MessageSquare, Users, DollarSign,
  Target, ArrowUpRight, ChevronRight, MoreHorizontal, Bot, Loader2,
  CheckCircle, ArrowRight
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts'
import { useAuth } from '../contexts/AuthContext'
import API from '../api/axios'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function timeAgo(d) {
  if (!d) return ''
  const s = Math.floor((Date.now() - new Date(d)) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

const statusColors = {
  hot: 'bg-red-100 text-red-700',
  negotiating: 'bg-amber-100 text-amber-700',
  new: 'bg-zinc-100 text-zinc-700',
  interested: 'bg-zinc-100 text-zinc-600',
  confirmed: 'bg-emerald-100 text-emerald-700',
}

const PIPELINE_COLORS = {
  New: '#18181b', Interested: '#3f3f46',
  Negotiating: '#f59e0b', Hot: '#ef4444',
  'Hot Lead': '#ef4444', Confirmed: '#10b981',
}

export default function DashboardHome() {
  const { user } = useAuth()
  const firstName = user?.first_name || 'there'
  const isNewUser = !user?.onboarding_completed

  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState(null)
  const [weekly, setWeekly] = useState([])
  const [pipeline, setPipeline] = useState([])
  const [conversations, setConversations] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [hasProducts, setHasProducts] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [ovRes, wkRes, plRes, cvRes, tpRes] = await Promise.allSettled([
          API.get('/analytics/overview/'),
          API.get('/analytics/weekly-overview/', { params: { days: 7 } }),
          API.get('/leads/pipeline/'),
          API.get('/conversations/', { params: { ordering: '-last_message_at' } }),
          API.get('/analytics/top-products/', { params: { limit: 5 } }),
        ])
        if (cancelled) return
        if (ovRes.status === 'fulfilled') setOverview(ovRes.value.data)
        if (wkRes.status === 'fulfilled') setWeekly(wkRes.value.data?.results || wkRes.value.data || [])
        if (plRes.status === 'fulfilled') setPipeline(plRes.value.data?.results || plRes.value.data || [])
        if (cvRes.status === 'fulfilled') {
          const list = cvRes.value.data?.results || cvRes.value.data || []
          setConversations(list.slice(0, 5))
        }
        if (tpRes.status === 'fulfilled') {
          const tp = tpRes.value.data?.results || tpRes.value.data || []
          setTopProducts(tp)
          setHasProducts(tp.length > 0)
        }
      } catch (e) { console.error('Dashboard load error:', e) }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const ov = overview || {}
  const metrics = [
    { title: 'Total Revenue', value: `GHS ${(ov.total_revenue || 0).toLocaleString()}`, change: ov.total_revenue > 0 ? '+' : '—', up: true, icon: DollarSign, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
    { title: 'Conversations', value: String(ov.conversations || 0), change: ov.conversations > 0 ? '+' : '—', up: true, icon: MessageSquare, iconBg: 'bg-zinc-100', iconColor: 'text-zinc-600' },
    { title: 'Hot Leads', value: String(ov.hot_leads || 0), change: ov.hot_leads > 0 ? '+' : '—', up: true, icon: Target, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
    { title: 'Conversion Rate', value: `${ov.conversion_rate || 0}%`, change: ov.conversion_rate > 0 ? '+' : '—', up: true, icon: Users, iconBg: 'bg-zinc-100', iconColor: 'text-zinc-600' },
  ]

  const chartData = weekly.length > 0 ? weekly.map(d => ({
    day: d.day, revenue: d.revenue || 0, conversations: d.conversations || 0,
  })) : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => ({ day: d, revenue: 0, conversations: 0 }))

  const pieData = pipeline.length > 0
    ? pipeline.filter(p => (p.count || 0) > 0).map(p => ({
        name: p.stage || p.label, value: p.count || 0,
        color: PIPELINE_COLORS[p.stage || p.label] || p.color || '#a1a1aa',
      }))
    : []

  // Calculate setup progress
  const setupSteps = [
    { label: 'Add your first product', desc: 'List what you sell so your agent knows your catalog', done: hasProducts, link: '/dashboard/products' },
    { label: 'Configure agent personality', desc: 'Set tone, greeting & negotiation style', done: false, link: '/dashboard/settings' },
    { label: 'Connect WhatsApp number', desc: 'Link your business WhatsApp to start receiving messages', done: user?.whatsapp_connected || false, link: '/dashboard/settings' },
  ]
  const completedSteps = setupSteps.filter(s => s.done).length
  const progressPercent = Math.round((completedSteps / setupSteps.length) * 100)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">{getGreeting()}, {firstName}</h2>
        <p className="text-sm text-zinc-500 mt-1">
          {isNewUser ? "Welcome! Let's get your AI agent set up" : 'Here is what your agent has been doing today'}
        </p>
      </div>

      {/* Onboarding Setup Card */}
      {isNewUser && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border-2 border-emerald-200 shadow-lg shadow-emerald-100/50 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-emerald-600 px-5 py-4 sm:px-6 sm:py-5">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
                <Bot size={22} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-white">Get your AI agent selling</h3>
                <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">
                  {completedSteps}/{setupSteps.length} steps completed
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-white">{progressPercent}%</span>
              </div>
            </div>
            {/* Mobile progress bar */}
            <div className="sm:hidden mt-3 flex items-center gap-2">
              <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-bold text-white">{progressPercent}%</span>
            </div>
          </div>

          {/* Steps */}
          <div className="p-4 sm:p-5 space-y-3">
            {setupSteps.map((step, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                  step.done
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-zinc-50 border-zinc-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                }`}
              >
                {/* Step indicator */}
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  step.done
                    ? 'bg-emerald-600'
                    : 'bg-white border-2 border-zinc-300'
                }`}>
                  {step.done ? (
                    <CheckCircle size={16} className="text-white" />
                  ) : (
                    <span className="text-xs font-bold text-zinc-400">{i + 1}</span>
                  )}
                </div>

                {/* Step content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${
                    step.done ? 'text-emerald-700 line-through' : 'text-zinc-900'
                  }`}>
                    {step.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${
                    step.done ? 'text-emerald-500' : 'text-zinc-500'
                  }`}>
                    {step.desc}
                  </p>
                </div>

                {/* Action button */}
                {!step.done ? (
                  <Link
                    to={step.link}
                    className="shrink-0 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 sm:px-4 py-2 rounded-lg transition-colors shadow-sm"
                  >
                    Start
                    <ArrowRight size={12} />
                  </Link>
                ) : (
                  <span className="shrink-0 text-xs font-semibold text-emerald-600 bg-emerald-100 px-3 py-2 rounded-lg">
                    Done ✓
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${m.iconBg} flex items-center justify-center`}>
                <m.icon size={16} className={`sm:hidden ${m.iconColor}`} />
                <m.icon size={18} className={`hidden sm:block ${m.iconColor}`} />
              </div>
              {m.change !== '—' && (
                <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                  <TrendingUp size={12} />{m.change}
                </span>
              )}
            </div>
            <p className="text-lg sm:text-2xl font-bold text-zinc-900 truncate">{m.value}</p>
            <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5">{m.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-xl border border-zinc-200 p-4 sm:p-5"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-zinc-900">Revenue Overview</h3>
              <p className="text-xs text-zinc-500 mt-0.5">This week</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} tickFormatter={v => v >= 1000 ? `${v / 1000}k` : v} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#revGrad)" name="revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-5"
        >
          <h3 className="text-sm sm:text-base font-semibold text-zinc-900 mb-1">Lead Pipeline</h3>
          <p className="text-xs text-zinc-500 mb-4">Current distribution</p>
          {pieData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[180px] text-center">
              <Target size={32} className="text-zinc-300 mb-2" />
              <p className="text-sm text-zinc-400">No leads yet</p>
              <p className="text-xs text-zinc-300 mt-1">They'll appear once customers message you</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {(pieData.length > 0 ? pieData : [
              { name: 'New', value: 0, color: '#18181b' },
              { name: 'Negotiating', value: 0, color: '#f59e0b' },
              { name: 'Hot', value: 0, color: '#ef4444' },
              { name: 'Confirmed', value: 0, color: '#10b981' },
            ]).map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="text-xs text-zinc-500">{d.name}</span>
                <span className="text-xs font-bold text-zinc-700 ml-auto">{d.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Conversations & Top Products */}
      <div className="grid lg:grid-cols-5 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-3 bg-white rounded-xl border border-zinc-200"
        >
          <div className="flex items-center justify-between p-4 sm:p-5 pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-zinc-900">Recent Conversations</h3>
              <p className="text-xs text-zinc-500 mt-0.5">AI-handled messages</p>
            </div>
            <Link to="/dashboard/conversations" className="text-xs text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-center px-6">
              <div className="w-14 h-14 bg-zinc-100 rounded-full flex items-center justify-center mb-3">
                <MessageSquare size={24} className="text-zinc-400" />
              </div>
              <p className="text-sm font-medium text-zinc-600">No conversations yet</p>
              <p className="text-xs text-zinc-400 mt-1 max-w-[280px]">Once customers message your WhatsApp number, they'll appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {conversations.map(c => (
                <Link to="/dashboard/conversations" key={c.id} className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-zinc-50 transition-colors">
                  <div className="w-9 h-9 bg-zinc-200 rounded-full flex items-center justify-center text-xs font-bold text-zinc-600 shrink-0">
                    {c.buyer?.initials || '??'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-zinc-900 truncate">{c.buyer?.display_name || c.buyer?.phone}</p>
                      <span className="text-[10px] text-zinc-400 shrink-0 ml-2">{timeAgo(c.last_message_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${statusColors[c.status] || 'bg-zinc-100 text-zinc-700'} uppercase`}>{c.status}</span>
                      <span className="text-xs text-zinc-400 truncate">{c.product_name || c.last_message_text?.slice(0, 40)}</span>
                    </div>
                  </div>
                  {c.unread_count > 0 && (
                    <span className="w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                      {c.unread_count}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2 bg-white rounded-xl border border-zinc-200"
        >
          <div className="flex items-center justify-between p-4 sm:p-5 pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-zinc-900">Top Products</h3>
              <p className="text-xs text-zinc-500 mt-0.5">By inquiries</p>
            </div>
          </div>
          {topProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-center px-6">
              <div className="w-14 h-14 bg-zinc-100 rounded-full flex items-center justify-center mb-3">
                <DollarSign size={24} className="text-zinc-400" />
              </div>
              <p className="text-sm font-medium text-zinc-600">No products added yet</p>
              <Link to="/dashboard/products" className="mt-3 text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                Add Products <ArrowUpRight size={12} />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-zinc-50 px-4 sm:px-5 pb-3">
              {topProducts.map((p, i) => (
                <div key={p.id || i} className="flex items-center justify-between py-3">
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-sm font-medium text-zinc-900 truncate">{p.name}</p>
                    <p className="text-xs text-zinc-400">{p.inquiries || 0} inquiries · {p.sales || 0} sales</p>
                  </div>
                  <p className="text-sm font-bold text-zinc-900 shrink-0">GHS {(p.price || 0).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Daily Conversations Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-5"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-zinc-900">Daily Conversations</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Messages handled by AI agent</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="conversations" fill="#18181b" radius={[6, 6, 0, 0]} name="conversations" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white shadow-lg border border-zinc-200 rounded-lg px-4 py-3">
      <p className="text-sm font-medium text-zinc-900">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm text-zinc-500 mt-1">
          <span className="font-medium" style={{ color: p.color }}>{p.name}: </span>
          {p.name === 'revenue' ? `GHS ${(p.value || 0).toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  )
}