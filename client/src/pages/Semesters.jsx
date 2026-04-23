import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, X, Plus, BookOpen, Trash2 } from 'lucide-react';
import api from '../api/axios';

import { useAuthStore } from '../store/authStore';

const Semesters = () => {
  const { user } = useAuthStore();
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // New subject state
  const [newSubjectName, setNewSubjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const openSemester = async (sem) => {
    setSelectedSemester(sem);
    fetchSubjects(sem);
  };

  const fetchSubjects = async (sem) => {
    setLoading(true);
    try {
      const res = await api.get(`/subjects?semester=${sem}`);
      setSubjects(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    
    setIsCreating(true);
    try {
      const res = await api.post('/subjects', {
        name: newSubjectName,
        semester: selectedSemester,
        color: ['#7c3aed', '#06b6d4', '#f59e0b', '#ec4899', '#10b981'][Math.floor(Math.random() * 5)],
        emoji: '📚'
      });
      setSubjects([...subjects, res.data]);
      setNewSubjectName('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSubject = async (e, id) => {
    e.stopPropagation();
    if(window.confirm("Are you sure you want to delete this subject?")) {
      try {
        await api.delete(`/subjects/${id}`);
        setSubjects(subjects.filter(s => s._id !== id));
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 relative">
      <div>
        <h1 className="text-3xl font-bold">Semesters</h1>
        <p className="text-gray-400">Select your semester to access subjects, videos, and notes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {semesters.map((sem) => (
          <motion.div
            key={sem}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openSemester(sem)}
            className="glass-card p-8 flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/30 transition-colors"></div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white mb-4 shadow-lg group-hover:shadow-glow transition-all">
              <GraduationCap size={32} />
            </div>
            <h2 className="text-2xl font-bold">Semester {sem}</h2>
            <p className="text-gray-400 mt-2 text-sm group-hover:text-primary transition-colors">View Subjects →</p>
          </motion.div>
        ))}
      </div>

      {/* Subjects Modal */}
      <AnimatePresence>
        {selectedSemester && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSemester(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card w-full max-w-3xl max-h-[85vh] flex flex-col relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-dark-border flex justify-between items-center bg-dark-bg/50">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <GraduationCap className="text-primary" /> 
                    Semester {selectedSemester} Subjects
                  </h2>
                  <p className="text-sm text-gray-400">Select a subject to view its materials</p>
                </div>
                <button 
                  onClick={() => setSelectedSemester(null)}
                  className="p-2 rounded-lg hover:bg-dark-border text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subjects.map(subject => (
                      <div 
                        key={subject._id}
                        onClick={() => navigate(`/subjects/${subject._id}`)}
                        className="bg-[#161622] border border-dark-border rounded-xl p-4 flex items-center cursor-pointer hover:border-primary/50 hover:bg-dark-cardHover transition-all group"
                      >
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl mr-4" style={{ backgroundColor: `${subject.color}20` }}>
                          {subject.emoji}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{subject.name}</h3>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <BookOpen size={12} /> Access Materials
                          </p>
                        </div>
                        {user?.role === 'admin' && (
                          <button 
                            onClick={(e) => handleDeleteSubject(e, subject._id)}
                            className="p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    ))}

                    {subjects.length === 0 && (
                      <div className="col-span-full py-8 text-center text-gray-500">
                        No subjects added for this semester yet.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Add New Subject Form (Admin Only) */}
              {user?.role === 'admin' && (
                <div className="p-6 border-t border-dark-border bg-dark-bg/50">
                  <form onSubmit={handleCreateSubject} className="flex gap-3">
                    <input 
                      type="text" 
                      placeholder="Add new subject name..." 
                      className="input-field flex-1"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      required
                    />
                    <button 
                      type="submit" 
                      disabled={isCreating}
                      className="btn-primary flex items-center gap-2 whitespace-nowrap"
                    >
                      <Plus size={18} />
                      {isCreating ? 'Adding...' : 'Add Subject'}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Semesters;
