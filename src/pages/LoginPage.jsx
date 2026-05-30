import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors.general) {
      setErrors({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.identifier.trim() || !formData.password) {
      setErrors({ general: 'Please enter your phone/email and password.' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    const result = await login(formData.identifier, formData.password);

    if (!result.success) {
      const be = result.errors;
      setErrors({
        general:
          be.detail ||
          (Array.isArray(be.non_field_errors) ? be.non_field_errors[0] : be.non_field_errors) ||
          'Invalid credentials. Please try again.',
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 items-center justify-center p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Bot size={22} className="text-white" />
            </div>
            <span className="font-bold text-2xl text-white">
              SalesAgent<span className="text-emerald-400">AI</span>
            </span>
          </div>
          <h2 className="text-3xl font-bold text-white leading-snug">
            Your AI sales agent is waiting for you.
          </h2>
          <p className="mt-4 text-zinc-400 leading-relaxed">
            Log in to check your conversations, manage inventory, and see how many sales your agent
            closed while you were away.
          </p>
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 mt-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <span className="text-emerald-400 text-lg">✓</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">3 sales closed while you were away</p>
                <p className="text-xs text-zinc-400">Total: GHS 8,400</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl text-zinc-900">
              SalesAgent<span className="text-emerald-600">AI</span>
            </span>
          </div>

          <h1 className="text-2xl font-bold text-zinc-900">Welcome back</h1>
          <p className="text-sm text-zinc-500 mt-1">Log in to your dashboard</p>

          {errors.general && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {errors.general}
            </div>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Phone Number or Email
              </label>
              <input
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                placeholder="0XX XXX XXXX or email"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-zinc-600">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors shadow-md shadow-emerald-600/20"
            >
              {isLoading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  Log In <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              Sign up free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}