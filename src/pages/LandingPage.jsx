import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, MessageSquare, Mic, Image, TrendingUp, Shield,
  Zap, Phone, Bell, Menu, X, ArrowRight, Check,
  Globe, Package, ChevronLeft, Video, MoreVertical,
  Search, Camera, Smile, Send, CheckCheck, Clock
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
  }),
}

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
}

/* ─────────────────── CHAT SCENARIOS ─────────────────── */
const chatScenarios = [
  {
    id: 'instant',
    title: 'Instant Responses',
    description: 'Responds in under 2 seconds, 24/7. Handles multiple buyers at once.',
    icon: MessageSquare,
    contact: 'Kwame Asante',
    online: true,
    messages: [
      {
        from: 'buyer',
        text: 'Hello! How much is the iPhone 14 Pro Max?',
        time: '10:30 AM',
      },
      {
        from: 'agent',
        text: 'Hi Kwame! 👋 The iPhone 14 Pro Max is available at GHS 4,200.\n\n📱 UK Used\n💾 128GB\n🔋 88% battery health\n\nWould you like photos or more details?',
        time: '10:30 AM',
      },
      {
        from: 'buyer',
        text: 'Wow that was fast! Yes send photos please',
        time: '10:31 AM',
      },
      {
        from: 'agent',
        text: 'Here you go! 📸 Phone is in excellent condition — no scratches on the screen, minor signs of use on the back. Battery health is very strong at 88%. \n\nWant to come see it in person?',
        time: '10:31 AM',
      },
    ],
  },
  {
    id: 'image',
    title: 'Image Recognition',
    description: 'Buyer sends a blurry photo — agent identifies the exact phone model.',
    icon: Image,
    contact: 'Ama Serwaa',
    online: true,
    messages: [
      {
        from: 'buyer',
        text: '📷 [Photo attached]\n\nI want something like this phone my friend has. Do you have it?',
        time: '2:15 PM',
        hasImage: true,
      },
      {
        from: 'agent',
        text: "I've identified this as a Samsung Galaxy S24 Ultra! ✨\n\nGreat news — we have one in stock:\n\n📱 Brand New\n💾 256GB\n💰 GHS 4,500\n\nWant me to reserve it for you?",
        time: '2:15 PM',
      },
      {
        from: 'buyer',
        text: 'Wow you recognized it! Yes I want it',
        time: '2:16 PM',
      },
    ],
  },
  {
    id: 'negotiate',
    title: 'Smart Negotiation',
    description: 'Set your price floor. Agent negotiates without ever going below it.',
    icon: TrendingUp,
    contact: 'Yaw Boateng',
    online: true,
    messages: [
      {
        from: 'buyer',
        text: 'I like the iPhone 14 Pro Max. Can you do GHS 3,000?',
        time: '4:20 PM',
      },
      {
        from: 'agent',
        text: "I understand you want a good deal! 😊 The best I can offer is GHS 3,900 — this phone is in excellent condition with a strong battery. It's getting a lot of interest today 🔥",
        time: '4:20 PM',
      },
      {
        from: 'buyer',
        text: 'GHS 3,500. Final price.',
        time: '4:22 PM',
      },
      {
        from: 'agent',
        text: 'For a same-day pickup, I can lock it at GHS 3,800. That\'s the best deal you\'ll find for this condition! ✅\n\nShall I confirm the order for you?',
        time: '4:22 PM',
      },
      {
        from: 'buyer',
        text: "Deal! I'll come pick it up",
        time: '4:23 PM',
      },
    ],
  },
  {
    id: 'voice',
    title: 'Voice Cloning',
    description: 'Record 2 minutes of your voice. Agent calls buyers sounding like you.',
    icon: Mic,
    contact: 'Efua Owusu',
    online: false,
    messages: [
      {
        from: 'buyer',
        text: "I'm really interested in the iPhone 15 Pro. Can someone call me to discuss?",
        time: '7:45 PM',
      },
      {
        from: 'agent',
        text: "Of course, Efua! I'd be happy to call you. Give me one moment... 📞",
        time: '7:45 PM',
      },
      {
        from: 'system',
        text: '📞 AI Voice Call Started\nUsing seller\'s cloned voice\nDuration: 2:34',
        time: '7:46 PM',
      },
      {
        from: 'agent',
        text: "Great call! ✅ I've confirmed your interest in the iPhone 15 Pro at GHS 5,500. The seller will follow up with payment details shortly.",
        time: '7:49 PM',
      },
    ],
  },
  {
    id: 'followup',
    title: 'Proactive Follow-ups',
    description: 'Agent follows up with silent buyers and broadcasts price drops.',
    icon: Bell,
    contact: 'Kofi Adjei',
    online: false,
    messages: [
      {
        from: 'agent',
        text: 'Hi Kofi! 👋 Remember the Samsung A54 you asked about last week?\n\n🎉 Great news — the price just dropped!\n\nOld price: GHS 1,800\nNew price: GHS 1,500\n\nWant me to reserve it before someone else grabs it?',
        time: '9:00 AM',
      },
      {
        from: 'buyer',
        text: 'Oh nice! Yes please reserve it for me',
        time: '9:15 AM',
      },
      {
        from: 'agent',
        text: "Done! ✅ Reserved the Samsung A54 at GHS 1,500 for you. The seller will contact you today to arrange pickup.\n\nThanks for your patience, Kofi! 🙏",
        time: '9:15 AM',
      },
    ],
  },
]

/* ─────────────────── NAVBAR ─────────────────── */
function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-black/90 backdrop-blur-xl border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">
            SalesAgent<span className="text-emerald-400">AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">
            Pricing
          </a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm text-slate-300 hover:text-white px-4 py-2 transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-lg transition-colors"
          >
            Get Started Free
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-white">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/5 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              <a href="#features" onClick={() => setOpen(false)} className="block text-sm text-slate-300 py-2">
                Features
              </a>
              <a href="#how-it-works" onClick={() => setOpen(false)} className="block text-sm text-slate-300 py-2">
                How It Works
              </a>
              <a href="#pricing" onClick={() => setOpen(false)} className="block text-sm text-slate-300 py-2">
                Pricing
              </a>
              <div className="pt-3 border-t border-white/10 space-y-2">
                <Link to="/login" className="block text-center text-sm text-slate-300 py-2.5 rounded-lg border border-slate-700">
                  Log In
                </Link>
                <Link to="/signup" className="block text-center text-sm font-medium text-white bg-emerald-600 py-2.5 rounded-lg">
                  Get Started Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

/* ─────────────────── HERO ─────────────────── */
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1720069004713-f72d26684a87?w=1920&auto=format&fit=crop&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          WebkitBackgroundSize: 'cover',
        }}
      />

      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.60) 40%, rgba(0,0,0,0.92) 100%)',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 sm:w-[500px] h-72 sm:h-[500px] bg-emerald-500/5 rounded-full blur-[150px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 relative z-10 w-full">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6"
            >
              <Zap size={14} className="text-emerald-400" />
              <span className="text-xs font-medium text-emerald-300">
                AI-Powered WhatsApp Sales Agent
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight"
            >
              The AI Agent That{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, #34d399, #10b981)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Never Sleeps
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-6 text-base sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto"
            >
              Your WhatsApp. Your voice. Your sales — 24/7. SalesAgent AI responds to buyers
              instantly, negotiates prices, and closes deals while you sleep.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="mt-8 flex flex-wrap gap-3 justify-center"
            >
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-600/20"
              >
                Start Free Trial <ArrowRight size={18} />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-8 py-4 rounded-xl border border-white/20 transition-colors backdrop-blur-sm"
              >
                See It In Action
              </a>
            </motion.div>

            <motion.p variants={fadeUp} custom={4} className="mt-5 text-sm text-slate-400">
              No credit card required · 14-day free trial · Cancel anytime
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={5}
              className="mt-12 flex flex-wrap gap-8 justify-center"
            >
              {[
                { value: '500+', label: 'Active Sellers' },
                { value: '50K+', label: 'Conversations' },
                { value: '24/7', label: 'Always Online' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────── WHATSAPP PHONE MOCKUP ─────────────────── */
function WhatsAppPhone({ scenario }) {
  const [visibleMessages, setVisibleMessages] = useState([])
  const [showTyping, setShowTyping] = useState(false)

  useEffect(() => {
    setVisibleMessages([])
    setShowTyping(false)

    let cancelled = false
    const msgs = scenario.messages

    const showMessages = async () => {
      for (let i = 0; i < msgs.length; i++) {
        if (cancelled) return

        if (msgs[i].from === 'agent' || msgs[i].from === 'system') {
          setShowTyping(true)
          await new Promise((r) => setTimeout(r, 800))
          if (cancelled) return
          setShowTyping(false)
        }

        setVisibleMessages((prev) => [...prev, msgs[i]])
        await new Promise((r) => setTimeout(r, 400))
      }
    }

    const timer = setTimeout(showMessages, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [scenario])

  return (
    <div className="relative mx-auto" style={{ maxWidth: '320px' }}>
      {/* Phone frame */}
      <div className="bg-zinc-900 rounded-[2.5rem] p-2.5 shadow-2xl shadow-black/60 border border-zinc-700/50">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-zinc-900 rounded-b-2xl z-20" />

        <div className="rounded-[2rem] overflow-hidden bg-white">
          {/* Status bar */}
          <div className="h-7 bg-[#075E54] flex items-center justify-between px-5">
            <span className="text-[10px] text-white/80 font-medium">9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-3.5 h-2 border border-white/60 rounded-sm relative">
                <div className="absolute inset-0.5 bg-white/60 rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* WhatsApp header */}
          <div className="bg-[#075E54] px-2 pb-2.5 flex items-center gap-2">
            <ChevronLeft size={20} className="text-white shrink-0" />
            <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-slate-600">
                {scenario.contact
                  .split(' ')
                  .map((w) => w[0])
                  .join('')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[13px] font-medium truncate">{scenario.contact}</p>
              <p className="text-white/60 text-[10px]">
                {scenario.online ? 'online' : 'last seen today at 3:00 PM'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Video size={16} className="text-white/80" />
              <Phone size={14} className="text-white/80" />
              <MoreVertical size={16} className="text-white/80" />
            </div>
          </div>

          {/* Chat area */}
          <div
            className="p-2.5 space-y-1.5 overflow-y-auto"
            style={{
              minHeight: '360px',
              maxHeight: '360px',
              backgroundColor: '#ECE5DD',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8c4bc' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          >
            {/* Today label */}
            <div className="flex justify-center mb-2">
              <span className="bg-white/80 text-[10px] text-[#54656f] px-3 py-1 rounded-lg shadow-sm">
                TODAY
              </span>
            </div>

            <AnimatePresence mode="wait">
              {visibleMessages.map((msg, i) => (
                <motion.div
                  key={`${scenario.id}-${i}`}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${
                    msg.from === 'buyer' ? 'justify-start' : 'justify-end'
                  }`}
                >
                  {msg.from === 'system' ? (
                    <div className="mx-auto bg-[#d1f4cc] rounded-lg px-3 py-2 max-w-[85%] shadow-sm">
                      <p className="text-[11px] text-[#303030] whitespace-pre-line leading-relaxed">
                        {msg.text}
                      </p>
                      <p className="text-[9px] text-[#667781] text-right mt-1">{msg.time}</p>
                    </div>
                  ) : (
                    <div
                      className={`relative max-w-[80%] px-2.5 py-1.5 shadow-sm ${
                        msg.from === 'buyer'
                          ? 'bg-white rounded-lg rounded-tl-none'
                          : 'bg-[#d9fdd3] rounded-lg rounded-tr-none'
                      }`}
                    >
                      {msg.hasImage && (
                        <div className="w-full h-28 bg-slate-200 rounded-md mb-1.5 flex items-center justify-center">
                          <Camera size={24} className="text-slate-400" />
                        </div>
                      )}
                      <p className="text-[12px] text-[#303030] whitespace-pre-line leading-[1.4]">
                        {msg.text}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5 justify-end">
                        <span className="text-[9px] text-[#667781]">{msg.time}</span>
                        {msg.from === 'agent' && (
                          <CheckCheck size={12} className="text-[#53bdeb]" />
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            <AnimatePresence>
              {showTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="flex justify-end"
                >
                  <div className="bg-[#d9fdd3] rounded-lg rounded-tr-none px-3 py-2.5 shadow-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-[#667781] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-[#667781] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-[#667781] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input bar */}
          <div className="bg-[#f0f2f5] px-2 py-1.5 flex items-center gap-1.5">
            <Smile size={20} className="text-[#54656f] shrink-0" />
            <div className="flex-1 bg-white rounded-full px-3 py-1.5 flex items-center">
              <span className="text-[11px] text-[#667781]">Type a message</span>
            </div>
            <Camera size={20} className="text-[#54656f] shrink-0" />
            <div className="w-8 h-8 bg-[#00a884] rounded-full flex items-center justify-center shrink-0">
              <Mic size={16} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────── FEATURES SECTION ─────────────────── */
function FeaturesDemo() {
  const [active, setActive] = useState(0)

  return (
    <section id="features" className="py-20 lg:py-28 bg-black relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/[0.02] rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <motion.p
            variants={fadeUp}
            className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3"
          >
            See It In Action
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-3xl sm:text-4xl font-extrabold text-white"
          >
            Your AI Agent At Work
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-slate-400">
            Watch how SalesAgent AI handles real buyer conversations on WhatsApp.
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Feature tabs */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-2"
          >
            {chatScenarios.map((scenario, i) => {
              const Icon = scenario.icon
              const isActive = active === i
              return (
                <button
                  key={scenario.id}
                  onClick={() => setActive(i)}
                  className={`w-full text-left px-5 py-4 rounded-xl transition-all duration-300 group ${
                    isActive
                      ? 'bg-emerald-600/10 border border-emerald-500/30'
                      : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.04] hover:border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isActive ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-500'
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3
                        className={`text-sm font-semibold transition-colors ${
                          isActive ? 'text-emerald-400' : 'text-slate-300'
                        }`}
                      >
                        {scenario.title}
                      </h3>
                      <p
                        className={`text-xs mt-1 leading-relaxed transition-colors ${
                          isActive ? 'text-slate-400' : 'text-slate-600'
                        }`}
                      >
                        {scenario.description}
                      </p>
                    </div>
                    <div
                      className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 transition-colors ${
                        isActive ? 'bg-emerald-400' : 'bg-transparent'
                      }`}
                    />
                  </div>
                </button>
              )
            })}
          </motion.div>

          {/* Right: WhatsApp mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            <WhatsAppPhone scenario={chatScenarios[active]} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────── HOW IT WORKS ─────────────────── */
function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Connect Your WhatsApp',
      desc: 'Scan a QR code to link your WhatsApp Business number. Takes less than 60 seconds.',
      icon: Phone,
    },
    {
      num: '02',
      title: 'Add Your Products',
      desc: 'Upload photos, set prices and negotiation floors. Your agent learns your inventory instantly.',
      icon: Package,
    },
    {
      num: '03',
      title: 'Go Live & Sell 24/7',
      desc: 'Flip the switch. Your AI agent handles every buyer message and follow-up automatically.',
      icon: Zap,
    },
  ]

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <motion.p
            variants={fadeUp}
            className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3"
          >
            How It Works
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold text-white">
            Up and Running in 10 Minutes
          </motion.h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-emerald-800/0 via-emerald-800/50 to-emerald-800/0" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center"
            >
              <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-600/20 relative z-10">
                <step.icon size={24} className="text-white" />
              </div>
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                Step {step.num}
              </span>
              <h3 className="text-xl font-bold text-white mt-2 mb-3">{step.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────── PRICING ─────────────────── */
function Pricing() {
  const plans = [
    {
      name: 'Starter',
      price: '50',
      period: '/month',
      desc: 'Perfect for new sellers',
      features: [
        '1 WhatsApp number',
        '50 AI conversations/month',
        '20 product listings',
        'Basic lead notifications',
        'Text conversations only',
        '14-day free trial',
      ],
      popular: false,
    },
    {
      name: 'Business',
      price: '150',
      period: '/month',
      desc: 'For active sellers who want to scale',
      features: [
        '1 WhatsApp number',
        'Unlimited conversations',
        'Unlimited products',
        'Image recognition',
        'Proactive follow-ups',
        'Price drop broadcasts',
        'Seller wake-up calls',
        'Live conversation monitor',
      ],
      popular: true,
    },
    {
      name: 'Pro',
      price: '350',
      period: '/month',
      desc: 'Full power — voice, calls, more',
      features: [
        'Up to 3 WhatsApp numbers',
        'Everything in Business',
        'AI voice calls to buyers',
        'Voice cloning',
        'Call campaigns',
        'Full analytics dashboard',
        'Custom agent personality',
        'Priority support',
      ],
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-20 lg:py-28 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <motion.p
            variants={fadeUp}
            className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3"
          >
            Pricing
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold text-white">
            Plans That Pay for Themselves
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-slate-400">
            If the agent saves even one GHS 800 sale per month, the plan pays for itself 5× over.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className={`rounded-2xl p-7 border transition-all duration-300 ${
                plan.popular
                  ? 'border-emerald-500 bg-emerald-600 text-white shadow-xl shadow-emerald-600/15 scale-[1.03]'
                  : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
              }`}
            >
              {plan.popular && (
                <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <p className={`text-sm mt-1 ${plan.popular ? 'text-emerald-100' : 'text-slate-500'}`}>
                {plan.desc}
              </p>
              <div className="mt-5 mb-6">
                <span className="text-4xl font-extrabold text-white">GHS {plan.price}</span>
                <span className={`text-sm ${plan.popular ? 'text-emerald-200' : 'text-slate-500'}`}>
                  {plan.period}
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm">
                    <Check
                      size={16}
                      className={`mt-0.5 shrink-0 ${
                        plan.popular ? 'text-emerald-200' : 'text-emerald-500'
                      }`}
                    />
                    <span className={plan.popular ? 'text-emerald-50' : 'text-slate-400'}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                  plan.popular
                    ? 'bg-white text-emerald-700 hover:bg-emerald-50'
                    : 'bg-white text-black hover:bg-slate-100'
                }`}
              >
                Start Free Trial
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────── CTA ─────────────────── */
function CTA() {
  return (
    <section className="py-20 bg-zinc-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 via-transparent to-emerald-600/5" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold text-white">
            Stop Losing Sales While You Sleep
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-slate-400 max-w-xl mx-auto">
            Every message you miss is money walking to another seller. Let your AI agent handle it.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors shadow-lg shadow-emerald-600/20 text-lg"
            >
              Get Started Free <ArrowRight size={20} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────────── FOOTER ─────────────────── */
function Footer() {
  return (
    <footer className="bg-black border-t border-zinc-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <span className="font-bold text-lg text-white">
                SalesAgent<span className="text-emerald-400">AI</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              AI-powered WhatsApp sales agent built for phone sellers in Ghana and West Africa.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2.5">
              {['Features', 'Pricing', 'How It Works', 'API'].map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2.5">
              {['Help Center', 'Contact Us', 'WhatsApp Support', 'Status'].map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-600">2025 SalesAgent AI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Globe size={18} className="text-slate-600" />
            <span className="text-sm text-slate-600">Made in Ghana 🇬🇭</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ─────────────────── MAIN EXPORT ─────────────────── */
export default function LandingPage() {
  return (
    <div className="bg-black">
      <Navbar />
      <Hero />
      <FeaturesDemo />
      <HowItWorks />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  )
}