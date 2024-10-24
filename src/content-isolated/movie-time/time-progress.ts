import type { ChapterAdvancedClassHeaderLessonSection, ChapterAdvancedClassHeaderSectionMovie, ChapterMovieResourceProps, ChapterNSchoolSectionMovie } from '../../api-caller/v2-material';
import type { ChapterPageInfo, CoursePageInfo, MonthlyReportsPageInfo } from '../../utils/page-info';
import { concatMap, forkJoin, map, type Observable } from 'rxjs';
import { callApiV2MaterialChapter, callApiV2MaterialCourse, callApiV2ReportProgressMonthly } from '../../api-caller';

export type TimeProgressGroup = {
  /**
   * Total seconds of movie time
   */
  goal: number;
  /**
   * Total seconds of movie watched
   */
  current: number;
};

export type TimeProgressGroupWithLabel = TimeProgressGroup & {
  label: string;
};

export type TimeProgress = {
  primary: TimeProgressGroup;
  groups: TimeProgressGroupWithLabel[];
};

const mergeTimeProgress = (a: TimeProgress, b: TimeProgress): TimeProgress => {
  const primary = {
    goal: a.primary.goal + b.primary.goal,
    current: a.primary.current + b.primary.current,
  };

  // Copy deeply
  const groups = a.groups.map((group) => ({ ...group }));

  for (const { label, goal, current } of b.groups) {
    const foundExistedGroup = groups.find((group) => group.label === label);

    if (foundExistedGroup) {
      foundExistedGroup.current += current;
      foundExistedGroup.goal += goal;
    } else {
      groups.push({ label, goal, current });
    }
  }

  return { primary, groups };
};

export const flatTimeProgress = (timeProgressList: TimeProgress[]): TimeProgress => (
  timeProgressList.reduce(mergeTimeProgress, {
    primary: {
      goal: 0,
      current: 0,
    },
    groups: [],
  })
);

const calcTimeProgressGroup = <T>(
  resources: T[],
  getTime: (resource: T) => number,
  isDone: (resource: T) => boolean,
): TimeProgressGroup => (
  resources.reduce(({ goal, current }, resource) => {
    const time = getTime(resource);
    return {
      goal: goal + time,
      current: current + (isDone(resource) ? time : 0),
    };
  }, { goal: 0, current: 0 })
);

const calcMovieResourcesTimeProgressGroup = <T extends ChapterMovieResourceProps>(
  movieResources: T[],
  isWatched: (resource: T) => boolean,
): TimeProgressGroup => (
  calcTimeProgressGroup(movieResources, (resource) => resource.length, isWatched)
);

const calcNSchoolSectionsTimeProgressGroup = (
  sections: ChapterNSchoolSectionMovie[],
): TimeProgressGroup => (
  calcMovieResourcesTimeProgressGroup(sections, ({ passed }) => passed)
);

export const fetchChapterTimeProgress = (chapterPageInfo: ChapterPageInfo): Observable<TimeProgress> => (
  callApiV2MaterialChapter(chapterPageInfo).pipe(
    map(({ course_type, chapter }): TimeProgress => {
      switch (course_type) {
        case 'n_school': {
          const { sections } = chapter;

          const allMovieSections = sections.filter((section) => (
            section.resource_type === 'movie'
          ));

          const mainMovieSectionsTimeProgressGroup = calcNSchoolSectionsTimeProgressGroup(
            allMovieSections.filter((section) => (
              section.material_type === 'main'
            )),
          );

          return {
            primary: mainMovieSectionsTimeProgressGroup,
            groups: [
              {
                label: '全動画',
                ...calcNSchoolSectionsTimeProgressGroup(allMovieSections),
              },
              {
                label: '必須',
                ...mainMovieSectionsTimeProgressGroup,
              },
              {
                label: 'Nプラス',
                ...calcNSchoolSectionsTimeProgressGroup(
                  allMovieSections.filter((section) => (
                    section.material_type === 'supplement'
                  )),
                ),
              },
            ],
          };
        }

        case 'advanced': {
          const { movieSections, lessonSections } = chapter.class_headers.reduce<{
            movieSections: ChapterAdvancedClassHeaderSectionMovie[];
            lessonSections: ChapterAdvancedClassHeaderLessonSection[];
          }>(({ movieSections, lessonSections }, { name, sections }) => {
            switch (name) {
              case 'section':
                return {
                  movieSections: [
                    ...movieSections,
                    ...sections.filter((section) => section.resource_type === 'movie'),
                  ],
                  lessonSections,
                };

              case 'lesson':
                return {
                  movieSections,
                  lessonSections: [
                    ...lessonSections,
                    ...sections.filter((section) => section.resource_type === 'lesson'),
                  ],
                };

              default:
                return { movieSections, lessonSections };
            }
          }, { movieSections: [], lessonSections: [] });

          const movieGroup = calcMovieResourcesTimeProgressGroup(
            movieSections,
            ({ progress: { comprehension } }) => (
              comprehension.good === comprehension.limit
            ),
          );

          return {
            primary: movieGroup,
            groups: [
              {
                label: '動画',
                ...movieGroup,
              },
              {
                label: '授業',
                ...calcTimeProgressGroup(
                  lessonSections,
                  ({ archive, minute }) => (archive ? archive.second - archive.start_offset : minute * 60),
                  ({ status_label }) => status_label === 'watched',
                ),
              },
            ],
          };
        }
      }
    }),
  )
);

export const fetchCourseTimeProgress = (
  coursePageInfo: CoursePageInfo,
): Observable<TimeProgress> => (
  callApiV2MaterialCourse(coursePageInfo).pipe(
    concatMap(({ course }) => (
      forkJoin(
        course.chapters.flatMap(({ resource_type, id }) => (
          resource_type === 'chapter'
            ? [fetchChapterTimeProgress({
                courseId: coursePageInfo.courseId,
                chapterId: id,
              })]
            : []
        )),
      ).pipe(
        map(flatTimeProgress),
      )
    )),
  )
);

export const fetchMonthlyReportsTimeProgress = (
  monthlyReportsPageInfo: MonthlyReportsPageInfo,
): Observable<TimeProgress> => (
  callApiV2ReportProgressMonthly(monthlyReportsPageInfo).pipe(
    concatMap(({ deadline_groups, completed_chapters }) => {
      const chapters = [
        ...deadline_groups.flatMap(({ chapters }) => chapters),
        ...completed_chapters,
      ];

      return forkJoin(
        chapters.map(({ course_id, chapter_id }) => (
          fetchChapterTimeProgress({
            courseId: course_id,
            chapterId: chapter_id,
          })
        )),
      ).pipe(
        map(flatTimeProgress),
      );
    }),
  )
);
