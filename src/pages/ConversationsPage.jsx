import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, Bot, User, Phone, Hand, MoreVertical, Send, ArrowLeft, Loader2, RefreshCw } from 'lucide-react'
import API from '../api/axios'

const statusColors = {
  hot: 'bg-red-100 text-red-700',
  negotiating: 'bg-amber-100 text-amber-700',
  new: 'bg-zinc-100 text-zinc-700',
  interested: 'bg-zinc-100 text-zinc-600',
  confirmed: 'bg-emerald-100 text-emerald-700',
  resolved: 'bg-blue-100 text-blue-700',
  lost: 'bg-zinc-100 text-zinc-400',
}

function timeAgo(d) {
  if (!d) return ''
  const s = Math.floor((Date.now() - new Date(d)) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function formatTime(d) {
  if (!d) return ''
  return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState([])
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [sendText, setSendText] = useState('')
  const [sending, setSending] = useState(false)
  const [showMobile, setShowMobile] = useState(false)
  const messagesEndRef = useRef(null)

  // Fetch conversation list
  const fetchList = useCallback(async () => {
    try {
      const { data } = await API.get('/conversations/', {
        params: { ordering: '-last_message_at', search: search || undefined },
      })
      setConversations(data.results || data || [])
    } catch (e) { console.error('Fetch conversations:', e) }
    finally { setLoading(false) }
  }, [search])

  useEffect(() => { fetchList() }, [fetchList])

  // Poll for new messages every 15s
  useEffect(() => {
    const interval = setInterval(fetchList, 15000)
    return () => clearInterval(interval)
  }, [fetchList])

  // Fetch detail when selecting
  const selectConversation = useCallback(async (conv) => {
    setSelected(conv)
    setShowMobile(true)
    setDetailLoading(true)
    try {
      const { data } = await API.get(`/conversations/${conv.id}/`)
      setDetail(data)
    } catch (e) { console.error('Fetch detail:', e) }
    finally { setDetailLoading(false) }
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [detail?.messages])

  // Refresh current conversation
  const refreshDetail = useCallback(async () => {
    if (!selected) return
    try {
      const { data } = await API.get(`/conversations/${selected.id}/`)
      setDetail(data)
    } catch (e) { console.error(e) }
  }, [selected])

  // Takeover / Handback
  const handleTakeover = async () => {
    if (!selected) return
    try {
      await API.post(`/conversations/${selected.id}/takeover/`)
      await refreshDetail()
      fetchList()
    } catch (e) { console.error(e) }
  }

  const handleHandback = async () => {
    if (!selected) return
    try {
      await API.post(`/conversations/${selected.id}/handback/`)
      await refreshDetail()
      fetchList()
    } catch (e) { console.error(e) }
  }

  // Send message
  const handleSend = async (e) => {
    e.preventDefault()
    if (!sendText.trim() || !selected || sending) return
    setSending(true)
    try {
      const { data: msg } = await API.post(`/conversations/${selected.id}/send/`, {
        text_content: sendText.trim(),
      })
      // Append message locally
      setDetail(prev => prev ? { ...prev, messages: [...(prev.messages || []), msg] } : prev)
      setSendText('')
      fetchList()
    } catch (e) { console.error('Send failed:', e) }
    finally { setSending(false) }
  }

  const messages = detail?.messages || []
  const isAgentHandling = detail?.is_agent_handling ?? true

  return (
    <div className="flex gap-4" style={{ height: 'calc(100vh - 8rem)' }}>
      {/* ── Left Panel: Conversation List ── */}
      <div className={`${showMobile ? 'hidden sm:flex' : 'flex'} w-full sm:w-80 lg:w-96 bg-white rounded-xl border border-zinc-200 flex-col shrink-0`}>
        <div className="p-4 border-b border-zinc-100">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input type="text" placeholder="Search conversations..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-200 text-sm outline-none focus:border-emerald-500" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /></div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-3"><Bot size={20} className="text-zinc-400" /></div>
              <p className="text-sm text-zinc-500">No conversations yet</p>
              <p className="text-xs text-zinc-400 mt-1">They'll appear when customers message you</p>
            </div>
          ) : (
            conversations.map(c => (
              <div key={c.id} onClick={() => selectConversation(c)} className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer border-l-2 transition-all ${selected?.id === c.id ? 'bg-emerald-50 border-l-emerald-600' : 'border-l-transparent hover:bg-zinc-50'}`}>
                <div className="w-10 h-10 bg-zinc-200 rounded-full flex items-center justify-center text-sm font-bold text-zinc-600 shrink-0">{c.buyer?.initials || '??'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-zinc-900 truncate">{c.buyer?.display_name || c.buyer?.phone}</p>
                    <span className="text-[10px] text-zinc-400 shrink-0">{timeAgo(c.last_message_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${statusColors[c.status] || 'bg-zinc-100 text-zinc-700'} uppercase`}>{c.status}</span>
                    <span className="text-xs text-zinc-400 truncate">{c.product_name || c.last_message_text?.slice(0, 30)}</span>
                  </div>
                </div>
                {c.unread_count > 0 && <span className="w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0">{c.unread_count}</span>}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Right Panel: Messages ── */}
      <div className={`${!showMobile ? 'hidden sm:flex' : 'flex'} flex-1 bg-white rounded-xl border border-zinc-200 flex-col`}>
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-center px-6">
            <div><Bot size={40} className="text-zinc-300 mx-auto mb-3" /><p className="text-sm text-zinc-400">Select a conversation to view messages</p></div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <button className="sm:hidden p-1 text-zinc-400" onClick={() => setShowMobile(false)}><ArrowLeft size={18} /></button>
                <div className="w-10 h-10 bg-zinc-200 rounded-full flex items-center justify-center text-sm font-bold text-zinc-600">{detail?.buyer?.initials || selected.buyer?.initials || '??'}</div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{detail?.buyer?.display_name || selected.buyer?.display_name}</p>
                  <p className="text-xs text-zinc-500">{detail?.product_name || selected.product_name || ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={refreshDetail} className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Refresh"><RefreshCw size={16} /></button>
                {isAgentHandling ? (
                  <button onClick={handleTakeover} className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Take Over"><Hand size={18} /></button>
                ) : (
                  <button onClick={handleHandback} className="px-3 py-1.5 text-xs font-semibold text-emerald-600 border border-emerald-200 hover:bg-emerald-50 rounded-lg transition-colors">Hand Back to AI</button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50">
              {detailLoading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /></div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12"><p className="text-sm text-zinc-400">No messages yet</p></div>
              ) : (
                messages.map((msg, i) => (
                  <motion.div key={msg.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }} className={`flex ${msg.sender === 'buyer' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${msg.sender === 'buyer' ? 'bg-white text-zinc-800 border border-zinc-200 rounded-bl-md shadow-sm' : msg.sender === 'seller' ? 'bg-blue-600 text-white rounded-br-md' : 'bg-zinc-900 text-white rounded-br-md'}`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        {msg.sender === 'buyer' ? <User size={12} /> : msg.sender === 'seller' ? <User size={12} /> : <Bot size={12} />}
                        <span className={`text-[10px] font-medium ${msg.sender === 'buyer' ? 'text-zinc-400' : msg.sender === 'seller' ? 'text-blue-200' : 'text-zinc-400'}`}>
                          {msg.sender === 'buyer' ? (detail?.buyer?.display_name || 'Buyer') : msg.sender === 'seller' ? 'You' : 'AI Agent'}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text_content}</p>
                      <p className={`text-[10px] mt-1.5 text-right ${msg.sender === 'buyer' ? 'text-zinc-400' : 'text-zinc-500'}`}>{formatTime(msg.created_at)}</p>
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Bar */}
            {isAgentHandling ? (
              <div className="p-3 border-t border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative rounded-full h-2 w-2 bg-emerald-500" /></span>
                  <span className="text-xs text-zinc-500">AI Agent is handling this conversation</span>
                </div>
                <button onClick={handleTakeover} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"><Hand size={13} /> Take Over</button>
              </div>
            ) : (
              <form onSubmit={handleSend} className="p-3 border-t border-zinc-100 flex items-center gap-2">
                <div className="flex items-center gap-2 mr-2">
                  <span className="relative flex h-2 w-2"><span className="relative rounded-full h-2 w-2 bg-blue-500" /></span>
                  <span className="text-[10px] text-zinc-400">You</span>
                </div>
                <input type="text" value={sendText} onChange={e => setSendText(e.target.value)} placeholder="Type a message..." className="flex-1 px-4 py-2 rounded-lg border border-zinc-200 text-sm outline-none focus:border-emerald-500" disabled={sending} />
                <button type="submit" disabled={!sendText.trim() || sending} className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-200 text-white disabled:text-zinc-400 rounded-lg transition-colors">
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}