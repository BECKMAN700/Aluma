/**
 * Tipos do domínio Aluma.
 *
 * Estes tipos descrevem o formato que a API REST devolve. Datas são string
 * ISO 8601, e não `Date`, porque JSON não tem tipo data: `response.json()`
 * sempre entrega texto. Converta para `Date` só na borda de exibição.
 */

/** Data e hora em ISO 8601, ex.: "2026-09-02T01:41:59Z". */
export type ISODateString = string;

export interface School {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  classroomId: string;
  schoolId: string;
}

export interface Teacher {
  id: string;
  name: string;
  schoolId: string;
  subjectIds: string[];
}

export interface Classroom {
  id: string;
  name: string;
  grade: string;
  schoolId: string;
  teacherId: string;
  studentIds: string[];
}

export interface Question {
  id: string;
  studentId: string;
  subjectId: string;
  text: string;
  resolved: boolean;
  createdAt: ISODateString;
}

export type MessageAuthor = 'student' | 'tutor';

export interface Message {
  id: string;
  questionId: string;
  author: MessageAuthor;
  text: string;
  sentAt: ISODateString;
}
