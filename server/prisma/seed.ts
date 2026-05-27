import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "ada@alu.edu" },
    update: {},
    create: {
      email: "ada@alu.edu",
      firstName: "Ada",
      lastName: "Karim",
      passwordHash,
      xp: 12480,
      streakDays: 24,
    },
  });

  await prisma.plannerTask.createMany({
    skipDuplicates: true,
    data: [
      { userId: user.id, title: "Calculus Review", day: 0, hour: 9, duration: 2, color: "from-indigo-500 to-purple-500" },
      { userId: user.id, title: "Physics Lab Notes", day: 0, hour: 14, duration: 1, color: "from-sky-500 to-blue-500" },
      { userId: user.id, title: "AI Tutor Session", day: 1, hour: 10, duration: 1, color: "from-fuchsia-500 to-pink-500" },
      { userId: user.id, title: "Spanish Practice", day: 2, hour: 16, duration: 2, color: "from-emerald-500 to-teal-500" },
      { userId: user.id, title: "Mock Quiz", day: 3, hour: 11, duration: 1, color: "from-amber-500 to-orange-500" },
    ],
  });

  const today = new Date();
  const sessions = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 6 + i);
    return { userId: user.id, duration: [2.4, 3.1, 1.8, 4.0, 2.9, 3.6, 1.2][i], focusScore: [78, 82, 65, 91, 80, 88, 70][i], date: d };
  });
  await prisma.studySession.createMany({ skipDuplicates: true, data: sessions });

  console.log("Seed complete. Demo account: ada@alu.edu / password123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
