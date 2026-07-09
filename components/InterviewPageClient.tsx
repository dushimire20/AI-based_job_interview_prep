"use client";

import { useState } from "react";
import Agent from "@/components/Agent";
import InterviewForm from "@/components/InterviewForm";
import { Button } from "@/components/ui/button";

const InterviewPageClient = ({
  user,
}: {
  user: { name: string; id: string };
}) => {
  const [mode, setMode] = useState<"voice" | "form" | null>(null);

  return (
    <>
      <h3>Interview generation</h3>

      {!mode && (
        <div className="flex gap-4 mt-6">
          <Button onClick={() => setMode("voice")} className="btn-primary">
            Generate by Voice
          </Button>
          <Button onClick={() => setMode("form")} variant="outline">
            Generate by Typing
          </Button>
        </div>
      )}

      {mode === "voice" && (
        <Agent
          userName={user.name}
          userId={user.id}
          type="generate"
        />
      )}

      {mode === "form" && (
        <div className="mt-6">
          <InterviewForm userId={user.id} />
        </div>
      )}
    </>
  );
};

export default InterviewPageClient;
