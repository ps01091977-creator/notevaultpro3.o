import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookText, Video, Play, FileText } from 'lucide-react';
import api from '../api/axios';

const SubjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' or 'videos'
  const [notes, setNotes] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Viewing states
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);

  const getBackendUrl = () => {
    return import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
  };

  const getVideoUrl = (video) => video?.youtubeUrl || video?.fileUrl || video?.videoUrl || '';
  const getPlayableVideoSrc = (url) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    return `${getBackendUrl()}${url.startsWith('/') ? url : `/${url}`}`;
  };

  // In a real app we would fetch the subject details too, but for simplicity we'll just fetch its notes/videos
  useEffect(() => {
    const fetchSubjectData = async () => {
      setLoading(true);
      try {
        const [notesRes, videosRes] = await Promise.all([
          api.get(`/notes?subject=${id}`),
          api.get(`/videos?subject=${id}`)
        ]);
        setNotes(notesRes.data);
        setVideos(videosRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjectData();
  }, [id]);

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/semesters')}
          className="p-2 glass-card hover:bg-dark-border text-gray-300 hover:text-white transition-colors rounded-lg"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold">Subject Materials</h1>
          <p className="text-gray-400">Access all videos and notes for this subject</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 glass-card w-fit rounded-lg">
        <button 
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-medium transition-all ${
            activeTab === 'notes' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <BookText size={18} /> Notes & PDFs
          <span className="ml-2 bg-black/20 px-2 py-0.5 rounded-full text-xs">{notes.length}</span>
        </button>
        <button 
          onClick={() => setActiveTab('videos')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-medium transition-all ${
            activeTab === 'videos' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Video size={18} /> Video Lectures
          <span className="ml-2 bg-black/20 px-2 py-0.5 rounded-full text-xs">{videos.length}</span>
        </button>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          
          {/* Notes View */}
          {activeTab === 'notes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map(note => (
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
              {notes.length === 0 && (
                <div className="col-span-full py-10 text-center text-gray-500 glass-card">
                  No notes available for this subject yet. You can add them from the Notes tab.
                </div>
              )}
            </div>
          )}

          {/* Videos View */}
          {activeTab === 'videos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map(video => (
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
              {videos.length === 0 && (
                <div className="col-span-full py-10 text-center text-gray-500 glass-card">
                  No video lectures available for this subject yet. You can add them from the Videos tab.
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* Note View Modal */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="glass-card w-full max-w-2xl max-h-[85vh] flex flex-col relative z-10 overflow-hidden">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
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
