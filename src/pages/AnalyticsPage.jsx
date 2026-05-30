import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Phone, Star, DollarSign, Loader2, TrendingUp } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import API from '../api/axios'

function SimpleTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white shadow-lg border border-zinc-200 rounded-lg px-3 py-2">
      <p className="text-xs font-medium text-zinc-900">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs text-zinc-500">
          {p.value > 1000 ? `GHS ${p.value.toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState({})
  const [revenue, setRevenue] = useState([])
  const [hourly, setHourly] = useState([])
  const [funnel, setFunnel] = useState([])
  const [brands, setBrands] = useState([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [ovR, rvR, hrR, fnR, brR] = await Promise.allSettled([
          API.get('/analytics/overview/'),
          API.get('/analytics/revenue-trend/', { params: { months: 6 } }),
          API.get('/analytics/hourly-activity/', { params: { days: 30 } }),
          API.get('/analytics/conversion-funnel/'),
          API.get('/analytics/brand-breakdown/', { params: { limit: 5 } }),
        ])
        if (cancelled) return
        if (ovR.status === 'fulfilled') {
          setOverview(ovR.value.data)
          console.log('Analytics overview:', ovR.value.data)
        }
        if (rvR.status === 'fulfilled') setRevenue(rvR.value.data?.results || rvR.value.data || [])
        if (hrR.status === 'fulfilled') setHourly(hrR.value.data?.results || hrR.value.data || [])
        if (fnR.status === 'fulfilled') setFunnel(fnR.value.data?.results || fnR.value.data || [])
        if (brR.status === 'fulfilled') setBrands(brR.value.data?.results || brR.value.data || [])
      } catch (e) { console.error(e) }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const kpis = [
    {
      title: 'Avg Response Time',
      value: overview.avg_response_time_display || '—',
      subtitle: 'By AI Agent',
      icon: Clock,
      iconBg: 'bg-zinc-100',
      iconColor: 'text-zinc-600',
    },
    {
      title: 'Calls Made',
      value: String(overview.calls_made || 0),
      subtitle: 'Flash calls this month',
      icon: Phone,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      highlight: (overview.calls_made || 0) > 0,
    },
    {
      title: 'Agent Score',
      value: overview.agent_score ? `${overview.agent_score}/100` : '—',
      subtitle: 'Response quality',
      icon: Star,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    {
      title: 'Deals Saved',
      value: `GHS ${(overview.deals_saved_value || 0).toLocaleString()}`,
      subtitle: `${overview.deals_saved || 0} deal${(overview.deals_saved || 0) !== 1 ? 's' : ''} closed by AI`,
      icon: DollarSign,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      highlight: (overview.deals_saved || 0) > 0,
    },
  ]

  const BRAND_COLORS = ['#18181b', '#10b981', '#a1a1aa', '#f59e0b', '#ef4444']
  const FUNNEL_COLORS = ['#18181b', '#3f3f46', '#f59e0b', '#10b981', '#059669']

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">Analytics</h2>
        <p className="text-sm text-zinc-500 mt-0.5">Detailed performance insights</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((k, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`bg-white rounded-xl border p-4 sm:p-5 ${
              k.highlight
                ? 'border-emerald-200 bg-emerald-50/30'
                : 'border-zinc-200'
            }`}
          >
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${k.iconBg} flex items-center justify-center mb-2 sm:mb-3`}>
              <k.icon size={16} className={`sm:hidden ${k.iconColor}`} />
              <k.icon size={18} className={`hidden sm:block ${k.iconColor}`} />
            </div>
            <p className="text-lg sm:text-2xl font-bold text-zinc-900 truncate">
              {k.value}
            </p>
            <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5">{k.title}</p>
            <p className="text-[10px] text-zinc-400">{k.subtitle}</p>
            {k.highlight && (
              <div className="flex items-center gap-1 mt-1.5">
                <TrendingUp size={10} className="text-emerald-500" />
                <span className="text-[10px] font-semibold text-emerald-600">Active</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Revenue + Brands */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-xl border border-zinc-200 p-4 sm:p-5"
        >
          <h3 className="text-sm sm:text-base font-semibold text-zinc-900 mb-1">Revenue Trend</h3>
          <p className="text-xs text-zinc-500 mb-4 sm:mb-6">Last 6 months (from orders & confirmed deals)</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenue}>
              <defs>
                <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} tickFormatter={v => v >= 1000 ? `${v / 1000}k` : v} />
              <Tooltip content={<SimpleTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#revGrad2)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-5"
        >
          <h3 className="text-sm sm:text-base font-semibold text-zinc-900 mb-1">Brand Breakdown</h3>
          <p className="text-xs text-zinc-500 mb-4">Inquiries by brand</p>
          {brands.length === 0 ? (
            <div className="flex items-center justify-center h-[180px] text-sm text-zinc-400">No data yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={brands} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="count" nameKey="name">
                    {brands.map((_, i) => <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {brands.map((b, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: BRAND_COLORS[i % BRAND_COLORS.length] }} />
                      <span className="text-xs text-zinc-600">{b.name}</span>
                    </div>
                    <span className="text-xs font-bold text-zinc-700">{b.value || 0}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Hourly + Funnel */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-5"
        >
          <h3 className="text-sm sm:text-base font-semibold text-zinc-900 mb-1">Peak Activity Hours</h3>
          <p className="text-xs text-zinc-500 mb-4 sm:mb-6">When buyers are most active</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hourly} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 10 }} interval={2} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} />
              <Tooltip content={<SimpleTooltip />} />
              <Bar dataKey="msgs" fill="#18181b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-5"
        >
          <h3 className="text-sm sm:text-base font-semibold text-zinc-900 mb-1">Conversion Funnel</h3>
          <p className="text-xs text-zinc-500 mb-4 sm:mb-6">From inquiry to completed sale</p>
          {funnel.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-sm text-zinc-400">No data yet</div>
          ) : (
            <>
              <div className="space-y-3">
                {funnel.map((step, i) => {
                  const maxVal = funnel[0]?.value || 1
                  const pct = maxVal > 0 ? (step.value / maxVal) * 100 : 0
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs sm:text-sm text-zinc-700 font-medium">{step.stage}</span>
                        <span className="text-xs sm:text-sm font-bold text-zinc-900">{step.value}</span>
                      </div>
                      <div className="w-full h-2.5 sm:h-3 bg-zinc-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.8 + i * 0.1, duration: 0.6 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: FUNNEL_COLORS[i % FUNNEL_COLORS.length] }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              {funnel.length >= 5 && funnel[0].value > 0 && (
                <div className="mt-5 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <p className="text-xs text-emerald-700 font-medium">
                    Overall conversion: {((funnel[4].value / funnel[0].value) * 100).toFixed(1)}%
                  </p>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}