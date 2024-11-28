import type { KeyboardEventLike, RuntimeMessage } from '../../utils/runtime-messages';
import type { ParsedPattern } from '../../utils/shortcut-keys';
import type { KeyboardShortcutOptions, SyncOptionsWithFallback } from '../../utils/sync-options';
import type { ContentFeature } from '../pages';
import type { Shortcut, ShortcutExecution } from './shortcuts';
import { filter, fromEvent, map, withLatestFrom } from 'rxjs';
import { matchPatterns, parsePatterns } from '../../utils/shortcut-keys';
import shortcuts from './shortcuts';

type ShortcutsOptions = SyncOptionsWithFallback['user']['keyboardShortcuts']['shortcuts'];

type ShortcutWithExecutionProps<T extends KeyboardShortcutOptions> = {
  shortcut: Shortcut<ShortcutExecution<T>>;
  parsedPatterns: ParsedPattern[];
  options: T;
};

const keyboardShortcuts: ContentFeature = ({ pageContent$, syncOptions$, runtimeMessage$, dispatchMessageEvent }) => {
  const shortcutWithExecutionProps$ = syncOptions$.pipe(
    map((syncOptions): { [K in keyof ShortcutsOptions]?: ShortcutWithExecutionProps<ShortcutsOptions[K]> } => (
      Object.fromEntries(
        Object.entries(syncOptions.user.keyboardShortcuts.shortcuts).flatMap(([key, { patterns, ...options }]) => (
          patterns
            ? [[key, {
                shortcut: shortcuts[key as keyof ShortcutsOptions],
                parsedPatterns: parsePatterns(patterns),
                options,
              }]]
            : []
        )),
      )
    )),
  );

  fromEvent<KeyboardEvent>(window, 'keydown').pipe(
    withLatestFrom(shortcutWithExecutionProps$, syncOptions$),
  ).subscribe(([event, shortcutWithExecutionProps, syncOptions]) => {
    const KeyboardShortcutOptions = syncOptions.user.keyboardShortcuts;

    if (event.target instanceof Element && event.target.matches(KeyboardShortcutOptions.ignoreTargetSelectors)) {
      return;
    }

    const { code, key, shiftKey, altKey, ctrlKey, metaKey } = event;

    const eventLike: KeyboardEventLike = { code, key, shiftKey, altKey, ctrlKey, metaKey };

    const isMatchSomePatterns = Object.values(shortcutWithExecutionProps).some(({ parsedPatterns }) => (
      matchPatterns(parsedPatterns, eventLike)
    ));

    if (isMatchSomePatterns) {
      event.preventDefault();
    }

    chrome.runtime.sendMessage<RuntimeMessage>({
      type: 'SEND_BACK_KEYBOARD_SHORTCUTS',
      sendBackEvent: eventLike,
    });
  });

  runtimeMessage$.pipe(
    filter((message) => message.type === 'KEYBOARD_SHORTCUTS'),
    withLatestFrom(shortcutWithExecutionProps$, pageContent$, syncOptions$),
  ).subscribe(([{ event }, shortcutWithExecutionProps, pageContent, syncOptions]) => {
    for (const { shortcut, options, parsedPatterns } of Object.values(shortcutWithExecutionProps)) {
      if (matchPatterns(parsedPatterns, event)) {
        shortcut({
          options: options as any,
          parsedPatterns,
          pageContent,
          syncOptions,
        });
      }
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
