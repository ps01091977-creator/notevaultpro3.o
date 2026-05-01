import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, X, Plus, BookOpen, Trash2 } from 'lucide-react';
import api from '../api/axios';

import { useAuthStore } from '../store/authStore';

const Semesters = () => {
  const { user } = useAuthStore();
  const [coursesList, setCoursesList] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [newSubjectName, setNewSubjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await api.get('/courses');
        setCoursesList(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  const openSemester = async (sem) => {
    setSelectedSemester(sem);
    fetchSubjects(sem, selectedCourse.name);
  };

  const fetchSubjects = async (sem, courseCode = selectedCourse.name) => {
    setLoading(true);
    try {
      const res = await api.get(`/subjects?semester=${sem}&course=${encodeURIComponent(courseCode)}`);
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
        course: selectedCourse.name,
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
        <h1 className="text-3xl font-bold">Courses & Semesters</h1>
        <p className="text-gray-400">Select course, then semester, then subjects (Course → Semester → Subject)</p>
      </div>

      <div className={`grid grid-cols-2 gap-6 ${!selectedCourse ? 'flex-1 grid-rows-2 min-h-[70vh]' : ''}`}>
        {loadingCourses ? (
          <div className="col-span-2 flex justify-center py-10">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          coursesList.map((course) => (
            <motion.div
              key={course._id}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedCourse(course);
                setSelectedSemester(null);
                setSubjects([]);
              }}
              className={`glass-card flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden border ${
                selectedCourse?.name === course.name ? 'border-primary shadow-[0_0_20px_rgba(124,58,237,0.3)]' : 'border-dark-border'
              } ${selectedCourse ? 'py-6' : 'h-full'}`}
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/30 transition-colors"></div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white mb-4 shadow-lg group-hover:shadow-glow transition-all">
                <GraduationCap size={32} />
              </div>
              <h2 className="text-2xl font-bold">{course.name}</h2>
              <p className="text-gray-400 mt-2 text-sm group-hover:text-primary transition-colors">{course.maxSemesters} Semesters</p>
            </motion.div>
          ))
        )}
      </div>

      {selectedCourse && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{selectedCourse.name} Semesters</h2>
            <span className="text-sm text-gray-400">Select a semester</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {Array.from({ length: selectedCourse.maxSemesters }, (_, i) => i + 1).map((sem) => (
              <button
                key={sem}
                onClick={() => openSemester(sem)}
                className={`rounded-lg border px-4 py-3 text-center font-semibold transition-colors ${
                  selectedSemester === sem
                    ? 'border-primary bg-primary/20 text-primary'
                    : 'border-dark-border bg-[#161622] text-gray-200 hover:border-primary/60'
                }`}
              >
                Sem {sem}
              </button>
            ))}
          </div>
        </motion.div>
      )}

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
                    {selectedCourse.name} - Semester {selectedSemester} Subjects
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
                            className="p-2 text-gray-500 hover:text-red-400 opacity-100 transition-opacity"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    ))}

                    {subjects.length === 0 && (
                      <div className="col-span-full py-8 text-center text-gray-500">
                        No subjects added for this course/semester yet.
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
