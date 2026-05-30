import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Eye, EyeOff, ArrowRight, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function SignupPage() {
  const { signup } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    businessName: '',
    password: '',
    passwordConfirm: '',
    agreeTerms: false,
  });

  const benefits = [
    '14-day free trial — no credit card',
    'Set up in under 10 minutes',
    'Agent starts selling immediately',
    'Cancel anytime, no lock-in',
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (formData.password.length < 8) newErrors.password = 'Min 8 characters';
    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Passwords do not match';
    }
    if (!formData.passwordConfirm) newErrors.passwordConfirm = 'Please confirm your password';
    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the terms';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    const result = await signup(formData);

    if (!result.success) {
      const be = result.errors;
      const mapped = {};

      // Map Django field names → form field names
      // Your serializer uses: first_name, last_name, email, phone, business_name, password, password_confirm
      if (be.first_name) mapped.firstName = Array.isArray(be.first_name) ? be.first_name[0] : be.first_name;
      if (be.last_name) mapped.lastName = Array.isArray(be.last_name) ? be.last_name[0] : be.last_name;
      if (be.email) mapped.email = Array.isArray(be.email) ? be.email[0] : be.email;
      if (be.phone) mapped.phone = Array.isArray(be.phone) ? be.phone[0] : be.phone;
      if (be.business_name) mapped.businessName = Array.isArray(be.business_name) ? be.business_name[0] : be.business_name;
      if (be.password) mapped.password = Array.isArray(be.password) ? be.password[0] : be.password;
      if (be.password_confirm) mapped.passwordConfirm = Array.isArray(be.password_confirm) ? be.password_confirm[0] : be.password_confirm;

      // General errors
      if (be.detail) mapped.general = be.detail;
      if (be.non_field_errors) mapped.general = Array.isArray(be.non_field_errors) ? be.non_field_errors[0] : be.non_field_errors;

      // Fallback
      if (Object.keys(mapped).length === 0 && typeof be === 'object') {
        mapped.general = Object.values(be).flat().join(' ');
      }

      setErrors(mapped);
    }

    setIsLoading(false);
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border ${
      errors[field]
        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
        : 'border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/20'
    } bg-white text-sm outline-none focus:ring-2 transition-all`;

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
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px]" />
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
            Start selling 24/7 in minutes.
          </h2>
          <p className="mt-4 text-zinc-400 leading-relaxed">
            Join hundreds of phone sellers across Ghana who never miss a sale again.
          </p>
          <ul className="mt-8 space-y-4">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-emerald-600/20 rounded-full flex items-center justify-center shrink-0">
                  <Check size={14} className="text-emerald-400" />
                </div>
                <span className="text-sm text-zinc-300">{b}</span>
              </li>
            ))}
          </ul>
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

          <h1 className="text-2xl font-bold text-zinc-900">Create your account</h1>
          <p className="text-sm text-zinc-500 mt-1">Start your 14-day free trial</p>

          {errors.general && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {errors.general}
            </div>
          )}

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Kofi"
                  className={inputClass('firstName')}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Mensah"
                  className={inputClass('lastName')}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0XX XXX XXXX"
                className={inputClass('phone')}
              />
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="kofi@example.com"
                className={inputClass('email')}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Business Name (optional) */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Business Name <span className="text-zinc-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="e.g. Kofi's Phone Shop"
                className={inputClass('businessName')}
              />
              {errors.businessName && (
                <p className="text-xs text-red-500 mt-1">{errors.businessName}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className={`${inputClass('password')} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPwConfirm ? 'text' : 'password'}
                  name="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className={`${inputClass('passwordConfirm')} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwConfirm(!showPwConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPwConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.passwordConfirm && (
                <p className="text-xs text-red-500 mt-1">{errors.passwordConfirm}</p>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="w-4 h-4 mt-0.5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-zinc-500">
                I agree to the{' '}
                <a href="#" className="text-emerald-600 underline">Terms</a> and{' '}
                <a href="#" className="text-emerald-600 underline">Privacy Policy</a>
              </span>
            </label>
            {errors.agreeTerms && (
              <p className="text-xs text-red-500 -mt-2">{errors.agreeTerms}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors shadow-md shadow-emerald-600/20 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}