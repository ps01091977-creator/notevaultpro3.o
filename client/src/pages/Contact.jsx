import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import api from '../api/axios';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/contact', formData);
      setIsSent(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setIsSent(false), 5000);
    } catch (error) {
      console.error(error);
      alert('Failed to send message. Please try again later.');
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
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
          GET IN TOUCH
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-dark-text">
          Let's <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Connect</span>
        </h1>
        <p className="text-lg md:text-xl text-dark-muted max-w-2xl mx-auto leading-relaxed">
          Have a question, need support, or want to collaborate? We'd love to hear from you. Drop us a message below.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        
        {/* Contact Information Cards */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="lg:col-span-1 space-y-6"
        >
          <div className="glass-card p-8 border border-dark-border h-full flex flex-col justify-center space-y-10">
            <div>
              <h3 className="text-2xl font-bold text-dark-text mb-6">Contact Details</h3>
              <p className="text-dark-muted mb-8 leading-relaxed">
                Reach out to us through any of the following channels. We usually respond within 24 hours.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-sm text-dark-muted font-medium mb-1">Email Us</p>
                  <a href={`mailto:ps01091977@gmail.com`} className="text-lg font-bold text-dark-text hover:text-primary transition-colors truncate block max-w-[200px]">
                    ps01091977@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-sm text-dark-muted font-medium mb-1">Call Us</p>
                  <a href={`tel:9557401677`} className="text-lg font-bold text-dark-text hover:text-accent transition-colors">
                    +91 9557401677
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 flex-shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-sm text-dark-muted font-medium mb-1">Location</p>
                  <p className="text-lg font-bold text-dark-text">
                    Noida sec-62
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="lg:col-span-2"
        >
          <div className="glass-card p-8 md:p-10 border border-dark-border relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-8">
              <MessageSquare className="text-primary" size={28} />
              <h2 className="text-2xl font-bold text-dark-text">Send a Message</h2>
            </div>

            {isSent ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center space-y-4"
              >
                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send size={32} />
                </div>
                <h3 className="text-2xl font-bold text-green-500">Message Sent!</h3>
                <p className="text-dark-text">Thank you for reaching out. We will get back to you shortly.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-dark-text ml-1">Your Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="input-field" 
                      placeholder="John Doe" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-dark-text ml-1">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="input-field" 
                      placeholder="john@example.com" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark-text ml-1">Subject</label>
                  <input 
                    type="text" 
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="input-field" 
                    placeholder="How can we help you?" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark-text ml-1">Message</label>
                  <textarea 
                    required
                    rows="5"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="input-field resize-none" 
                    placeholder="Write your message here..."
                  ></textarea>
                </div>

                <button type="submit" className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2">
                  Send Message <Send size={20} />
                </button>
              </form>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Contact;
