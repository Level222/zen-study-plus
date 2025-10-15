import type { OperatorFunction } from 'rxjs';
import { distinctUntilChanged, identity, map, Observable, pairwise, pipe, share, startWith, throttleTime } from 'rxjs';
import { isSameArray } from './helpers';

export const withPrevious = <T, U>(
  initialValue: U,
): OperatorFunction<T, [T | U, T]> => {
  return pipe(
    startWith(initialValue),
    pairwise() as OperatorFunction<T | U, [T | U, T]>,
  );
};

// export type IntervalQuerySelectorOptions = {
//   /**
//    * @default document
//    */
//   target?: ParentNode;
//   /**
//    * @default 100
//    */
//   interval?: number;
// };

// const intervalQuerySelectorBase = <T>(
//   mapFn: (target: ParentNode) => T,
//   {
//     target = document,
//     interval: intervalOption = 100,
//   }: IntervalQuerySelectorOptions = {},
// ): Observable<T> => (
//   interval(intervalOption).pipe(
//     startWith(undefined),
//     map(() => mapFn(target)),
//   )
// );

// export type IntervalQuerySelector = {
//   <K extends keyof HTMLElementTagNameMap>(selectors: K, options?: IntervalQuerySelectorOptions): Observable<HTMLElementTagNameMap[K] | null>;
//   <K extends keyof SVGElementTagNameMap>(selectors: K, options?: IntervalQuerySelectorOptions): Observable<SVGElementTagNameMap[K] | null>;
//   <K extends keyof MathMLElementTagNameMap>(selectors: K, options?: IntervalQuerySelectorOptions): Observable<MathMLElementTagNameMap[K] | null>;
//   <E extends Element = Element>(selectors: string, options?: IntervalQuerySelectorOptions): Observable<E | null>;
// };

// export const intervalQuerySelector: IntervalQuerySelector = (
//   selectors: string,
//   options?: IntervalQuerySelectorOptions,
// ): Observable<Element | null> => (
//   intervalQuerySelectorBase((target) => target.querySelector(selectors), options)
// );

// export type IntervalQuerySelectorAll = {
//   <K extends keyof HTMLElementTagNameMap>(selectors: K, options?: IntervalQuerySelectorOptions): Observable<NodeListOf<HTMLElementTagNameMap[K]>>;
//   <K extends keyof SVGElementTagNameMap>(selectors: K, options?: IntervalQuerySelectorOptions): Observable<NodeListOf<SVGElementTagNameMap[K]>>;
//   <K extends keyof MathMLElementTagNameMap>(selectors: K, options?: IntervalQuerySelectorOptions): Observable<NodeListOf<MathMLElementTagNameMap[K]>>;
//   <E extends Element = Element>(selectors: string, options?: IntervalQuerySelectorOptions): Observable<NodeListOf<E>>;
// };

// export const intervalQuerySelectorAll: IntervalQuerySelectorAll = (
//   selectors: string,
//   options?: IntervalQuerySelectorOptions,
// ): Observable<NodeListOf<Element>> => (
//   intervalQuerySelectorBase((target) => target.querySelectorAll(selectors), options)
// );

export const fromMutationObserver = (
  target: Node,
  options: MutationObserverInit,
): Observable<MutationRecord[]> => new Observable((subscriber) => {
  const observer = new MutationObserver((mutations) => {
    subscriber.next(mutations);
  });

  observer.observe(target, options);

  return () => {
    observer.disconnect();
  };
});

export type MutationSelectorOptions = {
  throttleDuration?: number;
};

/**
 * `target` 内の要素または属性が変更されたときに `querySelector` を実行し、
 * 取得した要素が前回から変化したときにその要素を発する。
 */
export class MutationSelector {
  private mutations: Observable<MutationRecord[]>;

  public constructor(
    public readonly target: ParentNode,
    public readonly options: MutationSelectorOptions = {},
  ) {
    this.mutations = fromMutationObserver(
      this.target,
      {
        subtree: true,
        childList: true,
        attributes: true,
      },
    ).pipe(
      typeof this.options.throttleDuration === 'number'
        ? throttleTime(this.options.throttleDuration, undefined, { trailing: true })
        : identity,
      share(),
    );
  }

  public selector<K extends keyof HTMLElementTagNameMap>(selectors: K): Observable<HTMLElementTagNameMap[K] | null>;
  public selector<K extends keyof SVGElementTagNameMap>(selectors: K): Observable<SVGElementTagNameMap[K] | null>;
  public selector<K extends keyof MathMLElementTagNameMap>(selectors: K): Observable<MathMLElementTagNameMap[K] | null>;
  public selector<E extends Element = Element>(selectors: string): Observable<E | null>;

  public selector(selectors: string): Observable<Element | null> {
    return this.mutations.pipe(
      startWith(undefined),
      map(() => this.target.querySelector(selectors)),
      distinctUntilChanged(),
    );
  }

  selectorAll<K extends keyof HTMLElementTagNameMap>(selectors: K): Observable<HTMLElementTagNameMap[K][]>;
  selectorAll<K extends keyof SVGElementTagNameMap>(selectors: K): Observable<SVGElementTagNameMap[K][]>;
  selectorAll<K extends keyof MathMLElementTagNameMap>(selectors: K): Observable<MathMLElementTagNameMap[K][]>;
  selectorAll<E extends Element = Element>(selectors: string): Observable<E[]>;

  public selectorAll(selectors: string): Observable<Element[]> {
    return this.mutations.pipe(
      startWith(undefined),
      map(() => [...this.target.querySelectorAll(selectors)]),
      distinctUntilChanged(isSameArray),
    );
  }
}

export const fromResizeObserver = (
  target: Element,
  options?: ResizeObserverOptions,
): Observable<ResizeObserverEntry[]> => new Observable((subscriber) => {
  const observer = new ResizeObserver((entries) => {
    subscriber.next(entries);
  });

  observer.observe(target, options);

  return () => {
    observer.disconnect();
  };
});
