import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, CalendarRange, FolderKanban, GitBranch, 
  Layers, BookOpen, CheckCircle2, Plus, ChevronRight, 
  ArrowLeft, Trash2, Search, Zap 
} from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

const materialTypes = ['Syllabus', 'PYQs', 'Notes', 'Quantum', 'Video Lectures'];

const Courses = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [coursesList, setCoursesList] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const selectedCourseName = searchParams.get('course');
  const selectedCourse = coursesList.find((c) => c.name === selectedCourseName) || null;
  const selectedYear = searchParams.get('year') || null;
  const selectedMaterial = searchParams.get('material') || null;
  const selectedBranch = searchParams.get('branch') || null;
  const selectedSemester = searchParams.get('semester') ? Number(searchParams.get('semester')) : null;
  const subjectId = searchParams.get('subjectId') || null;
  const subjectName = searchParams.get('subjectName') || null;
  const selectedSubject = subjectId && subjectName ? { _id: subjectId, name: subjectName } : null;

  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [isCreatingSubject, setIsCreatingSubject] = useState(false);

  const courseYears = useMemo(() => {
    if (!selectedCourse) return [];
    return Array.from({ length: selectedCourse.durationYears }, (_, i) => {
      const num = i + 1;
      const suffix = num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th';
      return `${num}${suffix} Year`;
    });
  }, [selectedCourse]);

  const courseBranches = selectedCourse?.branches || [];
  const courseSemesters = useMemo(() => {
    if (!selectedCourse || !selectedYear) return [];
    const yearNum = parseInt(selectedYear);
    if (isNaN(yearNum)) {
      return Array.from({ length: selectedCourse.maxSemesters }, (_, i) => i + 1);
    }
    const sems = [];
    const startSem = (yearNum * 2) - 1;
    const endSem = yearNum * 2;
    if (startSem <= selectedCourse.maxSemesters) sems.push(startSem);
    if (endSem <= selectedCourse.maxSemesters) sems.push(endSem);
    return sems;
  }, [selectedCourse, selectedYear]);

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

  const readyToApply = Boolean(selectedCourse && selectedYear && selectedMaterial && selectedBranch && selectedSemester && selectedSubject);
  const currentStep = !selectedCourse
    ? 'course'
    : !selectedYear
    ? 'year'
    : !selectedMaterial
    ? 'material'
    : !selectedBranch
    ? 'branch'
    : !selectedSemester
    ? 'semester'
    : 'subject';

  const steps = [
    { id: 'course', label: 'Course', icon: GraduationCap },
    { id: 'year', label: 'Year', icon: CalendarRange },
    { id: 'material', label: 'Material', icon: FolderKanban },
    { id: 'branch', label: 'Branch', icon: GitBranch },
    { id: 'semester', label: 'Semester', icon: Layers },
    { id: 'subject', label: 'Subject', icon: BookOpen }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const breadcrumbs = useMemo(
    () => [
      selectedCourse?.name,
      selectedYear,
      selectedMaterial,
      selectedBranch,
      selectedSemester ? `Semester ${selectedSemester}` : null,
      selectedSubject?.name
    ].filter(Boolean),
    [selectedCourse, selectedYear, selectedMaterial, selectedBranch, selectedSemester, selectedSubject]
  );

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedCourse || !selectedBranch || !selectedSemester) {
        setSubjects([]);
        return;
      }
      try {
        setLoadingSubjects(true);
        const { data } = await api.get(`/subjects?course=${encodeURIComponent(selectedCourse.name)}&semester=${selectedSemester}&department=${encodeURIComponent(selectedBranch)}`);
        setSubjects(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, [selectedCourse, selectedBranch, selectedSemester]);

  const openResults = () => {
    if (!readyToApply) return;
    const params = new URLSearchParams({
      course: selectedCourse.name,
      year: selectedYear,
      material: selectedMaterial,
      branch: selectedBranch,
      semester: String(selectedSemester),
      subjectId: selectedSubject._id,
      subjectName: selectedSubject.name
    });
    navigate(`/courses/results?${params.toString()}`);
  };

  const stepBack = () => {
    navigate(-1);
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName.trim() || !selectedCourse || !selectedBranch || !selectedSemester) return;
    try {
      setIsCreatingSubject(true);
      const { data } = await api.post('/subjects', {
        name: newSubjectName.trim(),
        course: selectedCourse.name,
        department: selectedBranch,
        semester: selectedSemester,
        color: ['#7c3aed', '#06b6d4', '#f59e0b', '#ec4899', '#10b981'][Math.floor(Math.random() * 5)],
        emoji: '📘'
      });
      setSubjects((prev) => [data, ...prev]);
      setNewSubjectName('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreatingSubject(false);
    }
  };

  const handleDeleteSubject = async (e, id) => {
    e.stopPropagation();
    if(window.confirm("Are you sure you want to delete this subject?")) {
      try {
        await api.delete(`/subjects/${id}`);
        setSubjects(subjects.filter(s => s._id !== id));
        if (selectedSubject && selectedSubject._id === id) {
          const newParams = new URLSearchParams(searchParams);
          newParams.delete('subjectId');
          newParams.delete('subjectName');
          setSearchParams(newParams);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 max-w-6xl mx-auto pb-8">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-dark-text flex items-center gap-3">
            Course Explorer
          </h1>
          <p className="text-dark-muted mt-2 text-lg">Navigate through our extensive library of engineering resources.</p>
        </div>
      </div>

      {/* Modern Stepper */}
      <div className="glass-card p-4 md:p-6 border border-dark-border overflow-hidden">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-dark-bg rounded-full hidden md:block"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500 hidden md:block"
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          ></div>
          
          <div className="flex justify-start md:justify-between w-full relative z-10 overflow-x-auto pb-4 md:pb-0 hide-scrollbar gap-6 md:gap-0 snap-x">
            {steps.map((step, idx) => {
              const isActive = idx === currentStepIndex;
              const isCompleted = idx < currentStepIndex;
              return (
                <div key={step.id} className="flex flex-col items-center gap-2 min-w-[70px] md:min-w-[80px] snap-center shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 
                    ${isActive ? 'bg-primary border-primary text-white shadow-[0_0_15px_rgba(124,58,237,0.4)] scale-110' : 
                      isCompleted ? 'bg-dark-card border-primary text-primary' : 'bg-dark-bg border-dark-border text-dark-muted'}`}>
                    {isCompleted ? <CheckCircle2 size={18} /> : <step.icon size={18} />}
                  </div>
                  <span className={`text-xs font-semibold whitespace-nowrap ${isActive ? 'text-primary' : isCompleted ? 'text-dark-text' : 'text-dark-muted'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Path Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-dark-muted font-medium">Your Path:</span>
          {breadcrumbs.map((item, idx) => (
            <React.Fragment key={`${item}-${idx}`}>
              <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">{item}</span>
              {idx < breadcrumbs.length - 1 && <ChevronRight size={16} className="text-dark-muted" />}
            </React.Fragment>
          ))}
        </motion.div>
      )}

      {/* Main Selection Area */}
      <div className="glass-card border border-dark-border p-4 sm:p-6 md:p-10 min-h-[400px] flex flex-col relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="flex items-center justify-between mb-8 relative z-10">
          <h2 className="text-2xl font-bold text-dark-text flex items-center gap-3">
            {steps[currentStepIndex].label} Selection
          </h2>
          {currentStepIndex > 0 && (
            <button onClick={stepBack} className="px-4 py-2 rounded-xl bg-dark-bg border border-dark-border text-dark-text hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all shadow-sm flex items-center gap-2 font-medium">
              <ArrowLeft size={18} /> Go Back
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 relative z-10"
          >
            {/* Step 1: Course */}
            {currentStep === 'course' && (
              loadingCourses ? (
                <div className="flex justify-center items-center h-40"><p className="text-dark-muted animate-pulse">Loading courses...</p></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {coursesList.map((course, i) => (
                    <motion.button
                      variants={cardVariants}
                      initial="hidden" animate="visible" transition={{ delay: i * 0.05 }}
                      key={course._id}
                      onClick={() => setSearchParams({ course: course.name })}
                      className="group p-4 md:p-6 rounded-2xl bg-dark-bg border border-dark-border hover:border-primary hover:bg-primary/5 flex flex-col items-center justify-center gap-3 md:gap-4 transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.1)] hover:-translate-y-1"
                    >
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-dark-card border border-dark-border flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <GraduationCap size={28} className="md:w-8 md:h-8" />
                      </div>
                      <span className="font-bold text-base md:text-lg text-dark-text text-center">{course.name}</span>
                    </motion.button>
                  ))}
                </div>
              )
            )}

            {/* Step 2: Year */}
            {currentStep === 'year' && selectedCourse && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {courseYears.map((year, i) => (
                  <motion.button
                    variants={cardVariants}
                    initial="hidden" animate="visible" transition={{ delay: i * 0.05 }}
                    key={year}
                    onClick={() => setSearchParams({ course: selectedCourse.name, year })}
                    className="group p-4 md:p-6 rounded-2xl bg-dark-bg border border-dark-border hover:border-accent hover:bg-accent/5 flex flex-col items-center justify-center gap-3 md:gap-4 transition-all hover:-translate-y-1"
                  >
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-dark-card border border-dark-border flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                      <CalendarRange size={24} className="md:w-7 md:h-7" />
                    </div>
                    <span className="font-bold text-base md:text-lg text-dark-text text-center">{year}</span>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Step 3: Material */}
            {currentStep === 'material' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {materialTypes.map((material, i) => (
                  <motion.button
                    variants={cardVariants}
                    initial="hidden" animate="visible" transition={{ delay: i * 0.05 }}
                    key={material}
                    onClick={() => setSearchParams({ course: selectedCourse.name, year: selectedYear, material })}
                    className="group p-4 md:p-6 rounded-2xl bg-dark-bg border border-dark-border hover:border-pink-500 hover:bg-pink-500/5 flex flex-col items-center justify-center gap-3 md:gap-4 transition-all hover:-translate-y-1"
                  >
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-dark-card border border-dark-border flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
                      <FolderKanban size={24} className="md:w-7 md:h-7" />
                    </div>
                    <span className="font-bold text-sm md:text-base text-dark-text text-center">{material}</span>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Step 4: Branch */}
            {currentStep === 'branch' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {courseBranches.map((branch, i) => (
                  <motion.button
                    variants={cardVariants}
                    initial="hidden" animate="visible" transition={{ delay: i * 0.05 }}
                    key={branch}
                    onClick={() => setSearchParams({ course: selectedCourse.name, year: selectedYear, material: selectedMaterial, branch })}
                    className="group p-4 md:p-6 rounded-2xl bg-dark-bg border border-dark-border hover:border-emerald-500 hover:bg-emerald-500/5 flex flex-col items-center justify-center gap-3 md:gap-4 transition-all hover:-translate-y-1 text-center"
                  >
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-dark-card border border-dark-border flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                      <GitBranch size={24} className="md:w-7 md:h-7" />
                    </div>
                    <span className="font-bold text-sm md:text-base text-dark-text">{branch}</span>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Step 5: Semester */}
            {currentStep === 'semester' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {courseSemesters.map((sem, i) => (
                  <motion.button
                    variants={cardVariants}
                    initial="hidden" animate="visible" transition={{ delay: i * 0.05 }}
                    key={sem}
                    onClick={() => setSearchParams({ course: selectedCourse.name, year: selectedYear, material: selectedMaterial, branch: selectedBranch, semester: sem.toString() })}
                    className="group p-4 md:p-6 rounded-2xl bg-dark-bg border border-dark-border hover:border-orange-500 hover:bg-orange-500/5 flex flex-col items-center justify-center gap-3 md:gap-4 transition-all hover:-translate-y-1"
                  >
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-dark-card border border-dark-border flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                      <Layers size={24} className="md:w-7 md:h-7" />
                    </div>
                    <span className="font-bold text-base md:text-lg text-dark-text">Sem {sem}</span>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Step 6: Subject */}
            {currentStep === 'subject' && (
              <div className="flex flex-col gap-6 h-full">
                {loadingSubjects ? (
                  <div className="flex justify-center items-center h-40"><p className="text-dark-muted animate-pulse">Loading subjects...</p></div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjects.map((subject, i) => {
                      const isSelected = selectedSubject?._id === subject._id;
                      return (
                        <motion.button
                          variants={cardVariants}
                          initial="hidden" animate="visible" transition={{ delay: i * 0.05 }}
                          key={subject._id}
                          onClick={() => setSearchParams({
                            course: selectedCourse.name, year: selectedYear, material: selectedMaterial, 
                            branch: selectedBranch, semester: selectedSemester.toString(),
                            subjectId: subject._id, subjectName: subject.name
                          })}
                          onDoubleClick={() => {
                            const params = new URLSearchParams({
                              course: selectedCourse.name, year: selectedYear, material: selectedMaterial, 
                              branch: selectedBranch, semester: selectedSemester.toString(),
                              subjectId: subject._id, subjectName: subject.name
                            });
                            navigate(`/courses/results?${params.toString()}`);
                          }}
                          className={`relative p-5 rounded-2xl border text-left transition-all flex flex-col gap-3 group
                            ${isSelected ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(124,58,237,0.15)] scale-[1.02]' : 'bg-dark-bg border-dark-border hover:border-primary/50 hover:-translate-y-1'}`}
                        >
                          <div className="flex items-start justify-between w-full">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-dark-card flex items-center justify-center text-lg md:text-xl shadow-sm">
                              {subject.emoji || '📘'}
                            </div>
                            <div className="flex items-center gap-2">
                              {isSelected && (
                                <div className="text-primary">
                                  <CheckCircle2 size={20} />
                                </div>
                              )}
                              {user?.role === 'admin' && (
                                <div 
                                  onClick={(e) => handleDeleteSubject(e, subject._id)}
                                  className="p-1.5 md:p-2 text-dark-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors z-10"
                                >
                                  <Trash2 size={16} />
                                </div>
                              )}
                            </div>
                          </div>
                          <span className={`font-bold text-base md:text-lg leading-tight mt-1 md:mt-2 ${isSelected ? 'text-primary' : 'text-dark-text'}`}>
                            {subject.name}
                          </span>
                        </motion.button>
                      );
                    })}
                    {subjects.length === 0 && (
                      <div className="col-span-full py-12 text-center flex flex-col items-center justify-center glass-card border border-dark-border border-dashed">
                        <Search size={40} className="text-dark-muted mb-4" />
                        <h3 className="text-xl font-bold text-dark-text mb-2">No subjects found</h3>
                        <p className="text-dark-muted">No subjects exist for this specific combination yet.</p>
                      </div>
                    )}
                  </div>
                  {subjects.length > 0 && (
                    <p className="text-center text-sm text-dark-muted mt-2 mb-4 animate-pulse">
                      💡 Tip: Double-click a subject to instantly open results!
                    </p>
                  )}
                  </>
                )}
                
                {user?.role === 'admin' && (
                  <div className="mt-auto pt-6 border-t border-dark-border">
                    <form onSubmit={handleCreateSubject} className="flex gap-3">
                      <input
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        className="input-field flex-1 max-w-sm bg-dark-bg"
                        placeholder="New subject name..."
                        required
                      />
                      <button type="submit" disabled={isCreatingSubject} className="btn-primary flex items-center gap-2">
                        <Plus size={18} />
                        {isCreatingSubject ? 'Adding...' : 'Create Subject'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
};

export default Courses;
