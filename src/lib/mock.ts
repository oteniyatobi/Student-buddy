export const studyStats = [
  { label: "Study Streak", value: "24", unit: "days", trend: "+3", color: "from-indigo-500 to-purple-500" },
  { label: "Hours This Week", value: "18.5", unit: "hrs", trend: "+12%", color: "from-sky-500 to-indigo-500" },
  { label: "Quizzes Aced", value: "47", unit: "quizzes", trend: "+8", color: "from-fuchsia-500 to-pink-500" },
  { label: "XP Earned", value: "12,480", unit: "XP", trend: "+540", color: "from-emerald-500 to-teal-500" },
];

export const recentActivity = [
  { title: "Completed Quiz: Organic Chemistry", time: "2h ago", icon: "Trophy" },
  { title: "Generated summary for ‘Calculus II’", time: "4h ago", icon: "FileText" },
  { title: "Chat session with AI tutor", time: "Yesterday", icon: "MessageSquare" },
  { title: "Uploaded notes: Linear Algebra", time: "2 days ago", icon: "Upload" },
];

export const upcomingTasks = [
  { title: "Review Biology Ch.4", due: "Today, 6:00 PM", priority: "high" },
  { title: "Practice Spanish Vocab", due: "Tomorrow, 9:00 AM", priority: "med" },
  { title: "Math problem set #12", due: "Fri, 3:00 PM", priority: "low" },
];

export const weekChart = [
  { d: "Mon", hours: 2.4, focus: 78 },
  { d: "Tue", hours: 3.1, focus: 82 },
  { d: "Wed", hours: 1.8, focus: 65 },
  { d: "Thu", hours: 4.0, focus: 91 },
  { d: "Fri", hours: 2.9, focus: 80 },
  { d: "Sat", hours: 3.6, focus: 88 },
  { d: "Sun", hours: 1.2, focus: 70 },
];

export const subjectsPie = [
  { name: "Math", value: 35 },
  { name: "Science", value: 28 },
  { name: "History", value: 14 },
  { name: "Languages", value: 23 },
];

export const quizQuestions = [
  {
    q: "Which data structure uses LIFO order?",
    options: ["Queue", "Stack", "Linked List", "Heap"],
    a: 1,
  },
  {
    q: "What is the derivative of sin(x)?",
    options: ["cos(x)", "-cos(x)", "-sin(x)", "tan(x)"],
    a: 0,
  },
  {
    q: "Photosynthesis primarily occurs in the…",
    options: ["Mitochondria", "Ribosome", "Chloroplast", "Nucleus"],
    a: 2,
  },
  {
    q: "Who wrote ‘1984’?",
    options: ["Aldous Huxley", "George Orwell", "Ray Bradbury", "Isaac Asimov"],
    a: 1,
  },
  {
    q: "Speed of light in vacuum (m/s)?",
    options: ["3×10⁶", "3×10⁸", "3×10¹⁰", "3×10⁴"],
    a: 1,
  },
];

export const chatPrompts = [
  "Explain quantum entanglement simply",
  "Quiz me on French Revolution",
  "Summarize my Biology notes",
  "Build a 7-day study plan",
];

export const mockChat = [
  { role: "ai", text: "Hey! 👋 I'm your AI Study Companion. What would you like to learn today?" },
  { role: "user", text: "Can you explain photosynthesis in 3 sentences?" },
  { role: "ai", text: "Photosynthesis is how plants convert sunlight into chemical energy. Inside chloroplasts, chlorophyll captures light and uses it to combine CO₂ and water into glucose. The byproduct, oxygen, is released into the air — fueling almost every breath you take." },
];

export const plannerTasks = [
  { id: "t1", title: "Calculus Review", day: 1, hour: 9, len: 2, color: "from-indigo-500 to-purple-500" },
  { id: "t2", title: "Physics Lab Notes", day: 1, hour: 14, len: 1, color: "from-sky-500 to-blue-500" },
  { id: "t3", title: "AI Tutor Session", day: 2, hour: 10, len: 1, color: "from-fuchsia-500 to-pink-500" },
  { id: "t4", title: "Spanish Practice", day: 3, hour: 16, len: 2, color: "from-emerald-500 to-teal-500" },
  { id: "t5", title: "Mock Quiz", day: 4, hour: 11, len: 1, color: "from-amber-500 to-orange-500" },
  { id: "t6", title: "Reading: Orwell", day: 5, hour: 19, len: 2, color: "from-rose-500 to-red-500" },
];

export const badges = [
  { name: "7-Day Streak", icon: "🔥", earned: true },
  { name: "Quiz Master", icon: "🧠", earned: true },
  { name: "Night Owl", icon: "🌙", earned: true },
  { name: "Early Bird", icon: "🐦", earned: false },
  { name: "100 Hours", icon: "⏰", earned: false },
  { name: "Polyglot", icon: "🌍", earned: true },
];

export const testimonials = [
  { name: "Maya Chen", role: "CS Student", text: "Smart Study Companion turned my chaotic notes into structured wins. My GPA jumped from 3.2 to 3.8 in one semester.", avatar: "MC" },
  { name: "Arjun Patel", role: "Med Student", text: "The AI summaries are scary-good. It’s like having a tutor that never sleeps. Quiz mode is addictively fun.", avatar: "AP" },
  { name: "Sofia Reyes", role: "High School Senior", text: "I finally enjoy studying. The streaks and XP make it feel like a game I want to win every day.", avatar: "SR" },
];
