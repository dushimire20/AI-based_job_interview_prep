import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

// Important for Firebase Admin in Next.js
export const runtime = "nodejs";
// Optional: ensures this route is not cached
export const dynamic = "force-dynamic";

type ToolResult =
  | { success: true; interviewId: string; warnings?: string[]; errors?: string[] }
  | { success: false; error: string; errors?: string[] };

function safeJsonParse<T = any>(input: string): { ok: true; value: T } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(input) };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? String(e) };
  }
}

export async function POST(request: Request) {
  const errors: string[] = [];
  const warnings: string[] = [];
  let toolCallId = "unknown";

  const log = (...args: any[]) => console.log("[vapi-interview]", ...args);
  const err = (...args: any[]) => console.error("[vapi-interview]", ...args);

  // Helper to always respond in Vapi tool format
  const respond = (result: ToolResult, status = 200) => {
    return Response.json(
      {
        results: [
          {
            toolCallId,
            result: {
              ...result,
              errors: result.errors ?? errors,
              ...(result.success ? { warnings } : {}),
            },
          },
        ],
      },
      { status }
    );
  };

  try {
    log("✅ HIT", new Date().toISOString());
    log("method", request.method);
    log("url", request.url);

    // Log headers
    const headersObj = Object.fromEntries(request.headers.entries());
    log("headers", headersObj);

    // Read raw body first (so we can log even if JSON parse fails)
    const rawBody = await request.text();
    log("rawBody", rawBody);

    const parsed = safeJsonParse(rawBody);
    if (!parsed.ok) {
      errors.push(`Failed to parse request JSON: ${parsed.error}`);
      err("❌ JSON parse failed", parsed.error);

      // Optional: write debug doc so you can see failures in Firestore
      try {
        await db.collection("vapi_debug").add({
          at: new Date().toISOString(),
          stage: "parse_request",
          error: parsed.error,
          rawBody,
        });
      } catch (e: any) {
        errors.push(`Also failed to write debug log to Firestore: ${e?.message ?? String(e)}`);
      }

      return respond({ success: false, error: "Invalid JSON body" });
    }

    const payload = parsed.value;
    log("payload.message.type", payload?.message?.type);

    // Tool call extraction (covers common shapes)
    const toolCall =
      payload?.message?.toolCallList?.[0] ??
      payload?.message?.toolCalls?.[0] ??
      payload?.toolCallList?.[0];

    log("toolCall (raw)", toolCall);

    toolCallId = toolCall?.id ?? toolCall?.toolCallId ?? "unknown";
    log("toolCallId", toolCallId);

    if (!toolCall) {
      errors.push("No toolCall found in payload (expected message.toolCallList[0])");
      return respond({ success: false, error: "No tool call in payload" });
    }

    // Args can be in different places depending on payload
    const rawArgs = toolCall?.function?.arguments ?? toolCall?.arguments ?? {};
    const args =
      typeof rawArgs === "string"
        ? (() => {
            const a = safeJsonParse(rawArgs);
            if (!a.ok) {
              errors.push(`Failed to parse tool arguments string: ${a.error}`);
              return {};
            }
            return a.value;
          })()
        : rawArgs;

    log("args", args);

    const {
      type,
      role,
      level,
      techstack,
      amount,
      userid,
      userId, // accept both
    } = args ?? {};

    const finalUserId = userId ?? userid;

    // Validate required fields
    const missing: string[] = [];
    if (!type) missing.push("type");
    if (!role) missing.push("role");
    if (!level) missing.push("level");
    if (!techstack) missing.push("techstack");
    if (amount === undefined || amount === null) missing.push("amount");
    if (!finalUserId) missing.push("userId/userid");

    if (missing.length) {
      const msg = `Missing required fields: ${missing.join(", ")}`;
      errors.push(msg);
      err("❌ VALIDATION ERROR", msg);
      return respond({ success: false, error: msg });
    }

    log("✅ validation passed", { type, role, level, techstack, amount, finalUserId });

    // Generate questions
    let questionsText = "";
    try {
      const resp = await generateText({
        model: google("gemini-2.5-flash"),
        prompt: `Prepare questions for a job interview.
The job role is ${role}.
The job experience level is ${level}.
The tech stack used in the job is: ${techstack}.
The focus between behavioural and technical questions should lean towards: ${type}.
The amount of questions required is: ${amount}.
Please return only the questions, without any additional text.
The questions are going to be read by a voice assistant so do not use slash or asterisk or any other special characters.
Return the questions formatted like this:
["Question 1", "Question 2", "Question 3"]`,
      });

      questionsText = resp.text ?? "";
      log("model questionsText", questionsText);
    } catch (e: any) {
      const msg = `generateText failed: ${e?.message ?? String(e)}`;
      errors.push(msg);
      err("❌ LLM ERROR", e);
      return respond({ success: false, error: msg });
    }

    // Parse questions
    const qParsed = safeJsonParse<string[]>(questionsText);
    if (!qParsed.ok || !Array.isArray(qParsed.value)) {
      const msg = `Failed to parse model output as JSON array. ParseError=${qParsed.ok ? "not array" : qParsed.error}. Output=${questionsText}`;
      errors.push(msg);
      err("❌ PARSE QUESTIONS ERROR", msg);
      return respond({ success: false, error: "Model output not valid JSON array" });
    }

    const parsedQuestions = qParsed.value;

    // Build interview doc
    const interview = {
      role,
      type,
      level,
      techstack: Array.isArray(techstack)
        ? techstack
        : String(techstack)
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean),
      questions: parsedQuestions,
      userId: finalUserId,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
      vapi: {
        toolCallId,
        functionName: toolCall?.function?.name,
      },
    };

    log("💾 writing interview", interview);

    // Firestore write
    try {
      const docRef = await db.collection("interviews").add(interview);
      log("🎉 saved interview id", docRef.id);
      return respond({ success: true, interviewId: docRef.id, warnings, errors });
    } catch (e: any) {
      const msg = `Firestore write failed: ${e?.message ?? String(e)}`;
      errors.push(msg);
      err("❌ FIRESTORE ERROR", e);

      // Optional: store the failure for later inspection
      try {
        await db.collection("vapi_debug").add({
          at: new Date().toISOString(),
          stage: "firestore_write",
          error: msg,
          interviewPreview: interview,
        });
      } catch (e2: any) {
        errors.push(`Also failed to write debug log to Firestore: ${e2?.message ?? String(e2)}`);
      }

      return respond({ success: false, error: "Failed to save interview to Firestore" });
    }
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    errors.push(`Unhandled error: ${msg}`);
    err("❌ UNHANDLED ERROR", e);

    return Response.json(
      {
        results: [
          {
            toolCallId,
            result: { success: false, error: "Unhandled error", errors },
          },
        ],
      },
      { status: 200 }
    );
  }
}

export async function GET() {
  return Response.json({ success: true, ok: true, at: new Date().toISOString() }, { status: 200 });
}