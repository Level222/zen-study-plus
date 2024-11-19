export const isPositiveInteger = (value: number) => {
  return Number.isInteger(value) && value >= 0;
};

export const el = <T extends keyof HTMLElementTagNameMap>(
  tagName: T,
  properties: Partial<HTMLElementTagNameMap[T]> = {},
  children: (Node | string)[] = [],
) => {
  const element = Object.assign(document.createElement(tagName), properties);
  element.replaceChildren(...children);
  return element;
};

export type WithRandomId<T extends object> = T & {
  randomId: string;
};

export const withRandomId = <T extends object>(obj: T): WithRandomId<T> => ({
  ...obj,
  randomId: crypto.randomUUID(),
});
