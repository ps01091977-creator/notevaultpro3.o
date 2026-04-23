import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, MoreVertical, Pin, Trash2, Edit2, FileText, Grid, List, BookText } from 'lucide-react';
import api from '../api/axios';

import { useAuthStore } from '../store/authStore';

const Notes = () => {
  const { user } = useAuthStore();
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', subject: '', type: 'text' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedNoteView, setSelectedNoteView] = useState(null);

  const getBackendUrl = () => {
    return import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
  };

  useEffect(() => {
    fetchNotes();
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get('/subjects');
      setSubjects(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await api.get('/notes');
      setNotes(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePin = async (id) => {
    try {
      await api.post(`/notes/${id}/pin`);
      fetchNotes();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        await api.delete(`/notes/${id}`);
        setNotes(notes.filter(n => n._id !== id));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const filteredNotes = notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Notes</h1>
          <p className="text-gray-400">Manage and organize your study materials</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search notes..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 h-10"
            />
          </div>
          <div className="flex bg-dark-card border border-dark-border rounded-lg p-1">
            <button 
              onClick={() => setView('grid')}
              className={`p-1.5 rounded-md ${view === 'grid' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={() => setView('list')}
              className={`p-1.5 rounded-md ${view === 'list' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <List size={18} />
            </button>
          </div>
          {user?.role === 'admin' && (
            <button onClick={() => setIsAddingNote(true)} className="btn-primary flex items-center gap-2 h-10">
              <Plus size={18} />
              <span>New Note</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className={`flex-1 overflow-y-auto ${view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 content-start' : 'space-y-4'}`}>
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={note._id}
                className={`glass-card p-5 relative group ${view === 'list' ? 'flex items-center gap-4' : 'flex flex-col min-h-[200px]'}`}
                style={{ borderTop: `4px solid ${note.color || '#7c3aed'}` }}
              >
                <div 
                  className="flex flex-col flex-1 group cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => {
                    if (note.type === 'pdf') {
                      window.open(`${getBackendUrl()}${note.fileUrl}`, '_blank');
                    } else {
                      setSelectedNoteView(note);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {note.type === 'pdf' ? <FileText className="text-red-400" size={20} /> : <BookText className="text-primary" size={20} />}
                      <h3 className="font-bold text-lg truncate max-w-[200px]">{note.title}</h3>
                    </div>
                    {user?.role === 'admin' && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                        <button onClick={() => handlePin(note._id)} className={`p-1.5 rounded-md hover:bg-dark-border ${note.isPinned ? 'text-accent' : 'text-gray-400'}`}>
                          <Pin size={16} />
                        </button>
                        <button onClick={() => handleDelete(note._id)} className="p-1.5 rounded-md hover:bg-dark-border text-red-400">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={`flex-1 text-gray-400 text-sm ${view === 'list' ? 'line-clamp-1' : 'line-clamp-4 mb-4'}`}>
                    {note.content ? note.content.replace(/<[^>]*>?/gm, '') : 'No content...'}
                  </div>
                </div>

                <div className={`flex items-center justify-between mt-auto ${view === 'list' ? 'w-48' : ''}`}>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-dark-bg text-gray-300 border border-dark-border">
                    {note.subject?.name || 'General'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                {note.isPinned && (
                  <div className="absolute top-0 right-4 w-4 h-6 bg-accent opacity-20 rounded-b-sm"></div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredNotes.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-500">
              No notes found. Create your first note!
            </div>
          )}
        </div>
      )}

      {/* Add Note Modal */}
      {isAddingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="glass-card w-full max-w-lg p-6 relative">
            <h2 className="text-2xl font-bold mb-4">Add New Note</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (newNote.type === 'pdf' && !selectedFile) {
                alert('Please select a PDF file to upload.');
                return;
              }
              
              setIsSubmitting(true);
              try {
                let fileUrl = '';
                if (newNote.type === 'pdf' && selectedFile) {
                  const formData = new FormData();
                  formData.append('file', selectedFile);
                  const uploadRes = await api.post('/notes/upload-pdf', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                  });
                  fileUrl = uploadRes.data.fileUrl;
                }

                const { data } = await api.post('/notes', {
                  ...newNote,
                  fileUrl,
                  color: ['#7c3aed', '#06b6d4', '#f59e0b', '#ec4899', '#10b981'][Math.floor(Math.random() * 5)]
                });
                setNotes([data, ...notes]);
                setIsAddingNote(false);
                setNewNote({ title: '', content: '', subject: '', type: 'text' });
                setSelectedFile(null);
              } catch (error) {
                console.error(error);
              } finally {
                setIsSubmitting(false);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                <input 
                  type="text" required
                  value={newNote.title} onChange={e => setNewNote({...newNote, title: e.target.value})}
                  className="input-field" placeholder="Note title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Subject</label>
                <select 
                  required value={newNote.subject} onChange={e => setNewNote({...newNote, subject: e.target.value})}
                  className="input-field"
                >
                  <option value="" disabled>Select a subject</option>
                  {subjects.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
                </select>
              </div>

              <div className="flex gap-4 mb-2">
                <button 
                  type="button"
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${newNote.type === 'text' ? 'bg-primary/20 border-primary text-primary' : 'border-dark-border text-gray-400 hover:border-gray-500'}`}
                  onClick={() => setNewNote({...newNote, type: 'text'})}
                >Text Note</button>
                <button 
                  type="button"
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${newNote.type === 'pdf' ? 'bg-red-500/20 border-red-500 text-red-400' : 'border-dark-border text-gray-400 hover:border-gray-500'}`}
                  onClick={() => setNewNote({...newNote, type: 'pdf'})}
                >PDF Upload</button>
              </div>

              {newNote.type === 'text' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Content (Text)</label>
                  <textarea 
                    required value={newNote.content} onChange={e => setNewNote({...newNote, content: e.target.value})}
                    className="input-field h-32 resize-none" placeholder="Write your note here..."
                  ></textarea>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Upload PDF File</label>
                  <input 
                    type="file" accept=".pdf" required
                    onChange={e => setSelectedFile(e.target.files[0])}
                    className="input-field py-2 bg-[#161622] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-accent"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsAddingNote(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Note View Modal */}
      {selectedNoteView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="glass-card w-full max-w-2xl max-h-[85vh] flex flex-col relative z-10 overflow-hidden">
            <div className="p-6 border-b border-dark-border flex justify-between items-center bg-dark-bg/50">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BookText className="text-primary" /> 
                {selectedNoteView.title}
              </h2>
              <button onClick={() => setSelectedNoteView(null)} className="p-2 rounded-lg hover:bg-dark-border text-gray-400 hover:text-white transition-colors">
                <MoreVertical size={20} className="rotate-90" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 whitespace-pre-wrap text-gray-200 leading-relaxed">
              {selectedNoteView.content}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Notes;
