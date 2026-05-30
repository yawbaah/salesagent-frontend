import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, Phone, MessageSquare, Flame, Loader2, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import API from '../api/axios'

const stageBadge = {
  new: 'bg-zinc-100 text-zinc-700',
  interested: 'bg-zinc-100 text-zinc-600',
  negotiating: 'bg-amber-100 text-amber-700',
  hot: 'bg-red-100 text-red-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  won: 'bg-emerald-100 text-emerald-700',
  lost: 'bg-zinc-100 text-zinc-400',
}

const stageColors = {
  New: 'bg-zinc-900', Interested: 'bg-zinc-600',
  Negotiating: 'bg-amber-500', Hot: 'bg-red-500',
  'Hot Lead': 'bg-red-500', Confirmed: 'bg-emerald-500',
}

function timeAgo(d) {
  if (!d) return ''
  const s = Math.floor((Date.now() - new Date(d)) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default function LeadsPage() {
  const [pipeline, setPipeline] = useState([])
  const [leads, setLeads] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [plRes, ldRes] = await Promise.all([
        API.get('/leads/pipeline/'),
        API.get('/leads/', { params: { ordering: '-score,-updated_at', search: search || undefined } }),
      ])
      setPipeline(plRes.data?.results || plRes.data || [])
      setLeads(ldRes.data?.results || ldRes.data || [])
    } catch (e) { console.error('Fetch leads:', e) }
    finally { setLoading(false) }
  }, [search])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Leads & Pipeline</h2>
          <p className="text-sm text-zinc-500 mt-0.5">Track every buyer from inquiry to sale</p>
        </div>
        <button onClick={fetchData} className="p-2 text-zinc-400 hover:text-emerald-600 rounded-lg transition-colors"><RefreshCw size={18} /></button>
      </div>

      {/* Pipeline stages */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {(pipeline.length > 0 ? pipeline : [
          { stage: 'New', count: 0 }, { stage: 'Interested', count: 0 },
          { stage: 'Negotiating', count: 0 }, { stage: 'Hot', count: 0 },
          { stage: 'Confirmed', count: 0 },
        ]).map((s, i) => (
          <motion.div key={s.stage || s.label || i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="bg-white rounded-xl border border-zinc-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2.5 h-2.5 rounded-full ${stageColors[s.stage || s.label] || 'bg-zinc-400'}`} />
              <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">{s.stage || s.label}</span>
            </div>
            <p className="text-2xl font-bold text-zinc-900">{s.count || 0}</p>
          </motion.div>
        ))}
      </div>

      {/* Leads table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-zinc-100">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input type="text" placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-200 text-sm outline-none focus:border-emerald-500" />
          </div>
        </div>

        {leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Flame size={32} className="text-zinc-300 mb-3" />
            <p className="text-sm text-zinc-500">No leads yet</p>
            <p className="text-xs text-zinc-400 mt-1">Leads are created automatically from conversations</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-4 py-3">Buyer</th>
                  <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Product</th>
                  <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Price</th>
                  <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-4 py-3">Stage</th>
                  <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Score</th>
                  <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Updated</th>
                  <th className="text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {leads.map((lead, i) => (
                  <motion.tr key={lead.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-zinc-200 rounded-full flex items-center justify-center text-xs font-bold text-zinc-600">{lead.buyer_initials || '??'}</div>
                        <div>
                          <p className="text-sm font-medium text-zinc-900">{lead.buyer_name || 'Unknown'}</p>
                          <p className="text-xs text-zinc-400">{lead.buyer_phone || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell"><p className="text-sm text-zinc-700">{lead.product_name || '—'}</p></td>
                    <td className="px-4 py-3.5 hidden md:table-cell"><p className="text-sm font-medium text-zinc-900">{lead.expected_price ? `GHS ${Number(lead.expected_price).toLocaleString()}` : '—'}</p></td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${stageBadge[lead.stage] || 'bg-zinc-100 text-zinc-700'} uppercase`}>
                        {lead.stage === 'hot' && <Flame size={10} className="inline mr-0.5 -mt-0.5" />}{lead.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${(lead.score || 0) >= 80 ? 'bg-emerald-500' : (lead.score || 0) >= 50 ? 'bg-amber-500' : 'bg-zinc-300'}`} style={{ width: `${lead.score || 0}%` }} />
                        </div>
                        <span className="text-xs text-zinc-500">{lead.score || 0}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell"><span className="text-xs text-zinc-400">{timeAgo(lead.updated_at)}</span></td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link to="/dashboard/conversations" className="p-1.5 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><MessageSquare size={15} /></Link>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}