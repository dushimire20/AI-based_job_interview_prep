"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const { object } = await generateObject({
      model: google("gemini-2.5-flash", {
        structuredOutputs: true,
      }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please return scores from 0 to 100 using this exact structure for categoryScores:
        communicationSkills: {score: number (0-100), comment: string}
        technicalKnowledge: {score: number (0-100), comment: string}
        problemSolving: {score: number (0-100), comment: string}
        culturalFit: {score: number (0-100), comment: string}
        confidenceClarity: {score: number (0-100), comment: string}

        Do not add other categories. Be thorough and point out mistakes/improvements. Examples:
        - communicationSkills: Clarity, articulation, structured responses.
        - technicalKnowledge: Understanding of key concepts.
        - problemSolving: Ability to analyze problems.
        - culturalFit: Alignment with company values/role.
        - confidenceClarity: Confidence, engagement, clarity.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: Object.entries(object.categoryScores).map(
        ([key, value]: [string, any]) => ({
          name: key
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()
            .trim()
            .split(" ")
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          score: value.score,
          comment: value.comment,
        })
      ),
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();

  if (!interview.exists) return null;

  return { id: interview.id, ...interview.data() } as Interview;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  const feedbackData = feedbackDoc.data();

  // Handle both old object format and new array format for categoryScores
  if (
    feedbackData.categoryScores &&
    typeof feedbackData.categoryScores === "object" &&
    !Array.isArray(feedbackData.categoryScores)
  ) {
    feedbackData.categoryScores = Object.entries(
      feedbackData.categoryScores
    ).map(([key, value]: [string, any]) => ({
      name: key
        .replace(/([A-Z])/g, " $1")
        .toLowerCase()
        .trim()
        .split(" ")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      score: value.score,
      comment: value.comment,
    }));
  }

  return { id: feedbackDoc.id, ...feedbackData } as Feedback;
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .where("finalized", "==", true)
    .get();

  const allInterviews: Interview[] = interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];

  return allInterviews
    .filter((interview) => interview.userId !== userId)
    .sort((a, b) => {
      const timeA = (a.createdAt as any)?.toMillis?.() || Date.parse(a.createdAt as string) || 0;
      const timeB = (b.createdAt as any)?.toMillis?.() || Date.parse(b.createdAt as string) || 0;
      return timeB - timeA;
    })
    .slice(0, limit);
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .get();

  const results = interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];

  // Sort by createdAt in descending order
  return results.sort((a, b) => {
    const timeA = (a.createdAt as any)?.toMillis?.() || Date.parse(a.createdAt as string) || 0;
    const timeB = (b.createdAt as any)?.toMillis?.() || Date.parse(b.createdAt as string) || 0;
    return timeB - timeA;
  });
}