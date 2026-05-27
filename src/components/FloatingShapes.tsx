import { motion } from "framer-motion";

export function FloatingShapes() {
  const shapes = [
    { c: "from-indigo-500 to-purple-500", x: "8%", y: "18%", s: 220, d: 0 },
    { c: "from-fuchsia-500 to-pink-500", x: "80%", y: "12%", s: 180, d: 1.2 },
    { c: "from-sky-400 to-indigo-500", x: "70%", y: "70%", s: 260, d: 0.6 },
    { c: "from-violet-500 to-blue-500", x: "15%", y: "75%", s: 200, d: 1.8 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {shapes.map((sh, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{
            opacity: 0.55,
            scale: 1,
            x: [0, 20, -10, 0],
            y: [0, -30, 10, 0],
          }}
          transition={{ duration: 14 + i * 2, delay: sh.d, repeat: Infinity, ease: "easeInOut" }}
          style={{ left: sh.x, top: sh.y, width: sh.s, height: sh.s }}
          className={`absolute rounded-full bg-gradient-to-br ${sh.c} blur-3xl opacity-50`}
        />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,var(--background)_95%)]" />
    </div>
  );
}
