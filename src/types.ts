export interface Course {
  id: string;
  userId: string;
  name: string;
  code?: string;
  instructor?: string;
  semester?: string;
  progress?: number; // 0 to 100
  color?: string; // Hex color or styling theme class
  credits?: number; // Kredite ECTS, used to weight the university-mode overall average
  createdAt?: string;
}

export interface Assignment {
  id: string;
  userId: string;
  courseId: string;
  title: string;
  dueDate?: string; // YYYY-MM-DD
  weight: number; // 0 to 100
  grade?: number; // Nota, Albanian scale 4 to 10 (5 is the minimum passing grade)
  status: 'Pa Filluar' | 'Në Vazhdim' | 'Dorëzuar' | 'Vlerësuar';
  createdAt?: string;
}

export interface Note {
  id: string;
  userId: string;
  courseId: string;
  title: string;
  content: string; // Markdown text
  folder?: string; // Folder category like "Leksione", "Laborator", "Udhëzues Studimi"
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  userId: string;
  courseId?: string; // Optional course link
  title: string;
  status: 'Pa Filluar' | 'Në Vazhdim' | 'Përfunduar';
  dueDate?: string; // YYYY-MM-DD
  createdAt?: string;
}

export interface Profile {
  userId: string;
  name: string;
  academicLevel?: 'Universitet' | 'Shkollë e Mesme';
  program?: string;
  studentId?: string;
  group?: string;
  updatedAt?: string;
}
