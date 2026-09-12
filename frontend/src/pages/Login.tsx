import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, User, Lock, Users, Shield, X, Activity, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LoginCredentials } from '@/types/auth';
import { config } from '@/config/app-config';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [sandboxLoading, setSandboxLoading] = useState<string | null>(null);
  const [isSandboxModalOpen, setIsSandboxModalOpen] = useState(false);
  const { login } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data as LoginCredentials);
      navigate('/dashboard');
    } catch (error) {
    }
  };

  const handleSandboxLogin = async (role: string, email: string) => {
    setSandboxLoading(role);
    setValue('email', email);
    setValue('password', 'password123');
    try {
      await login({ email, password: 'password123' });
      setIsSandboxModalOpen(false);
      navigate('/dashboard');
    } catch (error) {
    } finally {
      setSandboxLoading(null);
    }
  };

  const sandboxRoles = [
    { 
      role: 'receptionist', 
      label: 'Receptionist', 
      email: 'receptionist@hospital.com', 
      description: 'Manage patient queues & appointments',
      colorClass: 'border-blue-500/20 text-blue-600 dark:text-blue-400 bg-blue-500/5 hover:bg-blue-500/10' 
    },
    { 
      role: 'doctor', 
      label: 'Doctor', 
      email: 'doctor@hospital.com', 
      description: 'Record consultations & prescriptions',
      colorClass: 'border-green-500/20 text-green-600 dark:text-green-400 bg-green-500/5 hover:bg-green-500/10' 
    },
    { 
      role: 'diagnostic', 
      label: 'Diagnostic', 
      email: 'diagnostic@hospital.com', 
      description: 'Process lab test orders & results',
      colorClass: 'border-purple-500/20 text-purple-600 dark:text-purple-400 bg-purple-500/5 hover:bg-purple-500/10' 
    },
    { 
      role: 'pharmacy', 
      label: 'Pharmacy', 
      email: 'pharmacy@hospital.com', 
      description: 'Dispense drugs & manage inventory',
      colorClass: 'border-orange-500/20 text-orange-600 dark:text-orange-400 bg-orange-500/5 hover:bg-orange-500/10' 
    },
    { 
      role: 'admin', 
      label: 'Admin', 
      email: 'admin@hospital.com', 
      description: 'Manage users, staff & configuration',
      colorClass: 'border-red-500/20 text-red-600 dark:text-red-400 bg-red-500/5 hover:bg-red-500/10' 
    },
  ];

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-900 transition-colors duration-500 dark:bg-slate-950 light:bg-slate-50 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none z-0" />

      <svg className="absolute right-0 top-1/4 h-64 w-[50%] opacity-20 dark:opacity-40 pointer-events-none z-0" viewBox="0 0 400 200" fill="none">
        <path
          d="M 0 100 L 100 100 L 120 70 L 140 130 L 160 30 L 180 170 L 200 90 L 220 110 L 240 100 L 400 100"
          stroke="url(#heartbeat-gradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-pulse-soft"
        />
        <defs>
          <linearGradient id="heartbeat-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>

      <div 
        className="absolute top-0 left-0 h-full w-[35%] hidden md:block overflow-hidden z-10 border-r border-slate-200/20 dark:border-slate-800/20"
        style={{ clipPath: 'ellipse(85% 100% at 0% 50%)' }}
      >
        <img 
          src="hospital-dark.png" 
          alt="Hospital Dark" 
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`} 
        />
        <img 
          src="hospital-light.png" 
          alt="Hospital Light" 
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`} 
        />
        <div className="absolute inset-0 bg-slate-950/20 dark:bg-slate-950/40" />
      </div>

      <div className="w-full max-w-md z-20 flex flex-col items-center">
        <div className="text-center mb-6">
          <img src="logo.png" className="h-16 w-auto mx-auto mb-2 mt-[5px] object-contain" alt="Logo" />
          <h1 className="text-3xl font-display font-bold tracking-tight text-white">
            AuraCare<span className="text-blue-600 dark:text-cyan-400"> CRM</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Hospital & Clinic Management System
          </p>
        </div>

        <div className="w-full p-8 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md shadow-2xl transition-all duration-300">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500 dark:text-cyan-400" />
                <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email Address
                </Label>
              </div>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register('email')}
                className={`h-11 bg-white/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus-visible:ring-1 focus-visible:ring-blue-500 dark:focus-visible:ring-cyan-400 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-blue-500 dark:text-cyan-400" />
                <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password')}
                  className={`h-11 pr-10 bg-white/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus-visible:ring-1 focus-visible:ring-blue-500 dark:focus-visible:ring-cyan-400 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-blue-500/20 dark:shadow-cyan-500/10 transition-all duration-300"
              disabled={isSubmitting || !!sandboxLoading}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {config.isDevelopment && (
            <>
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-900 px-2 text-slate-400 dark:text-slate-500 font-medium">
                    OR
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSandboxModalOpen(true)}
                className="w-full h-11 border-dashed border-blue-500/40 dark:border-cyan-500/30 text-blue-600 dark:text-cyan-400 hover:bg-blue-500/5 dark:hover:bg-cyan-500/5 font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                disabled={isSubmitting || !!sandboxLoading}
              >
                <Users className="h-4 w-4" />
                <span>Sandbox Demo Login</span>
              </Button>
            </>
          )}
        </div>

        <div className="text-center mt-6 text-xs text-slate-500 dark:text-slate-400 flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-1">
            <Shield className="h-3.5 w-3.5 text-blue-500 dark:text-cyan-400" />
            <span>Secure &bull; Reliable &bull; Smart Healthcare</span>
          </div>
          <p>
            &copy; 2026{' '}
            <a 
              href={config.githubUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="underline hover:text-slate-700 dark:hover:text-slate-200"
            >
              {config.orgName}
            </a>
            . All rights reserved.
          </p>
        </div>
      </div>

      {isSandboxModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsSandboxModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Select Sandbox Role</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Choose a role to sign in instantly with mock credentials
              </p>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {sandboxRoles.map((roleInfo) => (
                <button
                  key={roleInfo.role}
                  onClick={() => handleSandboxLogin(roleInfo.role, roleInfo.email)}
                  disabled={!!sandboxLoading}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-center justify-between group ${roleInfo.colorClass}`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="font-semibold text-sm">{roleInfo.label}</div>
                    <div className="text-xs opacity-80 mt-0.5 truncate">{roleInfo.description}</div>
                  </div>
                  {sandboxLoading === roleInfo.role ? (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                  ) : (
                    <Activity className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}