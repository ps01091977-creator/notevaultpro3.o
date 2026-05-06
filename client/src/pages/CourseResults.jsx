import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Grid3X3, List, Download, Eye, PlayCircle, Plus, FileText, FolderOpen, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

const sectionByMaterial = {
  Syllabus: 'syllabus',
  PYQs: 'pyqs',
  Notes: 'notes',
  Quantum: 'quantum',
  'Video Lectures': 'video-lectures'
};

const CourseResults = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const material = params.get('material') || 'Notes';
  const subjectId = params.get('subjectId') || '';
  const subjectName = params.get('subjectName') || 'Subject';
  const section = sectionByMaterial[material] || 'notes';

  const [view, setView] = useState('grid');
  const [items, setItems] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  
  // Folder Creation state
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Upload state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadType, setUploadType] = useState('text');
  const [uploadForm, setUploadForm] = useState({ title: '', content: '', url: '', description: '' });
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const getBackendUrl = () => '';

  const getVideoSource = (video) => video?.youtubeUrl || video?.fileUrl || video?.videoUrl || '';
  const isYoutubeUrl = (url = '') => url.includes('youtube.com') || url.includes('youtu.be');
  const getYoutubeId = (url = '') => {
    if (!isYoutubeUrl(url)) return '';
    try {
      if (url.includes('v=')) return url.split('v=')[1].split('&')[0];
      if (url.includes('youtu.be/')) return url.split('youtu.be/')[1].split('?')[0];
    } catch(e) {}
    return '';
  };
  
  const getThumbnail = (video) => {
    const src = getVideoSource(video);
    if (isYoutubeUrl(src)) {
      const id = getYoutubeId(src);
      if (id) return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    }
    return 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80'; // Default tech thumbnail
  };
  const getPlayableVideoUrl = (url) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    return `${getBackendUrl()}${url.startsWith('/') ? url : `/${url}`}`;
  };

  useEffect(() => {
    const fetchFolders = async () => {
      if (!subjectId) {
        setLoadingFolders(false);
        return;
      }
      try {
        setLoadingFolders(true);
        const { data } = await api.get(`/folders?subject=${subjectId}`);
        setFolders(data);
        
        const urlFolderId = params.get('folderId');
        if (urlFolderId) {
          const folder = data.find(f => f._id === urlFolderId);
          if (folder) setActiveFolder(folder);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingFolders(false);
      }
    };
    fetchFolders();
  }, [subjectId, params]);

  useEffect(() => {
    const fetchData = async () => {
      if (!subjectId || !activeFolder) {
        setItems([]);
        return;
      }
      try {
        setLoadingContent(true);
        if (material === 'Video Lectures') {
          const { data } = await api.get(`/videos?subject=${subjectId}&section=${section}&folder=${activeFolder._id}`);
          setItems(data);
          const urlVideoId = params.get('videoId');
          if (urlVideoId) {
            const vid = data.find(v => v._id === urlVideoId);
            if (vid) setSelectedVideo(vid);
          } else {
            setSelectedVideo(null);
          }
        } else {
          const { data } = await api.get(`/notes?subject=${subjectId}&section=${section}&folder=${activeFolder._id}`);
          setItems(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingContent(false);
      }
    };
    fetchData();
  }, [material, section, subjectId, activeFolder]);

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim() || !subjectId) return;
    try {
      setIsCreatingFolder(true);
      const res = await api.post('/folders', { name: newFolderName, subject: subjectId });
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
    if (!subjectId || !activeFolder) return;
    try {
      setIsUploading(true);
      if (material === 'Video Lectures') {
        let payload = { title: uploadForm.title, description: uploadForm.description, subject: subjectId, folder: activeFolder._id, section, duration: 0 };
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
        setItems((prev) => [data, ...prev]);
        setSelectedVideo(data);
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
          subject: subjectId,
          folder: activeFolder._id,
          section,
          color: ['#7c3aed', '#06b6d4', '#f59e0b', '#ec4899', '#10b981'][Math.floor(Math.random() * 5)]
        };
        const { data } = await api.post('/notes', payload);
        setItems((prev) => [data, ...prev]);
      }
      setIsUploadOpen(false);
      setUploadForm({ title: '', content: '', url: '', description: '' });
      setUploadFile(null);
    } catch (error) {
      console.error(error);
      alert(`Upload failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (activeFolder) {
                setActiveFolder(null);
              } else {
                navigate(-1);
              }
            }} 
            className="p-2.5 rounded-xl bg-dark-bg border border-dark-border text-dark-text hover:bg-primary/10 hover:text-primary transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-dark-text">{subjectName}</h1>
            <p className="text-dark-muted mt-1 text-sm md:text-base">
              {params.get('course')} • {params.get('year')} • Semester {params.get('semester')} • {material}
              {activeFolder && ` • ${activeFolder.name}`}
            </p>
          </div>
        </div>
        
        {activeFolder && (
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex bg-dark-bg border border-dark-border rounded-lg p-1 shadow-sm">
              <button onClick={() => setView('grid')} className={`p-2 rounded-md transition-colors ${view === 'grid' ? 'bg-primary text-white shadow' : 'text-dark-muted hover:text-dark-text'}`}><Grid3X3 size={18} /></button>
              <button onClick={() => setView('list')} className={`p-2 rounded-md transition-colors ${view === 'list' ? 'bg-primary text-white shadow' : 'text-dark-muted hover:text-dark-text'}`}><List size={18} /></button>
            </div>
            {user?.role === 'admin' && (
              <button onClick={() => setIsUploadOpen(true)} className="btn-primary flex items-center gap-2">
                <Plus size={16} />
                <span className="hidden sm:inline">{material === 'Video Lectures' ? 'Upload Video' : 'Upload Content'}</span>
                <span className="sm:hidden">Upload</span>
              </button>
            )}
          </div>
        )}
      </div>

      {!activeFolder ? (
        // Folders View
        <div className="flex-1 flex flex-col overflow-hidden">
          {loadingFolders ? (
            <div className="flex items-center justify-center py-20 text-dark-muted animate-pulse font-medium">Loading folders...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-4">
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
                    <p className="text-xs text-gray-400 mt-1">Open to view {material}</p>
                  </div>
                  {user?.role === 'admin' && (
                    <button 
                      onClick={(e) => handleDeleteFolder(e, folder._id)}
                      className="p-2 text-gray-500 hover:text-red-400 opacity-100 transition-opacity ml-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
              {folders.length === 0 && (
                <div className="col-span-full py-16 text-center text-gray-500 glass-card border border-dark-border border-dashed">
                  <FolderOpen size={48} className="text-dark-muted mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-bold text-dark-text mb-2">No Folders Found</h3>
                  <p className="text-dark-muted">Admin has not created any folders for this subject yet.</p>
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
        // Content View inside Folder
        <div className="flex-1 overflow-y-auto">
          {material === 'Video Lectures' && selectedVideo && (
            <div className="glass-card p-6 md:p-8 border border-dark-border flex flex-col lg:flex-row gap-8 mb-8 relative overflow-hidden rounded-2xl">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>

              {/* Left Column: Details */}
              <div className="flex-1 flex flex-col justify-center relative z-10">
                <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-2 leading-tight">{selectedVideo.title}</h2>
                <p className="text-primary font-bold mb-5 flex items-center gap-2">From Zero to Hero <span role="img" aria-label="rocket">🚀</span></p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-dark-muted mb-8 bg-dark-bg/50 w-fit px-4 py-2 rounded-full border border-dark-border">
                  <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg> English</span>
                  <span className="w-1 h-1 rounded-full bg-dark-border"></span>
                  <span className="flex items-center gap-1.5 text-accent font-medium">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg> 
                    4.9 (1K+ Reviews)
                  </span>
                  <span className="w-1 h-1 rounded-full bg-dark-border"></span>
                  <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Lifetime validity</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {['Structured In-depth Curriculum', 'Practical Learning', 'Interview Preparation Content', 'Real-world Industry Examples'].map((topic, i) => (
                    <div key={i} className="bg-dark-bg/80 border border-dark-border px-4 py-3.5 rounded-xl flex items-center justify-between group hover:border-primary/50 transition-all hover:-translate-y-1 shadow-sm">
                      <span className="text-dark-text text-sm font-medium">{topic}</span>
                      <span className="text-dark-muted text-2xl font-black opacity-20 group-hover:opacity-100 group-hover:text-primary transition-all">0{i+1}</span>
                    </div>
                  ))}
                </div>
                
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-2">
                  <h4 className="text-primary font-bold mb-2">About this Unit</h4>
                  <p className="text-dark-text leading-relaxed text-sm">
                    {selectedVideo.description || 'Dive deep into this subject and master the concepts for your exams with our comprehensive video lectures.'}
                  </p>
                </div>
              </div>

              {/* Right Column: Video Player */}
              <div className="lg:w-[50%] xl:w-[55%] flex flex-col justify-center relative z-10">
                <div className="rounded-2xl overflow-hidden bg-black aspect-video border-2 border-dark-border shadow-[0_0_40px_rgba(124,58,237,0.2)] relative group">
                  {(() => {
                    const src = getVideoSource(selectedVideo);
                    if (isYoutubeUrl(src)) {
                      return (
                        <iframe
                          className="w-full h-full"
                          src={`https://www.youtube.com/embed/${getYoutubeId(src)}?autoplay=1`}
                          title={selectedVideo.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      );
                    }
                    return <video className="w-full h-full" controls playsInline src={getPlayableVideoUrl(src)} autoPlay></video>;
                  })()}
                </div>
                
                <div className="flex gap-4 mt-6">
                  <button className="flex-1 py-3.5 rounded-xl bg-dark-bg border border-primary text-primary font-bold hover:bg-primary/10 transition-colors">
                    View Resources
                  </button>
                  <button 
                    onClick={async () => {
                      try {
                        const maxProgress = selectedVideo.duration || 100;
                        await api.put(`/videos/${selectedVideo._id}/progress`, { watchProgress: maxProgress });
                        setItems(items.map(i => i._id === selectedVideo._id ? { ...i, watchProgress: maxProgress } : i));
                        alert('Marked as completed!');
                      } catch (error) {
                        console.error(error);
                      }
                    }}
                    className="flex-1 py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                  >
                    Mark as Completed
                  </button>
                </div>
              </div>
            </div>
          )}

          {loadingContent ? (
            <div className="flex items-center justify-center py-20 text-dark-muted animate-pulse font-medium">Loading content...</div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center glass-card border border-dark-border border-dashed rounded-2xl">
              <FolderOpen size={48} className="text-dark-muted mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-dark-text mb-2">No {material} Found</h3>
              <p className="text-dark-muted">There is currently no content uploaded for this section in {activeFolder.name}.</p>
            </div>
          ) : (
            <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {items.map((item) => {
                if (material === 'Video Lectures') {
                  const isPlaying = selectedVideo?._id === item._id;
                  return (
                    <div key={item._id} className={`bg-dark-card overflow-hidden border transition-all duration-300 group ${isPlaying ? 'border-primary shadow-[0_0_20px_rgba(124,58,237,0.15)] scale-[1.02]' : 'border-dark-border hover:border-primary/50 hover:-translate-y-1'} ${view === 'list' ? 'flex flex-col sm:flex-row rounded-xl h-auto sm:h-48' : 'flex flex-col rounded-[20px]'}`}>
                      {/* Thumbnail Area */}
                      <div className={`relative bg-black overflow-hidden shrink-0 ${view === 'list' ? 'w-full sm:w-72 sm:h-full aspect-video sm:aspect-auto' : 'aspect-video w-full'}`}>
                        <img src={getThumbnail(item)} alt={item.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-transform duration-500 group-hover:scale-105" />
                        {isPlaying && (
                          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                            <span className="bg-primary text-white px-4 py-2 rounded-full font-bold shadow-lg animate-pulse text-sm">Now Playing</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Card Content */}
                      <div className={`p-4 md:p-5 flex flex-col flex-1 relative bg-gradient-to-b from-dark-card to-dark-bg ${view === 'list' ? 'justify-center' : ''}`}>
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay pointer-events-none"></div>
                        <div className="relative z-10 flex flex-col h-full">
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <h3 className="text-lg font-bold text-dark-text line-clamp-1 flex-1">{item.title}</h3>
                            <div className="flex items-center gap-1 text-accent shrink-0">
                              {[1, 2, 3, 4, 5].map(star => <svg key={star} className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>)}
                              <span className="text-xs text-dark-muted ml-1 font-medium">4.9/5</span>
                            </div>
                          </div>

                          <p className={`text-sm text-dark-muted ${view === 'list' ? 'line-clamp-1 mb-2' : 'line-clamp-2 mb-6'} flex-1 pr-4`}>
                            {item.description || 'Wanna dive deep into this topic? Enroll into this lecture now!'}
                          </p>

                          <div className={`flex items-center justify-between pt-3 border-t border-dark-border mt-auto ${view === 'list' ? 'pb-1' : ''}`}>
                            <div className="flex items-center gap-1.5 text-sm text-dark-muted font-medium">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                              English
                            </div>
                            <button 
                              onClick={async () => {
                                setSelectedVideo(item);
                                document.getElementById('main-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
                                if (!item.watchProgress || item.watchProgress === 0) {
                                  try {
                                    await api.put(`/videos/${item._id}/progress`, { watchProgress: 10 });
                                    setItems(items.map(i => i._id === item._id ? { ...i, watchProgress: 10 } : i));
                                  } catch (e) {}
                                }
                              }}
                              className={`px-5 py-2 rounded-full font-bold text-sm transition-all shadow-md flex items-center gap-2 ${isPlaying ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-primary text-white hover:bg-primary/90 hover:scale-105'}`}
                            >
                              {isPlaying ? 'Playing...' : 'Play Lecture'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                // For Notes, PYQs, etc.
                return (
                  <div key={item._id} className="glass-card p-5 border border-dark-border rounded-xl">
                    <h3 className="font-semibold mb-3 text-dark-text">{item.title}</h3>
                    {item.type === 'pdf' ? (
                    <div className="flex gap-2">
                      <a href={`https://docs.google.com/viewer?url=${encodeURIComponent(item.fileUrl.startsWith('http') ? item.fileUrl : `${getBackendUrl()}${item.fileUrl}`)}`} target="_blank" rel="noreferrer" className="btn-secondary flex items-center gap-2 border border-dark-border">
                        <Eye size={14} />
                        Open
                      </a>
                      <a href={item.fileUrl.startsWith('http') ? item.fileUrl : `${getBackendUrl()}${item.fileUrl}`} download className="btn-primary flex items-center gap-2">
                        <Download size={14} />
                        Download
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-dark-muted line-clamp-4">{item.content || 'No text content available.'}</p>
                  )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {isUploadOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="glass-card w-full max-w-lg p-6 border border-dark-border">
            <h3 className="text-xl font-bold mb-4">{material === 'Video Lectures' ? `Upload Video to ${activeFolder?.name}` : `Upload ${material} to ${activeFolder?.name}`}</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm text-dark-muted mb-1 font-medium">Title (e.g. Unit 1: Introduction)</label>
                <input className="input-field bg-dark-bg" value={uploadForm.title} onChange={(e) => setUploadForm((p) => ({ ...p, title: e.target.value }))} placeholder="Enter title..." required />
              </div>
              {material === 'Video Lectures' && (
                <div>
                  <label className="block text-sm text-dark-muted mb-1 font-medium">Description</label>
                  <textarea className="input-field bg-dark-bg resize-none h-20" value={uploadForm.description} onChange={(e) => setUploadForm((p) => ({ ...p, description: e.target.value }))} placeholder="Brief description of this unit/lecture..." />
                </div>
              )}

              {material === 'Video Lectures' ? (
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
    </div>
  );
};

export default CourseResults;
