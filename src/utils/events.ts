import type { SyncOptionsWithFallback } from './sync-options';
import { EVENT_TYPE_PREFIX } from '../constants';

export const LOAD_MAIN_EVENT_TYPE = `${EVENT_TYPE_PREFIX}_LOAD_MAIN`;
export const INIT_EVENT_TYPE = `${EVENT_TYPE_PREFIX}_INIT`;

export type ChangeStateDetail = {
  type: 'CHANGE_STATE';
};

export type ChangeSyncOptionsDetail = {
  type: 'CHANGE_OPTIONS';
  syncOptions: SyncOptionsWithFallback;
};

export type MessageEventDetail = ChangeStateDetail | ChangeSyncOptionsDetail;

export type DispatchMessageEvent = (detail: MessageEventDetail) => void;

export const createMessageEventDispatcher = (
  messageEventType: string,
): DispatchMessageEvent => {
  return (detail) => {
    window.dispatchEvent(new CustomEvent(messageEventType, {
      detail: JSON.stringify(detail),
    }));
  };
};

export const getMessageEventDetail = (event: Event): MessageEventDetail => {
  if (!(event instanceof CustomEvent)) {
    throw new TypeError('Expected an CustomEvent.');
  }

  return JSON.parse(event.detail);
};
