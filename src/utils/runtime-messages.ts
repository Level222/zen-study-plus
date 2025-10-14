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

export const SendBackResizeReferenceMessage = z.object({
  type: z.literal('SEND_BACK_RESIZE_REFERENCE'),
  sendBackHeight: z.number(),
});

export type SendBackResizeReferenceMessage = z.infer<typeof SendBackResizeReferenceMessage>;

export const ResizeReferenceMessage = z.object({
  type: z.literal('RESIZE_REFERENCE'),
  height: z.number(),
});

export type ResizeReferenceMessage = z.infer<typeof ResizeReferenceMessage>;

export const RuntimeMessage = z.union([
  ChangeHistoryStateMessage,
  SendBackKeyboardShortcutsMessage,
  KeyboardShortcutsMessage,
  SendBackResizeReferenceMessage,
  ResizeReferenceMessage,
]);

export type RuntimeMessage = z.infer<typeof RuntimeMessage>;
