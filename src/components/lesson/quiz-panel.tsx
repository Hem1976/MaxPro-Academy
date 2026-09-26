"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { submitQuiz, type QuizQuestionResult } from "@/actions/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface QuizPanelQuestion {
  id: string;
  question: string;
  options: Array<{
    id: string;
    option_text: string;
  }>;
}

export interface QuizPanelProps {
  quizId: string;
  title: string;
  description?: string | null;
  passingScore: number;
  questions: QuizPanelQuestion[];
  onPassed?: () => void;
  className?: string;
}

export function QuizPanel({
  quizId,
  title,
  description,
  passingScore,
  questions,
  onPassed,
  className,
}: QuizPanelProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [passed, setPassed] = useState(false);
  const [results, setResults] = useState<QuizQuestionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const allAnswered = questions.every((question) => answers[question.id]);

  const handleSubmit = () => {
    setError(null);

    startTransition(async () => {
      const result = await submitQuiz({ quizId, answers });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSubmitted(true);
      setScore(result.data.attempt.score);
      setPassed(result.data.attempt.passed);
      setResults(result.data.results);
      if (result.data.attempt.passed) {
        onPassed?.();
      }
    });
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(null);
    setPassed(false);
    setResults([]);
    setError(null);
  };

  const getResultForQuestion = (questionId: string) =>
    results.find((item) => item.questionId === questionId);

  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card p-6",
        className,
      )}
      aria-labelledby="quiz-title"
    >
      <header>
        <h2 id="quiz-title" className="text-lg font-semibold text-navy">
          Course quiz
        </h2>
        <p className="mt-1 text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          {questions.length} question{questions.length === 1 ? "" : "s"} covering
          the full course · Passing score: {passingScore}%
        </p>
      </header>

      <div className="mt-6 space-y-6">
        {questions.map((question, index) => {
          const result = getResultForQuestion(question.id);

          return (
            <fieldset
              key={question.id}
              className={cn(
                "rounded-md border p-4",
                submitted && result?.correct
                  ? "border-success/40 bg-success/5"
                  : submitted && result && !result.correct
                    ? "border-destructive/40 bg-destructive/5"
                    : "border-border",
              )}
            >
              <legend className="px-1 text-sm font-medium text-foreground">
                {index + 1}. {question.question}
              </legend>

              <div className="mt-3 space-y-2">
                {question.options.map((option) => {
                  const isSelected = answers[question.id] === option.id;
                  const showAsCorrect =
                    submitted && result?.correctOptionId === option.id;
                  const showAsIncorrect =
                    submitted && isSelected && !result?.correct;

                  return (
                    <label
                      key={option.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2 text-sm transition-colors",
                        !submitted && isSelected
                          ? "border-accent bg-accent-muted"
                          : "border-transparent hover:bg-surface",
                        submitted && showAsCorrect && "border-success/50 bg-success/10",
                        submitted && showAsIncorrect && "border-destructive/50 bg-destructive/10",
                        (submitted || isPending) && "cursor-default",
                      )}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option.id}
                        checked={isSelected}
                        disabled={submitted || isPending}
                        onChange={() =>
                          setAnswers((prev) => ({
                            ...prev,
                            [question.id]: option.id,
                          }))
                        }
                        className="mt-0.5"
                        aria-describedby={
                          submitted && result?.explanation
                            ? `explanation-${question.id}`
                            : undefined
                        }
                      />
                      <span className="flex-1">{option.option_text}</span>
                      {submitted && showAsCorrect && (
                        <CheckCircle2
                          className="size-4 shrink-0 text-success"
                          aria-label="Correct answer"
                        />
                      )}
                      {submitted && showAsIncorrect && (
                        <XCircle
                          className="size-4 shrink-0 text-destructive"
                          aria-label="Incorrect answer"
                        />
                      )}
                    </label>
                  );
                })}
              </div>

              {submitted && result?.explanation && (
                <p
                  id={`explanation-${question.id}`}
                  className="mt-3 text-sm text-muted-foreground"
                >
                  {result.explanation}
                </p>
              )}
            </fieldset>
          );
        })}
      </div>

      {error && (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {submitted && score !== null && (
        <div
          className={cn(
            "mt-6 rounded-md border px-4 py-3",
            passed
              ? "border-success/40 bg-success/5"
              : "border-warning/40 bg-warning/5",
          )}
          role="status"
        >
          <p className="text-sm font-medium text-foreground">
            Score: {score}% — {passed ? "Passed" : "Not passed"}
          </p>
          {!passed && (
            <p className="mt-1 text-sm text-muted-foreground">
              Review the explanations and try again.
            </p>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {!submitted ? (
          <Button
            type="button"
            variant="primary"
            disabled={!allAnswered || isPending}
            onClick={handleSubmit}
          >
            {isPending ? "Submitting…" : "Submit answers"}
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={handleRetry}
            disabled={isPending}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Try again
          </Button>
        )}
      </div>
    </section>
  );
}
