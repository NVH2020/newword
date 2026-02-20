
import React, { useState } from 'react';
import { User, Question, ExamConfig, QuestionType } from '../types';
import { parseExamFile } from '../services/parser';
import { saveExam, resetResults } from '../services/api';
import MathRenderer from './MathRenderer';
import { Upload, FileText, Settings, Trash2, CheckCircle } from 'lucide-react';

interface Props {
  user: User;
}

const TeacherView: React.FC<Props> = ({ user }) => {  
  const [examCode, setExamCode] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [config, setConfig] = useState<ExamConfig>({
    exams: '',
    idNumber: user.idgv,
    mcqCount: 0,
    mcqScore: 0.25,
    tfCount: 0,
    tfScorePerPart: 0.5,
    saCount: 0,
    saScore: 1.0,
    fullTime: 60,
    miniTime: 15,
    tabLimit: 3,
    closeDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !examCode) {
      alert("Vui lòng nhập mã đề trước khi tải file!");
      return;
    }
    setLoading(true);
    try {
      const qs = await parseExamFile(e.target.files[0], examCode);
      setQuestions(qs);
      
      const mcqs = qs.filter(q => q.type === QuestionType.MCQ).length;
      const tfs = qs.filter(q => q.type === QuestionType.TF).length;
      const sas = qs.filter(q => q.type === QuestionType.SA).length;
      
      setConfig(prev => ({
        ...prev,
        exams: examCode,
        mcqCount: mcqs,
        tfCount: tfs,
        saCount: sas
      }));
      setStatus(`Đã nạp ${qs.length} câu hỏi thành công.`);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi đọc file. Kiểm tra lại định dạng.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!questions.length) return;
    setLoading(true);
    try {
      await saveExam(user.linkScript!, config, questions);
      alert("Đã lưu đề thi thành công!");
    } catch (err) {
      alert("Lỗi khi lưu dữ liệu lên Google Sheet.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (mode: 'all' | 'exam') => {
    const code = mode === 'exam' ? prompt("Nhập mã exams cần xóa:") : null;
    if (mode === 'exam' && !code) return;
    if (confirm(`Bạn có chắc muốn xóa dữ liệu kết quả (${mode}) không?`)) {
      await resetResults(user.linkScript!, mode, code || undefined);
      alert("Đã xóa thành công.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8 pb-20">
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Upload className="text-blue-600" /> Nhập Đề Thi Mới
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Mã Exams (Mã đề)</label>
            <input 
              type="text" 
              value={examCode} 
              onChange={(e) => setExamCode(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="Ví dụ: TOAN12A"
            />
           
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Chọn file Word (.docx)</label>
            <input 
              type="file" 
              accept=".docx"
              onChange={handleFileUpload}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>

        {status && <div className="text-green-600 font-medium mb-4">{status}</div>}
        {*/ Nút cấu hình đề */}

        {questions.length > 0 && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="font-semibold text-blue-700">Phần I (MCQ): {config.mcqCount} câu</p>
                <label className="text-xs">Điểm mỗi câu:</label>
                <input type="number" step="0.1" value={config.mcqScore} onChange={e => setConfig({...config, mcqScore: parseFloat(e.target.value)})} className="w-full p-1 border rounded" />
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-green-700">Phần II (TF): {config.tfCount} câu</p>
                <label className="text-xs">Điểm mỗi câu:</label>
                <input type="number" step="0.1" value={config.tfScorePerPart} onChange={e => setConfig({...config, tfScorePerPart: parseFloat(e.target.value)})} className="w-full p-1 border rounded" />
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-purple-700">Phần III (SA): {config.saCount} câu</p>
                <label className="text-xs">Điểm mỗi câu:</label>
                <input type="number" step="0.1" value={config.saScore} onChange={e => setConfig({...config, saScore: parseFloat(e.target.value)})} className="w-full p-1 border rounded" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold">Thời gian (phút):</label>
                <input type="number" value={config.fullTime} onChange={e => setConfig({...config, fullTime: parseInt(e.target.value)})} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="text-xs font-bold">Thời gian tối thiểu (phút):</label>
                <input type="number" value={config.miniTime} onChange={e => setConfig({...config, miniTime: parseInt(e.target.value)})} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="text-xs font-bold">Số lần chuyển tab:</label>
                <input type="number" value={config.tabLimit} onChange={e => setConfig({...config, tabLimit: parseInt(e.target.value)})} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="text-xs font-bold">Ngày đóng:</label>
                <input type="date" value={config.closeDate} onChange={e => setConfig({...config, closeDate: e.target.value})} className="w-full p-2 border rounded" />
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              {loading ? "Đang xử lý..." : <><CheckCircle size={20}/> Lưu Đề Thi & Cấu Hình</>}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Settings className="text-gray-600" /> Quản Lý Kết Quả
        </h2>
        <div className="flex flex-wrap gap-4">
          <button onClick={() => handleReset('all')} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100">
            <Trash2 size={18}/> Xóa Toàn Bộ Kết Quả
          </button>
          <button onClick={() => handleReset('exam')} className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 border border-orange-200 rounded hover:bg-orange-100">
            <Trash2 size={18}/> Xóa Theo Mã Đề
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FileText className="text-indigo-600" /> Xem Trước Câu Hỏi
        </h2>
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {questions.map((q, i) => (
            <div key={q.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold px-2 py-1 bg-gray-200 rounded">ID: {q.idquestion}</span>
                <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded">{q.type}</span>
              </div>
              <MathRenderer content={q.question} className="font-medium mb-3" />
              {q.options && q.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm ml-4">
                  {q.options.map((opt, idx) => (
                    <MathRenderer key={idx} content={opt} />
                  ))}
                </div>
              )}
              <div className="mt-2 text-sm text-green-700 font-bold">
                Đáp án: {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}
              </div>
              {q.explanation && (
                <div className="mt-2 text-sm text-gray-500 italic">
                  Lời giải: <MathRenderer content={q.explanation} />
                </div>
              )}
            </div>
          ))}
          {!questions.length && <p className="text-gray-400 italic">Chưa có câu hỏi nào được nạp.</p>}
        </div>
      </div>
    </div>
  );
};

export default TeacherView;
