import { Request } from "express";

export interface JwtPayload {
  userId: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface QuizQuestion {
  q: string;
  options: string[];
  a: number;
}

export interface SummaryData {
  shortText: string;
  detailedText: string;
  keyPoints: string[];
}

export interface ChatMessageInput {
  role: "user" | "assistant";
  content: string;
}
