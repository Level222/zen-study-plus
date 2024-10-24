import type { ContentFeature, PageContent, PageType } from './pages';
import { filter, fromEvent, map, merge, shareReplay, startWith } from 'rxjs';
import movieTime from './movie-time';
import { knownPageTypes } from './pages';

const messageEventType = `__ZEN_STUDY_PLUS_${crypto.randomUUID()}__`;

fromEvent(window, '__ZEN_STUDY_PLUS_LOAD_MAIN__').pipe(
  startWith(undefined),
).subscribe(() => {
  window.dispatchEvent(new CustomEvent('__ZEN_STUDY_PLUS_INIT__', {
    detail: messageEventType,
  }));
});

const features: ContentFeature[] = [
  movieTime,
];

const pageContent$ = merge(
  fromEvent(window, 'popstate'),
  fromEvent(window, messageEventType).pipe(
    filter((event) => event instanceof CustomEvent && event.detail === 'CHANGE_STATE'),
  ),
).pipe(
  startWith(undefined),
  map<unknown, PageContent>(() => {
    const url = new URL(location.href);

    const types = knownPageTypes.flatMap(({ name, match }) => {
      const matchResult = match(url);

      if (matchResult.match) {
        return [{
          name,
          props: matchResult.props,
        }];
      }

      return [];
    }) as PageType[];

    return { url, types };
  }),
  shareReplay(1),
);

for (const feature of features) {
  feature({ pageContent$ });
}
