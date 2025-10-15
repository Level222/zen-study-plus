import type { ChapterProgressProps, ThumbnailProps } from './common';

export type TitleProps = {
  title: string;
};

export type BaseContentProps =
  & TitleProps
  & ThumbnailProps
  & {
    id: number;
  };

export type Permission = {
  active: boolean;
  reason: string;
  meta: object;
};

export type PermissionContentProps =
  & BaseContentProps
  & {
    permissions: Record<string, Permission>;
  };

export type DetailedPermissionContentProps =
  & PermissionContentProps
  & {
    permission_label: string;
    permission_url: string;
    permission_text: string;
  };

export type ContentURLProps = {
  content_url: string;
};

export type ReleaseTimeProps = {
  released_at: number | null;
};

export type OutlineProps = {
  outline: string;
};

export type ProgressProps = {
  comprehension: {
    limit: number;
    bad: number;
    good: number;
    perfect: number;
  };
  checkpoint: {
    total: number;
    clear: number;
  };
};

export type TotalQuestionProps = {
  total_question: number;
};

export type StatusProps = {
  status: string;
};

export type PassedProps = {
  passed: boolean;
};

export type ChapterMovieResourceProps = {
  resource_type: 'movie';
  length: number;
  playback_position: number;
};

export type ChapterMinuteProps = {
  minute: number;
};

export type ChapterNSchoolSectionCommonProps =
  & PermissionContentProps
  & ContentURLProps
  & PassedProps
  & {
    material_type: 'main' | 'supplement';
  };

export type ChapterNSchoolSectionEvaluationProps = {
  done: boolean;
};

export type ChapterNSchoolSectionMovie =
  & ChapterNSchoolSectionCommonProps
  & ChapterMovieResourceProps
  & {
    textbook_info: string;
  };

export type ChapterNSchoolSectionEvaluationTest =
  & ChapterNSchoolSectionCommonProps
  & TotalQuestionProps
  & ChapterNSchoolSectionEvaluationProps
  & { resource_type: 'evaluation_test' };

export type ChapterNSchoolSectionEssayTest =
  & ChapterNSchoolSectionCommonProps
  & TotalQuestionProps
  & { resource_type: 'essay_test' };

export type ChapterNSchoolSectionEvaluationReport =
  & ChapterNSchoolSectionCommonProps
  & TotalQuestionProps
  & ChapterNSchoolSectionEvaluationProps
  & { resource_type: 'evaluation_report' };

export type ChapterNSchoolSectionEssayReport =
  & ChapterNSchoolSectionCommonProps
  & TotalQuestionProps
  & { resource_type: 'essay_report' };

export type ChapterNSchool = {
  course_type: 'n_school';
  chapter:
    & BaseContentProps
    & OutlineProps
    & {
      open_section_index: number;
      progress:
        & ChapterProgressProps
        & StatusProps;
      sections: (
        | ChapterNSchoolSectionMovie
        | ChapterNSchoolSectionEvaluationTest
        | ChapterNSchoolSectionEssayTest
        | ChapterNSchoolSectionEvaluationReport
        | ChapterNSchoolSectionEssayReport
      )[];
    };
};

export type ChapterAdvancedProgressProps = {
  progress: ProgressProps;
};

export type ChapterAdvancedClassHeaderSectionCommonProps =
  & PermissionContentProps
  & ContentURLProps
  & ChapterAdvancedProgressProps
  & ReleaseTimeProps;

export type ChapterAdvancedClassHeaderSectionMovie =
  & ChapterAdvancedClassHeaderSectionCommonProps
  & ChapterMovieResourceProps
  & ChapterMinuteProps;

export type ChapterAdvancedClassHeaderSectionGuide =
  & ChapterAdvancedClassHeaderSectionCommonProps
  & { resource_type: 'guide' };

export type ChapterAdvancedClassHeaderSectionExercise =
  & ChapterAdvancedClassHeaderSectionCommonProps
  & { resource_type: 'exercise' };

export type ChapterAdvancedClassHeaderCommonProps = {
  label: string;
  has_progress: boolean;
};

export type ChapterAdvancedClassHeaderSection =
  & ChapterAdvancedClassHeaderCommonProps
  & {
    name: 'section';
    writing_mode: string;
    sections: (
      | ChapterAdvancedClassHeaderSectionMovie
      | ChapterAdvancedClassHeaderSectionGuide
      | ChapterAdvancedClassHeaderSectionExercise
    )[];
  };

export type ChapterAdvancedClassHeaderLessonSection =
  & DetailedPermissionContentProps
  & ReleaseTimeProps
  & OutlineProps
  & ChapterMinuteProps
  & {
    resource_type: 'lesson';
    tags: string[];
    archive?: {
      total_audience: number;
      second: number;
      start_offset: number;
      show_comment: boolean;
    };
    teacher_name: string;
    start_at: number;
    broadcast_status: string;
    broadcast_opening_minute: number;
    broadcast_ending_minute: number;
    thumbnail_wide_url: string;
    status_label: string;
    viewer_count: number;
    planned_start_at: number;
  };

export type ChapterAdvancedClassHeaderLesson =
  & ChapterAdvancedClassHeaderCommonProps
  & {
    name: 'lesson';
    sections: ChapterAdvancedClassHeaderLessonSection[];
  };

export type ChapterAdvanced = {
  course_type: 'advanced';
  chapter:
    & DetailedPermissionContentProps
    & ChapterAdvancedProgressProps
    & ReleaseTimeProps
    & {
      class_pattern_name: string;
      class_headers: (
        | ChapterAdvancedClassHeaderSection
        | ChapterAdvancedClassHeaderLesson
      )[];
    };
};

export type Chapter = ChapterNSchool | ChapterAdvanced;

export type CourseSelectedProps = {
  selected: boolean;
};

export type CourseSubjectCategoryProps = {
  subject_category: TitleProps;
};

export type CourseOnCalculationProps = {
  on_calculation: boolean;
};

export type CourseNSchoolProgress =
  & StatusProps
  & ChapterProgressProps
  & CourseOnCalculationProps;

export type CourseNSchoolChapter =
  & BaseContentProps
  & OutlineProps
  & StatusProps
  & {
    resource_type: 'chapter';
    label?: string;
    progress: CourseNSchoolProgress;
  };

export type CourseNSchool =
  & BaseContentProps
  & CourseSelectedProps
  & OutlineProps
  & CourseSubjectCategoryProps
  & {
    type: 'n_school';
    progress:
      & CourseNSchoolProgress
      & {
        total_chapters: number;
        passed_chapters: number;
        total_materials: number;
        passed_materials: number;
      };
    chapters: CourseNSchoolChapter[];
  };

export type CourseAdvancedProgressProps = {
  progress:
    & ProgressProps
    & CourseOnCalculationProps;
};

export type CourseAdvancedChapterProps =
  & DetailedPermissionContentProps
  & ReleaseTimeProps
  & CourseAdvancedProgressProps
  & {
    resource_type: 'chapter';
  };

export type CourseAdvancedShortTestProps =
  & DetailedPermissionContentProps
  & OutlineProps
  & TotalQuestionProps
  & ReleaseTimeProps
  & {
    resource_type: 'short_test';
    time_limit: number;
    short_test_result?:
      & PassedProps
      & {
        last_short_test_session_id: string;
        score: number;
      };
  };

export type CourseAdvanced =
  & DetailedPermissionContentProps
  & ContentURLProps
  & OutlineProps
  & CourseSelectedProps
  & ReleaseTimeProps
  & CourseAdvancedProgressProps
  & CourseSubjectCategoryProps
  & {
    short_test: {
      total_short_test: number;
      total_passed_short_test: number;
    };
    type: 'advanced';
    chapters: (
      | CourseAdvancedChapterProps
      | CourseAdvancedShortTestProps
    )[];
  };

export type Course = {
  course: CourseNSchool | CourseAdvanced;
};
