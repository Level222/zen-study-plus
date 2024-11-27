import type { DispatchMessageEvent } from '../utils/events';
import type { ParsedPattern } from '../utils/shortcut-keys';
import { createMessageEventDispatcher, getMessageEventDetail, INIT_EVENT_TYPE, LOAD_MAIN_EVENT_TYPE } from '../utils/events';
import { matchPatterns, parsePatterns } from '../utils/shortcut-keys';

let dispatchMessageEvent: DispatchMessageEvent | undefined;
let parsedDefaultShortcutsToDisablePatterns: ParsedPattern[] | undefined;

window.addEventListener(INIT_EVENT_TYPE, (event) => {
  if (event instanceof CustomEvent && typeof event.detail === 'string') {
    const messageEventType = event.detail;
    dispatchMessageEvent = createMessageEventDispatcher(messageEventType);

    window.addEventListener(messageEventType, (event) => {
      const detail = getMessageEventDetail(event);

      if (detail.type === 'CHANGE_OPTIONS') {
        const { patterns } = detail.syncOptions.user.keyboardShortcuts.defaultShortcutsToDisable;
        parsedDefaultShortcutsToDisablePatterns = patterns ? parsePatterns(patterns) : undefined;
      }
    });
  }
});

window.dispatchEvent(new CustomEvent(LOAD_MAIN_EVENT_TYPE));

type ProxyHandlerApply<T extends object> = NonNullable<ProxyHandler<T>['apply']>;

const applyProxyToMethods = <T extends PropertyKey, U extends Record<T, (...args: any[]) => void>>(
  obj: U,
  methodKeys: T[],
  apply: ProxyHandlerApply<U[T]>,
) => {
  for (const methodKey of methodKeys) {
    const nativeMethod = Object.getOwnPropertyDescriptor(obj, methodKey)?.value;

    if (typeof nativeMethod !== 'function') {
      throw new TypeError(`${String(methodKey)} is not a function.`);
    }

    const proxyMethod = new Proxy(nativeMethod, { apply });

    Object.defineProperty(obj, methodKey, { value: proxyMethod });
  }
};

applyProxyToMethods(History.prototype, ['pushState', 'replaceState'], (target, thisArg, argArray) => {
  const returnedValue = Reflect.apply(target, thisArg, argArray);

  if (thisArg === history) {
    dispatchMessageEvent?.({ type: 'CHANGE_STATE' });
  }

  return returnedValue;
});

const callbackApplyHandler: ProxyHandlerApply<
  EventTarget['addEventListener']
> = (target, thisArg, argArray) => {
  const [event] = argArray;

  if (event instanceof KeyboardEvent && parsedDefaultShortcutsToDisablePatterns) {
    if (matchPatterns(parsedDefaultShortcutsToDisablePatterns, event)) {
      return;
    }
  }

  return Reflect.apply(target, thisArg, argArray);
};

const KEYBOARD_EVENT_TYPES = ['keydown', 'keypress', 'keyup'];

applyProxyToMethods(EventTarget.prototype, ['addEventListener'], (target, thisArg, argArray) => {
  const [eventType, callback] = argArray;

  if (
    KEYBOARD_EVENT_TYPES.includes(eventType)
    && (thisArg instanceof Window || thisArg instanceof Document || thisArg instanceof Element)
  ) {
    const proxyCallback = new Proxy(callback, { apply: callbackApplyHandler });
    return Reflect.apply(target, thisArg, [eventType, proxyCallback, ...argArray.slice(2)]);
  }

  return Reflect.apply(target, thisArg, argArray);
});
