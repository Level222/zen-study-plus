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
