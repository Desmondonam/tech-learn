import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  joinDate: string;
  githubUsername?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  courseId: string;
  order: number;
  duration: string;
  completed?: boolean;
  progress?: number;
  videoUrl?: string;
  resources?: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  color: string;
  icon: string;
  modules: number;
  completedModules?: number;
  enrolled: boolean;
  instructor: string;
}

export interface Assignment {
  id: string;
  title: string;
  courseId: string;
  moduleName: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded' | 'late';
  grade?: number;
  maxGrade: number;
  feedback?: string;
  description: string;
  submittedAt?: string;
  submissionText?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: UserRole;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: Message[];
}

export interface Webinar {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  zoomLink: string;
  instructor: string;
  duration: string;
  registered: boolean;
  type: 'webinar' | 'office-hours' | 'workshop' | 'class';
}

export interface SharedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  courseId: string;
  courseName: string;
  url: string;
}

export interface CodingChallenge {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;
  solved: boolean;
  score?: number;
  maxScore: number;
  tags: string[];
  githubUrl?: string;
  submittedAt?: string;
}

export interface Feedback {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  rating: number;
  content: string;
  submittedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_USERS: User[] = [
  { id: 'student1', name: 'Alex Johnson', email: 'alex@student.com', role: 'student', joinDate: '2024-09-01', githubUsername: 'alexjdev' },
  { id: 'student2', name: 'Maria Chen', email: 'maria@student.com', role: 'student', joinDate: '2024-09-01', githubUsername: 'mariachen' },
  { id: 'student3', name: 'James Wilson', email: 'james@student.com', role: 'student', joinDate: '2024-09-15', githubUsername: 'jwilson_code' },
  { id: 'student4', name: 'Priya Sharma', email: 'priya@student.com', role: 'student', joinDate: '2024-10-01', githubUsername: 'priyashdev' },
  { id: 'admin1', name: 'Dr. Sarah Mitchell', email: 'admin@techlearn.com', role: 'admin', joinDate: '2023-01-01' },
];

export const COURSES: Course[] = [
  { id: 'c1', title: 'Python for Data Science', description: 'Master Python fundamentals and apply them to real-world data science problems.', category: 'Data Science', color: '#3b82f6', icon: '🐍', modules: 12, completedModules: 8, enrolled: true, instructor: 'Dr. Sarah Mitchell' },
  { id: 'c2', title: 'SQL & Database Design', description: 'Learn SQL from basics to advanced queries and database architecture.', category: 'Database', color: '#10b981', icon: '🗄️', modules: 10, completedModules: 5, enrolled: true, instructor: 'Dr. Sarah Mitchell' },
  { id: 'c3', title: 'Web Development Bootcamp', description: 'Full-stack web development covering HTML, CSS, JavaScript, React, and Node.js.', category: 'Web Dev', color: '#f59e0b', icon: '🌐', modules: 20, completedModules: 3, enrolled: true, instructor: 'Dr. Sarah Mitchell' },
  { id: 'c4', title: 'Machine Learning Fundamentals', description: 'Introduction to ML algorithms, model training, and deployment.', category: 'AI/ML', color: '#8b5cf6', icon: '🤖', modules: 15, completedModules: 0, enrolled: false, instructor: 'Dr. Sarah Mitchell' },
];

export const MODULES: Module[] = [
  { id: 'm1', title: 'Python Basics & Setup', description: 'Install Python, set up your environment, and write your first program.', courseId: 'c1', order: 1, duration: '2h 30m', completed: true, progress: 100 },
  { id: 'm2', title: 'Variables & Data Types', description: 'Understand Python variable types, casting, and type checking.', courseId: 'c1', order: 2, duration: '3h', completed: true, progress: 100 },
  { id: 'm3', title: 'Control Flow', description: 'Conditionals, loops, and control statements in Python.', courseId: 'c1', order: 3, duration: '2h', completed: true, progress: 100 },
  { id: 'm4', title: 'Functions & Modules', description: 'Define reusable functions and import Python modules.', courseId: 'c1', order: 4, duration: '3h 30m', completed: true, progress: 100 },
  { id: 'm5', title: 'Data Structures', description: 'Lists, tuples, sets, and dictionaries in Python.', courseId: 'c1', order: 5, duration: '4h', completed: true, progress: 100 },
  { id: 'm6', title: 'File I/O & Exceptions', description: 'Reading/writing files and handling exceptions.', courseId: 'c1', order: 6, duration: '2h', completed: true, progress: 100 },
  { id: 'm7', title: 'NumPy Fundamentals', description: 'Arrays, vectorized operations, and linear algebra with NumPy.', courseId: 'c1', order: 7, duration: '4h', completed: true, progress: 100 },
  { id: 'm8', title: 'Pandas for Data Analysis', description: 'DataFrames, data cleaning, and exploratory data analysis.', courseId: 'c1', order: 8, duration: '5h', completed: true, progress: 100 },
  { id: 'm9', title: 'Data Visualization', description: 'Create compelling charts with Matplotlib and Seaborn.', courseId: 'c1', order: 9, duration: '3h', completed: false, progress: 45 },
  { id: 'm10', title: 'Introduction to SQL', description: 'Learn the basics of SQL and relational databases.', courseId: 'c2', order: 1, duration: '3h', completed: true, progress: 100 },
  { id: 'm11', title: 'SELECT & Filtering', description: 'Master SELECT statements, WHERE clauses, and filtering techniques.', courseId: 'c2', order: 2, duration: '2h 30m', completed: true, progress: 100 },
  { id: 'm12', title: 'JOINs & Relationships', description: 'Inner joins, outer joins, and table relationships.', courseId: 'c2', order: 3, duration: '4h', completed: true, progress: 100 },
  { id: 'm13', title: 'Aggregation & Grouping', description: 'GROUP BY, HAVING, and aggregate functions.', courseId: 'c2', order: 4, duration: '3h', completed: true, progress: 100 },
  { id: 'm14', title: 'Subqueries & CTEs', description: 'Nested queries and Common Table Expressions.', courseId: 'c2', order: 5, duration: '3h 30m', completed: false, progress: 20 },
];

export const ASSIGNMENTS: Assignment[] = [
  { id: 'a1', title: 'Python Calculator App', courseId: 'c1', moduleName: 'Functions & Modules', dueDate: '2024-12-15', status: 'graded', grade: 92, maxGrade: 100, feedback: 'Excellent work! Clean code structure and good use of functions. Minor improvement: add input validation.', description: 'Build a command-line calculator that supports +, -, *, / operations.', submittedAt: '2024-12-14', submissionText: 'Submitted via GitHub repository.' },
  { id: 'a2', title: 'Data Cleaning with Pandas', courseId: 'c1', moduleName: 'Pandas for Data Analysis', dueDate: '2025-01-10', status: 'graded', grade: 88, maxGrade: 100, feedback: 'Good analysis! Remember to handle edge cases in null values.', description: 'Clean and analyze the provided dataset using Pandas.', submittedAt: '2025-01-09' },
  { id: 'a3', title: 'NumPy Array Operations', courseId: 'c1', moduleName: 'NumPy Fundamentals', dueDate: '2025-01-25', status: 'submitted', maxGrade: 100, description: 'Implement matrix operations using NumPy without built-in methods.', submittedAt: '2025-01-24' },
  { id: 'a4', title: 'SQL Customer Database', courseId: 'c2', moduleName: 'SELECT & Filtering', dueDate: '2025-02-01', status: 'graded', grade: 95, maxGrade: 100, feedback: 'Near perfect! Great query optimization.', description: 'Design and query a customer database with at least 5 tables.', submittedAt: '2025-01-31' },
  { id: 'a5', title: 'Complex JOIN Queries', courseId: 'c2', moduleName: 'JOINs & Relationships', dueDate: '2025-02-20', status: 'pending', maxGrade: 100, description: 'Write 10 complex JOIN queries on the provided e-commerce database schema.' },
  { id: 'a6', title: 'Visualization Dashboard', courseId: 'c1', moduleName: 'Data Visualization', dueDate: '2025-03-05', status: 'pending', maxGrade: 100, description: 'Create a multi-chart dashboard using Matplotlib and Seaborn.' },
];

export const CODING_CHALLENGES: CodingChallenge[] = [
  { id: 'ch1', title: 'Two Sum', difficulty: 'easy', language: 'Python', solved: true, score: 100, maxScore: 100, tags: ['arrays', 'hash-map'], githubUrl: 'https://github.com/alexjdev/challenges/two-sum', submittedAt: '2025-01-10' },
  { id: 'ch2', title: 'Fibonacci Sequence', difficulty: 'easy', language: 'Python', solved: true, score: 95, maxScore: 100, tags: ['recursion', 'dynamic-programming'], githubUrl: 'https://github.com/alexjdev/challenges/fibonacci', submittedAt: '2025-01-12' },
  { id: 'ch3', title: 'Binary Search Tree', difficulty: 'medium', language: 'Python', solved: true, score: 80, maxScore: 100, tags: ['trees', 'recursion'], githubUrl: 'https://github.com/alexjdev/challenges/bst', submittedAt: '2025-01-20' },
  { id: 'ch4', title: 'SQL Top N per Group', difficulty: 'medium', language: 'SQL', solved: true, score: 90, maxScore: 100, tags: ['window-functions', 'aggregation'], submittedAt: '2025-02-01' },
  { id: 'ch5', title: 'Longest Common Subsequence', difficulty: 'hard', language: 'Python', solved: false, maxScore: 100, tags: ['dynamic-programming', 'strings'] },
  { id: 'ch6', title: 'Graph BFS/DFS', difficulty: 'medium', language: 'Python', solved: false, maxScore: 100, tags: ['graphs', 'traversal'] },
  { id: 'ch7', title: 'Merge Intervals', difficulty: 'medium', language: 'Python', solved: true, score: 85, maxScore: 100, tags: ['arrays', 'sorting'], submittedAt: '2025-02-10' },
  { id: 'ch8', title: 'Recursive Query CTE', difficulty: 'hard', language: 'SQL', solved: false, maxScore: 100, tags: ['recursive-cte', 'hierarchy'] },
];

const INITIAL_MESSAGES_ADMIN: Message[] = [
  { id: 'msg1', senderId: 'admin1', senderName: 'Dr. Sarah Mitchell', senderRole: 'admin', content: 'Hi Alex! Just checking in — how are you finding the Pandas module so far?', timestamp: '2025-02-24T10:00:00', read: true },
  { id: 'msg2', senderId: 'student1', senderName: 'Alex Johnson', senderRole: 'student', content: "It's going well, thank you! I'm finding the groupby operations a bit tricky though.", timestamp: '2025-02-24T10:15:00', read: true },
  { id: 'msg3', senderId: 'admin1', senderName: 'Dr. Sarah Mitchell', senderRole: 'admin', content: "That's totally normal! I've uploaded a cheat sheet in the resources section. Also, remember office hours are Thursday 3-5pm.", timestamp: '2025-02-24T10:20:00', read: true },
  { id: 'msg4', senderId: 'student1', senderName: 'Alex Johnson', senderRole: 'student', content: "Perfect, I'll check that out. Thanks for the reminder!", timestamp: '2025-02-24T10:25:00', read: false },
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv1',
    participantId: 'admin1',
    participantName: 'Dr. Sarah Mitchell',
    participantRole: 'admin',
    lastMessage: "Perfect, I'll check that out. Thanks!",
    lastTime: '10:25 AM',
    unread: 1,
    messages: INITIAL_MESSAGES_ADMIN,
  }
];

export const WEBINARS: Webinar[] = [
  { id: 'w1', title: 'Weekly Python Office Hours', description: 'Open Q&A session for all Python course students. Bring your questions!', date: '2025-02-27', time: '3:00 PM - 5:00 PM', zoomLink: 'https://zoom.us/j/123456789', instructor: 'Dr. Sarah Mitchell', duration: '2h', registered: true, type: 'office-hours' },
  { id: 'w2', title: 'SQL Advanced Techniques Workshop', description: 'Deep dive into window functions, CTEs, and query optimization strategies.', date: '2025-03-01', time: '2:00 PM - 4:00 PM', zoomLink: 'https://zoom.us/j/987654321', instructor: 'Dr. Sarah Mitchell', duration: '2h', registered: true, type: 'workshop' },
  { id: 'w3', title: 'Live Coding: Data Visualization', description: 'Build a real-time dashboard from scratch. Follow along and code with me!', date: '2025-03-05', time: '5:00 PM - 6:30 PM', zoomLink: 'https://zoom.us/j/112233445', instructor: 'Dr. Sarah Mitchell', duration: '1.5h', registered: false, type: 'class' },
  { id: 'w4', title: 'Career Talk: From Bootcamp to Big Tech', description: 'Guest speaker: Senior Data Engineer at Google shares their journey and tips for landing tech roles.', date: '2025-03-10', time: '6:00 PM - 7:30 PM', zoomLink: 'https://zoom.us/j/556677889', instructor: 'Guest Speaker', duration: '1.5h', registered: false, type: 'webinar' },
  { id: 'w5', title: 'Machine Learning Preview Session', description: 'Get a sneak peek at the upcoming ML course. No prerequisites needed!', date: '2025-03-15', time: '4:00 PM - 5:00 PM', zoomLink: 'https://zoom.us/j/334455667', instructor: 'Dr. Sarah Mitchell', duration: '1h', registered: false, type: 'webinar' },
];

export const SHARED_FILES: SharedFile[] = [
  { id: 'f1', name: 'Python Pandas Cheat Sheet.pdf', type: 'pdf', size: '2.4 MB', uploadedBy: 'Dr. Sarah Mitchell', uploadedAt: '2025-02-20', courseId: 'c1', courseName: 'Python for Data Science', url: '#' },
  { id: 'f2', name: 'Week 8 - Pandas Lecture Slides.pptx', type: 'pptx', size: '8.1 MB', uploadedBy: 'Dr. Sarah Mitchell', uploadedAt: '2025-02-18', courseId: 'c1', courseName: 'Python for Data Science', url: '#' },
  { id: 'f3', name: 'SQL JOINs Visual Guide.pdf', type: 'pdf', size: '1.8 MB', uploadedBy: 'Dr. Sarah Mitchell', uploadedAt: '2025-02-15', courseId: 'c2', courseName: 'SQL & Database Design', url: '#' },
  { id: 'f4', name: 'Sample Database Schema.sql', type: 'sql', size: '45 KB', uploadedBy: 'Dr. Sarah Mitchell', uploadedAt: '2025-02-14', courseId: 'c2', courseName: 'SQL & Database Design', url: '#' },
  { id: 'f5', name: 'Matplotlib Gallery Examples.zip', type: 'zip', size: '12.3 MB', uploadedBy: 'Dr. Sarah Mitchell', uploadedAt: '2025-02-22', courseId: 'c1', courseName: 'Python for Data Science', url: '#' },
  { id: 'f6', name: 'Career Resources & Interview Prep.pdf', type: 'pdf', size: '3.2 MB', uploadedBy: 'Dr. Sarah Mitchell', uploadedAt: '2025-02-10', courseId: 'c1', courseName: 'Python for Data Science', url: '#' },
];

export const FEEDBACKS: Feedback[] = [
  { id: 'fb1', studentId: 'student2', studentName: 'Maria Chen', courseId: 'c1', courseName: 'Python for Data Science', rating: 5, content: 'Absolutely fantastic course! Dr. Mitchell explains complex concepts so clearly. The hands-on assignments really cement the learning.', submittedAt: '2025-02-15' },
  { id: 'fb2', studentId: 'student3', studentName: 'James Wilson', courseId: 'c2', courseName: 'SQL & Database Design', rating: 4, content: 'Great content and pacing. Would love more practice datasets to work with. The live coding sessions are my favorite part!', submittedAt: '2025-02-10' },
  { id: 'fb3', studentId: 'student4', studentName: 'Priya Sharma', courseId: 'c1', courseName: 'Python for Data Science', rating: 5, content: 'Coming in with zero coding experience, I was nervous but the course was perfectly structured. I feel so confident now!', submittedAt: '2025-02-18' },
];

export const ADMIN_STUDENTS = MOCK_USERS.filter(u => u.role === 'student');

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppContextValue {
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  assignments: Assignment[];
  submitAssignment: (id: string, text: string) => void;
  conversations: Conversation[];
  sendMessage: (convId: string, content: string) => void;
  webinars: Webinar[];
  registerWebinar: (id: string) => void;
  sharedFiles: SharedFile[];
  uploadFile: (file: SharedFile) => void;
  feedbacks: Feedback[];
  submitFeedback: (fb: Omit<Feedback, 'id' | 'submittedAt'>) => void;
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  challenges: CodingChallenge[];
  codeOutput: string;
  runCode: (code: string, language: string) => void;
  isRunningCode: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>(ASSIGNMENTS);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [webinars, setWebinars] = useState<Webinar[]>(WEBINARS);
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>(SHARED_FILES);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(FEEDBACKS);
  const [challenges] = useState<CodingChallenge[]>(CODING_CHALLENGES);
  const [codeOutput, setCodeOutput] = useState('');
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 'n1', title: 'Assignment Graded', message: 'Your "Python Calculator App" has been graded: 92/100', type: 'success', read: false, timestamp: '2025-02-24T09:00:00' },
    { id: 'n2', title: 'New Resource Uploaded', message: 'Dr. Mitchell uploaded "Pandas Cheat Sheet"', type: 'info', read: false, timestamp: '2025-02-23T14:30:00' },
    { id: 'n3', title: 'Upcoming Webinar', message: 'Python Office Hours tomorrow at 3:00 PM', type: 'warning', read: true, timestamp: '2025-02-23T08:00:00' },
    { id: 'n4', title: 'Assignment Due Soon', message: '"Complex JOIN Queries" is due in 3 days', type: 'warning', read: false, timestamp: '2025-02-22T10:00:00' },
  ]);

  const login = (email: string, _password: string): boolean => {
    const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => setCurrentUser(null);

  const submitAssignment = (id: string, text: string) => {
    setAssignments(prev => prev.map(a =>
      a.id === id ? { ...a, status: 'submitted', submittedAt: new Date().toISOString(), submissionText: text } : a
    ));
  };

  const sendMessage = (convId: string, content: string) => {
    if (!currentUser) return;
    const newMsg: Message = {
      id: `msg${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      content,
      timestamp: new Date().toISOString(),
      read: true,
    };
    setConversations(prev => prev.map(c =>
      c.id === convId
        ? { ...c, messages: [...c.messages, newMsg], lastMessage: content, lastTime: 'Just now' }
        : c
    ));
  };

  const registerWebinar = (id: string) => {
    setWebinars(prev => prev.map(w =>
      w.id === id ? { ...w, registered: !w.registered } : w
    ));
  };

  const uploadFile = (file: SharedFile) => {
    setSharedFiles(prev => [file, ...prev]);
  };

  const submitFeedback = (fb: Omit<Feedback, 'id' | 'submittedAt'>) => {
    const newFb: Feedback = { ...fb, id: `fb${Date.now()}`, submittedAt: new Date().toISOString() };
    setFeedbacks(prev => [...prev, newFb]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const runCode = (code: string, language: string) => {
    setIsRunningCode(true);
    setCodeOutput('');
    setTimeout(() => {
      // Simulate code execution with realistic-looking output
      const pythonOutputs = [
        `>>> Running Python code...\n\nHello, World!\n42\n[1, 2, 3, 4, 5]\n{'name': 'Alex', 'score': 95}\n\nProcess finished with exit code 0`,
        `>>> Running Python code...\n\nResult: 150\nList sum: 55\nFiltered: [2, 4, 6, 8, 10]\n\nProcess finished with exit code 0`,
        `>>> Running Python code...\n\n   name  score grade\n0  Alex     95     A\n1  Maria    88     B\n2  James    72     C\n\nProcess finished with exit code 0`,
      ];
      const sqlOutputs = [
        `Query executed successfully.\n\n| id | name          | score |\n|----|---------------|-------|\n|  1 | Alex Johnson  |    95 |\n|  2 | Maria Chen    |    88 |\n|  3 | James Wilson  |    72 |\n\n3 rows returned`,
        `Query executed successfully.\n\n| department | avg_score | total |\n|------------|-----------|-------|\n| DS         |      91.5 |    24 |\n| WebDev     |      87.2 |    18 |\n\n2 rows returned`,
      ];
      const outputs = language === 'sql' ? sqlOutputs : pythonOutputs;
      setCodeOutput(outputs[Math.floor(Math.random() * outputs.length)]);
      setIsRunningCode(false);
    }, 1500);
  };

  return (
    <AppContext.Provider value={{
      currentUser, login, logout,
      assignments, submitAssignment,
      conversations, sendMessage,
      webinars, registerWebinar,
      sharedFiles, uploadFile,
      feedbacks, submitFeedback,
      notifications, markNotificationRead,
      challenges,
      codeOutput, runCode, isRunningCode,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

// export { MOCK_USERS, COURSES, MODULES, ADMIN_STUDENTS };
