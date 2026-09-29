"use client";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/lib/auth/action-result";

interface AuthFormState {
  error?: string;
  message?: string;
}

interface AuthFormProps {
  title: string;
  description: string;
  submitLabel: string;
  action: (formData: FormData) => Promise<ActionResult<unknown>>;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  next?: string;
  hint?: React.ReactNode;
}

export function AuthForm({
  title,
  description,
  submitLabel,
  action,
  children,
  footer,
  next,
  hint,
}: AuthFormProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: AuthFormState, formData: FormData) => {
      try {
        const result = await action(formData);
        if (!result.success) {
          return { error: result.error };
        }
        if ("message" in (result.data as object)) {
          return { message: (result.data as { message: string }).message };
        }
        return {};
      } catch (error) {
        if (isRedirectError(error)) {
          throw error;
        }
        const message =
          error instanceof Error ? error.message : "Something went wrong";
        return { error: message };
      }
    },
    {} as AuthFormState,
  );

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-navy">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>

      {hint ? <div className="mb-6">{hint}</div> : null}

      <form action={formAction} className="space-y-4">
        {next && <input type="hidden" name="next" value={next} />}
        {children}

        {state.error && (
          <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        )}

        {state.message && (
          <p className="rounded-md border border-success/30 bg-success/5 px-3 py-2 text-sm text-success">
            {state.message}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? "Please wait..." : submitLabel}
        </Button>
      </form>

      {footer && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          {footer}
        </div>
      )}
    </div>
  );
}

export function AuthField({
  id,
  label,
  type = "text",
  name,
  required,
  autoComplete,
  defaultValue,
}: {
  id: string;
  label: string;
  type?: string;
  name: string;
  required?: boolean;
  autoComplete?: string;
  defaultValue?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} required={required}>{label}</Label>
      <Input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
      />
    </div>
  );
}

export function AuthLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="font-medium text-accent hover:text-accent-hover">
      {children}
    </Link>
  );
}
