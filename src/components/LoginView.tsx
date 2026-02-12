import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';

const LoginView: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [googleLoading, setGoogleLoading] = useState(false);

    const { signIn, signUp, signInWithGoogle } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                await signIn(email, password);
            } else {
                await signUp(email, password);
            }
        } catch (err: any) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setError('');
            setGoogleLoading(true);
            await signInWithGoogle();
        } catch (err: any) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
                <div className="text-center mb-8">
                    <img src="/favicon1.png" alt="CostPilot" className="h-16 mx-auto mb-2" />
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6">CostPilot</h2>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        {isLogin ? 'Sign in to access your dashboard' : 'Get started with your financial journey'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg flex items-center gap-2 text-sm mb-6 border border-red-100 dark:border-red-800">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || googleLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {loading ? 'Processing...' : isLogin ? (
                            <>
                                <LogIn size={18} /> Sign In
                            </>
                        ) : (
                            <>
                                <UserPlus size={18} /> Create Account
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-4">
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={loading || googleLoading}
                        className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {googleLoading ? 'Connecting...' : (
                            <>
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                                Sign in with Google
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginView;
