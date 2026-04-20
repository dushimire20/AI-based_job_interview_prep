import { getRandomInterviewCover } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = await request.json();

  // Vapi sends: { message: { type: "tool-calls", toolCallList: [...] }, call: {...} }
  const toolCall = payload?.message?.toolCallList?.[0];
  const toolCallId = toolCall?.id;

  try {
    if (!toolCallId) {
      return Response.json(
        { results: [{ toolCallId: "unknown", result: { error: "Missing toolCallId" } }] },
        { status: 400 }
      );
    }

    const args = toolCall?.function?.arguments ?? toolCall?.arguments ?? {};
    const { type, role, level, techstack, amount, userId } = args;

    const [{ generateText }, { google }, { getFirebase }] = await Promise.all([
      import("ai"),
      import("@ai-sdk/google"),
      import("@/firebase/admin"),
    ]);

    const { db } = getFirebase();

    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
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

    const interview = {
      role,
      type,
      level,
      techstack: String(techstack ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      questions: JSON.parse(questions),
      userId,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    return Response.json(
      { results: [{ toolCallId, result: { success: true, interview } }] },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { results: [{ toolCallId: toolCallId ?? "unknown", result: { success: false, error: String(error) } }] },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}