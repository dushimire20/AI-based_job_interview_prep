// app/api/vapi/generate/route.ts
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

async function generateInterview({
  type,
  role,
  level,
  techstack,
  amount,
  userid,
}: {
  type?: string;
  role?: string;
  level?: string;
  techstack?: string;
  amount?: string | number;
  userid?: string;
}) {
  const { text: questionsText } = await generateText({
    model: google("gemini-2.5-flash"),
    prompt: `Return ONLY valid JSON (no markdown, no extra text).
It must be a JSON array of strings.

Prepare questions for a job interview.
The job role is ${role}.
The job experience level is ${level}.
The tech stack used in the job is: ${techstack}.
The focus between behavioural and technical questions should lean towards: ${type}.
The amount of questions required is: ${amount}.
The questions are going to be read by a voice assistant so do not use slashes, asterisks, or other special characters.
Output example:
["Question 1","Question 2","Question 3"]`,
  });

  const cleaned = String(questionsText)
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  const questions = JSON.parse(cleaned);

  const interview = {
    role: role ?? "",
    type: type ?? "",
    level: level ?? "",
    techstack: String(techstack ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    questions,
    userId: userid ?? "",
    finalized: true,
    coverImage: getRandomInterviewCover(),
    createdAt: new Date().toISOString(),
  };

  const docRef = await db.collection("interviews").add(interview);
  return docRef.id;
}

export async function POST(request: Request) {
  const body = await request.json();

  // --- Path 1: Direct form submission (no Vapi wrapper) ---
  if (!body?.message?.toolCallList) {
    try {
      const { type, role, level, techstack, amount, userid } = body as {
        type?: string;
        role?: string;
        level?: string;
        techstack?: string;
        amount?: string | number;
        userid?: string;
      };

      const interviewId = await generateInterview({
        type,
        role,
        level,
        techstack,
        amount,
        userid,
      });

      return Response.json({ success: true, interviewId });
    } catch (error) {
      console.error("Error:", error);
      return Response.json(
        {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }
  }

  // --- Path 2: Vapi "tool-calls" webhook payload shape ---
  const toolCall = body?.message?.toolCallList?.[0];
  const toolCallId = toolCall?.id ?? toolCall?.toolCallId;
  const args = toolCall?.function?.arguments ?? toolCall?.arguments ?? {};

  const { type, role, level, techstack, amount, userid } = args as {
    type?: string;
    role?: string;
    level?: string;
    techstack?: string;
    amount?: string | number;
    userid?: string;
  };

  try {
    const interviewId = await generateInterview({
      type,
      role,
      level,
      techstack,
      amount,
      userid,
    });

    return Response.json({
      results: [
        {
          toolCallId,
          result: { success: true, interviewId },
        },
      ],
    });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({
      results: [
        {
          toolCallId,
          result: {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          },
        },
      ],
    });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}