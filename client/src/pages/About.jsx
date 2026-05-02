import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Target, Users, Zap, Shield, Award } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';

const About = () => {
  const { settings } = useSettingsStore();
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="h-full flex flex-col gap-12 max-w-6xl mx-auto pb-10">
      
      {/* Hero Section */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="text-center space-y-6 pt-10"
      >
        <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-sm tracking-wide">
          ABOUT {settings?.siteName?.toUpperCase() || 'NOTE VAULT PRO'}
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-dark-text">
          Redefining <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Digital Learning</span>
        </h1>
        <p className="text-lg md:text-xl text-dark-muted max-w-3xl mx-auto leading-relaxed">
          {settings?.aboutMission || 'We are on a mission to democratize quality education. By eliminating clutter and organizing materials logically, we empower engineering students to focus purely on learning and scoring high.'}
        </p>
      </motion.div>

      {/* Stats/Highlight Row */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6"
      >
        {[
          { icon: Users, label: "Active Learners", value: "10K+" },
          { icon: BookOpen, label: "Study Resources", value: "500+" },
          { icon: Target, label: "Success Rate", value: "98%" },
        ].map((stat, i) => (
          <motion.div variants={fadeIn} key={i} className="glass-card p-8 border border-dark-border text-center flex flex-col items-center group hover:-translate-y-1 transition-transform">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
              <stat.icon size={32} />
            </div>
            <h3 className="text-4xl font-black text-dark-text mb-2">{stat.value}</h3>
            <p className="text-dark-muted font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Story Section */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="bg-dark-card border border-dark-border rounded-[2rem] p-10 md:p-16 flex flex-col md:flex-row items-center gap-12 mt-8 shadow-sm"
      >
        <div className="flex-1 space-y-6">
          <h2 className="text-3xl font-bold text-dark-text">Our Story</h2>
          <p className="text-dark-muted leading-relaxed text-lg whitespace-pre-line">
            {settings?.aboutStory || `Note Vault Pro was born out of a simple frustration: finding the right study material before exams was harder than actually studying it.\nStudents spent hours scrolling through endless WhatsApp groups and unorganized Google Drives.\n\nWe built this platform to bring order to chaos. Our unique hierarchical architecture ensures that every PDF, every syllabus, and every video lecture is exactly where you expect it to be.`}
          </p>
        </div>
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full"></div>
          <img 
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80" 
            alt="Students studying together" 
            className="w-full h-auto rounded-2xl relative z-10 border border-dark-border shadow-xl"
          />
        </div>
      </motion.div>

      {/* Values Section */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
        className="mt-12"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-dark-text mb-4">Core Values</h2>
          <p className="text-dark-muted">The principles that guide everything we build.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Zap, title: "Speed & Efficiency", desc: "No delays, no clutter. Find what you need in under 3 clicks." },
            { icon: Shield, title: "Quality Assured", desc: "Every piece of content is verified by toppers and educators." },
            { icon: Award, title: "Excellence", desc: "We strive to deliver the absolute best learning experience possible." }
          ].map((val, i) => (
            <motion.div variants={fadeIn} key={i} className="glass-card p-8 border border-dark-border hover:border-primary/50 transition-colors">
              <val.icon size={36} className="text-primary mb-6" />
              <h3 className="text-xl font-bold text-dark-text mb-3">{val.title}</h3>
              <p className="text-dark-muted leading-relaxed">{val.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

    </div>
  );
};

export default About;
