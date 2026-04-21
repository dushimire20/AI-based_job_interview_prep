import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  let toolCallId = "unknown";

  try {
    const payload = await request.json();

    // Vapi tool-calls payload
    const toolCall = payload?.message?.toolCallList?.[0];
    toolCallId = toolCall?.id ?? "unknown";

    // Parse args (can be object or JSON string)
    const rawArgs = toolCall?.function?.arguments ?? toolCall?.arguments ?? {};
    const args = typeof rawArgs === "string" ? JSON.parse(rawArgs) : rawArgs;

    const { type, role, level, techstack, amount, userid } = args;

    console.log("📥 Received tool call from VAPI:", {
      toolCallId,
      functionName: toolCall?.function?.name,
      type,
      role,
      level,
      techstack,
      amount,
      userid,
    });

    // Validate required fields
    const missingFields = [
      !type && "type",
      !role && "role",
      !level && "level",
      !techstack && "techstack",
      amount === undefined || amount === null ? "amount" : false,
      !userid && "userid",
    ].filter(Boolean);

    if (missingFields.length > 0) {
      const errorMsg = `Missing required fields: ${missingFields.join(", ")}`;
      console.error("\n❌ ❌ ❌ VALIDATION ERROR ❌ ❌ ❌");
      console.error(errorMsg);
      console.error("Failed to generate interview\n");

      return Response.json(
        {
          results: [
            {
              toolCallId,
              result: { success: false, error: errorMsg },
            },
          ],
        },
        { status: 200 }
      );
    }

    console.log("\n✅ ✅ ✅ VALIDATION PASSED ✅ ✅ ✅");
    console.log("Generating questions...");

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

    console.log("🤖 AI Response:", questions);

    let parsedQuestions: string[];
    try {
      parsedQuestions = JSON.parse(questions);
      if (!Array.isArray(parsedQuestions)) {
        throw new Error("Parsed response is not an array");
      }
      console.log("✅ Parsed questions:", parsedQuestions);
    } catch (parseError) {
      const errorMsg = `Failed to parse AI response as JSON. Response was: ${questions}`;
      console.error("\n❌ ❌ ❌ JSON PARSE ERROR ❌ ❌ ❌");
      console.error(errorMsg);
      console.error("Failed to generate interview\n");

      return Response.json(
        {
          results: [
            {
              toolCallId,
              result: { success: false, error: errorMsg },
            },
          ],
        },
        { status: 200 }
      );
    }

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
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    console.log("\n💾 Saving interview to Firebase...");
    console.log("Interview Data:", interview);
    const docRef = await db.collection("interviews").add(interview);
    console.log("\n🎉 🎉 🎉 SUCCESS 🎉 🎉 🎉");
    console.log("Interview saved successfully!");
    console.log("Interview ID:", docRef.id);
    console.log("\n");

    return Response.json(
      {
        results: [
          {
            toolCallId,
            result: { success: true, interviewId: docRef.id },
          },
        ],
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("\n❌ ❌ ❌ UNHANDLED ERROR ❌ ❌ ❌");
    console.error("Error Message:", errorMessage);
    console.error("Full Error:", error);
    console.error("\n");

    return Response.json(
      {
        results: [
          {
            toolCallId,
            result: { success: false, error: errorMessage },
          },
        ],
      },
      { status: 200 }
    );
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}