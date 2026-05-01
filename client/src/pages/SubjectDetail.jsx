import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookText, Video, Play, FileText, FolderOpen, Plus, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

const SubjectDetail = () => {
  const sectionOptions = [
    { value: 'notes', label: 'Notes' },
    { value: 'pyqs', label: 'PYQs' },
    { value: 'quantum', label: 'Quantum' },
    { value: 'syllabus', label: 'Syllabus' }
  ];
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [folders, setFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState(null);

  const [activeTab, setActiveTab] = useState('notes'); // 'notes' or 'videos'
  const [activeSection, setActiveSection] = useState('notes');
  const [notes, setNotes] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Folder Creation state
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Upload state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadType, setUploadType] = useState('text');
  const [uploadForm, setUploadForm] = useState({ title: '', content: '', url: '', description: '' });
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Viewing states
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);

  const getBackendUrl = () => {
    return '';
  };

  const getVideoUrl = (video) => video?.youtubeUrl || video?.fileUrl || video?.videoUrl || '';
  const getPlayableVideoSrc = (url) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    return `${getBackendUrl()}${url.startsWith('/') ? url : `/${url}`}`;
  };

  useEffect(() => {
    const fetchFolders = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/folders?subject=${id}`);
        setFolders(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFolders();
  }, [id]);

  useEffect(() => {
    const fetchContent = async () => {
      if (!activeFolder) return;
      setLoading(true);
      try {
        const [notesRes, videosRes] = await Promise.all([
          api.get(`/notes?subject=${id}&folder=${activeFolder._id}`),
          api.get(`/videos?subject=${id}&folder=${activeFolder._id}`)
        ]);
        setNotes(notesRes.data);
        setVideos(videosRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [activeFolder, id]);

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      setIsCreatingFolder(true);
      const res = await api.post('/folders', { name: newFolderName, subject: id });
      setFolders([res.data, ...folders]);
      setNewFolderName('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleDeleteFolder = async (e, folderId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this folder? All content inside will be orphaned.')) {
      try {
        await api.delete(`/folders/${folderId}`);
        setFolders(folders.filter(f => f._id !== folderId));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!activeFolder) return;
    try {
      setIsUploading(true);
      if (activeTab === 'videos') {
        let payload = { title: uploadForm.title, description: uploadForm.description, subject: id, folder: activeFolder._id, section: activeSection, duration: 0 };
        if (uploadType === 'file') {
          const formData = new FormData();
          formData.append('file', uploadFile);
          const uploadRes = await api.post('/videos/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
          payload = { ...payload, type: 'upload', fileUrl: uploadRes.data.fileUrl };
        } else {
          const url = uploadForm.url.trim();
          const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
          payload = isYoutube ? { ...payload, type: 'url', youtubeUrl: url } : { ...payload, type: 'upload', fileUrl: url };
        }
        const { data } = await api.post('/videos', payload);
        setVideos((prev) => [data, ...prev]);
      } else {
        let fileUrl = '';
        if (uploadType === 'pdf') {
          const formData = new FormData();
          formData.append('file', uploadFile);
          const uploadRes = await api.post('/notes/upload-pdf', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
          fileUrl = uploadRes.data.fileUrl;
        }
        const payload = {
          title: uploadForm.title,
          content: uploadType === 'text' ? uploadForm.content : '',
          type: uploadType,
          fileUrl,
          subject: id,
          folder: activeFolder._id,
          section: activeSection,
          color: ['#7c3aed', '#06b6d4', '#f59e0b', '#ec4899', '#10b981'][Math.floor(Math.random() * 5)]
        };
        const { data } = await api.post('/notes', payload);
        setNotes((prev) => [data, ...prev]);
      }
      setIsUploadOpen(false);
      setUploadForm({ title: '', content: '', url: '', description: '' });
      setUploadFile(null);
    } catch (error) {
      console.error(error);
      alert('Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const sectionMatches = (item) => {
    const itemSection = item?.section || 'notes';
    return itemSection === activeSection;
  };

  const filteredNotes = notes.filter(sectionMatches);
  const filteredVideos = videos.filter(sectionMatches);

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (activeFolder) {
                setActiveFolder(null);
              } else {
                navigate(-1);
              }
            }}
            className="p-2 glass-card hover:bg-dark-border text-gray-300 hover:text-white transition-colors rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold">{activeFolder ? activeFolder.name : 'Subject Folders'}</h1>
            <p className="text-gray-400">
              {activeFolder ? 'Browse materials in this folder' : 'Select a folder to view contents'}
            </p>
          </div>
        </div>
        
        {activeFolder && user?.role === 'admin' && (
          <button onClick={() => setIsUploadOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            Upload Content
          </button>
        )}
      </div>

      {!activeFolder ? (
        // Folders View
        <div className="flex-1 flex flex-col overflow-hidden">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-4 pr-2">
              {folders.map(folder => (
                <div 
                  key={folder._id}
                  onClick={() => setActiveFolder(folder)}
                  className="glass-card border border-dark-border rounded-xl p-5 flex items-center cursor-pointer hover:border-primary/50 hover:bg-dark-cardHover transition-all group"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mr-4">
                    <FolderOpen size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{folder.name}</h3>
                    <p className="text-xs text-gray-400">Open folder</p>
                  </div>
                  {user?.role === 'admin' && (
                    <button 
                      onClick={(e) => handleDeleteFolder(e, folder._id)}
                      className="p-2 text-gray-500 hover:text-red-400 opacity-100 transition-opacity"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
              {folders.length === 0 && (
                <div className="col-span-full py-16 text-center text-gray-500 glass-card">
                  No folders created for this subject yet.
                </div>
              )}
            </div>
          )}

          {user?.role === 'admin' && (
            <div className="pt-6 mt-auto border-t border-dark-border">
              <form onSubmit={handleCreateFolder} className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="New folder name (e.g. Unit 1)..." 
                  className="input-field flex-1 max-w-sm"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  required
                />
                <button 
                  type="submit" 
                  disabled={isCreatingFolder}
                  className="btn-primary flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus size={18} />
                  {isCreatingFolder ? 'Creating...' : 'Create Folder'}
                </button>
              </form>
            </div>
          )}
        </div>
      ) : (
        // Folder Contents View
        <div className="flex-1 flex flex-col h-full overflow-hidden space-y-6">
          {/* Tabs */}
          <div className="flex p-1 glass-card w-fit rounded-lg">
            <button 
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-medium transition-all ${
                activeTab === 'notes' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <BookText size={18} /> Notes & PDFs
              <span className="ml-2 bg-black/20 px-2 py-0.5 rounded-full text-xs">{notes.filter(n => activeTab==='notes' ? (n.section||'notes')===activeSection : true).length}</span>
            </button>
            <button 
              onClick={() => setActiveTab('videos')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-medium transition-all ${
                activeTab === 'videos' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Video size={18} /> Video Lectures
              <span className="ml-2 bg-black/20 px-2 py-0.5 rounded-full text-xs">{videos.filter(v => activeTab==='videos' ? (v.section||'notes')===activeSection : true).length}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {sectionOptions.map((section) => (
              <button
                key={section.value}
                onClick={() => setActiveSection(section.value)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  activeSection === section.value
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'border-dark-border text-gray-300 hover:border-primary/50'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pb-6 pr-2">
              
              {/* Notes View */}
              {activeTab === 'notes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredNotes.map(note => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={note._id}
                      className="glass-card p-5 flex flex-col group cursor-pointer hover:border-primary/50"
                      style={{ borderTop: `4px solid ${note.color || '#7c3aed'}` }}
                      onClick={() => {
                        if (note.type === 'pdf') {
                          window.open(`${getBackendUrl()}${note.fileUrl}`, '_blank');
                        } else {
                          setSelectedNote(note);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-dark-bg border border-dark-border">
                          {note.type === 'pdf' ? <FileText className="text-red-400" size={20} /> : <BookText className="text-primary" size={20} />}
                        </div>
                        <h3 className="font-bold text-lg line-clamp-1">{note.title}</h3>
                      </div>
                      <p className="text-gray-400 text-sm line-clamp-2 flex-1 mb-4">
                        {note.content ? note.content.replace(/<[^>]*>?/gm, '') : 'No description'}
                      </p>
                      <div className="text-xs text-gray-500 mt-auto pt-4 border-t border-dark-border">
                        Updated: {new Date(note.updatedAt).toLocaleDateString()}
                      </div>
                    </motion.div>
                  ))}
                  {filteredNotes.length === 0 && (
                    <div className="col-span-full py-10 text-center text-gray-500 glass-card border border-dashed border-dark-border">
                      <FileText size={40} className="mx-auto mb-3 text-dark-muted opacity-50" />
                      No {activeSection.toUpperCase()} notes available in this folder.
                    </div>
                  )}
                </div>
              )}

              {/* Videos View */}
              {activeTab === 'videos' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredVideos.map(video => (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={video._id}
                      className="glass-card overflow-hidden group cursor-pointer hover:-translate-y-1 transition-all"
                      onClick={() => setSelectedVideo(video)}
                    >
                      <div className="relative aspect-video bg-gray-800">
                        <img 
                          src={video.thumbnail || "https://images.unsplash.com/photo-1610484826967-09c5720778c7?w=800&q=80"} 
                          alt={video.title}
                          className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/0">
                          <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center text-white shadow-glow transform scale-90 group-hover:scale-110 transition-all">
                            <Play size={20} className="ml-1" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                          {video.title}
                        </h3>
                      </div>
                    </motion.div>
                  ))}
                  {filteredVideos.length === 0 && (
                    <div className="col-span-full py-10 text-center text-gray-500 glass-card border border-dashed border-dark-border">
                      <Video size={40} className="mx-auto mb-3 text-dark-muted opacity-50" />
                      No {activeSection.toUpperCase()} videos available in this folder.
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center px-4">
          <div className="glass-card w-full max-w-lg p-6 border border-dark-border">
            <h3 className="text-xl font-bold mb-4 flex justify-between items-center">
              <span>Upload to {activeFolder?.name}</span>
              <span className="text-sm px-3 py-1 bg-primary/20 text-primary rounded-lg border border-primary/30">
                {activeTab === 'videos' ? 'Video Lecture' : 'Notes/PDF'} • {activeSection}
              </span>
            </h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm text-dark-muted mb-1 font-medium">Title</label>
                <input className="input-field bg-dark-bg" value={uploadForm.title} onChange={(e) => setUploadForm((p) => ({ ...p, title: e.target.value }))} placeholder="Enter title..." required />
              </div>
              {activeTab === 'videos' && (
                <div>
                  <label className="block text-sm text-dark-muted mb-1 font-medium">Description</label>
                  <textarea className="input-field bg-dark-bg resize-none h-20" value={uploadForm.description} onChange={(e) => setUploadForm((p) => ({ ...p, description: e.target.value }))} placeholder="Brief description..." />
                </div>
              )}

              {activeTab === 'videos' ? (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <button type="button" onClick={() => setUploadType('url')} className={`py-2 rounded-lg border transition-colors ${uploadType === 'url' ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-dark-border text-dark-muted hover:bg-dark-bg'}`}>Paste URL</button>
                    <button type="button" onClick={() => setUploadType('file')} className={`py-2 rounded-lg border transition-colors ${uploadType === 'file' ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-dark-border text-dark-muted hover:bg-dark-bg'}`}>Upload File</button>
                  </div>
                  {uploadType === 'url' ? (
                    <input type="url" className="input-field" value={uploadForm.url} onChange={(e) => setUploadForm((p) => ({ ...p, url: e.target.value }))} placeholder="YouTube or direct video URL" required />
                  ) : (
                    <input type="file" accept="video/mp4,video/webm,video/ogg" className="input-field py-2" onChange={(e) => setUploadFile(e.target.files[0])} required />
                  )}
                </>
              ) : (
                <>
                  <div className="flex gap-3 mb-2">
                    <button type="button" onClick={() => setUploadType('text')} className={`flex-1 py-2 rounded-lg border transition-colors ${uploadType === 'text' ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-dark-border text-dark-muted hover:bg-dark-bg'}`}>Text Content</button>
                    <button type="button" onClick={() => setUploadType('pdf')} className={`flex-1 py-2 rounded-lg border transition-colors ${uploadType === 'pdf' ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-dark-border text-dark-muted hover:bg-dark-bg'}`}>PDF File</button>
                  </div>
                  {uploadType === 'text' ? (
                    <textarea className="input-field h-28 resize-none" value={uploadForm.content} onChange={(e) => setUploadForm((p) => ({ ...p, content: e.target.value }))} required />
                  ) : (
                    <input type="file" accept=".pdf" className="input-field py-2" onChange={(e) => setUploadFile(e.target.files[0])} required />
                  )}
                </>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsUploadOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isUploading} className="btn-primary flex items-center gap-2">
                  <FileText size={16} />
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Note View Modal */}
      {selectedNote && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="glass-card w-full max-w-2xl max-h-[85vh] flex flex-col relative overflow-hidden">
            <div className="p-6 border-b border-dark-border flex justify-between items-center bg-dark-bg/50">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BookText className="text-primary" /> 
                {selectedNote.title}
              </h2>
              <button onClick={() => setSelectedNote(null)} className="p-2 rounded-lg hover:bg-dark-border text-gray-400 hover:text-white transition-colors">
                <ArrowLeft size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 whitespace-pre-wrap text-gray-200 leading-relaxed">
              {selectedNote.content}
            </div>
          </div>
        </div>
      )}

      {/* Video View Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <div className="w-full max-w-5xl relative">
            <button onClick={() => setSelectedVideo(null)} className="absolute -top-12 right-0 p-2 text-gray-400 hover:text-white transition-colors">
              Close <ArrowLeft className="inline ml-1 rotate-180" size={20} />
            </button>
            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-dark-border">
              {(() => {
                const videoUrl = getVideoUrl(selectedVideo);

                if (!videoUrl) {
                  return (
                    <div className="w-full h-full flex items-center justify-center text-white text-center px-6">
                      Unable to load this video. The source URL is missing.
                    </div>
                  );
                }

                const isYoutube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
                const youtubeId = isYoutube
                  ? videoUrl.includes('v=')
                    ? videoUrl.split('v=')[1].split('&')[0]
                    : videoUrl.split('youtu.be/')[1].split('?')[0]
                  : null;

                return isYoutube ? (
                  <iframe 
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video 
                    className="w-full h-full" 
                    controls 
                    autoPlay
                    src={getPlayableVideoSrc(videoUrl)}
                  ></video>
                );
              })()}
            </div>
            <h2 className="text-2xl font-bold mt-4">{selectedVideo.title}</h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectDetail;
