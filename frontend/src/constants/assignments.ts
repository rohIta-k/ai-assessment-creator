import {
  BookOpen,
  ClipboardList,
  FilePlus2,
  Grid2X2,
  Library,
  Sparkles,
  Users,
} from 'lucide-react'
import type { Assignment, GeneratedQuestion, NavigationItem, QuestionType } from '../types/assignment'

export const assignments: Assignment[] = []

export const questionTypeOptions: QuestionType[] = [
  { id: 'mcq', label: 'Multiple Choice Questions', questions: 1, marks: 1 },
  { id: 'short', label: 'Short Questions', questions: 1, marks: 1 },
  { id: 'diagram', label: 'Diagram/Graph-Based Questions', questions: 1, marks: 1 },
  { id: 'numerical', label: 'Numerical Problems', questions: 1, marks: 1 },
]

export const sidebarNavigation: NavigationItem[] = [
  { label: 'Home', path: '/', icon: Grid2X2 },
  { label: 'My Groups', path: '/groups', icon: Users },
  { label: 'Assignments', path: '/dashboard', icon: ClipboardList, badge: 10 },
  { label: "AI Teacher's Toolkit", path: '/output', icon: BookOpen },
  { label: 'My Library', path: '/create', icon: Library, badge: 32 },
]

export const mobileNavigation: NavigationItem[] = [
  { label: 'Home', path: '/', icon: Grid2X2, mobileIconSrc: '/home.svg' },
  { label: 'Assignments', path: '/dashboard', icon: ClipboardList, mobileIconSrc: '/assignments.svg' },
  { label: 'Library', path: '/create', icon: FilePlus2, mobileIconSrc: '/my_library.svg' },
  { label: 'AI Toolkit', path: '/output', icon: Sparkles, mobileIconSrc: '/ai_teacher_toolkit.svg' },
]

export const generatedQuestions: GeneratedQuestion[] = [
  {
    id: 1,
    difficulty: 'Easy',
    text: 'Define electroplating. Explain its purpose.',
    marks: 2,
  },
  {
    id: 2,
    difficulty: 'Moderate',
    text: 'What is the role of a conductor in the process of electrolysis?',
    marks: 2,
  },
  {
    id: 3,
    difficulty: 'Easy',
    text: 'Why does a solution of copper sulfate conduct electricity?',
    marks: 2,
  },
  {
    id: 4,
    difficulty: 'Moderate',
    text: 'Describe one example of the chemical effect of electric current in daily life.',
    marks: 2,
  },
  {
    id: 5,
    difficulty: 'Moderate',
    text: 'Explain why electric current is said to have chemical effects.',
    marks: 2,
  },
  {
    id: 6,
    difficulty: 'Challenging',
    text: 'How is sodium hydroxide prepared during the electrolysis of brine? Write the chemical reaction involved.',
    marks: 2,
  },
  {
    id: 7,
    difficulty: 'Challenging',
    text: 'What happens at the cathode and anode during the electrolysis of water? Name the gases evolved.',
    marks: 2,
  },
  {
    id: 8,
    difficulty: 'Easy',
    text: 'Mention the type of current used in electroplating and justify why it is used.',
    marks: 2,
  },
  {
    id: 9,
    difficulty: 'Moderate',
    text: 'What is the importance of electric current in the field of metallurgy?',
    marks: 2,
  },
  {
    id: 10,
    difficulty: 'Challenging',
    text: 'Explain with a chemical equation how copper is deposited during the electroplating of an object.',
    marks: 2,
  },
]
