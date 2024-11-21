import type { ContentFeature } from '../pages';
import { combineLatest, filter, fromEvent, startWith, takeUntil, timer } from 'rxjs';
import { CLASS_NAME_PREFIX } from '../../constants';
import { cleanable, Cleanup, modifyProperties } from '../../utils/cleanup';
import { el } from '../../utils/helpers';
import { intervalQuerySelectorAll } from '../../utils/interval-query-selector';

const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' });

const countWords = (text: string): number => {
  const segments = [...segmenter.segment(text)];
  const words = segments.filter(({ isWordLike }) => isWordLike);
  return words.length;
};

const WORD_COUNT_CLASS_NAME = `${CLASS_NAME_PREFIX}_word-count`;

const wordCount: ContentFeature = ({ pageContent$, syncOptions$ }) => {
  combineLatest({
    pageContent: pageContent$,
    syncOptions: syncOptions$,
  }).pipe(
    cleanable(),
  ).subscribe(({ value: { pageContent, syncOptions }, previousCleanup, cleanup }) => {
    previousCleanup.execute();

    const wordCountOptions = syncOptions.user.wordCount;

    if (!wordCountOptions.enabled) {
      return;
    }

    const sectionPageType = pageContent.types.find((pageType) => pageType.name === 'SECTION');

    if (!sectionPageType) {
      return;
    }

    const { pageInfo } = sectionPageType;

    if (pageInfo.type === 'CHAPTER_RESOURCE' && pageInfo.isResult) {
      return;
    }

    const fieldsSubscription = intervalQuerySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      wordCountOptions.fieldSelectors,
    ).pipe(
      filter((fieldNodeList) => fieldNodeList.length > 0),
      takeUntil(timer(wordCountOptions.timeout)),
    ).subscribe((fieldNodeList) => {
      const fields = [...fieldNodeList].flatMap((field) => {
        const counter = field.parentElement?.querySelector<HTMLDivElement>(wordCountOptions.counterSelectors);
        return counter ? [{ field, counter }] : [];
      });

      for (const { field, counter } of fields) {
        if ([...counter.children].some((element) => element.classList.contains(WORD_COUNT_CLASS_NAME))) {
          continue;
        }

        const wordCountElement = el('span', { className: WORD_COUNT_CLASS_NAME });

        cleanup.add(
          modifyProperties(counter.style, { gap: '4px' }),
        );

        counter.append(wordCountElement);
        cleanup.add(Cleanup.fromAddedNode(wordCountElement));

        const inputSubscription = fromEvent(field, 'input').pipe(
          startWith(undefined),
        ).subscribe(() => {
          wordCountElement.textContent = `${countWords(field.value)}単語`;
        });

        cleanup.add(Cleanup.fromSubscription(inputSubscription));
      }
    });

    cleanup.add(Cleanup.fromSubscription(fieldsSubscription));
  });
};

export default wordCount;
