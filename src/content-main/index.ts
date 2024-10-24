let messageEventType: string | undefined;

window.addEventListener('__ZEN_STUDY_PLUS_INIT__', (event) => {
  if (event instanceof CustomEvent && typeof event.detail === 'string') {
    messageEventType = event.detail;
  }
});

window.dispatchEvent(new CustomEvent('__ZEN_STUDY_PLUS_LOAD_MAIN__'));

for (const methodName of ['pushState', 'replaceState']) {
  const nativeMethod = Object.getOwnPropertyDescriptor(History.prototype, methodName)?.value;

  if (typeof nativeMethod !== 'function') {
    continue;
  }

  const proxyMethod = new Proxy(nativeMethod, {
    apply(target, thisArg, argArray) {
      const returnedValue = Reflect.apply(target, thisArg, argArray);

      if (thisArg === history && messageEventType) {
        window.dispatchEvent(new CustomEvent(messageEventType, {
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
