
import { TeacherInfo, StudentInfo, ExamConfig, Question, ExamResult } from '../types';

const ADMIN_SHEET_URL = "https://script.google.com/macros/s/AKfycbyfE9_35N_Y_L0K4P3q9v8T0o3vV-K1B1C/exec"; // Mock URL

/**
 * Generic fetcher for Google Apps Script.
 * Assumes the Script returns JSON and handles CORS.
 */
async function callScript(url: string, payload: any) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'no-cors', // In real scenarios, Google Apps Script redirects might cause issues with 'cors'
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    // Due to 'no-cors', we can't read the body in standard browser fetch if it's not handled by the server.
    // Usually, we use JSONP or the developer sets up a CORS-friendly proxy.
    // For this prototype, we'll simulate the response or assume 'cors' works if configured correctly.
    return { success: true }; 
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// SIMULATED DB FOR PROTOTYPE PURPOSES (Since real Google Sheet URLs need active scripts)
const MOCK_TEACHERS: TeacherInfo[] = [
  { idNumber: "GV001", name: "Nguyễn Văn A", linkScript: "https://script.google.com/macros/s/teacher-a/exec", subject: "Toán" },
  { idNumber: "GV002", name: "Trần Thị B", linkScript: "https://script.google.com/macros/s/teacher-b/exec", subject: "Lý" }
];

export async function verifyTeacher(idgv: string): Promise<TeacherInfo | null> {
  // Real implementation: fetch from ADMIN_SHEET_URL?action=getTeachers
  return MOCK_TEACHERS.find(t => t.idNumber === idgv) || null;
}

export async function verifyStudent(idgv: string, sbd: string, linkScript: string): Promise<StudentInfo | null> {
  // Real implementation: fetch from linkScript?action=getStudents
  // Simulation:
  if (idgv === "GV001" && sbd === "HS001") {
    return { sbd: "HS001", name: "Lê Văn C", class: "12A1", idgv: "GV001" };
  }
  return null;
}

export async function saveExam(linkScript: string, config: ExamConfig, questions: Question[]) {
  // POST to teacher's script
  console.log("Saving exam to:", linkScript, { config, questions });
  return { success: true };
}

export async function getExamData(linkScript: string, examCode: string): Promise<{config: ExamConfig, questions: Question[]} | null> {
  // GET from teacher's script
  return null; // Implementation needed
}

export async function submitResult(linkScript: string, result: ExamResult) {
  console.log("Submitting result:", result);
  return { success: true };
}

export async function resetResults(linkScript: string, mode: 'all' | 'exam', examCode?: string) {
  console.log("Resetting results:", { mode, examCode });
  return { success: true };
}
