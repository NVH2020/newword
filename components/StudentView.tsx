
import React, { useState } from 'react';
import { User, ExamConfig, Question, QuestionType } from '../types';
import { getExamData } from '../services/api';
import { Search, PlayCircle, History, Trophy } from 'lucide-react';

interface Props {
  user: User;
  onStartExam: (config: ExamConfig, questions: Question[]) => void;
}

const StudentView: React.FC<Props> = ({ user, onStartExam }) => {
  const [examCode, setExamCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFetchExam = async () => {
    if (!examCode) return;
    setLoading(true);
    
    // Simulation:
    // In real app: call getExamData(user.linkScript, examCode)
    setTimeout(() => {
      // Dummy data for testing
      const dummyConfig: ExamConfig = {
        exams: examCode,
        idNumber: user.idgv,
        mcqCount: 2,
        mcqScore: 0.5,
        tfCount: 1,
        tfScorePerPart: 0.25,
        saCount: 1,
        saScore: 2.0,
        fullTime: 15,
        miniTime: 1,
        tabLimit: 5,
        closeDate: '2025-12-31'
      };

      const dummyQuestions: Question[] = [
        {
          id: '1', exams: examCode, idquestion: '01', type: QuestionType.MCQ, classTag: 'Toan',
          question: 'Giá trị của biểu thức $P = \\log_2 8$ là:',
          options: ['A. 1', 'B. 2', 'C. 3', 'D. 4'],
          correctAnswer: 'C', explanation: '$2^3 = 8 \\Rightarrow \\log_2 8 = 3$', datetime: ''
        },
        {
          id: '2', exams: examCode, idquestion: '02', type: QuestionType.MCQ, classTag: 'Toan',
          question: 'Đạo hàm của hàm số $y = e^x$ là:',
          options: ['A. $e^x$', 'B. $xe^{x-1}$', 'C. $\\ln x$', 'D. $1/x$'],
          correctAnswer: 'A', explanation: 'Công thức cơ bản.', datetime: ''
        },
        {
          id: '3', exams: examCode, idquestion: '03', type: QuestionType.TF, classTag: 'Toan',
          question: 'Cho hàm số $f(x) = x^2 - 1$. Xét các khẳng định sau:',
          options: ['a) Hàm số đồng biến trên $(0; +\\infty)$', 'b) Đồ thị hàm số đi qua điểm $(1; 0)$', 'c) Hàm số có giá trị nhỏ nhất bằng $0$', 'd) Hàm số là hàm lẻ'],
          correctAnswer: ['a', 'b'], explanation: 'Min f(x) = -1. Hàm chẵn.', datetime: ''
        },
        {
          id: '4', exams: examCode, idquestion: '04', type: QuestionType.SA, classTag: 'Toan',
          question: 'Tính tổng $S = 1 + 2 + 3 + ... + 10$',
          correctAnswer: '55', explanation: '$10(11)/2 = 55$', datetime: ''
        }
      ];

      onStartExam(dummyConfig, dummyQuestions);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-20">
      {/* Search Exam */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-50">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Search className="text-blue-600" /> Vào Thi
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Nhập mã Exams (Mã đề)" 
            value={examCode}
            onChange={(e) => setExamCode(e.target.value)}
            className="flex-grow p-4 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-lg font-mono uppercase"
          />
          <button 
            onClick={handleFetchExam}
            disabled={loading || !examCode}
            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            {loading ? "Đang tải..." : <><PlayCircle /> Bắt đầu Thi</>}
          </button>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          * Vui lòng đảm bảo kết nối internet ổn định trước khi bắt đầu.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Statistics / History */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <History className="text-gray-400" /> Lịch sử thi
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-bold">TOAN12A</p>
                <p className="text-xs text-gray-500">20/05/2024</p>
              </div>
              <div className="text-right">
                <p className="text-blue-600 font-extrabold">9.5 đ</p>
                <p className="text-xs text-gray-400">12:30s</p>
              </div>
            </div>
            {/* More dummy items */}
          </div>
        </div>

        {/* Info */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Trophy className="text-yellow-500" /> Thành tích cá nhân
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl text-center">
              <p className="text-blue-600 text-3xl font-bold">12</p>
              <p className="text-xs font-medium text-blue-400">Bài thi đã làm</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl text-center">
              <p className="text-green-600 text-3xl font-bold">8.4</p>
              <p className="text-xs font-medium text-green-400">Điểm trung bình</p>
            </div>
          </div>
          <button 
            onClick={() => alert("Chức năng xem lại điểm cần mã Exams cụ thể.")}
            className="w-full mt-6 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            Xem lại điểm học sinh
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentView;
