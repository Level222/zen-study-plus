import { z } from 'zod';

export const ChangeHistoryStateMessage = z.object({
  type: z.literal('CHANGE_HISTORY_STATE'),
});

export type ChangeHistoryStateMessage = z.infer<typeof ChangeHistoryStateMessage>;

export const KeyboardEventLike = z.object({
  code: z.string(),
  key: z.string(),
  shiftKey: z.boolean(),
  altKey: z.boolean(),
  ctrlKey: z.boolean(),
  metaKey: z.boolean(),
}) satisfies z.ZodType<Partial<KeyboardEvent>>;

export type KeyboardEventLike = z.infer<typeof KeyboardEventLike>;

export const SendBackKeyboardShortcutsMessage = z.object({
  type: z.literal('SEND_BACK_KEYBOARD_SHORTCUTS'),
  sendBackEvent: KeyboardEventLike,
});

export type SendBackKeyboardShortcutsMessage = z.infer<typeof SendBackKeyboardShortcutsMessage>;

export const KeyboardShortcutsMessage = z.object({
  type: z.literal('KEYBOARD_SHORTCUTS'),
  event: KeyboardEventLike,
});

export type KeyboardShortcutsMessage = z.infer<typeof KeyboardShortcutsMessage>;

export const RuntimeMessage = z.union([
  ChangeHistoryStateMessage,
  SendBackKeyboardShortcutsMessage,
  KeyboardShortcutsMessage,
]);

export type RuntimeMessage = z.infer<typeof RuntimeMessage>;
