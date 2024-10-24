import type { ChapterProgressProps, ThumbnailProps } from './common';

export type Chapter =
  & ChapterProgressProps
  & {
    course_id: number;
    chapter_id: number;
    subject_category_title: string;
    course_title: string;
    chapter_title: string;
    exempted: boolean;
  };

export type ReportProgressMonthly =
  & ThumbnailProps
  & {
    year: number;
    month: number;
    total_material_count: number;
    passed_material_count: number;
    total_chapter_count: number;
    passed_chapter_count: number;
    deadline_groups: {
      deadline: string;
      chapters: Chapter[];
    }[];
    completed_chapters: Chapter[];
  };
