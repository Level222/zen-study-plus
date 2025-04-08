import type { SyncStorage } from '../utils/storage';
import type { ContentFeature, PageContent, PageType } from './pages';
import defaults from 'defaults';
import { concatMap, EMPTY, filter, from, fromEvent, fromEventPattern, map, merge, of, shareReplay, startWith } from 'rxjs';
import { EVENT_TYPE_PREFIX } from '../constants';
import { fallbackSyncOptions } from '../utils/default-options';
import { createMessageEventDispatcher, getMessageEventDetail, INIT_EVENT_TYPE, LOAD_MAIN_EVENT_TYPE } from '../utils/events';
import { RuntimeMessage } from '../utils/runtime-messages';
import { getSyncStorage } from '../utils/storage';
import { SyncOptions } from '../utils/sync-options';
import disableMathJaxFocus from './disable-math-jax-focus';
import keyboardShortcuts from './keyboard-shortcuts';
import movieTime from './movie-time';
import { knownPageTypes } from './pages';
import wordCount from './word-count';

const messageEventType = `${EVENT_TYPE_PREFIX}_${crypto.randomUUID()}`;
const dispatchMessageEvent = createMessageEventDispatcher(messageEventType);

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
  keyboardShortcuts,
  disableMathJaxFocus,
];

const pageContent$ = merge(
  fromEvent(window, 'popstate'),
  fromEvent(window, messageEventType).pipe(
    filter((event) => getMessageEventDetail(event).type === 'CHANGE_STATE'),
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
  from(getSyncStorage('options')).pipe(
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

const runtimeMessage$ = fromEventPattern(
  (handler) => {
    chrome.runtime.onMessage.addListener(handler);
  },
  (handler) => {
    chrome.runtime.onMessage.removeListener(handler);
  },
  (message) => message,
).pipe(
  map((unknownMessage) => RuntimeMessage.parse(unknownMessage)),
  shareReplay(1),
);

for (const feature of features) {
  feature({ pageContent$, syncOptions$, runtimeMessage$, dispatchMessageEvent });
}
