import { z } from 'zod';
import { SyncOptions } from './sync-options';

export const SyncStorage = z.object({
  options: SyncOptions,
  test: z.string(),
});

export type SyncStorage = z.infer<typeof SyncStorage>;
