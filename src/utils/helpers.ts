export const isPositiveInteger = (value: number) => {
  return Number.isInteger(value) && value >= 0;
};

export const parseToPositiveIntegers = <T extends string[]>(
  values: [...T],
): { [K in keyof T]: number } => {
  return values.map((value) => {
    const numberValue = Number(value);

    if (!isPositiveInteger(numberValue)) {
      throw new TypeError(`${value} is not a positive integer.`);
    }

    return numberValue;
  }) as { [K in keyof T]: number };
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
