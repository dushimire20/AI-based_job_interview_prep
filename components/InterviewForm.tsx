// components/InterviewForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const InterviewForm = ({ userId }: { userId?: string }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    role: "",
    level: "Junior",
    type: "Mixed",
    techstack: "",
    amount: "5",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/vapi/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          userid: userId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/");
      } else {
        setError(data.error ?? "Something went wrong");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const selectClass =
    "border border-input rounded-md p-2.5 bg-input/30 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors appearance-none cursor-pointer";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 max-w-lg w-full bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-lg"
    >
      <div className="flex flex-col gap-1 mb-2">
        <h3 className="text-xl font-semibold text-foreground">
          Interview Details
        </h3>
        <p className="text-sm text-muted-foreground">
          Fill in the details below to generate a tailored interview.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="role">Job Role</Label>
        <Input
          id="role"
          name="role"
          placeholder="e.g. Frontend Developer"
          value={form.role}
          onChange={handleChange}
          required
          className="bg-input/30 border-input"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="level">Experience Level</Label>
          <div className="relative">
            <select
              id="level"
              name="level"
              value={form.level}
              onChange={handleChange}
              className={selectClass}
            >
              <option value="Junior">Junior</option>
              <option value="Mid">Mid</option>
              <option value="Senior">Senior</option>
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="type">Question Focus</Label>
          <div className="relative">
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
              className={selectClass}
            >
              <option value="Behavioural">Behavioural</option>
              <option value="Technical">Technical</option>
              <option value="Mixed">Mixed</option>
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="techstack">Tech Stack</Label>
        <Input
          id="techstack"
          name="techstack"
          placeholder="e.g. React, Node.js, MongoDB"
          value={form.techstack}
          onChange={handleChange}
          required
          className="bg-input/30 border-input"
        />
        <p className="text-xs text-muted-foreground">
          Separate technologies with commas.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="amount">Number of Questions</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          min={1}
          max={20}
          value={form.amount}
          onChange={handleChange}
          required
          className="bg-input/30 border-input max-w-[120px]"
        />
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        className="btn-primary w-full mt-2"
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Interview"}
      </Button>
    </form>
  );
};

export default InterviewForm;