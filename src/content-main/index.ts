import type { MessageEventDetail } from '../utils/events';
import { INIT_EVENT_TYPE, LOAD_MAIN_EVENT_TYPE } from '../utils/events';

let messageEventType: string | undefined;

window.addEventListener(INIT_EVENT_TYPE, (event) => {
  if (event instanceof CustomEvent && typeof event.detail === 'string') {
    messageEventType = event.detail;
  }
});

window.dispatchEvent(new CustomEvent(LOAD_MAIN_EVENT_TYPE));

for (const methodName of ['pushState', 'replaceState']) {
  const nativeMethod = Object.getOwnPropertyDescriptor(History.prototype, methodName)?.value;

  if (typeof nativeMethod !== 'function') {
    continue;
  }

  const proxyMethod = new Proxy(nativeMethod, {
    apply(target, thisArg, argArray) {
      const returnedValue = Reflect.apply(target, thisArg, argArray);

      if (thisArg === history && messageEventType) {
        window.dispatchEvent(new CustomEvent<MessageEventDetail>(messageEventType, {
          detail: 'CHANGE_STATE',
        }));
      }

      return returnedValue;
    },
  });

  Object.defineProperty(History.prototype, methodName, {
    value: proxyMethod,
  });
}
