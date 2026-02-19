
import React, { useState, useEffect } from 'react';
import { User, ExamConfig, Question, ExamResult } from './types';
import { verifyTeacher, verifyStudent } from './services/api';
import TeacherView from './components/TeacherView';
import StudentView from './components/StudentView';
import ExamTaker from './components/ExamTaker';
import { BookOpen, User as UserIcon, LogOut, Facebook, Github, Heart } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'teacher' | 'student' | 'exam' | 'result'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [examState, setExamState] = useState<{config: ExamConfig, questions: Question[]} | null>(null);
  const [finalResult, setFinalResult] = useState<ExamResult | null>(null);
  
  
  // Login states
  const [loginIdgv, setLoginIdgv] = useState('');
  const [loginSbd, setLoginSbd] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginPass, setLoginPass] = useState('');

  const handleTeacherLogin = async () => {
    if (loginPass !== `a${loginIdgv}@`) {
  alert('Sai mật khẩu');
  return;
}
    if (!loginIdgv) return;
    setLoginLoading(true);
    const gv = await verifyTeacher(loginIdgv);
    if (gv) {
      setUser({ role: 'GV', idgv: gv.idNumber, name: gv.name, linkScript: gv.linkScript });
      setView('teacher');
    } else {
      alert("ID Giáo viên không tồn tại!");
    }
    setLoginLoading(false);
  };

  const handleStudentLogin = async () => {
    if (!loginIdgv || !loginSbd) return;
    setLoginLoading(true);
    const gv = await verifyTeacher(loginIdgv);
    if (!gv) {
      alert("ID Giáo viên không tồn tại!");
      setLoginLoading(false);
      return;
    }
    const hs = await verifyStudent(loginIdgv, loginSbd, gv.linkScript);
    if (hs) {
      setUser({ role: 'HS', idgv: hs.idgv, name: hs.name, sbd: hs.sbd, class: hs.class, linkScript: gv.linkScript });
      setView('student');
    } else {
      alert("SBD hoặc IDGV không khớp trong danh sách của giáo viên!");
    }
    setLoginLoading(false);
  };

  const handleLogout = () => {
    setUser(null);
    setView('home');
    setExamState(null);
    setFinalResult(null);
  };

  const startExam = (config: ExamConfig, questions: Question[]) => {
    setExamState({ config, questions });
    setView('exam');
  };

  const finishExam = (result: ExamResult) => {
    setFinalResult(result);
    setView('result');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <BookOpen size={24} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 hidden sm:block">
              LaTeX Exam Pro
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role === 'GV' ? 'Giáo viên' : `Lớp: ${user.class}`}</p>
                </div>
                <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={() => setView('home')} 
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  Đăng nhập
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-gray-50">
        {view === 'home' && (
          <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Hệ Thống Thi Trắc Nghiệm Online</h2>
              <p className="text-gray-600">Hỗ trợ LaTeX, trộn đề tự động và quản lý kết quả qua Google Sheets</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Teacher Login */}
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <UserIcon size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-4">Dành cho Giáo viên</h3>
                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Nhập ID Giáo viên" 
                    value={loginIdgv}
                    onChange={(e) => setLoginIdgv(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                   <input 
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button 
                    onClick={handleTeacherLogin}
                    disabled={loginLoading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
                  >
                    Đăng nhập Giáo viên
                  </button>
                </div>
              </div>

              {/* Student Login */}
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                  <UserIcon size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-4">Dành cho Học sinh</h3>
                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Nhập ID Giáo viên" 
                    value={loginIdgv}
                    onChange={(e) => setLoginIdgv(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input 
                    type="text" 
                    placeholder="Nhập Số báo danh" 
                    value={loginSbd}
                    onChange={(e) => setLoginSbd(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button 
                    onClick={handleStudentLogin}
                    disabled={loginLoading}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition"
                  >
                    Đăng nhập Học sinh
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'teacher' && user && <TeacherView user={user} />}
        {view === 'student' && user && <StudentView user={user} onStartExam={startExam} />}
        {view === 'exam' && user && examState && (
          <ExamTaker 
            user={user} 
            config={examState.config} 
            questions={examState.questions} 
            onFinished={finishExam} 
          />
        )}
        
        {view === 'result' && finalResult && (
          <div className="max-w-xl mx-auto py-20 px-4 text-center">
            <div className="bg-white p-10 rounded-3xl shadow-2xl border border-green-100">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart size={40} fill="currentColor" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Hoàn Thành Bài Thi!</h2>
              <p className="text-gray-500 mb-8">Kết quả của bạn đã được ghi nhận.</p>
              
              <div className="text-5xl font-extrabold text-blue-600 mb-4">
                {finalResult.totalScore.toFixed(2)} đ
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-400">Thời gian làm</p>
                  <p className="font-bold">{Math.floor(finalResult.timeTaken / 60)} phút {finalResult.timeTaken % 60} giây</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-400">Số báo danh</p>
                  <p className="font-bold">{finalResult.sbd}</p>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => setView('student')} 
                  className="w-full py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-black transition"
                >
                  Quay lại Trang cá nhân
                </button>
                <button 
                  onClick={() => alert("Chế độ xem lại đang được phát triển...")} 
                  className="w-full py-3 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition"
                >
                  Xem lại bài làm
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h4 className="text-white font-bold text-lg mb-2">LaTeX Exam Online</h4>
            <p className="text-sm">Hệ thống thi chuyên nghiệp dành cho giáo viên và học sinh.</p>
          </div>
          
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition"><Facebook /></a>
            <a href="#" className="hover:text-white transition"><Github /></a>
            <button className="px-4 py-2 bg-gray-800 text-sm rounded-lg hover:text-white transition">
              Đánh giá website
            </button>
          </div>
          
          <div className="text-sm">
            &copy; 2024 LaTeX Exam Pro. Made with ❤️ for Education.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
