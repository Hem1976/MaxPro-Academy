"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import {
  generateCourseQuizWithAi,
  saveCourseQuiz,
} from "@/actions/course-content";
import type { GeneratedCourseQuiz } from "@/lib/ai/quiz-generator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
interface QuizBuilderFormProps {
  courseId: string;
  hasExistingQuiz: boolean;
  lessonCount: number;
}

type DraftQuestion = GeneratedCourseQuiz["questions"][number];

function emptyQuestion(): DraftQuestion {
  return {
    question: "",
    explanation: "",
    options: [
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  };
}

export function QuizBuilderForm({
  courseId,
  hasExistingQuiz,
  lessonCount,
}: QuizBuilderFormProps) {
  const [draft, setDraft] = useState<GeneratedCourseQuiz | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(
    Math.min(10, Math.max(3, lessonCount || 5)),
  );
  const [isPending, startTransition] = useTransition();

  const startManual = () => {
    setError(null);
    setMessage(null);
    setDraft({
      title: "Course knowledge check",
      description: "Answer all questions to complete the course.",
      passingScore: 80,
      questions: [emptyQuestion(), emptyQuestion(), emptyQuestion()],
    });
  };

  const runAi = () => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await generateCourseQuizWithAi({
        courseId,
        questionCount,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setDraft(result.data.draft);
      setMessage(
        result.data.warning ??
          `Generated with ${result.data.provider} (${result.data.model}). Review before saving.`,
      );
    });
  };

  const save = () => {
    if (!draft) return;
    setError(null);
    startTransition(async () => {
      const result = await saveCourseQuiz({ courseId, quiz: draft });
      if (!result.success) {
        setError(result.error);
        return;
      }
      window.location.reload();
    });
  };

  const updateQuestion = (
    index: number,
    updates: Partial<DraftQuestion>,
  ) => {
    if (!draft) return;
    const questions = draft.questions.map((item, i) =>
      i === index ? { ...item, ...updates } : item,
    );
    setDraft({ ...draft, questions });
  };

  const setCorrectOption = (questionIndex: number, optionIndex: number) => {
    if (!draft) return;
    const questions = draft.questions.map((item, qi) => {
      if (qi !== questionIndex) return item;
      return {
        ...item,
        options: item.options.map((option, oi) => ({
          ...option,
          isCorrect: oi === optionIndex,
        })),
      };
    });
    setDraft({ ...draft, questions });
  };

  if (hasExistingQuiz) {
    return (
      <p className="text-sm text-muted-foreground">
        This course already has a final quiz. View it under{" "}
        <a href="/admin/quizzes" className="text-accent hover:underline">
          Quizzes
        </a>
        .
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label htmlFor="aiQuestionCount">AI question count</Label>
          <Input
            id="aiQuestionCount"
            type="number"
            min={3}
            max={20}
            value={questionCount}
            onChange={(event) =>
              setQuestionCount(Number(event.target.value) || 5)
            }
            className="w-24"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={runAi}
          disabled={isPending || lessonCount === 0}
        >
          <Sparkles className="mr-1.5 size-4" aria-hidden />
          {isPending ? "Generating…" : "Generate with AI"}
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={startManual}>
          Build manually
        </Button>
      </div>

      {lessonCount === 0 && (
        <p className="text-sm text-amber-700">
          Upload lessons first — the course quiz attaches to the last lesson.
        </p>
      )}

      {message && <p className="text-sm text-muted-foreground">{message}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {draft && (
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Quiz title</Label>
              <Input
                value={draft.title}
                onChange={(event) =>
                  setDraft({ ...draft, title: event.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Passing score (%)</Label>
              <Input
                type="number"
                min={50}
                max={100}
                value={draft.passingScore}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    passingScore: Number(event.target.value) || 80,
                  })
                }
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea
              rows={2}
              value={draft.description}
              onChange={(event) =>
                setDraft({ ...draft, description: event.target.value })
              }
            />
          </div>

          <div className="space-y-6">
            {draft.questions.map((question, questionIndex) => (
              <div
                key={questionIndex}
                className="rounded-md border border-border bg-surface p-3"
              >
                <p className="text-xs font-medium text-muted-foreground">
                  Question {questionIndex + 1}
                </p>
                <Input
                  className="mt-2"
                  value={question.question}
                  onChange={(event) =>
                    updateQuestion(questionIndex, {
                      question: event.target.value,
                    })
                  }
                  placeholder="Question text"
                />
                <div className="mt-3 space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <label
                      key={optionIndex}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="radio"
                        name={`q-${questionIndex}-correct`}
                        checked={option.isCorrect}
                        onChange={() =>
                          setCorrectOption(questionIndex, optionIndex)
                        }
                      />
                      <Input
                        value={option.text}
                        onChange={(event) => {
                          const options = question.options.map((item, oi) =>
                            oi === optionIndex
                              ? { ...item, text: event.target.value }
                              : item,
                          );
                          updateQuestion(questionIndex, { options });
                        }}
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                setDraft({
                  ...draft,
                  questions: [...draft.questions, emptyQuestion()],
                })
              }
            >
              Add question
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={save}
              disabled={isPending}
            >
              {isPending ? "Saving…" : "Save course quiz"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
