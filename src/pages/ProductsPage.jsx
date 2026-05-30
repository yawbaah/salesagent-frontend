import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, X, Camera, Trash2, Edit, EyeOff,
  ShoppingBag, Tag, ChevronDown, Package, AlertCircle,
  CheckCircle, XCircle, Info, Loader2, Image as ImageIcon
} from 'lucide-react'
import API from '../api/axios'

const statusConfig = {
  available: { label: 'Available', style: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  sold: { label: 'Sold', style: 'bg-zinc-100 text-zinc-500', icon: XCircle },
  hidden: { label: 'Hidden', style: 'bg-amber-100 text-amber-700', icon: EyeOff },
}

const categoryEmojis = {
  Phones: '📱', Electronics: '🔌', Fashion: '👗', Shoes: '👟',
  'Beauty & Health': '🧴', 'Food & Groceries': '🍚', 'Home & Living': '🏠',
  'Cars & Auto': '🚗', Services: '🛠️', Other: '📦',
}

const defaultCategories = Object.keys(categoryEmojis)

const emptyForm = {
  name: '', category: 'Other', price: '', floor_price: '', description: '',
  details: [{ detail_key: '', detail_value: '' }],
}

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [counts, setCounts] = useState({ all: 0, available: 0, sold: 0, hidden: 0 })

  const [toast, setToast] = useState(null)

  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })
  const [editingId, setEditingId] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [statusMenu, setStatusMenu] = useState(null)
  const [detailView, setDetailView] = useState(null)
  const [statusChanging, setStatusChanging] = useState(null)

  const fileInputRef = useRef(null)
  const statusMenuRef = useRef(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Click outside to close status menu ──
  useEffect(() => {
    if (!statusMenu) return

    const handleClickOutside = (e) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target)) {
        setStatusMenu(null)
      }
    }

    // Small delay so the opening click doesn't immediately close it
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 10)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [statusMenu])

  // ── Fetch products ──
  const fetchProducts = useCallback(async () => {
    try {
      const params = { ordering: '-created_at' }
      if (search) params.search = search
      if (filter !== 'all') params.status = filter
      const { data } = await API.get('/products/', { params })
      const list = data.results || data || []
      setProducts(list)

      const { data: stats } = await API.get('/products/stats/')
      setCounts({
        all: stats.total_products || 0,
        available: stats.available || 0,
        sold: stats.sold || 0,
        hidden: stats.hidden || 0,
      })
    } catch (e) { console.error('Fetch products:', e) }
    finally { setLoading(false) }
  }, [search, filter])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  // ── Image handling ──
  const handleImageClick = () => fileInputRef.current?.click()

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setFormErrors(prev => ({ ...prev, image: 'Image must be under 5 MB' }))
      return
    }
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setFormErrors(prev => ({ ...prev, image: 'Use JPG, PNG, or WebP' }))
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setFormErrors(prev => { const n = { ...prev }; delete n.image; return n })
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Detail rows ──
  const addDetailRow = () => setForm(prev => ({ ...prev, details: [...prev.details, { detail_key: '', detail_value: '' }] }))
  const removeDetailRow = (i) => setForm(prev => ({ ...prev, details: prev.details.filter((_, j) => j !== i) }))
  const updateDetail = (i, field, val) => setForm(prev => {
    const d = [...prev.details]; d[i] = { ...d[i], [field]: val }; return { ...prev, details: d }
  })

  // ── Submit form ──
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.price) return
    setSaving(true); setFormErrors({})

    const cleanDetails = form.details.filter(d => d.detail_key.trim() && d.detail_value.trim())

    const payload = {
      name: form.name,
      category: form.category,
      description: form.description,
      price: Number(form.price),
      floor_price: Number(form.floor_price) || 0,
      details: cleanDetails.map((d, i) => ({ detail_key: d.detail_key, detail_value: d.detail_value, sort_order: i })),
    }

    try {
      let productId
      if (editingId) {
        const { data } = await API.patch(`/products/${editingId}/`, payload)
        productId = data.id
      } else {
        const { data } = await API.post('/products/', payload)
        productId = data.id
      }

      if (imageFile && productId) {
        const fd = new FormData()
        fd.append('image', imageFile)
        fd.append('is_primary', 'true')
        await API.post(`/products/${productId}/images/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }

      resetForm()
      await fetchProducts()
      showToast(editingId ? 'Product updated successfully' : 'Product added successfully')
    } catch (err) {
      const be = err.response?.data || {}
      const m = {}
      Object.keys(be).forEach(k => { m[k] = Array.isArray(be[k]) ? be[k][0] : typeof be[k] === 'object' ? JSON.stringify(be[k]) : be[k] })
      setFormErrors(m)
    } finally { setSaving(false) }
  }

  const resetForm = () => {
    setForm({ ...emptyForm }); setEditingId(null); setShowAdd(false)
    setImageFile(null); setImagePreview(''); setFormErrors({})
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Edit ──
  const startEdit = (p) => {
    const details = (p.details || []).map(d => ({ detail_key: d.detail_key, detail_value: d.detail_value }))
    setForm({
      name: p.name, category: p.category, price: p.price, floor_price: p.floor_price,
      description: p.description || '',
      details: details.length > 0 ? details : [{ detail_key: '', detail_value: '' }],
    })
    setEditingId(p.id)
    setImagePreview(p.image || p.effective_image || '')
    setImageFile(null)
    setShowAdd(true)
  }

  // ── Delete ──
  const confirmDelete = async (id) => {
    setDeleting(true)
    try {
      await API.delete(`/products/${id}/`)
      await fetchProducts()
      showToast('Product deleted')
    } catch (e) { console.error(e) }
    finally { setDeleting(false); setDeleteConfirm(null) }
  }

  // ── Status change ──
  const changeStatus = async (productId, newStatus) => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    const oldStatus = product.status
    if (oldStatus === newStatus) {
      setStatusMenu(null)
      return
    }

    // Close menu immediately
    setStatusMenu(null)
    setStatusChanging(productId)

    // Optimistic: remove from view if filtered, or update badge
    if (filter !== 'all' && filter !== newStatus) {
      setProducts(prev => prev.filter(p => p.id !== productId))
    } else {
      setProducts(prev => prev.map(p =>
        p.id === productId ? { ...p, status: newStatus } : p
      ))
    }

    // Optimistic count update
    setCounts(prev => ({
      ...prev,
      all: prev.all,
      [oldStatus]: Math.max(0, (prev[oldStatus] || 0) - 1),
      [newStatus]: (prev[newStatus] || 0) + 1,
    }))

    try {
      const response = await API.patch(`/products/${productId}/status/`, { status: newStatus })
      console.log('Status updated:', response.data)

      // Refetch to get accurate server data
      await fetchProducts()

      const statusLabel = statusConfig[newStatus]?.label || newStatus
      showToast(`Product marked as ${statusLabel}`)
    } catch (e) {
      console.error('Status change failed:', e)
      console.error('Response:', e.response?.data)
      showToast('Failed to update status', 'error')
      // Revert
      await fetchProducts()
    } finally {
      setStatusChanging(null)
    }
  }

  const getProductImage = (p) => p.image || p.effective_image || ''

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
    </div>
  )

  return (
    <div className="space-y-6">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-xl shadow-lg border flex items-center gap-2 text-sm font-medium ${
              toast.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            {toast.type === 'error' ? <XCircle size={16} /> : <CheckCircle size={16} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">Products</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            {counts.all} product{counts.all !== 1 ? 's' : ''} in your inventory
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAdd(true) }}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-md shadow-emerald-600/15"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name, category, or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {['all', 'available', 'sold', 'hidden'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors capitalize whitespace-nowrap ${
                filter === f
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              {f} ({counts[f]})
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl border border-zinc-200 p-8 sm:p-12 text-center"
        >
          <Package size={40} className="text-zinc-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-zinc-700">
            {filter !== 'all' ? `No ${filter} products` : 'No products found'}
          </h3>
          <p className="text-sm text-zinc-400 mt-1">
            {search
              ? 'Try a different search term'
              : filter !== 'all'
                ? `Products marked as "${filter}" will appear here`
                : 'Add your first product to get started'
            }
          </p>
          {!search && filter === 'all' && (
            <button
              onClick={() => { resetForm(); setShowAdd(true) }}
              className="mt-4 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              <Plus size={16} /> Add Product
            </button>
          )}
        </motion.div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {products.map((p, i) => {
          const imgUrl = getProductImage(p)
          const isChanging = statusChanging === p.id
          const isMenuOpen = statusMenu === p.id

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isChanging ? 0.5 : 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              layout
              className={`bg-white rounded-xl border border-zinc-200 overflow-hidden hover:shadow-md transition-all group ${
                isChanging ? 'pointer-events-none' : ''
              } ${isMenuOpen ? 'relative z-30' : 'relative'}`}
            >
              {/* Loading overlay */}
              {isChanging && (
                <div className="absolute inset-0 bg-white/60 z-20 flex items-center justify-center rounded-xl">
                  <Loader2 size={20} className="animate-spin text-emerald-600" />
                </div>
              )}

              {/* Image */}
              <div className="h-28 sm:h-40 bg-gradient-to-br from-zinc-100 to-zinc-50 flex items-center justify-center relative overflow-hidden">
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    onError={e => {
                      e.target.style.display = 'none'
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div className={`${imgUrl ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                  <span className="text-3xl sm:text-5xl">{categoryEmojis[p.category] || '📦'}</span>
                </div>

                {/* Status badge + dropdown */}
                <div
                  className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10"
                  ref={isMenuOpen ? statusMenuRef : null}
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setStatusMenu(isMenuOpen ? null : p.id)
                    }}
                    disabled={isChanging}
                    className={`text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg ${
                      statusConfig[p.status]?.style || 'bg-zinc-100 text-zinc-700'
                    } uppercase flex items-center gap-1 hover:opacity-80 transition-opacity`}
                  >
                    {p.status}<ChevronDown size={9} />
                  </button>

                  {/* Dropdown - renders when menu is open for THIS product */}
                  {isMenuOpen && (
                    <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-zinc-200 py-1 z-[60] min-w-[150px]">
                      {Object.entries(statusConfig).map(([key, config]) => {
                        const SIcon = config.icon
                        const isCurrent = p.status === key
                        return (
                          <button
                            key={key}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              console.log('Changing status to:', key, 'for product:', p.id)
                              changeStatus(p.id, key)
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium transition-colors ${
                              isCurrent
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'text-zinc-600 hover:bg-zinc-50'
                            }`}
                          >
                            <SIcon size={14} />
                            <span className="flex-1 text-left">{config.label}</span>
                            {isCurrent && (
                              <CheckCircle size={13} className="text-emerald-500" />
                            )}
                          </button>
                        )
                      })}
                      <div className="border-t border-zinc-100 mt-1 pt-1.5 px-3 pb-1.5">
                        <p className="text-[10px] text-zinc-400 leading-tight">
                          {p.status === 'available'
                            ? '🟢 Agent is selling this'
                            : p.status === 'sold'
                              ? '⛔ Agent won\'t sell this'
                              : '👁️ Hidden from agent'
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={() => setDetailView(p)}
                    className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-zinc-500 hover:text-emerald-600 transition-colors"
                    title="View"
                  >
                    <Info size={14} />
                  </button>
                  <button
                    onClick={() => startEdit(p)}
                    className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-zinc-500 hover:text-emerald-600 transition-colors"
                    title="Edit"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(p.id)}
                    className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-zinc-500 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
                  <span className="text-[9px] sm:text-[10px] font-medium text-zinc-500 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-md">
                    {p.category}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-3 sm:p-4">
                <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 truncate">{p.name}</h3>
                {p.description && (
                  <p className="text-[10px] sm:text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                )}
                {p.details?.length > 0 && (
                  <div className="hidden sm:flex flex-wrap gap-1 mt-2">
                    {p.details.slice(0, 3).map((d, j) => (
                      <span key={j} className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-md">
                        {d.detail_key}: {d.detail_value}
                      </span>
                    ))}
                    {p.details.length > 3 && (
                      <span className="text-[10px] bg-zinc-100 text-zinc-400 px-2 py-0.5 rounded-md">
                        +{p.details.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-zinc-100">
                  <div>
                    <p className="text-sm sm:text-lg font-bold text-zinc-900">
                      GHS {Number(p.price).toLocaleString()}
                    </p>
                    {p.floor_price > 0 && (
                      <p className="text-[9px] sm:text-[10px] text-zinc-400">
                        Floor: GHS {Number(p.floor_price).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] sm:text-xs font-semibold text-emerald-600">
                      {p.inquiry_count || 0}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-zinc-400">inquiries</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => !deleting && setDeleteConfirm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-[30%] mx-auto max-w-sm bg-white rounded-2xl shadow-2xl z-50 p-6 text-center"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={22} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">Delete Product?</h3>
              <p className="text-sm text-zinc-500 mt-2">
                This will hide the product. Your agent will no longer sell it.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDelete(deleteConfirm)}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold flex items-center justify-center gap-2"
                >
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : null}
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DETAIL VIEW MODAL */}
      <AnimatePresence>
        {detailView && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setDetailView(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-[8%] mx-auto max-w-lg bg-white rounded-2xl shadow-2xl z-50 max-h-[84vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-zinc-100">
                <h3 className="text-lg font-bold text-zinc-900">Product Details</h3>
                <button onClick={() => setDetailView(null)} className="text-zinc-400 hover:text-zinc-600">
                  <X size={20} />
                </button>
              </div>
              <div className="p-5 space-y-5">
                {getProductImage(detailView) ? (
                  <div className="w-full h-48 rounded-xl overflow-hidden bg-zinc-100">
                    <img src={getProductImage(detailView)} alt={detailView.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-full h-32 rounded-xl bg-zinc-100 flex items-center justify-center">
                    <span className="text-5xl">{categoryEmojis[detailView.category] || '📦'}</span>
                  </div>
                )}

                <div>
                  <h4 className="text-lg font-bold text-zinc-900">{detailView.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-md">{detailView.category}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${statusConfig[detailView.status]?.style} uppercase`}>
                      {detailView.status}
                    </span>
                  </div>
                </div>

                <div className={`rounded-lg p-3 border ${
                  detailView.status === 'available'
                    ? 'bg-emerald-50 border-emerald-100'
                    : 'bg-amber-50 border-amber-100'
                }`}>
                  <p className={`text-xs font-medium ${
                    detailView.status === 'available' ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    {detailView.status === 'available'
                      ? '🟢 Your AI agent is actively selling this product'
                      : detailView.status === 'sold'
                        ? '⛔ Marked as sold — agent will NOT sell this product'
                        : '👁️ Hidden — agent will NOT show this product'
                    }
                  </p>
                </div>

                {detailView.description && (
                  <div>
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Description</p>
                    <p className="text-sm text-zinc-700 leading-relaxed bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                      {detailView.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                    <p className="text-xs text-zinc-500">Asking Price</p>
                    <p className="text-xl font-bold text-zinc-900 mt-0.5">
                      GHS {Number(detailView.price).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                    <p className="text-xs text-zinc-500">Floor Price</p>
                    <p className="text-xl font-bold text-zinc-900 mt-0.5">
                      GHS {Number(detailView.floor_price || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {detailView.details?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Product Details</p>
                    <div className="space-y-1.5">
                      {detailView.details.map((d, i) => (
                        <div key={i} className="flex items-center justify-between bg-zinc-50 rounded-lg px-3 py-2 border border-zinc-100">
                          <span className="text-sm text-zinc-500">{d.detail_key}</span>
                          <span className="text-sm font-medium text-zinc-900">{d.detail_value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                  <p className="text-xs text-emerald-600 font-medium">
                    This product has received {detailView.inquiry_count || 0} inquiries • {detailView.sale_count || 0} sales
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setDetailView(null); startEdit(detailView) }}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <Edit size={15} /> Edit
                  </button>
                  <button
                    onClick={() => { setDetailView(null); setDeleteConfirm(detailView.id) }}
                    className="py-2.5 px-4 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ADD / EDIT MODAL */}
      <AnimatePresence>
        {showAdd && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => !saving && resetForm()}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-[5%] mx-auto max-w-lg bg-white rounded-2xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-zinc-100 sticky top-0 bg-white rounded-t-2xl z-10">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">
                    {editingId ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Fill in details so your agent can sell this product
                  </p>
                </div>
                <button onClick={() => !saving && resetForm()} className="text-zinc-400 hover:text-zinc-600">
                  <X size={20} />
                </button>
              </div>

              <form className="p-5 space-y-5" onSubmit={handleSubmit}>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp,image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                {imagePreview ? (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden bg-zinc-100">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={removeImage} className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-lg shadow flex items-center justify-center text-red-500 hover:text-red-700">
                      <X size={16} />
                    </button>
                    <button type="button" onClick={handleImageClick} className="absolute bottom-2 right-2 px-3 py-1.5 bg-white/90 rounded-lg shadow text-xs font-medium text-zinc-700 hover:bg-white flex items-center gap-1">
                      <Camera size={12} /> Change
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={handleImageClick} className="w-full h-32 border-2 border-dashed border-zinc-200 rounded-xl flex flex-col items-center justify-center text-zinc-400 hover:border-emerald-400 hover:text-emerald-500 cursor-pointer transition-colors">
                    <Camera size={28} />
                    <span className="text-xs mt-1.5 font-medium">Tap to upload photo</span>
                    <span className="text-[10px] mt-0.5">JPG, PNG, or WebP · Max 5 MB</span>
                  </button>
                )}
                {formErrors.image && <p className="text-xs text-red-500 -mt-3">{formErrors.image}</p>}

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Product Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. iPhone 14 Pro Max, Nike Air Max 90..."
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${formErrors.name ? 'border-red-400' : 'border-zinc-200'} text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20`}
                  />
                  {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none focus:border-emerald-500 bg-white"
                  >
                    {defaultCategories.map(cat => (
                      <option key={cat} value={cat}>{categoryEmojis[cat]} {cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
                  <p className="text-[11px] text-zinc-400 mb-1.5">How your AI agent will describe this product to buyers</p>
                  <textarea
                    rows={3}
                    placeholder="e.g. Brand new, 128GB, Space Black, 88% battery health..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      Asking Price (GHS) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 4200"
                      value={form.price}
                      onChange={e => setForm({ ...form, price: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${formErrors.price ? 'border-red-400' : 'border-zinc-200'} text-sm outline-none focus:border-emerald-500`}
                    />
                    {formErrors.price && <p className="text-xs text-red-500 mt-1">{formErrors.price}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Floor Price (GHS)</label>
                    <input
                      type="number"
                      placeholder="Minimum you'll accept"
                      value={form.floor_price}
                      onChange={e => setForm({ ...form, floor_price: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${formErrors.floor_price ? 'border-red-400' : 'border-zinc-200'} text-sm outline-none focus:border-emerald-500`}
                    />
                    {formErrors.floor_price && <p className="text-xs text-red-500 mt-1">{formErrors.floor_price}</p>}
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  <p className="text-[11px] text-amber-700">
                    <AlertCircle size={12} className="inline mr-1 -mt-0.5" />
                    The agent will never sell below your floor price.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700">Product Details</label>
                      <p className="text-[11px] text-zinc-400">Size, color, condition, brand, etc.</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {form.details.map((d, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Color, Size..."
                          value={d.detail_key}
                          onChange={e => updateDetail(i, 'detail_key', e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 text-sm outline-none focus:border-emerald-500"
                        />
                        <input
                          type="text"
                          placeholder="e.g. Black, 43..."
                          value={d.detail_value}
                          onChange={e => updateDetail(i, 'detail_value', e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 text-sm outline-none focus:border-emerald-500"
                        />
                        {form.details.length > 1 && (
                          <button type="button" onClick={() => removeDetailRow(i)} className="p-2 text-zinc-400 hover:text-red-500 shrink-0">
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={addDetailRow} className="mt-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                    <Plus size={14} /> Add another detail
                  </button>
                </div>

                {formErrors.non_field_errors && <p className="text-xs text-red-500">{formErrors.non_field_errors}</p>}
                {formErrors.detail && <p className="text-xs text-red-500">{formErrors.detail}</p>}

                <div className="pt-2 border-t border-zinc-100">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {saving
                      ? <><Loader2 size={17} className="animate-spin" /> Saving...</>
                      : <><ShoppingBag size={17} />{editingId ? 'Save Changes' : 'Add Product'}</>
                    }
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}