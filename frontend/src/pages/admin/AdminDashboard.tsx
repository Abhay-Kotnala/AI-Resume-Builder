import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { Users, FileText, Zap, Crown, TrendingUp, Activity, Shield, RefreshCw } from 'lucide-react';

interface StatsOverview {
    totalUsers: number;
    totalProUsers: number;
    totalResumesGenerated: number;
    totalAiActions: number;
    signupsData: Array<{ date: string; signups: number }>;
}

// Animated counter hook
function useCountUp(target: number, duration = 1200) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (target === 0) return;
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [target, duration]);
    return count;
}

export const AdminDashboard: React.FC = () => {
    const { token } = useAuth();
    const [stats, setStats] = useState<StatsOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchStats = async (showRefreshAnim = false) => {
        if (showRefreshAnim) setIsRefreshing(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/stats/overview`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch admin stats');
            const data = await response.json();
            setStats(data);
            setLastUpdated(new Date().toLocaleTimeString());
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        if (token) fetchStats();
    }, [token]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#030712]">
                <div className="text-center space-y-4">
                    <div className="relative w-16 h-16 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
                        <div className="absolute inset-0 rounded-full border-4 border-t-emerald-400 animate-spin" />
                        <Shield className="absolute inset-0 m-auto h-7 w-7 text-emerald-400" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium animate-pulse">Loading admin data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#030712]">
                <div className="text-center p-8 bg-red-950/30 border border-red-800/50 rounded-2xl backdrop-blur-xl max-w-md">
                    <div className="w-12 h-12 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Zap className="h-6 w-6 text-red-400" />
                    </div>
                    <h3 className="text-red-400 font-semibold mb-2">Failed to Load</h3>
                    <p className="text-slate-400 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    if (!stats) return null;

    const conversionRate = stats.totalUsers > 0
        ? ((stats.totalProUsers / stats.totalUsers) * 100).toFixed(1)
        : '0.0';

    return (
        <div className="min-h-screen bg-[#030712] text-white relative overflow-hidden">
            {/* Ambient glow background */}
            <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="fixed top-1/2 left-0 w-[400px] h-[400px] bg-purple-600/4 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                <span className="text-emerald-400 text-xs font-semibold tracking-wider uppercase">Admin Control</span>
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                            Platform Overview
                        </h1>
                        <p className="text-slate-400 mt-1 text-sm">
                            Real-time analytics for ElevateAI
                            {lastUpdated && <span className="ml-2 text-slate-600">· Last updated {lastUpdated}</span>}
                        </p>
                    </div>
                    <button
                        onClick={() => fetchStats(true)}
                        className={`flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 rounded-xl text-slate-300 text-sm font-medium transition-all ${isRefreshing ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-600 hover:text-white'}`}
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        title="Total Users"
                        value={stats.totalUsers}
                        icon={<Users className="h-5 w-5" />}
                        color="blue"
                        subtitle="Registered accounts"
                    />
                    <StatCard
                        title="Pro Subscribers"
                        value={stats.totalProUsers}
                        icon={<Crown className="h-5 w-5" />}
                        color="yellow"
                        subtitle={`${conversionRate}% conversion`}
                    />
                    <StatCard
                        title="Resumes Created"
                        value={stats.totalResumesGenerated}
                        icon={<FileText className="h-5 w-5" />}
                        color="emerald"
                        subtitle="Total generated"
                    />
                    <StatCard
                        title="AI Actions"
                        value={stats.totalAiActions}
                        icon={<Zap className="h-5 w-5" />}
                        color="purple"
                        subtitle="AI operations run"
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                    {/* Signups Chart — wide */}
                    <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6 hover:border-slate-700/60 transition-colors">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-semibold text-white">User Signups</h2>
                                <p className="text-slate-400 text-sm mt-0.5">Last 30 days growth</p>
                            </div>
                            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-lg text-sm font-medium">
                                <TrendingUp className="h-4 w-4" />
                                Trending
                            </div>
                        </div>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.signupsData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#334155"
                                        tick={{ fill: '#64748b', fontSize: 11 }}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={8}
                                    />
                                    <YAxis
                                        stroke="#334155"
                                        tick={{ fill: '#64748b', fontSize: 11 }}
                                        tickLine={false}
                                        axisLine={false}
                                        dx={-4}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#0f172a',
                                            border: '1px solid #1e293b',
                                            borderRadius: '12px',
                                            color: '#fff',
                                            fontSize: '13px',
                                            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                                        }}
                                        itemStyle={{ color: '#34d399' }}
                                        labelStyle={{ color: '#94a3b8', marginBottom: 4 }}
                                        cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="signups"
                                        stroke="#10b981"
                                        strokeWidth={2.5}
                                        fill="url(#signupGrad)"
                                        dot={false}
                                        activeDot={{ r: 5, fill: '#10b981', stroke: '#030712', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Conversion & Quick Stats — narrow */}
                    <div className="flex flex-col gap-4">

                        {/* Conversion Rate */}
                        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6 hover:border-slate-700/60 transition-colors flex-1">
                            <div className="flex items-center gap-2 mb-4">
                                <Activity className="h-4 w-4 text-yellow-400" />
                                <p className="text-slate-400 text-sm font-medium">Pro Conversion</p>
                            </div>
                            <div className="text-4xl font-bold bg-gradient-to-br from-yellow-300 to-yellow-500 bg-clip-text text-transparent mb-2">
                                {conversionRate}%
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2 mt-4">
                                <div
                                    className="h-2 rounded-full bg-gradient-to-r from-yellow-500 to-amber-400 transition-all duration-1000"
                                    style={{ width: `${Math.min(parseFloat(conversionRate), 100)}%` }}
                                />
                            </div>
                            <p className="text-slate-500 text-xs mt-2">{stats.totalProUsers} of {stats.totalUsers} users upgraded</p>
                        </div>

                        {/* Top Activity Bar Chart */}
                        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6 hover:border-slate-700/60 transition-colors flex-1">
                            <p className="text-slate-400 text-sm font-medium mb-4 flex items-center gap-2">
                                <Zap className="h-4 w-4 text-purple-400" />
                                Platform Activity
                            </p>
                            <div className="h-[130px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={[
                                            { name: 'Users', value: stats.totalUsers },
                                            { name: 'Pro', value: stats.totalProUsers },
                                            { name: 'Resumes', value: stats.totalResumesGenerated },
                                            { name: 'AI', value: stats.totalAiActions },
                                        ]}
                                        margin={{ top: 0, right: 0, left: -30, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.9} />
                                                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.6} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', fontSize: '12px' }}
                                            itemStyle={{ color: '#c4b5fd' }}
                                            cursor={{ fill: '#1e293b' }}
                                        />
                                        <Bar dataKey="value" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom highlights strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Avg Scans/User', value: stats.totalUsers > 0 ? (stats.totalAiActions / stats.totalUsers).toFixed(1) : '0', color: 'text-blue-400' },
                        { label: 'Resumes/User', value: stats.totalUsers > 0 ? (stats.totalResumesGenerated / stats.totalUsers).toFixed(1) : '0', color: 'text-emerald-400' },
                        { label: 'Pro Revenue Est.', value: `$${(stats.totalProUsers * 12).toLocaleString()}`, color: 'text-yellow-400' },
                        { label: 'Platform Health', value: '✓ Good', color: 'text-emerald-400' },
                    ].map((item) => (
                        <div key={item.label} className="bg-slate-900/30 border border-slate-800/40 rounded-xl p-4 hover:border-slate-700/40 transition-colors">
                            <p className="text-slate-500 text-xs mb-1">{item.label}</p>
                            <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const colorMap = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: 'text-blue-400', glow: 'shadow-blue-500/10', grad: 'from-blue-400 to-blue-600' },
    yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: 'text-yellow-400', glow: 'shadow-yellow-500/10', grad: 'from-yellow-300 to-amber-500' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'text-emerald-400', glow: 'shadow-emerald-500/10', grad: 'from-emerald-400 to-teal-500' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: 'text-purple-400', glow: 'shadow-purple-500/10', grad: 'from-purple-400 to-violet-500' },
};

const StatCard = ({
    title, value, icon, color, subtitle
}: {
    title: string; value: number; icon: React.ReactNode; color: keyof typeof colorMap; subtitle?: string;
}) => {
    const c = colorMap[color];
    const displayed = useCountUp(value);

    return (
        <div className={`relative group bg-slate-900/40 backdrop-blur-xl border ${c.border} rounded-2xl p-6 hover:shadow-xl ${c.glow} transition-all duration-300 hover:-translate-y-0.5 overflow-hidden`}>
            {/* subtle gradient overlay on hover */}
            <div className={`absolute inset-0 ${c.bg} opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none`} />

            <div className="relative z-10">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${c.bg} border ${c.border} ${c.icon} mb-4`}>
                    {icon}
                </div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
                <p className={`text-4xl font-bold bg-gradient-to-br ${c.grad} bg-clip-text text-transparent`}>
                    {displayed.toLocaleString()}
                </p>
                {subtitle && <p className="text-slate-500 text-xs mt-2">{subtitle}</p>}
            </div>
        </div>
    );
};
