import { COLORS } from './colors.js';
import { FONTS, SPACING, ANIMATIONS } from './theme.js';

export const BASE_API_URL = 'http://127.0.0.1:8000';

export const API_ENDPOINTS = {
  chat: '/chat',
  followup: '/followup',
  health: '/health',
};

export const CHAT_CONFIG = {
  maxMessageLength: 1000,
  typingDelay: 50,
  responseDelay: 500,
  maxRetries: 3,
};

export const UI_CONSTANTS = {
  chatMaxHeight: '60vh',
  sidebarWidth: '280px',
  headerHeight: '80px',
  inputMinHeight: '56px',
  messageMaxWidth: '80%',
};

export const MEDICAL_KEYWORDS = [
  'diagnosis', 'treatment', 'symptoms', 'medication', 'therapy',
  'patient', 'clinical', 'medical', 'health', 'disease',
  'ultrasound', 'blood pressure', 'cardiovascular', 'diabetes',
  'arrhythmia', 'pulse wave velocity', 'PWV', 'ARTSENS'
];

export const SAMPLE_QUESTIONS = [
  {
    id: 1,
    text: "What is pulse wave velocity and how is it measured?",
    category: "General"
  },
  {
    id: 2,
    text: "How does the ARTSENS device work for PWV measurement?",
    category: "Device"
  },
  {
    id: 3,
    text: "What are the contraindications for PWV measurement?",
    category: "Clinical"
  },
  {
    id: 4,
    text: "How can I prevent Type 2 Diabetes?",
    category: "Prevention"
  },
  {
    id: 5,
    text: "What are the differences between obstructive and central sleep apnea?",
    category: "Clinical"
  }
];

export const LOADING_MESSAGES = [
  "Analyzing medical knowledge graph...",
  "Processing your query...",
  "Retrieving relevant information...",
  "Consulting medical database...",
  "Generating evidence-based response...",
];

export {
  COLORS,
  FONTS,
  SPACING,
  ANIMATIONS,
};