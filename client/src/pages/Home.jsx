import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  PlayCircle, BookOpen, Star, Users, CheckCircle, Globe,
  AtSign, Heart, ArrowUp, Map, ChevronRight, Zap, Award,
  TrendingUp, Download, Monitor, MessageSquare
} from 'lucide-react';
import { FaInstagram, FaLinkedin, FaYoutube, FaGithub } from 'react-icons/fa';
import api from '../api/axios';
import { useSettingsStore } from '../store/settingsStore';

const IconMap = {
  BookOpen, Monitor, Zap, PlayCircle, Star, Users, CheckCircle, Globe, AtSign, Heart, Map, ChevronRight, Award, TrendingUp, Download, MessageSquare
};

const Home = () => {
  const navigate = useNavigate();
  const { settings } = useSettingsStore();
  const [courses, setCourses] = React.useState([]);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [globalStats, setGlobalStats] = useState({
    activeStudents: 0,
    subjectNotes: 0,
    videoLectures: 0,
    averageRating: '4.9/5'
  });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: coursesData } = await api.get('/courses');
        setCourses(coursesData);

        const { data: statsData } = await api.get('/analytics/global');
        setGlobalStats(statsData);
      } catch (error) {
        console.error("Error fetching data for home:", error);
      }
    };
    fetchData();
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto overflow-x-hidden pb-10 md:pr-2 space-y-16 md:space-y-20 bg-dark-bg">

      {/* ----------------- HERO SECTION ----------------- */}
      <section className="relative w-full min-h-[90vh] rounded-3xl overflow-hidden mt-2 flex items-center border border-dark-border bg-gradient-to-b from-dark-bg to-dark-bg">
        {/* Animated Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/20 blur-[150px] rounded-full mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-accent/20 blur-[150px] rounded-full mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        <div className="relative z-10 px-4 md:px-6 py-16 md:py-32 flex flex-col lg:flex-row items-center justify-between gap-12 md:gap-16 max-w-[1400px] mx-auto w-full">

          {/* Left Content */}
          <div className="flex-1 space-y-10 max-w-2xl relative z-20">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-6"
            >
              <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/40 bg-primary/10 text-primary text-sm font-semibold tracking-wide backdrop-blur-md shadow-[0_0_15px_rgba(124,58,237,0.2)]">
                <span className="relative flex h-3 w-3 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
                Note Vault Pro 2.0 is Live
              </motion.div>

              <motion.h1 variants={fadeIn} className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-dark-text">
                {settings?.heroTitle ? settings.heroTitle.split(' ').slice(0, -2).join(' ') : 'Master Your'} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-accent">
                  {settings?.heroTitle ? settings.heroTitle.split(' ').slice(-2).join(' ') : 'Engineering Exams'}
                </span>
              </motion.h1>

              <motion.p variants={fadeIn} className="text-base sm:text-lg md:text-xl text-dark-muted leading-relaxed max-w-xl">
                {settings?.heroSubtitle || 'The ultimate academic arsenal for engineering students. High-quality structured notes, premium video lectures, and previous year papers curated by top educators.'}
              </motion.p>

              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => navigate('/courses')}
                  className="group relative inline-flex items-center justify-center gap-2 md:gap-3 px-6 py-3.5 md:px-8 md:py-4 bg-white text-black rounded-full font-bold text-base md:text-lg overflow-hidden transition-transform hover:scale-105 active:scale-95"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-10 transition-opacity"></span>
                  Explore Courses
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/courses')}
                  className="inline-flex items-center justify-center gap-2 md:gap-3 px-6 py-3.5 md:px-8 md:py-4 rounded-full border border-dark-border text-dark-text font-medium text-base md:text-lg hover:bg-dark-cardHover backdrop-blur-md transition-colors"
                >
                  <PlayCircle size={20} /> Watch Demo
                </button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div variants={fadeIn} className="pt-8 flex items-center gap-4 text-sm text-gray-500 font-medium">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-[#0a0a0a] overflow-hidden`}>
                      <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex text-yellow-500 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <p>Trusted by <span className="text-dark-text">{globalStats.activeStudents}+</span> students</p>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Content / Floating 3D Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 w-full max-w-lg relative h-[600px] hidden lg:block"
          >
            {/* Card 1 */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute top-10 right-10 w-72 bg-dark-card/80 backdrop-blur-xl border border-dark-border rounded-2xl p-5 shadow-2xl z-20"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Download size={24} />
                </div>
                <div>
                  <h4 className="text-dark-text font-bold">Data Structures</h4>
                  <p className="text-xs text-dark-muted">PDF Notes Downloaded</p>
                </div>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5 mb-2">
                <div className="bg-blue-500 h-1.5 rounded-full w-[85%]"></div>
              </div>
              <p className="text-xs text-right text-blue-400 font-medium">100% Verified</p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-20 left-0 w-80 bg-dark-card/80 backdrop-blur-xl border border-dark-border rounded-2xl p-5 shadow-[0_0_50px_rgba(124,58,237,0.15)] z-30"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-dark-text font-bold flex items-center gap-2">
                  <PlayCircle size={18} className="text-primary" /> Live Lecture
                </h4>
                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded animate-pulse">LIVE</span>
              </div>
              <div className="aspect-video bg-black/50 rounded-lg overflow-hidden relative group">
                <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80" className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500" alt="Video thumbnail" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/40 pl-1">
                    <PlayCircle size={24} className="text-white" />
                  </div>
                </div>
              </div>
              <p className="text-sm text-dark-muted mt-3 font-medium">Machine Learning - Unit 3</p>
            </motion.div>

            {/* Background Decorative Element */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-accent/20 rounded-[40px] blur-3xl opacity-50 z-10"></div>
          </motion.div>
        </div>
      </section>

      {/* ----------------- STATS SECTION ----------------- */}
      <section className="max-w-[1400px] mx-auto w-full px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 relative">
          <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>
          {[
            { icon: Users, label: 'Active Students', value: `${globalStats.activeStudents}+` },
            { icon: BookOpen, label: 'Subject Notes', value: `${globalStats.subjectNotes}+` },
            { icon: PlayCircle, label: 'Video Lectures', value: `${globalStats.videoLectures}+` },
            { icon: Award, label: 'Average Rating', value: globalStats.averageRating }
          ].map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              key={i}
              className="bg-dark-card border border-dark-border p-4 sm:p-6 lg:p-8 rounded-2xl text-center hover:bg-dark-cardHover transition-colors relative group overflow-hidden shadow-sm hover:shadow-md"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-12 h-12 md:w-14 md:h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                <stat.icon size={24} className="md:w-7 md:h-7" />
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-dark-text mb-1 md:mb-2">{stat.value}</h3>
              <p className="text-xs sm:text-sm md:text-base text-dark-muted font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ----------------- FEATURES SHOWCASE ----------------- */}
      <section className="max-w-[1400px] mx-auto w-full px-4 md:px-8 relative">
        <div className="text-center mb-10 md:mb-16 space-y-4">
          <h2 className="text-primary font-bold tracking-widest uppercase text-xs md:text-sm">Why Choose Us</h2>
          <h3 className="text-3xl md:text-5xl font-bold text-dark-text max-w-3xl mx-auto leading-tight">
            Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">score the perfect GPA</span>
          </h3>
          <p className="text-dark-muted max-w-2xl mx-auto text-base md:text-lg">Stop relying on messy WhatsApp groups. Get perfectly organized, high-quality study materials in one place.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(settings?.features?.length > 0 ? settings.features : [
            {
              title: 'Premium PDF Notes',
              desc: 'Handwritten and typed notes perfectly aligned with your university syllabus. Downloadable and beautifully formatted.',
              icon: 'BookOpen',
              color: 'text-blue-400',
              bg: 'bg-blue-400/10',
              border: 'group-hover:border-blue-500/50'
            },
            {
              title: 'Targeted Video Lectures',
              desc: 'Ditch the YouTube distractions. Ad-free, to-the-point lectures covering exact exam topics and numericals.',
              icon: 'Monitor',
              color: 'text-purple-400',
              bg: 'bg-purple-400/10',
              border: 'group-hover:border-purple-500/50'
            },
            {
              title: 'PYQs & Quantums',
              desc: 'Master the exam pattern with year-wise previous question papers and detailed quantum series solutions.',
              icon: 'Zap',
              color: 'text-emerald-400',
              bg: 'bg-emerald-400/10',
              border: 'group-hover:border-emerald-500/50'
            }
          ]).map((feature, i) => {
            const Icon = IconMap[feature.icon] || BookOpen;
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                key={i}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                className={`group relative bg-dark-card border border-dark-border p-6 md:p-8 rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 shadow-sm hover:shadow-lg ${feature.border}`}
              >
                {/* Hover Glow */}
                <div className={`absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm pointer-events-none ${i === 0 ? 'bg-gradient-to-b from-blue-500/20 to-transparent' :
                    i === 1 ? 'bg-gradient-to-b from-purple-500/20 to-transparent' :
                      'bg-gradient-to-b from-emerald-500/20 to-transparent'
                  }`}></div>

                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 transform transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110`}>
                    <Icon size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-dark-text mb-4">{feature.title}</h3>
                  <p className="text-dark-muted leading-relaxed text-lg">{feature.desc}</p>

                  <div className="mt-8 flex items-center text-sm font-bold text-white group-hover:text-primary transition-colors">
                    Explore Feature <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ----------------- HOW IT WORKS ----------------- */}
      <section className="max-w-[1400px] mx-auto w-full px-4 md:px-8 py-10 md:py-16">
        <div className="bg-dark-card border border-dark-border rounded-[30px] md:rounded-[40px] p-6 sm:p-10 md:p-20 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row gap-10 md:gap-16 items-center relative z-10">
            <div className="flex-1 space-y-6 md:space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold text-dark-text leading-tight">
                Your pathway to <br /> <span className="text-primary">academic excellence</span>
              </h2>
              <div className="space-y-5 md:space-y-6">
                {[
                  { step: '01', title: 'Select Your Course', desc: 'Choose your specific degree, branch, and semester.' },
                  { step: '02', title: 'Access Materials', desc: 'Instantly unlock notes, syllabus, and video lectures.' },
                  { step: '03', title: 'Aces Your Exams', desc: 'Study efficiently and score the top grades you deserve.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="flex-shrink-0 w-14 h-14 rounded-full border border-dark-border flex items-center justify-center text-xl font-bold text-dark-muted group-hover:text-primary group-hover:border-primary/50 transition-colors bg-dark-bg">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-dark-text mb-2 group-hover:text-primary transition-colors">{item.title}</h4>
                      <p className="text-dark-muted">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 w-full aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
              <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80" alt="Study Dashboard" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-8">
                <div className="glass-card p-4 flex items-center gap-4 w-full">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <h5 className="text-white font-bold">Progress Tracking</h5>
                    <p className="text-sm text-gray-300">You completed 80% of Physics syllabus!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- TESTIMONIALS ----------------- */}
      <section className="max-w-[1400px] mx-auto w-full px-4 md:px-8 py-10">
        <h2 className="text-3xl md:text-5xl font-bold text-center text-dark-text mb-10 md:mb-16">Loved by thousands of students</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {(settings?.testimonials?.length > 0 ? settings.testimonials : [
            { name: 'Rahul Sharma', role: 'B.Tech CS, 3rd Year', text: 'Note Vault Pro completely changed my study routine. The organized notes saved me hours of searching for materials before finals.' },
            { name: 'Priya Patel', role: 'B.Pharm, 2nd Year', text: 'The video lectures are straight to the point. No fluff, just exactly what you need to write in the exams to get full marks.' },
            { name: 'Ankit Kumar', role: 'MBA, Final Year', text: 'The PYQ section with detailed solutions is a lifesaver. I passed my hardest subjects solely by relying on this portal.' }
          ]).map((test, i) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              key={i}
              className="bg-dark-card border border-dark-border p-8 rounded-3xl relative shadow-md"
            >
              <MessageSquare size={32} className="text-primary/20 absolute top-8 right-8" />
              <div className="flex text-yellow-500 mb-6">
                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} fill="currentColor" />)}
              </div>
              <p className="text-dark-muted text-lg mb-8 leading-relaxed">"{test.text}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                  {test.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-dark-text font-bold">{test.name}</h4>
                  <p className="text-sm text-dark-muted">{test.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ----------------- CTA SECTION ----------------- */}
      <section className="max-w-[1400px] mx-auto w-full px-4 md:px-8 py-10">
        <div className="relative rounded-[30px] md:rounded-[40px] overflow-hidden bg-gradient-to-r from-primary/90 to-purple-600 p-8 sm:p-12 md:p-20 text-center">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
          <div className="relative z-10 max-w-3xl mx-auto space-y-6 md:space-y-8">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white leading-tight">Ready to boost your grades?</h2>
            <p className="text-base sm:text-xl text-white/80">Join 10,000+ students who are already learning smarter and scoring higher with Note Vault Pro.</p>
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 md:px-10 md:py-5 bg-white text-black rounded-full font-bold text-lg md:text-xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)] mt-2"
            >
              Get Started for Free <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </section>

      {/* ----------------- FOOTER ----------------- */}
      <footer className="mt-16 md:mt-20 border-t border-dark-border bg-dark-bg pt-16 md:pt-24 pb-12 relative">
        <div className="max-w-[1400px] mx-auto px-6 md:px-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-12 gap-y-12 md:gap-y-16 mb-16 md:mb-20">

            {/* Brand & CTA */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-xl font-bold text-white shadow-[0_0_20px_rgba(124,58,237,0.4)]">
                  NV
                </div>
                <span className="text-3xl font-extrabold text-dark-text tracking-wide">
                  {settings?.siteName ? settings.siteName.replace(' Pro', '') : 'Note Vault Pro'}<span className="text-primary font-medium">{settings?.siteName?.includes(' Pro') ? 'Pro' : ''}</span>
                </span>
              </div>
              <p className="text-lg text-dark-muted leading-relaxed font-medium max-w-md">
                The most comprehensive, beautifully organized educational content designed specifically for university students to score top grades.
              </p>

              <div className="flex gap-4 pt-2">
                <div className="h-14 w-40 border border-dark-border bg-dark-card rounded-xl flex items-center justify-center text-sm font-medium text-dark-text hover:border-primary/50 hover:bg-primary/10 transition-all cursor-pointer">
                  App Store
                </div>
                <div className="h-14 w-40 border border-dark-border bg-dark-card rounded-xl flex items-center justify-center text-sm font-medium text-dark-text hover:border-primary/50 hover:bg-primary/10 transition-all cursor-pointer">
                  Google Play
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Map className="text-primary" size={24} strokeWidth={2} />
                <h3 className="text-lg font-bold text-dark-text">Platform</h3>
              </div>
              <ul className="space-y-5 text-base font-medium text-dark-muted">
                <li><Link to="/courses" onClick={() => document.getElementById('main-scroll')?.scrollTo(0, 0)} className="hover:text-primary transition-colors block">Courses & Subjects</Link></li>
                <li><Link to="/analytics" onClick={() => document.getElementById('main-scroll')?.scrollTo(0, 0)} className="hover:text-primary transition-colors block">Student Analytics</Link></li>
                <li><Link to="/dashboard" onClick={() => document.getElementById('main-scroll')?.scrollTo(0, 0)} className="hover:text-primary transition-colors block">My Dashboard</Link></li>
              </ul>
            </div>

            {/* Explore Our Courses */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Globe className="text-primary" size={24} strokeWidth={2} />
                <h3 className="text-lg font-bold text-dark-text">Top Courses</h3>
              </div>
              <ul className="space-y-5 text-base font-medium text-dark-muted">
                {courses.length > 0 ? courses.slice(0, 5).map((course) => (
                  <li key={course._id}>
                    <Link to={`/courses?course=${encodeURIComponent(course.name)}&material=Notes`} onClick={() => document.getElementById('main-scroll')?.scrollTo(0, 0)} className="hover:text-primary transition-colors block">
                      {course.name} Notes
                    </Link>
                  </li>
                )) : (
                  <>
                    <li><Link to="/courses?course=B.Tech&material=Notes" onClick={() => document.getElementById('main-scroll')?.scrollTo(0, 0)} className="hover:text-primary transition-colors block">B.Tech Notes</Link></li>
                    <li><Link to="/courses?course=MBA&material=Notes" onClick={() => document.getElementById('main-scroll')?.scrollTo(0, 0)} className="hover:text-primary transition-colors block">MBA Notes</Link></li>
                    <li><Link to="/courses?course=MCA&material=Notes" onClick={() => document.getElementById('main-scroll')?.scrollTo(0, 0)} className="hover:text-primary transition-colors block">MCA Notes</Link></li>
                    <li><Link to="/courses?course=B.Pharm&material=Notes" onClick={() => document.getElementById('main-scroll')?.scrollTo(0, 0)} className="hover:text-primary transition-colors block">B.Pharm Notes</Link></li>
                  </>
                )}
              </ul>
            </div>

            {/* Contact & Socials */}
            <div className="flex flex-col relative">
              <div className="flex items-center gap-3 mb-8">
                <Heart className="text-primary" size={24} strokeWidth={2} />
                <h3 className="text-lg font-bold text-dark-text">Connect</h3>
              </div>
              <div className="mb-8">
                <a href={`mailto:${settings?.supportEmail || 'support@notevaultpro.com'}`} className="text-base font-medium text-dark-muted hover:text-primary transition-colors block mb-4">
                  {settings?.supportEmail || 'support@notevaultpro.com'}
                </a>
                <p className="flex items-center gap-2 text-sm font-medium text-dark-text mb-2">
                  Made with <Heart size={16} className="fill-red-500 text-red-500" /> in India
                </p>
                <p className="text-sm font-bold text-primary">Developer: {settings?.developerName || 'Priyanshu Shakya'}</p>
              </div>

              <div className="flex items-center gap-4 mt-auto">
                <a href={settings?.socialLinks?.instagram || "https://instagram.com/"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-dark-border bg-dark-card flex items-center justify-center text-dark-muted hover:text-dark-text hover:border-primary hover:bg-primary/20 transition-all"><FaInstagram size={18} /></a>
                <a href={settings?.socialLinks?.linkedin || "https://linkedin.com/in/"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-dark-border bg-dark-card flex items-center justify-center text-dark-muted hover:text-dark-text hover:border-primary hover:bg-primary/20 transition-all"><FaLinkedin size={18} /></a>
                <a href={settings?.socialLinks?.youtube || "https://youtube.com/"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-dark-border bg-dark-card flex items-center justify-center text-dark-muted hover:text-dark-text hover:border-primary hover:bg-primary/20 transition-all"><FaYoutube size={18} /></a>
                <a href={settings?.socialLinks?.github || "https://github.com/"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-dark-border bg-dark-card flex items-center justify-center text-dark-muted hover:text-dark-text hover:border-primary hover:bg-primary/20 transition-all"><FaGithub size={18} /></a>
              </div>

            </div>
          </div>

          {/* Bottom Links */}
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-dark-border text-sm text-dark-muted font-medium">
            <div className="flex flex-wrap items-center justify-center gap-6 mb-4 md:mb-0">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Refund Policy</a>
              <a href="#" className="hover:text-primary transition-colors">About Us</a>
            </div>
            <p>© {new Date().getFullYear()} {settings?.siteName || 'Note Vault Pro'}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

