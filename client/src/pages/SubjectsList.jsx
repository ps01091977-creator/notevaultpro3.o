import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpen, Plus, Trash2, ArrowLeft } from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

const SubjectsList = () => {
  const { courseId, semester } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New subject state
  const [newSubjectName, setNewSubjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, [courseId, semester]);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      // Fetch subjects for this course and semester (ignoring department now)
      const res = await api.get(`/subjects?semester=${semester}&course=${encodeURIComponent(courseId)}`);
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
        course: courseId,
        semester: parseInt(semester),
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
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(`/course/${courseId}/semesters`)}
          className="p-2 glass-card hover:bg-dark-border text-gray-300 hover:text-white transition-colors rounded-lg"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold">Subjects</h1>
          <p className="text-gray-400">{courseId} - Semester {semester}</p>
        </div>
      </div>

      <div className="glass-card p-6 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto pr-2">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <div className="col-span-full py-16 text-center text-gray-500">
                  No subjects added for this semester yet.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add New Subject Form (Admin Only) */}
        {user?.role === 'admin' && (
          <div className="pt-6 mt-4 border-t border-dark-border">
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
      </div>
    </div>
  );
};

export default SubjectsList;
