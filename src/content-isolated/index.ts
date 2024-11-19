import type { SyncStorage } from '../utils/storage';
import type { ContentFeature, PageContent, PageType } from './pages';
import { concatMap, EMPTY, filter, fromEvent, fromEventPattern, map, merge, of, shareReplay, startWith } from 'rxjs';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';
import { SyncOptions } from '../utils/sync-options';
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
          pageInfo: matchResult.pageInfo,
        }];
      }

      return [];
    }) as PageType[];

    return { url, types };
  }),
  shareReplay(1),
);

const syncOptions$ = merge(
  fromPromise(chrome.storage.sync.get('options')).pipe(
    map(({ options }) => options),
  ),
  fromEventPattern<{ [K in keyof SyncStorage]?: chrome.storage.StorageChange }>(
    (handler) => {
      chrome.storage.sync.onChanged.addListener(handler);
    },
    (handler) => {
      chrome.storage.sync.onChanged.removeListener(handler);
    },
  ).pipe(
    concatMap(({ options }) => options ? of(options.newValue) : EMPTY),
  ),
).pipe(
  map((unknownSyncOptions) => SyncOptions.parse(unknownSyncOptions)),
  shareReplay(1),
);

for (const feature of features) {
  feature({ pageContent$, syncOptions$ });
}
