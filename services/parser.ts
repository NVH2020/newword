
import { Question, QuestionType } from '../types';

/**
 * Parses the Word document content (extracted as HTML/Text) into Question objects.
 * Uses Regex to identify MCQ, TF, and SA based on the provided format.
 */
export async function parseExamFile(file: File, examCode: string): Promise<Question[]> {
  const arrayBuffer = await file.arrayBuffer();
  // Using mammoth to get HTML to detect underlining
  const result = await (window as any).mammoth.convertToHtml({ arrayBuffer });
  const html = result.value;
  
  const questions: Question[] = [];
  const sections = html.split(/Phần\s+(I|II|III)\./i);
  
  let currentType = QuestionType.MCQ;
  
  // Very simplified parser based on the requested patterns.
  // In a real app, this would be much more robust.
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const paragraphs = Array.from(doc.querySelectorAll('p'));

  let currentQuestion: Partial<Question> | null = null;
  let sectionIndex = 0;

  paragraphs.forEach((p, idx) => {
    const text = p.textContent?.trim() || '';
    const innerHtml = p.innerHTML;

    // Detect section headers
    if (/Phần I/i.test(text)) { currentType = QuestionType.MCQ; return; }
    if (/Phần II/i.test(text)) { currentType = QuestionType.TF; return; }
    if (/Phần III/i.test(text)) { currentType = QuestionType.SA; return; }

    // Detect new question "Câu X."
    const questionMatch = text.match(/^Câu\s+(\d+)\s*[:.]/i);
    if (questionMatch) {
      if (currentQuestion && currentQuestion.idquestion) {
        questions.push(currentQuestion as Question);
      }
      currentQuestion = {
        id: Math.random().toString(36).substr(2, 9),
        exams: examCode,
        idquestion: questionMatch[1],
        type: currentType,
        question: text.replace(/^Câu\s+\d+\.\s*/i, ''),
        options: [],
        correctAnswer: currentType === QuestionType.TF ? [] : '',
        explanation: '',
        datetime: new Date().toISOString()
      };
      
      // If it's an MCQ and the question body itself contains the underlined answer
      // (Though the prompt says "Gạch chân đáp án đúng, xuống dòng các phương án")
    }
    else if (!mcqMatch && !tfMatch && currentQuestion && !questionMatch) {
  currentQuestion.question += '<br/>' + innerHtml;
}

    if (!currentQuestion) return;

    // MCQ Parsing: A. B. C. D.
    if (currentType === QuestionType.MCQ) {
      const mcqMatch = text.match(/^([A-D])\.\s*(.*)/i);
      if (mcqMatch) {
        const label = mcqMatch[1].toUpperCase();
        const content = mcqMatch[2];
        currentQuestion.options?.push(`${label}. ${content}`);
        if (innerHtml.includes('<u>')) {
          currentQuestion.correctAnswer = label;
        }
      }
    }

    // TF Parsing: a) b) c) d)
    if (currentType === QuestionType.TF) {
      const tfMatch = text.match(/^([a-d])\)\s*(.*)/i);
      if (tfMatch) {
        const label = tfMatch[1].toLowerCase();
        const content = tfMatch[2];
        currentQuestion.options?.push(`${label}) ${content}`);
       if (
  innerHtml.includes('<u>') ||
  innerHtml.includes('text-decoration:underline')
) {
          (currentQuestion.correctAnswer as string[]).push(label);
        }
      }
    }

    // SA Parsing: <Key=X>
    if (currentType === QuestionType.SA) {
      const saMatch = text.match(/<\s*Key\s*=\s*([^>]+)\s*>/i);
      if (saMatch) {
        currentQuestion.correctAnswer = saMatch[1].trim();
      }
    }

    // Explanation: loigiai: "..."
    if (text.toLowerCase().includes('loigiai:')) {
      currentQuestion.explanation = text.split(/loigiai:/i)[1]?.trim().replace(/^"|"$/g, '');
    }
  });

  if (currentQuestion && currentQuestion.idquestion) {
    questions.push(currentQuestion as Question);
  }

  return questions;
}
