import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, ArrowLeft, ArrowRight, Loader2, Mail, KeyRound, Check } from 'lucide-react';
import API from '../api/axios';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await API.post('/auth/forgot-password/', { email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!code.trim()) {
      setError('Please enter the 6-digit code');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await API.post('/auth/reset-password/', {
        email,
        code,
        new_password: newPassword,
      });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl text-zinc-900">
            SalesAgent<span className="text-emerald-600">AI</span>
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">
          <AnimatePresence mode="wait">
            {/* ── STEP 1: Enter Email ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                  <Mail size={22} className="text-emerald-600" />
                </div>
                <h1 className="text-xl font-bold text-zinc-900">Forgot your password?</h1>
                <p className="text-sm text-zinc-500 mt-1">
                  Enter your email and we&apos;ll send you a reset code.
                </p>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                    {error}
                  </div>
                )}

                <form onSubmit={handleRequestCode} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="kofi@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-3 rounded-xl transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={17} className="animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        Send Reset Code <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── STEP 2: Code + New Password ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                  <KeyRound size={22} className="text-emerald-600" />
                </div>
                <h1 className="text-xl font-bold text-zinc-900">Check your email</h1>
                <p className="text-sm text-zinc-500 mt-1">
                  We sent a 6-digit code to{' '}
                  <span className="font-medium text-zinc-700">{email}</span>
                </p>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                    {error}
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                      6-Digit Code
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                        setError('');
                      }}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-sm text-center tracking-[0.5em] font-mono text-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="Min. 8 characters"
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="Re-enter password"
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-3 rounded-xl transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={17} className="animate-spin" /> Resetting...
                      </>
                    ) : (
                      <>
                        Reset Password <ArrowRight size={17} />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setError('');
                      setCode('');
                    }}
                    className="w-full text-sm text-zinc-500 hover:text-zinc-700 py-2"
                  >
                    Didn&apos;t receive a code? Go back
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── STEP 3: Success ── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-emerald-600" />
                </div>
                <h1 className="text-xl font-bold text-zinc-900">Password reset!</h1>
                <p className="text-sm text-zinc-500 mt-2">
                  Your password has been changed successfully.
                </p>
                <Link
                  to="/login"
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  Go to Login <ArrowRight size={17} />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step !== 3 && (
          <Link
            to="/login"
            className="mt-6 flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-zinc-700"
          >
            <ArrowLeft size={16} /> Back to login
          </Link>
        )}
      </motion.div>
    </div>
  );
}