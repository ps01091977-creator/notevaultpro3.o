import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Layers, ArrowLeft } from 'lucide-react';

import api from '../api/axios';

const SemestersList = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [totalSemesters, setTotalSemesters] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await api.get('/courses');
        const course = data.find(c => c.name === courseId);
        setTotalSemesters(course ? course.maxSemesters : 8);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/courses')}
          className="p-2 glass-card hover:bg-dark-border text-gray-300 hover:text-white transition-colors rounded-lg"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold">{courseId} Semesters</h1>
          <p className="text-gray-400">Select your semester</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 flex-1">
          {Array.from({ length: totalSemesters }, (_, i) => i + 1).map((sem) => (
            <motion.div
              key={sem}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/course/${courseId}/semesters/${sem}/subjects`)}
              className="glass-card p-6 flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden border border-dark-border h-48"
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/30 transition-colors"></div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white mb-4 shadow-lg group-hover:shadow-glow transition-all">
                <Layers size={28} />
              </div>
              <h2 className="text-2xl font-bold text-center">Semester {sem}</h2>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SemestersList;
