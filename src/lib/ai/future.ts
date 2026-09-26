export interface SearchDocument {
  id: string;
  type: "course" | "lesson" | "product" | "resource";
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface SearchResult {
  document: SearchDocument;
  score: number;
  highlights?: string[];
}

export interface SearchIndex {
  index(documents: SearchDocument[]): Promise<void>;
  search(query: string, options?: { limit?: number }): Promise<SearchResult[]>;
  remove(ids: string[]): Promise<void>;
}

export interface RecommendationContext {
  userId?: string;
  completedCourseIds?: string[];
  preferredProductIds?: string[];
  learningRole?: string;
}

export interface Recommendation {
  entityType: "course" | "lesson" | "product";
  entityId: string;
  score: number;
  reason?: string;
}

export interface RecommendationEngine {
  recommendCourses(
    context: RecommendationContext,
    limit?: number,
  ): Promise<Recommendation[]>;
  recommendLessons(
    courseId: string,
    context: RecommendationContext,
    limit?: number,
  ): Promise<Recommendation[]>;
}

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface TranscriptResult {
  lessonId: string;
  language: string;
  segments: TranscriptSegment[];
  fullText: string;
}

export interface TranscriptService {
  generateFromVideo(videoUrl: string, lessonId: string): Promise<TranscriptResult>;
  translate(
    transcript: TranscriptResult,
    targetLanguage: string,
  ): Promise<TranscriptResult>;
}
