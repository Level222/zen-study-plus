import type { SetOptional } from 'type-fest';
import type { KeyboardEventLike } from './runtime-messages';
import { combinations, createCharListRange, existDuplication } from './helpers';

export const SUPPORTED_RAW_CODES = [
  // Symbols
  'Backquote',
  'Backslash',
  'BracketLeft',
  'BracketRight',
  'Comma',
  'Equal',
  'IntlBackslash',
  'IntlRo',
  'IntlYen',
  'Minus',
  'Period',
  'Quote',
  'Semicolon',
  'Slash',

  // Whitespace
  'Enter',
  'Space',
  'Tab',

  // Navigation
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'End',
  'Home',
  'PageDown',
  'PageUp',

  // UI
  'Escape',

  // Functions
  ...Array.from({ length: 24 }, (_, i) => `F${i + 1}`),
];

export type TransformedCode = {
  definition: string;
  codes: string[];
};

export const SUPPORTED_TRANSFORMED_CODES: TransformedCode[] = [
  // Alphabet
  ...createCharListRange('A', 'Z').map((alpha) => ({
    definition: alpha,
    codes: [`Key${alpha}`],
  })),

  // Number
  ...Array.from({ length: 10 }, (_, i) => ({
    definition: String(i),
    codes: [`Digit${i}`, `Numpad${i}`],
  })),
];

export const MODIFIER_KEY_EVENT_PROPERTIES = [
  'shiftKey',
  'altKey',
  'ctrlKey',
  'metaKey',
] as const satisfies (keyof KeyboardEvent)[];

export type ModifierKeyEventProperties = (typeof MODIFIER_KEY_EVENT_PROPERTIES)[number];

export type ModifierKey = {
  definition: string;
  eventProps: ModifierKeyEventProperties[];
};

export type Prefix = {
  prefixName: string;
  transform: (unprefixed: string) => ParsedKey;
};

export const PREFIXES: Prefix[] = [
  {
    prefixName: 'code',
    transform: (unprefixed) => ({
      type: 'TRIGGER',
      codes: [unprefixed],
      keys: [],
    }),
  },
  {
    prefixName: 'key',
    transform: (unprefixed) => ({
      type: 'TRIGGER',
      codes: [],
      keys: [unprefixed],
    }),
  },
];

export const MODIFIER_KEYS: ModifierKey[] = [
  {
    definition: 'Shift',
    eventProps: ['shiftKey'],
  },
  {
    definition: 'Alt',
    eventProps: ['altKey'],
  },
  {
    definition: 'Ctrl',
    eventProps: ['ctrlKey', 'metaKey'],
  },
  {
    definition: 'MacCtrl',
    eventProps: ['ctrlKey'],
  },
  {
    definition: 'MacCommand',
    eventProps: ['metaKey'],
  },
];

export const ANY_MODIFIER_KEY = 'Any';

export const RESERVED = {
  join: '+',
  division: ',',
  prefixEnd: ':',
  space: ' ',
};

export type ParsedKeyTrigger = {
  type: 'TRIGGER';
  codes: string[];
  keys: string[];
};

export type ParsedKeyModifier = {
  type: 'MODIFIER';
  eventProps: ModifierKeyEventProperties[];
};

export type ParsedKeyAnyModifiers = {
  type: 'ANY_MODIFIERS';
};

export type ParsedKey = ParsedKeyTrigger | ParsedKeyModifier | ParsedKeyAnyModifiers;

export const parseKey = (key: string): ParsedKey => {
  if (!key) {
    throw new SyntaxError('Empty key is not allowed.');
  }

  if (key === ANY_MODIFIER_KEY) {
    return {
      type: 'ANY_MODIFIERS',
    };
  }

  if (SUPPORTED_RAW_CODES.includes(key)) {
    return {
      type: 'TRIGGER',
      codes: [key],
      keys: [],
    };
  }

  for (const { definition, codes } of SUPPORTED_TRANSFORMED_CODES) {
    if (definition === key) {
      return {
        type: 'TRIGGER',
        codes,
        keys: [],
      };
    }
  }

  for (const { definition, eventProps } of MODIFIER_KEYS) {
    if (definition === key) {
      return {
        type: 'MODIFIER',
        eventProps,
      };
    }
  }

  const prefixEndIndex = key.indexOf(RESERVED.prefixEnd);

  if (prefixEndIndex !== -1) {
    const prefixName = key.slice(0, prefixEndIndex);

    for (const prefix of PREFIXES) {
      if (prefix.prefixName === prefixName) {
        const unprefixed = key.slice(prefixEndIndex + 1);
        return prefix.transform(unprefixed);
      }
    }

    throw new SyntaxError(`"${prefixName}" is not a valid prefix.`);
  }

  throw new SyntaxError(`"${key}" is not allowed.`);
};

export type ParsedPattern = {
  trigger: {
    codes: string[];
    keys: string[];
  };
  modifierEventPropGroups: ModifierKeyEventProperties[][];
  allowAnyModifiers: boolean;
};

export const parseSinglePattern = (pattern: string): ParsedPattern => {
  const keys = pattern.split(RESERVED.join);

  const { trigger, modifierEventPropGroups, allowAnyModifiers }
    = keys.reduce<SetOptional<ParsedPattern, 'trigger'>>(
      // eslint-disable-next-line array-callback-return
      ({ trigger, modifierEventPropGroups, allowAnyModifiers }, key) => {
        const parsedKey = parseKey(key);

        switch (parsedKey.type) {
          case 'TRIGGER':
            if (trigger) {
              throw new SyntaxError('Only one trigger key can exist.');
            }

            return {
              trigger: {
                codes: parsedKey.codes,
                keys: parsedKey.keys,
              },
              modifierEventPropGroups,
              allowAnyModifiers,
            };

          case 'MODIFIER':
            return {
              trigger,
              modifierEventPropGroups: [...modifierEventPropGroups, parsedKey.eventProps],
              allowAnyModifiers,
            };

          case 'ANY_MODIFIERS':
            if (allowAnyModifiers) {
              throw new SyntaxError(`Only one "${ANY_MODIFIER_KEY}" can exist.`);
            }

            return {
              trigger,
              modifierEventPropGroups,
              allowAnyModifiers: true,
            };
        }
      },
      { modifierEventPropGroups: [], allowAnyModifiers: false },
    );

  if (!trigger) {
    throw new SyntaxError('A trigger key is required.');
  }

  const allModifierKeys = modifierEventPropGroups.flat();

  if (existDuplication(allModifierKeys)) {
    throw new SyntaxError(`Modifier keys of ${pattern} is not allowed.`);
  }

  return { trigger, modifierEventPropGroups, allowAnyModifiers };
};

export const parsePatterns = (patterns: string): ParsedPattern[] => {
  const normalizedKeyPatterns = patterns.replace(RESERVED.space, '');
  const keyPatternList = normalizedKeyPatterns.split(',');
  return keyPatternList.map(parseSinglePattern);
};

export const matchSinglePattern = (
  { trigger, modifierEventPropGroups, allowAnyModifiers }: ParsedPattern,
  event: KeyboardEventLike,
): boolean => {
  if (!trigger.codes.includes(event.code) && !trigger.keys.includes(event.key)) {
    return false;
  }

  if (!modifierEventPropGroups.length) {
    if (allowAnyModifiers) {
      return true;
    } else {
      return MODIFIER_KEY_EVENT_PROPERTIES.every((prop) => !event[prop]);
    }
  }

  if (allowAnyModifiers) {
    return modifierEventPropGroups.every((modifierEventPropGroup) => (
      modifierEventPropGroup.some((prop) => event[prop])
    ));
  } else {
    return combinations(modifierEventPropGroups).some((requiredProps) => (
      MODIFIER_KEY_EVENT_PROPERTIES.every((prop) => requiredProps.includes(prop) === event[prop])
    ));
  }
};

export const matchPatterns = (patterns: ParsedPattern[], event: KeyboardEventLike): boolean => (
  patterns.some((pattern) => matchSinglePattern(pattern, event))
);
