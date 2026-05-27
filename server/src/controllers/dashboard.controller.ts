import { Response } from "express";
import { prisma } from "../config/db.js";
import { AuthRequest } from "../types/index.js";

export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);

    const [user, weekSessions, quizAttempts, noteCount, recentActivities] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { xp: true, streakDays: true, firstName: true, lastName: true },
      }),
      prisma.studySession.findMany({
        where: { userId, date: { gte: weekStart } },
        orderBy: { date: "asc" },
      }),
      prisma.quizAttempt.count({
        where: {
          userId,
          score: { gte: 1 },
        },
      }),
      prisma.note.count({ where: { userId } }),
      prisma.chatMessage.findMany({
        where: { userId, role: "user" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { content: true, createdAt: true },
      }),
    ]);

    const hoursThisWeek = weekSessions.reduce((sum, s) => sum + s.duration, 0);

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weekChart = days.map((d, i) => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + i);
      const daySessions = weekSessions.filter((s) => {
        const sDate = new Date(s.date);
        return sDate.toDateString() === dayDate.toDateString();
      });
      const hours = daySessions.reduce((sum, s) => sum + s.duration, 0);
      const focus = daySessions.length
        ? Math.round(daySessions.reduce((sum, s) => sum + s.focusScore, 0) / daySessions.length)
        : 0;
      return { d, hours: parseFloat(hours.toFixed(1)), focus };
    });

    const recentNotes = await prisma.note.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { title: true, createdAt: true },
    });

    const recentAttempts = await prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { completedAt: "desc" },
      take: 3,
      include: { quiz: { select: { title: true } } },
    });

    const recentActivity = [
      ...recentNotes.map((n) => ({
        title: `Uploaded: ${n.title}`,
        time: formatRelativeTime(n.createdAt),
        icon: "Upload",
      })),
      ...recentAttempts.map((a) => ({
        title: `Quiz: ${a.quiz.title} — ${a.score}/${a.total}`,
        time: formatRelativeTime(a.completedAt),
        icon: "Trophy",
      })),
    ]
      .sort((a, b) => (a.time > b.time ? -1 : 1))
      .slice(0, 4);

    const upcomingTasks = await prisma.plannerTask.findMany({
      where: { userId },
      orderBy: [{ day: "asc" }, { hour: "asc" }],
      take: 3,
      select: { id: true, title: true, due: true, priority: true },
    });

    res.json({
      stats: {
        streakDays: user?.streakDays ?? 0,
        hoursThisWeek: parseFloat(hoursThisWeek.toFixed(1)),
        quizzesAced: quizAttempts,
        xp: user?.xp ?? 0,
        noteCount,
      },
      weekChart,
      recentActivity,
      upcomingTasks,
      userName: user ? `${user.firstName}` : "Student",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

function formatRelativeTime(date: Date): string {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.round(diff / 86400)} days ago`;
  return new Date(date).toLocaleDateString();
}
