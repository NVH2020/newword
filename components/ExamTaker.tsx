
import React, { useState, useEffect, useCallback } from 'react';
import { Question, ExamConfig, ExamResult, User, QuestionType } from '../types';
import MathRenderer from './MathRenderer';
import { Timer, AlertTriangle, Send } from 'lucide-react';
import { submitResult } from '../services/api';

interface Props {
  user: User;
  config: ExamConfig;
  questions: Question[];
  onFinished: (result: ExamResult) => void;
}

const ExamTaker: React.FC<Props> = ({ user, config, questions, onFinished }) => {
  const [timeLeft, setTimeLeft] = useState(config.fullTime * 60);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);

  // Shuffle questions per part
  useEffect(() => {
    const shuffle = (array: any[]) => [...array].sort(() => Math.random() - 0.5);
    
    const mcq = shuffle(questions.filter(q => q.type === QuestionType.MCQ));
    const tf = shuffle(questions.filter(q => q.type === QuestionType.TF));
    const sa = shuffle(questions.filter(q => q.type === QuestionType.SA));
    
    setShuffledQuestions([...mcq, ...tf, ...sa]);
  }, [questions]);

  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Anti-cheat logic
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setTabSwitches(prev => {
          const newValue = prev + 1;
          if (newValue >= config.tabLimit) {
            alert("Bạn đã quá giới hạn chuyển tab cho phép. Bài thi sẽ tự động nộp!");
            handleFinalSubmit();
          } else {
            alert(`Cảnh báo: Không được chuyển tab! (${newValue}/${config.tabLimit})`);
          }
          return newValue;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [config.tabLimit]);

  const handleAnswerChange = (qId: string, val: any) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const calculateScore = () => {
    let total = 0;
    shuffledQuestions.forEach(q => {
      const userAns = answers[q.id];
      if (!userAns) return;

      if (q.type === QuestionType.MCQ) {
        if (userAns === q.correctAnswer) total += config.mcqScore;
      } else if (q.type === QuestionType.TF) {
        // userAns is array of selected labels
        const correct = q.correctAnswer as string[];
        const options = ['a', 'b', 'c', 'd'];
        options.forEach(opt => {
          const isCorrectInKey = correct.includes(opt);
          const isSelectedByUser = userAns.includes(opt);
          if (isCorrectInKey === isSelectedByUser) {
            total += config.tfScorePerPart;
          }
        });
      } else if (q.type === QuestionType.SA) {
        if (userAns.toString().trim() === q.correctAnswer.toString().trim()) {
          total += config.saScore;
        }
      }
    });
    return total;
  };

  const handleFinalSubmit = async () => {
    const timeSpent = config.fullTime * 60 - timeLeft;
    if (timeSpent < config.miniTime * 60 && timeLeft > 0) {
      alert(`Bạn cần làm bài ít nhất ${config.miniTime} phút mới được nộp.`);
      return;
    }

    const totalScore = calculateScore();
    const result: ExamResult = {
      timestamp: new Date().toLocaleString(),
      exams: config.exams,
      sbd: user.sbd!,
      name: user.name,
      class: user.class || 'N/A',
      totalScore,
      timeTaken: timeSpent,
      detail: JSON.stringify(answers)
    };

    await submitResult(user.linkScript!, result);
    onFinished(result);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pb-32">
      <div className="sticky top-0 z-10 bg-white p-4 shadow-md rounded-b-xl mb-6 flex justify-between items-center border-b border-blue-100">
        <div className="flex items-center gap-2 font-bold text-blue-700">
          <Timer />
          <span className={timeLeft < 300 ? 'text-red-500 animate-pulse' : ''}>
            {formatTime(timeLeft)}
          </span>
        </div>
        <div className="text-sm font-medium text-gray-600 hidden md:block">
          SBD: {user.sbd} | {user.name}
        </div>
        <div className="flex items-center gap-2 text-orange-600 font-bold text-sm">
          <AlertTriangle size={16}/> Tab: {tabSwitches}/{config.tabLimit}
        </div>
      </div>

      <div className="space-y-8">
        {shuffledQuestions.map((q, idx) => (
          <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <span className="text-blue-600 font-bold">Câu {idx + 1} <span className="text-xs font-normal text-gray-400">(ID: {q.idquestion})</span></span>
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-md text-gray-500">{q.type}</span>
            </div>
            <MathRenderer content={q.question} className="mb-6 text-lg" />

            {q.type === QuestionType.MCQ && (
              <div className="grid grid-cols-1 gap-3">
                {q.options?.map((opt, i) => {
                  const label = opt.charAt(0);
                  return (
                    <label key={i} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${answers[q.id] === label ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}`}>
                      <input 
                        type="radio" 
                        name={q.id} 
                        checked={answers[q.id] === label} 
                        onChange={() => handleAnswerChange(q.id, label)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <MathRenderer content={opt} />
                    </label>
                  );
                })}
              </div>
            )}

            {q.type === QuestionType.TF && (
              <div className="space-y-4">
                <p className="text-sm italic text-gray-500">Chọn phương án đúng (có thể chọn nhiều):</p>
                {q.options?.map((opt, i) => {
                  const label = opt.charAt(0).toLowerCase();
                  const currentAns = answers[q.id] || [];
                  return (
                    <label key={i} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${currentAns.includes(label) ? 'bg-green-50 border-green-300' : 'hover:bg-gray-50'}`}>
                      <input 
                        type="checkbox" 
                        checked={currentAns.includes(label)} 
                        onChange={(e) => {
                          const next = e.target.checked 
                            ? [...currentAns, label] 
                            : currentAns.filter((l: string) => l !== label);
                          handleAnswerChange(q.id, next);
                        }}
                        className="w-4 h-4 text-green-600"
                      />
                      <MathRenderer content={opt} />
                    </label>
                  );
                })}
              </div>
            )}

            {q.type === QuestionType.SA && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Đáp án của bạn:</label>
                <input 
                  type="text" 
                  value={answers[q.id] || ''} 
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  placeholder="Nhập câu trả lời..."
                  className="w-full md:w-1/2 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 mb-20">
        <button 
          onClick={handleFinalSubmit}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-xl shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
        >
          <Send /> Nộp Bài Thi
        </button>
      </div>
    </div>
  );
};

export default ExamTaker;
