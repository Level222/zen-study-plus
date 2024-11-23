import type { MessageEventDetail } from '../utils/events';
import type { SyncStorage } from '../utils/storage';
import type { ContentFeature, PageContent, PageType } from './pages';
import defaults from 'defaults';
import { concatMap, EMPTY, filter, fromEvent, fromEventPattern, map, merge, of, shareReplay, startWith } from 'rxjs';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';
import { EVENT_TYPE_PREFIX } from '../constants';
import { fallbackSyncOptions } from '../utils/default-options';
import { INIT_EVENT_TYPE, LOAD_MAIN_EVENT_TYPE } from '../utils/events';
import { getSyncStorage } from '../utils/storage';
import { SyncOptions } from '../utils/sync-options';
import movieTime from './movie-time';
import { knownPageTypes } from './pages';
import wordCount from './word-count';

const messageEventType = `${EVENT_TYPE_PREFIX}_${crypto.randomUUID()}`;

fromEvent(window, LOAD_MAIN_EVENT_TYPE).pipe(
  startWith(undefined),
).subscribe(() => {
  window.dispatchEvent(new CustomEvent(INIT_EVENT_TYPE, {
    detail: messageEventType,
  }));
});

const features: ContentFeature[] = [
  movieTime,
  wordCount,
];

const pageContent$ = merge(
  fromEvent(window, 'popstate'),
  fromEvent(window, messageEventType).pipe(
    filter((event) => (
      event instanceof CustomEvent && event.detail === 'CHANGE_STATE' satisfies MessageEventDetail
    )),
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
  fromPromise(getSyncStorage('options')).pipe(
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
  map((unknownSyncOptions) => defaults(
    SyncOptions.parse(unknownSyncOptions),
    fallbackSyncOptions,
  )),
  shareReplay(1),
);

for (const feature of features) {
  feature({ pageContent$, syncOptions$ });
}
