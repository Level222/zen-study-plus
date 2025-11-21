import * as z from 'zod';
import { SyncOptions } from './sync-options';

export const ChangeHistoryStateMessage = z.object({
  type: z.literal('CHANGE_HISTORY_STATE'),
});

export type ChangeHistoryStateMessage = z.infer<typeof ChangeHistoryStateMessage>;

const KeyboardShortcutNames = z.array(
  SyncOptions.shape.user.shape.keyboardShortcuts.shape.shortcuts.keyof(),
);

export const SendBackKeyboardShortcutsMessage = z.object({
  type: z.literal('SEND_BACK_KEYBOARD_SHORTCUTS'),
  sendBackKeyboardShortcutNames: KeyboardShortcutNames,
});

export type SendBackKeyboardShortcutsMessage = z.infer<typeof SendBackKeyboardShortcutsMessage>;

export const KeyboardShortcutsMessage = z.object({
  type: z.literal('KEYBOARD_SHORTCUTS'),
  keyboardShortcutNames: KeyboardShortcutNames,
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
