import { EVENT_TYPE_PREFIX } from '../constants';

export const LOAD_MAIN_EVENT_TYPE = `${EVENT_TYPE_PREFIX}_LOAD_MAIN`;
export const INIT_EVENT_TYPE = `${EVENT_TYPE_PREFIX}_INIT`;

export type ChangeStateDetail = {
  type: 'CHANGE_STATE';
};

export type DisableMathJaxInTabOrder = {
  type: 'DISABLE_MATH_JAX_IN_TAB_ORDER';
};

export type UpdateDefaultShortcutsToDisablePatterns = {
  type: 'UPDATE_DEFAULT_SHORTCUTS_TO_DISABLE_PATTERNS';
  patterns: string;
};

export type MessageEventDetail =
  | ChangeStateDetail
  | UpdateDefaultShortcutsToDisablePatterns
  | DisableMathJaxInTabOrder;

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
    throw new TypeError('Expected a CustomEvent.');
  }

  return JSON.parse(event.detail);
};
