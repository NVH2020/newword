
import React, { useState } from 'react';
import { User, ExamConfig, Question } from '../types';
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
    
    try {
      const data = await getExamData(user.linkScript || '', examCode);
      if (data) {
        // Kiểm tra ngày đóng đề
        const closeDate = new Date(data.config.closeDate);
        if (new Date() > closeDate) {
          alert("Xin lỗi, đề thi này đã đóng vào ngày " + data.config.closeDate);
          setLoading(false);
          return;
        }
        onStartExam(data.config, data.questions);
      } else {
        alert("Không tìm thấy mã Exams này hoặc lỗi kết nối.");
      }
    } catch (err) {
      alert("Lỗi khi tải đề thi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-20">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-50">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Search className="text-blue-600" /> Vào Thi
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Nhập mã Exams (Mã đề)" 
            value={examCode}
            onChange={(e) => setExamCode(e.target.value.toUpperCase())}
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <History className="text-gray-400" /> Lịch sử thi
          </h3>
          <p className="text-gray-400 italic text-sm">Tính năng lịch sử đang được đồng bộ từ server...</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Trophy className="text-yellow-500" /> Thành tích cá nhân
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl text-center">
              <p className="text-blue-600 text-3xl font-bold">--</p>
              <p className="text-xs font-medium text-blue-400">Bài thi đã làm</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl text-center">
              <p className="text-green-600 text-3xl font-bold">--</p>
              <p className="text-xs font-medium text-green-400">Điểm trung bình</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentView;
