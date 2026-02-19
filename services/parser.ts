import { Question, QuestionType } from '../types';

export async function parseExamFile(file: File, examCode: string): Promise<Question[]> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await (window as any).mammoth.convertToHtml({ arrayBuffer });
  const html = result.value;

  const questions: Question[] = [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const paragraphs = Array.from(doc.querySelectorAll('p'));

  let currentType = QuestionType.MCQ;
  let currentQuestion: Partial<Question> | null = null;

  const isUnderlined = (innerHtml: string) => {
    return (
      innerHtml.includes('<u>') ||
      innerHtml.includes('text-decoration:underline') ||
      innerHtml.includes('text-decoration: underline')
    );
  };

  paragraphs.forEach((p) => {
    const text = p.textContent?.trim() || '';
    const innerHtml = p.innerHTML;

    if (!text) return;

    // =========================
    // Detect Section (robust)
if (/Phần\s*I\b/i.test(text)) {
  currentType = QuestionType.MCQ;
  return;
}

if (/Phần\s*II\b/i.test(text)) {
  currentType = QuestionType.TF;
  return;
}

if (/Phần\s*III\b/i.test(text)) {
  currentType = QuestionType.SA;
  return;
}
    // =========================
    // Detect New Question
    // =========================
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
        question: text.replace(/^Câu\s+\d+\s*[:.]\s*/i, ''),
        options: [],
        correctAnswer: currentType === QuestionType.TF ? [] : '',
        explanation: '',
        datetime: new Date().toISOString()
      };

      return;
    }

    if (!currentQuestion) return;

    // =========================
    // MCQ Parsing
    // =========================
    if (currentType === QuestionType.MCQ) {
      const mcqMatch = text.match(/^([A-D])[\.\)]\s*(.*)/i);

      if (mcqMatch) {
        const label = mcqMatch[1].toUpperCase();
        const content = mcqMatch[2];

        currentQuestion.options?.push(`${label}. ${content}`);

        if (isUnderlined(innerHtml)) {
          currentQuestion.correctAnswer = label;
        }

        return;
      }
    }

    // =========================
    // TF Parsing
    // =========================
    if (currentType === QuestionType.TF) {
      const tfMatch = text.match(/^([a-d])[\)\.]\s*(.*)/i);

      if (tfMatch) {
        const label = tfMatch[1].toLowerCase();
        const content = tfMatch[2];

        currentQuestion.options?.push(`${label}) ${content}`);

        if (isUnderlined(innerHtml)) {
          (currentQuestion.correctAnswer as string[]).push(label);
        }

        return;
      }
    }

    // =========================
    // SA Parsing
    // =========================
    if (currentType === QuestionType.SA) {
      const saMatch = text.match(/<\s*Key\s*=\s*([^>]+)\s*>/i);

      if (saMatch) {
        currentQuestion.correctAnswer = saMatch[1].trim();
        return;
      }
    }

    // =========================
    // Explanation
    // =========================
    if (/loigiai:/i.test(text)) {
      currentQuestion.explanation =
        text.split(/loigiai:/i)[1]?.trim().replace(/^"|"$/g, '') || '';
      return;
    }

    // =========================
    // Append multi-line content
    // =========================
    currentQuestion.question += '<br/>' + innerHtml;
  });

  if (currentQuestion && currentQuestion.idquestion) {
    questions.push(currentQuestion as Question);
  }

  return questions;
}
