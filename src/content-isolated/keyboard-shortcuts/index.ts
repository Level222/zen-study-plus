import type { RuntimeMessage } from '../../utils/runtime-messages';
import type { KeyboardEventLike, ParsedPattern } from '../../utils/shortcut-keys';
import type { SyncOptionsWithFallback } from '../../utils/sync-options';
import type { ContentFeature } from '../pages';
import { filter, fromEvent, map, withLatestFrom } from 'rxjs';
import { matchPatterns, parsePatterns } from '../../utils/shortcut-keys';
import shortcuts from './shortcuts';

type ShortcutsOptions = SyncOptionsWithFallback['user']['keyboardShortcuts']['shortcuts'];

const keyboardShortcuts: ContentFeature = ({ pageContent$, syncOptions$, runtimeMessage$, dispatchMessageEvent }) => {
  const parsedPatternsRecord$ = syncOptions$.pipe(
    map((syncOptions): { [K in keyof ShortcutsOptions]?: ParsedPattern[] } => (
      Object.fromEntries(
        Object.entries(syncOptions.user.keyboardShortcuts.shortcuts).flatMap(([name, { patterns }]) => {
          if (!patterns) {
            return [];
          }

          const parsedPatterns = parsePatterns(patterns);
          return [[name, parsedPatterns]];
        }),
      )
    )),
  );

  fromEvent<KeyboardEvent>(window, 'keydown').pipe(
    withLatestFrom(parsedPatternsRecord$, syncOptions$),
  ).subscribe(([event, parsedPatternsRecord, syncOptions]) => {
    if (
      event.target instanceof Element
      && event.target.matches(syncOptions.user.keyboardShortcuts.ignoreTargetSelectors)
    ) {
      return;
    }

    const { code, key, shiftKey, altKey, ctrlKey, metaKey } = event;

    const eventLike: KeyboardEventLike = { code, key, shiftKey, altKey, ctrlKey, metaKey };

    const matchedShortcutNames = Object.entries(parsedPatternsRecord)
      .filter(([, parsedPatterns]) => matchPatterns(parsedPatterns, eventLike))
      .map(([name]) => name as keyof ShortcutsOptions);

    if (matchedShortcutNames.length === 0) {
      return;
    }

    event.preventDefault();

    chrome.runtime.sendMessage<RuntimeMessage>({
      type: 'SEND_BACK_KEYBOARD_SHORTCUTS',
      sendBackKeyboardShortcutNames: matchedShortcutNames,
    });
  });

  runtimeMessage$.pipe(
    filter((message) => message.type === 'KEYBOARD_SHORTCUTS'),
    withLatestFrom(pageContent$, syncOptions$),
  ).subscribe(([{ keyboardShortcutNames }, pageContent, syncOptions]) => {
    const keyboardShortcutsOptionsRecord = syncOptions.user.keyboardShortcuts.shortcuts;

    for (const name of keyboardShortcutNames) {
      const shortcut = shortcuts[name];
      const options = keyboardShortcutsOptionsRecord[name];

      shortcut({
        options: options as any,
        pageContent,
        syncOptions,
      });
    }
  });

  syncOptions$.subscribe((syncOptions) => {
    const { patterns } = syncOptions.user.keyboardShortcuts.defaultShortcutsToDisable;

    dispatchMessageEvent({
      type: 'UPDATE_DEFAULT_SHORTCUTS_TO_DISABLE_PATTERNS',
      patterns,
    });
  });
};

export default keyboardShortcuts;
