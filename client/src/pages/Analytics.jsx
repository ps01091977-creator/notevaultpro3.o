import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../api/axios';

const Analytics = () => {
  const [data, setData] = useState({
    notesActivity: [],
    timePerSubject: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [overviewRes, weeklyRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/weekly')
        ]);
        setData({
          timePerSubject: overviewRes.data.timePerSubject,
          notesActivity: weeklyRes.data.notesActivity
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-card border border-dark-border p-3 rounded-lg shadow-xl">
          <p className="text-gray-300 font-medium mb-1">{label}</p>
          <p className="text-primary font-bold">{`${payload[0].value} items`}</p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-card border border-dark-border p-3 rounded-lg shadow-xl">
          <p className="text-gray-300 font-medium">{payload[0].name}</p>
          <p className="text-accent font-bold mt-1">{`${payload[0].value} min`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full text-primary animate-pulse">Loading Analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Study Analytics</h1>
        <p className="text-gray-400">Track your progress and study habits</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h2 className="text-xl font-bold mb-6">Notes Created This Week</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.notesActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff0a' }} />
                <Bar dataKey="notes" fill="url(#colorPrimary)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={1} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Study Time by Subject */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <h2 className="text-xl font-bold mb-6">Study Time by Subject (Minutes)</h2>
          <div className="h-80 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.timePerSubject}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.timePerSubject.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#06b6d4'} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {data.timePerSubject.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color || '#06b6d4' }}></div>
                {item.name}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="glass-card p-6 relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-accent/10 blur-[80px] rounded-full mix-blend-screen pointer-events-none"></div>
        <h2 className="text-xl font-bold mb-4">Study Streaks</h2>
        <div className="flex items-center gap-6">
          <div className="bg-[#161622] rounded-xl p-5 border border-dark-border flex-1 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center text-2xl">🔥</div>
            <div>
              <p className="text-sm text-gray-400">Current Streak</p>
              <h3 className="text-2xl font-bold">5 Days</h3>
            </div>
          </div>
          <div className="bg-[#161622] rounded-xl p-5 border border-dark-border flex-1 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center text-2xl">⭐</div>
            <div>
              <p className="text-sm text-gray-400">Longest Streak</p>
              <h3 className="text-2xl font-bold">14 Days</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
