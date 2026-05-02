import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookText, Video, FolderOpen, Clock, PlayCircle, Flame, Target, Trophy, ChevronRight, Pause, Play, RotateCcw, TrendingUp } from 'lucide-react';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalVideos: 0,
    totalSubjects: 0,
    studyHours: 0
  });
  const [recentVideos, setRecentVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pomodoro State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState('Focus');

  // Video Thumbnail Helpers
  const getVideoSource = (video) => video?.youtubeUrl || video?.fileUrl || video?.videoUrl || '';
  const isYoutubeUrl = (url = '') => url.includes('youtube.com') || url.includes('youtu.be');
  const getYoutubeId = (url = '') => {
    if (!isYoutubeUrl(url)) return '';
    try {
      if (url.includes('v=')) return url.split('v=')[1].split('&')[0];
      if (url.includes('youtu.be/')) return url.split('youtu.be/')[1].split('?')[0];
    } catch(e) {}
    return '';
  };
  const getThumbnail = (video) => {
    if (video?.thumbnail) return video.thumbnail;
    const src = getVideoSource(video);
    if (isYoutubeUrl(src)) {
      const id = getYoutubeId(src);
      if (id) return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    }
    return 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80';
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, videosRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/videos')
        ]);
        setStats(statsRes.data.stats || {
          totalNotes: 0,
          totalVideos: 0,
          totalSubjects: 0,
          studyHours: 0
        });
        const activeVideos = (videosRes.data || []).filter(v => v.watchProgress > 0 && v.watchProgress < (v.duration || 100));
        setRecentVideos(activeVideos.slice(0, 2));
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Pomodoro Timer Logic
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (sessionType === 'Focus') {
        setSessionType('Break');
        setTimeLeft(5 * 60);
      } else {
        setSessionType('Focus');
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, sessionType]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setSessionType('Focus');
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const statCards = [
    { title: 'Total Notes', value: stats.totalNotes || 12, icon: BookText, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
    { title: 'Video Lectures', value: stats.totalVideos || 8, icon: Video, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
    { title: 'Subjects', value: stats.totalSubjects || 4, icon: FolderOpen, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
    { title: 'Study Hours', value: stats.studyHours || 15, icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full shadow-[0_0_15px_rgba(124,58,237,0.5)]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20 relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-dark-card to-dark-bg border border-dark-border p-8 md:p-12 shadow-2xl group"
      >
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none group-hover:from-primary/20 transition-all duration-700"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-gray-300 backdrop-blur-md">
              <Flame size={16} className="text-orange-500" /> 7 Day Streak!
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-dark-text tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{user?.name?.split(' ')[0] || 'Student'}</span> 👋
            </h1>
            <p className="text-lg text-dark-muted leading-relaxed">
              You are in the top <span className="text-dark-text font-bold">15%</span> of students this week. Consistency is the key to mastering your engineering subjects. Let's keep the momentum going!
            </p>
            <div className="pt-4 flex items-center gap-4">
              <button className="btn-primary shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:scale-105 transition-transform">
                Resume Learning
              </button>
              <Link to="/courses" className="text-dark-muted hover:text-white font-medium flex items-center gap-1 transition-colors">
                Explore Courses <ChevronRight size={18} />
              </Link>
            </div>
          </div>
          
          {/* Circular Progress (Mock) */}
          <div className="hidden lg:flex flex-col items-center justify-center relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-dark-border" />
              <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="502" strokeDashoffset="150" className="text-primary" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-white">70%</span>
              <span className="text-xs text-dark-muted font-medium uppercase tracking-wider mt-1">Weekly Goal</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`glass-card p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg relative overflow-hidden group ${stat.border}`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] -mr-10 -mt-10 opacity-50 transition-opacity group-hover:opacity-100 ${stat.bg}`}></div>
            <div className="relative z-10 flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">
                <TrendingUp size={12} className="mr-1" /> +12%
              </span>
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl font-extrabold text-dark-text mb-1">{stat.value}</h3>
              <p className="text-dark-muted text-sm font-medium">{stat.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Continue Watching Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-dark-text flex items-center gap-2">
              <PlayCircle className="text-primary" /> Continue Watching
            </h2>
            <Link to="/courses" className="text-sm font-bold text-primary hover:text-white transition-colors bg-primary/10 px-4 py-2 rounded-full">
              View all
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {recentVideos.length > 0 ? recentVideos.map((video, idx) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + (idx*0.1) }}
                key={video._id} 
                onClick={() => navigate(`/courses/results?subjectId=${video.subject?._id}&subjectName=${encodeURIComponent(video.subject?.name || 'Subject')}&material=Video Lectures&videoId=${video._id}&folderId=${video.folder}`)}
                className="glass-card rounded-2xl overflow-hidden group cursor-pointer border border-dark-border hover:border-primary/50 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
              >
                <div className="relative aspect-video bg-black overflow-hidden">
                  <img 
                    src={getThumbnail(video)} 
                    alt={video.title}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-all duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent opacity-80"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white shadow-[0_0_20px_rgba(124,58,237,0.6)] pl-1 transform scale-50 group-hover:scale-100 transition-transform duration-500">
                      <Play size={24} fill="currentColor" />
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/10 backdrop-blur-sm">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent relative" 
                      style={{ width: `${(video.watchProgress / (video.duration || 100)) * 100 || 45}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_5px_white]"></div>
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white border border-white/10">
                    {Math.floor(video.duration / 60 || 12)}:{String(video.duration % 60 || 30).padStart(2, '0')}
                  </div>
                </div>
                <div className="p-5 bg-dark-card group-hover:bg-dark-cardHover transition-colors">
                  <h3 className="font-bold text-lg text-dark-text truncate mb-1.5 group-hover:text-primary transition-colors">{video.title}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-dark-muted font-medium">{video.subject?.name || 'Computer Networks'}</p>
                    <span className="text-xs font-bold text-dark-muted">45% Left</span>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full glass-card p-12 text-center border border-dark-border border-dashed rounded-2xl flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-dark-bg border border-dark-border flex items-center justify-center text-dark-muted mb-4">
                  <Video size={32} />
                </div>
                <h3 className="text-xl font-bold text-dark-text mb-2">No Recent Videos</h3>
                <p className="text-dark-muted max-w-sm">You haven't watched any videos recently. Start a course to see your progress here.</p>
                <Link to="/courses" className="mt-6 btn-primary">Browse Courses</Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Pomodoro Timer */}
          <div className="glass-card p-1 rounded-2xl border border-dark-border bg-gradient-to-b from-dark-card to-dark-bg shadow-lg">
            <div className="bg-dark-bg/50 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[40px] rounded-full pointer-events-none"></div>
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="font-bold text-dark-text flex items-center gap-2">
                  <Target className="text-primary" size={20} /> Focus Session
                </h3>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold transition-colors ${sessionType === 'Focus' ? 'bg-primary/20 text-primary' : 'text-dark-muted'}`}>Focus</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold transition-colors ${sessionType === 'Break' ? 'bg-emerald-500/20 text-emerald-400' : 'text-dark-muted'}`}>Break</span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-6 relative z-10">
                <div className="relative flex items-center justify-center w-48 h-48 mb-6 mx-auto">
                  {/* Outer animated ring */}
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="90" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-dark-border" />
                    <circle 
                      cx="96" cy="96" r="90" stroke="currentColor" strokeWidth="4" fill="transparent" 
                      strokeDasharray="565" 
                      strokeDashoffset={565 - (565 * (timeLeft / (sessionType === 'Focus' ? 25*60 : 5*60)))} 
                      className={`${sessionType === 'Focus' ? 'text-primary' : 'text-emerald-400'} transition-all duration-1000 ease-linear`} strokeLinecap="round" 
                    />
                  </svg>
                  <div className={`text-6xl font-black tabular-nums tracking-tight z-10 ${sessionType === 'Focus' ? 'text-dark-text' : 'text-emerald-400'} drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]`}>
                    {formatTime(timeLeft)}
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full px-4">
                  <button onClick={resetTimer} className="p-3 rounded-xl bg-dark-card border border-dark-border text-dark-muted hover:text-white transition-colors">
                    <RotateCcw size={20} />
                  </button>
                  <button 
                    onClick={toggleTimer} 
                    className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${isActive ? 'bg-red-500/10 text-red-500 border border-red-500/30' : sessionType === 'Focus' ? 'bg-primary text-white hover:bg-primary/90' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                  >
                    {isActive ? <><Pause size={20} fill="currentColor" /> Pause</> : <><Play size={20} fill="currentColor" /> Start</>}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mini Goals / Achievements */}
          <div className="glass-card p-6 rounded-2xl border border-dark-border">
            <h3 className="font-bold text-dark-text mb-4 flex items-center gap-2">
              <Trophy className="text-yellow-500" size={20} /> Daily Goals
            </h3>
            <div className="space-y-4">
              {[
                { title: 'Watch 2 Lectures', progress: 50, color: 'bg-primary' },
                { title: 'Read 1 Chapter Notes', progress: 100, color: 'bg-emerald-500' },
                { title: 'Focus for 2 Hours', progress: 30, color: 'bg-orange-500' }
              ].map((goal, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className={goal.progress === 100 ? 'text-dark-muted line-through' : 'text-dark-text'}>{goal.title}</span>
                    <span className={goal.progress === 100 ? 'text-emerald-400' : 'text-dark-muted'}>{goal.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-dark-bg rounded-full overflow-hidden">
                    <div className={`h-full ${goal.color} rounded-full transition-all duration-1000`} style={{ width: `${goal.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
