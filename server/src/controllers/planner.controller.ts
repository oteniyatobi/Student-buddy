import { Response } from "express";
import { prisma } from "../config/db.js";
import { AuthRequest } from "../types/index.js";
import { getRouteParam, toBoundedInteger } from "../utils/request.js";

export const listTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tasks = await prisma.plannerTask.findMany({
      where: { userId: req.user!.userId },
      orderBy: [{ day: "asc" }, { hour: "asc" }],
    });
    res.json({ tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, day, hour, duration, color, priority, due } = req.body;
    if (!title) {
      res.status(400).json({ message: "Title is required" });
      return;
    }

    const task = await prisma.plannerTask.create({
      data: {
        userId: req.user!.userId,
        title,
        day: toBoundedInteger(day, 0, 0, 6),
        hour: toBoundedInteger(hour, 9, 0, 23),
        duration: toBoundedInteger(duration, 1, 1, 24),
        color: color ?? "from-indigo-500 to-purple-500",
        priority: priority ?? "med",
        due,
      },
    });
    res.status(201).json({ task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create task" });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const taskId = getRouteParam(req.params.id, res, "task id");
    if (!taskId) return;

    const task = await prisma.plannerTask.findFirst({
      where: { id: taskId, userId: req.user!.userId },
    });
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    const { title, day, hour, duration, color, priority, due } = req.body;
    const updated = await prisma.plannerTask.update({
      where: { id: task.id },
      data: {
        ...(title !== undefined && { title }),
        ...(day !== undefined && { day: toBoundedInteger(day, task.day, 0, 6) }),
        ...(hour !== undefined && { hour: toBoundedInteger(hour, task.hour, 0, 23) }),
        ...(duration !== undefined && { duration: toBoundedInteger(duration, task.duration, 1, 24) }),
        ...(color !== undefined && { color }),
        ...(priority !== undefined && { priority }),
        ...(due !== undefined && { due }),
      },
    });
    res.json({ task: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update task" });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const taskId = getRouteParam(req.params.id, res, "task id");
    if (!taskId) return;

    const task = await prisma.plannerTask.findFirst({
      where: { id: taskId, userId: req.user!.userId },
    });
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }
    await prisma.plannerTask.delete({ where: { id: task.id } });
    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete task" });
  }
};
