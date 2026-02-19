
export enum QuestionType {
  MCQ = 'MCQ', // Phần I
  TF = 'TF',   // Phần II
  SA = 'SA'    // Phần III
}

export interface Question {
  id: string;
  exams: string;
  idquestion: string;
  classTag: string;
  type: QuestionType;
  question: string;
  options?: string[]; // For MCQ and TF
  correctAnswer: string | string[]; // Single for MCQ/SA, Array for TF
  explanation: string;
  datetime: string;
}

export interface ExamConfig {
  exams: string;
  idNumber: string;
  mcqCount: number;
  mcqScore: number;
  tfCount: number;
  tfScorePerPart: number; // Assuming points per small part in TF
  saCount: number;
  saScore: number;
  fullTime: number;
  miniTime: number;
  tabLimit: number;
  closeDate: string;
}

export interface User {
  role: 'GV' | 'HS';
  idgv: string;
  name: string;
  sbd?: string;
  class?: string;
  linkScript?: string;
}

export interface TeacherInfo {
  idNumber: string;
  name: string;
  linkScript: string;
  subject: string;
}

export interface StudentInfo {
  sbd: string;
  name: string;
  class: string;
  idgv: string;
}

export interface ExamResult {
  timestamp: string;
  exams: string;
  sbd: string;
  name: string;
  class: string;
  totalScore: number;
  timeTaken: number; // seconds
  detail: string; // JSON string of answers
}
