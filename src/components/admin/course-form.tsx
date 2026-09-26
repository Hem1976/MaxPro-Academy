"use client";

import { useState, useTransition } from "react";
import { createCourse, updateCourse } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CourseTypeFields } from "@/components/admin/course-type-fields";
import type { Course, Product } from "@/types/database";

interface CourseFormProps {
  course?: Course;
  products: Product[];
}

export function CourseForm({ course, products }: CourseFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = course
        ? await updateCourse(course.id, formData)
        : await createCourse(formData);

      if (!result.success) {
        setError(result.error);
        return;
      }

      window.location.href = `/admin/courses/${result.data.id}`;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      <CourseTypeFields course={course} />

      <div className="space-y-2">
        <Label htmlFor="productId">Product</Label>
        <Select
          id="productId"
          name="productId"
          defaultValue={course?.product_id ?? products[0]?.id}
          required
        >
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={course?.title} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={course?.slug} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="shortDescription">Short description</Label>
        <Input
          id="shortDescription"
          name="shortDescription"
          defaultValue={course?.short_description ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={course?.description ?? ""}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="level">Level</Label>
          <Select id="level" name="level" defaultValue={course?.level ?? "beginner"}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimatedMinutes">Est. minutes</Label>
          <Input
            id="estimatedMinutes"
            name="estimatedMinutes"
            type="number"
            defaultValue={course?.estimated_minutes ?? 60}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select id="status" name="status" defaultValue={course?.status ?? "draft"}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="published"
            value="true"
            defaultChecked={course?.published ?? false}
          />
          Published
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="featured"
            value="true"
            defaultChecked={course?.featured ?? false}
          />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="certificateEnabled"
            value="true"
            defaultChecked={course?.certificate_enabled ?? true}
          />
          Certificate enabled
        </label>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : course ? "Update course" : "Create course"}
      </Button>
    </form>
  );
}
