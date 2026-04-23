import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookText, Video, FolderOpen, Clock, PlayCircle } from 'lucide-react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalVideos: 0,
    totalSubjects: 0,
    studyHours: 0
  });
  const [recentVideos, setRecentVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, videosRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/videos')
        ]);
        setStats(statsRes.data.stats);
        setRecentVideos(videosRes.data.slice(0, 2)); // Get 2 most recent
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const statCards = [
    { title: 'Total Notes', value: stats.totalNotes, icon: BookText, color: 'from-blue-500 to-cyan-400' },
    { title: 'Video Lectures', value: stats.totalVideos, icon: Video, color: 'from-purple-500 to-pink-500' },
    { title: 'Subjects', value: stats.totalSubjects, icon: FolderOpen, color: 'from-orange-500 to-yellow-500' },
    { title: 'Study Hours', value: stats.studyHours, icon: Clock, color: 'from-emerald-500 to-teal-400' },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-full text-primary animate-pulse">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-dark-card border border-dark-border p-8 pb-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full"></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
          <p className="text-gray-400 max-w-2xl">
            You're doing great. Pick up where you left off or start something new today. 
            Consistency is key to mastering your subjects.
          </p>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-10 relative z-20 px-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6 flex items-center justify-between"
          >
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">{stat.title}</p>
              <h3 className="text-3xl font-bold">{stat.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
              <stat.icon size={24} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Continue Watching */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Continue Watching</h2>
            <Link to="/videos" className="text-sm text-primary hover:text-primary-light">View all</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentVideos.length > 0 ? recentVideos.map((video) => (
              <div key={video._id} className="glass-card overflow-hidden group cursor-pointer">
                <div className="relative h-40 bg-gray-800">
                  <img 
                    src={video.thumbnail || "https://images.unsplash.com/photo-1610484826967-09c5720778c7?w=800&q=80"} 
                    alt={video.title}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary/80 flex items-center justify-center text-white backdrop-blur-sm group-hover:scale-110 transition-transform">
                      <PlayCircle size={28} />
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 w-full h-1.5 bg-dark-bg">
                    <div 
                      className="h-full bg-accent" 
                      style={{ width: `${(video.watchProgress / (video.duration || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg truncate mb-1">{video.title}</h3>
                  <p className="text-sm text-gray-400">{video.subject?.name || 'Uncategorized'}</p>
                </div>
              </div>
            )) : (
              <div className="col-span-2 glass-card p-8 text-center text-gray-400">
                No recent videos. Start watching!
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-bold mb-4">Pomodoro Timer</h3>
            {/* Simple Pomodoro UI for now */}
            <div className="text-center">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-4">
                25:00
              </div>
              <button className="btn-primary w-full">Start Focus Session</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
