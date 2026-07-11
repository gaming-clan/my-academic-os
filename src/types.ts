export interface Course {
  id: string;
  userId: string;
  name: string;
  code?: string;
  instructor?: string;
  semester?: string;
  progress?: number; // 0 to 100
  color?: string; // Hex color or styling theme class
  createdAt?: string;
}

export interface Assignment {
  id: string;
  userId: string;
  courseId: string;
  title: string;
  dueDate?: string; // YYYY-MM-DD
  weight: number; // 0 to 100
  grade?: number; // 0 to 100
  status: 'Not Started' | 'In Progress' | 'Submitted' | 'Graded';
  createdAt?: string;
}

export interface Note {
  id: string;
  userId: string;
  courseId: string;
  title: string;
  content: string; // Markdown text
  folder?: string; // Folder category like "Lecture", "Lab", "Study Guide"
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  userId: string;
  courseId?: string; // Optional course link
  title: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  dueDate?: string; // YYYY-MM-DD
  createdAt?: string;
}

export interface Profile {
  userId: string;
  name: string;
  academicLevel?: 'University' | 'High School';
  program?: string;
  studentId?: string;
  group?: string;
  updatedAt?: string;
}
