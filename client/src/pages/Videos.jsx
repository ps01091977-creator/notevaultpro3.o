import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Plus, Search, FolderOpen, Clock } from 'lucide-react';
import api from '../api/axios';

import { useAuthStore } from '../store/authStore';

const Videos = () => {
  const { user } = useAuthStore();
  const [videos, setVideos] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [newVideo, setNewVideo] = useState({ title: '', videoUrl: '', subject: '' });
  const [uploadType, setUploadType] = useState('url'); // 'url' or 'file'
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVideoView, setSelectedVideoView] = useState(null);
  const [playbackError, setPlaybackError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const getBackendUrl = () => {
    return import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
  };

  const getVideoUrl = (video) => video.youtubeUrl || video.fileUrl || video.videoUrl || '';
  const getPlayableVideoSrc = (url) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    return `${getBackendUrl()}${url.startsWith('/') ? url : `/${url}`}`;
  };

  useEffect(() => {
    fetchVideos();
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

  const fetchVideos = async () => {
    try {
      const res = await api.get('/videos');
      setVideos(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!videoId || isDeleting) return;
    const confirmed = window.confirm('Are you sure you want to delete this video?');
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await api.delete(`/videos/${videoId}`);
      setVideos((prev) => prev.filter((video) => video._id !== videoId));
      setSelectedVideoView(null);
      setPlaybackError('');
    } catch (error) {
      console.error(error);
      alert('Failed to delete video. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Video Lectures</h1>
          <p className="text-gray-400">Watch, track, and manage your video resources</p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={() => setIsAddingVideo(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            <span>Add Video</span>
          </button>
        )}
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search videos..." 
            className="input-field pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <motion.div
              key={video._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card overflow-hidden group cursor-pointer hover:-translate-y-1 transition-all duration-300"
              onClick={() => {
                setPlaybackError('');
                setSelectedVideoView(video);
              }}
            >
              <div className="relative aspect-video bg-gray-800">
                <img 
                  src={video.thumbnail || "https://images.unsplash.com/photo-1610484826967-09c5720778c7?w=800&q=80"} 
                  alt={video.title}
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/0 transition-colors">
                  <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center text-white shadow-[0_0_15px_rgba(124,58,237,0.5)] transform scale-90 group-hover:scale-110 transition-all duration-300">
                    <Play size={24} className="ml-1" />
                  </div>
                </div>
                {/* Duration */}
                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-medium text-white">
                  {Math.floor((video.duration || 0) / 60)}:{((video.duration || 0) % 60).toString().padStart(2, '0')}
                </div>
                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-dark-bg">
                  <div 
                    className="h-full bg-accent" 
                    style={{ width: `${(video.watchProgress / (video.duration || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg line-clamp-2 leading-tight mb-2 group-hover:text-primary transition-colors">
                  {video.title}
                </h3>
                <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <FolderOpen size={14} />
                    {video.subject?.name || 'General'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(video.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
          {videos.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-500">
              No videos found. Add your first video lecture!
            </div>
          )}
        </div>
      )}

      {/* Add Video Modal */}
      {isAddingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="glass-card w-full max-w-lg p-6 relative">
            <h2 className="text-2xl font-bold mb-4">Add Video Lecture</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (uploadType === 'file' && !selectedFile) {
                alert('Please select a video file to upload.');
                return;
              }

              setIsSubmitting(true);
              try {
                let finalVideoUrl = newVideo.videoUrl;
                let thumbnail = "https://images.unsplash.com/photo-1610484826967-09c5720778c7?w=800&q=80";

                if (uploadType === 'file' && selectedFile) {
                  const formData = new FormData();
                  formData.append('file', selectedFile);
                  const uploadRes = await api.post('/videos/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                  });
                  finalVideoUrl = uploadRes.data.fileUrl;
                  // For local uploads, use a placeholder thumbnail or implement video frame extraction later
                } else if (uploadType === 'url') {
                  if(finalVideoUrl.includes('youtube.com/watch?v=')) {
                    const vid = finalVideoUrl.split('v=')[1].split('&')[0];
                    thumbnail = `https://img.youtube.com/vi/${vid}/maxresdefault.jpg`;
                  } else if(finalVideoUrl.includes('youtu.be/')) {
                    const vid = finalVideoUrl.split('youtu.be/')[1].split('?')[0];
                    thumbnail = `https://img.youtube.com/vi/${vid}/maxresdefault.jpg`;
                  }
                }

                const payload = {
                  title: newVideo.title,
                  subject: newVideo.subject,
                  thumbnail,
                  duration: 60,
                  type: uploadType === 'file' ? 'upload' : 'url',
                  ...(uploadType === 'file' ? { fileUrl: finalVideoUrl } : { youtubeUrl: finalVideoUrl })
                };

                const { data } = await api.post('/videos', payload);
                setVideos([data, ...videos]);
                setIsAddingVideo(false);
                setNewVideo({ title: '', videoUrl: '', subject: '' });
                setSelectedFile(null);
              } catch (error) {
                console.error(error);
              } finally {
                setIsSubmitting(false);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Video Title</label>
                <input 
                  type="text" required
                  value={newVideo.title} onChange={e => setNewVideo({...newVideo, title: e.target.value})}
                  className="input-field" placeholder="E.g. Engineering Mathematics Lec 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Subject</label>
                <select 
                  required value={newVideo.subject} onChange={e => setNewVideo({...newVideo, subject: e.target.value})}
                  className="input-field"
                >
                  <option value="" disabled>Select a subject</option>
                  {subjects.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
                </select>
              </div>

              <div className="flex gap-4 mb-2">
                <button 
                  type="button"
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${uploadType === 'url' ? 'bg-primary/20 border-primary text-primary' : 'border-dark-border text-gray-400 hover:border-gray-500'}`}
                  onClick={() => setUploadType('url')}
                >Video URL</button>
                <button 
                  type="button"
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${uploadType === 'file' ? 'bg-primary/20 border-primary text-primary' : 'border-dark-border text-gray-400 hover:border-gray-500'}`}
                  onClick={() => setUploadType('file')}
                >Upload File</button>
              </div>

              {uploadType === 'url' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Video URL (YouTube or direct link)</label>
                  <input 
                    type="url" required
                    value={newVideo.videoUrl} onChange={e => setNewVideo({...newVideo, videoUrl: e.target.value})}
                    className="input-field" placeholder="https://youtube.com/watch?v=... or https://example.com/video.mp4"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Upload Video File</label>
                  <input 
                    type="file" accept="video/*" required
                    onChange={e => setSelectedFile(e.target.files[0])}
                    className="input-field py-2 bg-[#161622] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-accent"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsAddingVideo(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? 'Adding...' : 'Add Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video View Modal */}
      {selectedVideoView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <div className="w-full max-w-5xl relative">
            <button onClick={() => setSelectedVideoView(null)} className="absolute -top-12 right-0 p-2 text-gray-400 hover:text-white transition-colors">
              Close <span className="text-xl inline-block ml-1">×</span>
            </button>
            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-dark-border">
              {(() => {
                const videoUrl = getVideoUrl(selectedVideoView);

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
                    title={selectedVideoView.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video 
                    className="w-full h-full" 
                    controls 
                    autoPlay
                    src={getPlayableVideoSrc(videoUrl)}
                    onCanPlay={() => setPlaybackError('')}
                    onError={() => setPlaybackError('This video format is not supported in browser. Please upload MP4/WebM or use a YouTube URL.')}
                  ></video>
                );
              })()}
            </div>
            {playbackError && (
              <p className="mt-3 text-sm text-red-400">{playbackError}</p>
            )}
            <div className="mt-4 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-bold">{selectedVideoView.title}</h2>
              {user?.role === 'admin' && (
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => handleDeleteVideo(selectedVideoView._id)}
                  className="btn-secondary border border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:opacity-60"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Video'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Videos;
