import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  const body = await request.json();

  // Vapi "tool-calls" webhook payload shape
  const toolCall = body?.message?.toolCallList?.[0];

  // Vapi may provide the identifier as `id` or `toolCallId`
  const toolCallId = toolCall?.id ?? toolCall?.toolCallId;

  // Arguments can be nested in a couple possible locations depending on tool type/version
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

    // Remove possible code fences just in case
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

    // IMPORTANT: Tool call webhooks should respond with results + toolCallId
    return Response.json({
      results: [
        {
          toolCallId,
          result: { success: true, interviewId: docRef.id },
        },
      ],
    });
  } catch (error) {
    console.error("Error:", error);

    // IMPORTANT: Return 200 with a tool result; don't throw a hard 500 for tool calls
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