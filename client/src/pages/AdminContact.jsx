import React, { useEffect, useState } from 'react';
import { Mail, CheckCircle2, Trash2, Search, Inbox, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

const AdminContact = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/contact');
      setMessages(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/contact/${id}/read`);
      setMessages(messages.map(msg => msg._id === id ? { ...msg, status: 'read' } : msg));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await api.delete(`/contact/${id}`);
        setMessages(messages.filter(msg => msg._id !== id));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const filteredMessages = messages.filter(msg => 
    msg.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-text flex items-center gap-2">
            <Inbox className="text-primary" /> Enquiries
          </h1>
          <p className="text-dark-muted text-sm mt-1">Manage inquiries and support requests from users.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search messages..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
      </div>

      <div className="flex-1 glass-card border border-dark-border overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-dark-bg border border-dark-border flex items-center justify-center text-dark-muted mb-4">
              <Mail size={32} />
            </div>
            <h3 className="text-xl font-bold text-dark-text mb-2">No messages found</h3>
            <p className="text-dark-muted">When users contact you, their messages will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-dark-bg border-b border-dark-border">
                  <th className="p-4 text-sm font-semibold text-dark-muted">Status</th>
                  <th className="p-4 text-sm font-semibold text-dark-muted">User</th>
                  <th className="p-4 text-sm font-semibold text-dark-muted">Subject & Message</th>
                  <th className="p-4 text-sm font-semibold text-dark-muted">Date</th>
                  <th className="p-4 text-sm font-semibold text-dark-muted text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredMessages.map((msg) => (
                    <motion.tr 
                      key={msg._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`border-b border-dark-border/50 transition-colors ${msg.status === 'unread' ? 'bg-primary/5' : 'hover:bg-dark-bg/50'}`}
                    >
                      <td className="p-4 align-top">
                        {msg.status === 'unread' ? (
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold border border-accent/20 w-fit">
                            <AlertCircle size={14} /> New
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-dark-bg text-dark-muted text-xs font-bold border border-dark-border w-fit">
                            Read
                          </span>
                        )}
                      </td>
                      <td className="p-4 align-top">
                        <div className="font-semibold text-dark-text">{msg.name}</div>
                        <a href={`mailto:${msg.email}`} className="text-sm text-primary hover:underline">{msg.email}</a>
                      </td>
                      <td className="p-4 align-top max-w-md">
                        <div className="font-semibold text-dark-text mb-1">{msg.subject}</div>
                        <p className="text-sm text-dark-muted whitespace-pre-wrap">{msg.message}</p>
                      </td>
                      <td className="p-4 align-top whitespace-nowrap text-sm text-dark-muted">
                        {new Date(msg.createdAt).toLocaleDateString()} <br />
                        <span className="text-xs">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                      <td className="p-4 align-top text-right space-x-2">
                        {msg.status === 'unread' && (
                          <button 
                            onClick={() => handleMarkAsRead(msg._id)}
                            className="p-2 bg-dark-bg border border-dark-border rounded-lg text-primary hover:bg-primary/10 transition-colors"
                            title="Mark as Read"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(msg._id)}
                          className="p-2 bg-dark-bg border border-dark-border rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContact;
