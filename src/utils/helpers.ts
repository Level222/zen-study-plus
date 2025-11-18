import type { IfEmptyObject, OptionalKeysOf, UnknownArray } from 'type-fest';

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

export const isSameArray = <T extends readonly any[]>(arr1: T, arr2: T): boolean => {
  return arr1.length === arr2.length && arr1.every((value, i) => value === arr2[i]);
};

export const omit = <T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const newObj = { ...obj };

  for (const key of keys) {
    delete newObj[key];
  }

  return newObj;
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

export const existDuplication = (array: unknown[]) => array.length !== new Set(array).size;

export type NonPlainObject = UnknownArray | ReadonlyMap<unknown, unknown> | ReadonlySet<unknown>;

export type DeepPickOptional<T> = T extends object ? T extends NonPlainObject ? T : {
  [K in keyof T as T[K] extends object ? T[K] extends NonPlainObject ? never
    : IfEmptyObject<DeepPickOptional<T[K]>, never, K>
    : K extends OptionalKeysOf<T> ? K : never
  ]-?: DeepPickOptional<T[K]>
} : T;

export const combinations = (array: string[][]) => (
  array.reduce<string[][]>((acc, currentArray) => (
    acc.flatMap((accItem) => currentArray.map((item) => [...accItem, item]))
  ), [[]])
);

export const createCharListRange = (startChar: string, endChar: string): string[] => {
  const startCode = startChar.charCodeAt(0);
  const endCode = endChar.charCodeAt(0);

  return Array.from({ length: endCode - startCode + 1 }, (_, i) => (
    String.fromCharCode(startCode + i)
  ));
};
