
import { TeacherInfo, StudentInfo, ExamConfig, Question, ExamResult } from '../types';

// THAY URL NÀY BẰNG URL WEB APP CỦA BẠN SAU KHI DEPLOY GOOGLE APPS SCRIPT
const ADMIN_SHEET_URL = "https://script.google.com/macros/s/AKfycbz_REAL_URL_HERE/exec"; 

/**
 * Hàm gọi Google Apps Script thông qua POST request.
 * GAS yêu cầu POST với content-type text/plain để tránh lỗi CORS Preflight.
 */
async function callGAS(action: string, payload: any, url: string = ADMIN_SHEET_URL) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors', // Sử dụng cors vì chúng ta muốn đọc kết quả trả về
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ action, payload })
    });
    
    if (!response.ok) throw new Error("Network response was not ok");
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: "Lỗi kết nối server: " + error };
  }
}

export async function verifyTeacher(idgv: string): Promise<TeacherInfo | null> {
  const res = await callGAS('verifyTeacher', { idgv });
  return res.success ? res.data : null;
}

export async function verifyStudent(idgv: string, sbd: string, linkScript: string): Promise<StudentInfo | null> {
  // Ưu tiên dùng linkScript riêng của GV nếu có, không thì dùng Admin URL
  const endpoint = linkScript || ADMIN_SHEET_URL;
  const res = await callGAS('verifyStudent', { idgv, sbd }, endpoint);
  return res.success ? res.data : null;
}

export async function saveExam(linkScript: string, config: ExamConfig, questions: Question[]) {
  const endpoint = linkScript || ADMIN_SHEET_URL;
  return await callGAS('saveExam', { config, questions }, endpoint);
}

export async function getExamData(linkScript: string, examCode: string): Promise<{config: ExamConfig, questions: Question[]} | null> {
  const endpoint = linkScript || ADMIN_SHEET_URL;
  const res = await callGAS('getExamData', { examCode }, endpoint);
  return res.success ? { config: res.config, questions: res.questions } : null;
}

export async function submitResult(linkScript: string, result: ExamResult) {
  const endpoint = linkScript || ADMIN_SHEET_URL;
  return await callGAS('submitResult', { result }, endpoint);
}

export async function resetResults(linkScript: string, mode: 'all' | 'exam', examCode?: string) {
  const endpoint = linkScript || ADMIN_SHEET_URL;
  return await callGAS('resetResults', { mode, examCode }, endpoint);
}
