import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Video, FileText, BarChart3, Layers, Clock, ShieldCheck, CheckCircle2, Monitor, Zap, Star, Users, Globe, Award } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';

const IconMap = {
  BookOpen, Video, FileText, BarChart3, Layers, Clock, Monitor, Zap, Star, Users, Globe, Award
};

const FeaturesServices = () => {
  const { settings } = useSettingsStore();

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.1 } }
  };

  const features = settings?.features?.length > 0 ? settings.features : [
    { title: 'Structured Notes Library', desc: 'Access course, year, semester and subject-wise notes instantly. No more digging through unorganized folders.', icon: 'BookOpen', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Video Lecture Bank', desc: 'Topic-level lecture organization with clean study paths. High-quality ad-free learning experience.', icon: 'Video', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'PYQs & Quantum Packs', desc: 'Previous year papers and quick-revision bundles in one place to master your university exam patterns.', icon: 'FileText', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Study Insights & Tracking', desc: 'Track your learning activity, measure your progress, and improve your consistency week over week.', icon: 'BarChart3', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { title: 'Hierarchical Navigation', desc: 'Seamlessly drill down from your degree program all the way to specific chapters and topics.', icon: 'Layers', color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { title: 'Always Available', desc: '24/7 access to all materials from any device. Your study companion anytime, anywhere.', icon: 'Clock', color: 'text-cyan-500', bg: 'bg-cyan-500/10' }
  ];

  return (
    <div className="h-full flex flex-col gap-12 max-w-6xl mx-auto pb-10">
      
      {/* Hero Section */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="text-center space-y-6 pt-10"
      >
        <span className="px-4 py-1.5 rounded-full bg-accent/10 text-accent font-semibold text-sm tracking-wide">
          WHAT WE OFFER
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-dark-text">
          Powerful Features for <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">Smarter Preparation</span>
        </h1>
        <p className="text-lg md:text-xl text-dark-muted max-w-2xl mx-auto leading-relaxed">
          Everything you need to excel in your academics. We provide a comprehensive suite of tools and resources designed specifically for engineering students.
        </p>
      </motion.div>

      {/* Main Features Grid */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
      >
        {features.map((item, index) => {
          const Icon = IconMap[item.icon] || BookOpen;
          return (
          <motion.div 
            variants={fadeIn} 
            key={index} 
            className="glass-card border border-dark-border p-8 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
          >
            <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <Icon size={28} />
            </div>
            <h3 className="text-xl font-bold text-dark-text mb-3">{item.title}</h3>
            <p className="text-dark-muted leading-relaxed">{item.desc}</p>
          </motion.div>
        )})}
      </motion.div>

      {/* Premium Services Banner */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="mt-8 relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-primary/10 to-accent/10 border border-dark-border p-8 md:p-12"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <ShieldCheck size={200} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="space-y-4 max-w-xl">
            <h2 className="text-3xl font-bold text-dark-text flex items-center gap-3">
              <Sparkles className="text-accent" /> Premium Services & Extensions
            </h2>
            <p className="text-dark-muted text-lg leading-relaxed">
              Need custom modules like branch-specific filters, premium access controls, or batch-wise content visibility? Note Vault Pro is built with scalability in mind.
            </p>
          </div>
          <div className="flex-shrink-0">
            <ul className="space-y-3">
              {['Custom Dashboards', 'Role-based Access', 'Analytics API', 'White-labeling'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-dark-text font-medium">
                  <CheckCircle2 size={20} className="text-primary" /> {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

    </div>
  );
};

export default FeaturesServices;
