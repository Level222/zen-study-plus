import { interval, map, Observable, startWith } from 'rxjs';

export type IntervalQuerySelectorOptions = {
  /**
   * @default document
   */
  target?: ParentNode;
  /**
   * @default 100
   */
  interval?: number;
};

const intervalQuerySelectorBase = <T>(
  mapFn: (target: ParentNode) => T,
  {
    target = document,
    interval: intervalOption = 100,
  }: IntervalQuerySelectorOptions = {},
): Observable<T> => (
  interval(intervalOption).pipe(
    startWith(undefined),
    map(() => mapFn(target)),
  )
);

export type IntervalQuerySelector = {
  <K extends keyof HTMLElementTagNameMap>(selectors: K, options?: IntervalQuerySelectorOptions): Observable<HTMLElementTagNameMap[K] | null>;
  <K extends keyof SVGElementTagNameMap>(selectors: K, options?: IntervalQuerySelectorOptions): Observable<SVGElementTagNameMap[K] | null>;
  <K extends keyof MathMLElementTagNameMap>(selectors: K, options?: IntervalQuerySelectorOptions): Observable<MathMLElementTagNameMap[K] | null>;
  <E extends Element = Element>(selectors: string, options?: IntervalQuerySelectorOptions): Observable<E | null>;
};

export const intervalQuerySelector: IntervalQuerySelector = (
  selectors: string,
  options?: IntervalQuerySelectorOptions,
): Observable<Element | null> => (
  intervalQuerySelectorBase((target) => target.querySelector(selectors), options)
);

export type IntervalQuerySelectorAll = {
  <K extends keyof HTMLElementTagNameMap>(selectors: K, options?: IntervalQuerySelectorOptions): Observable<NodeListOf<HTMLElementTagNameMap[K]>>;
  <K extends keyof SVGElementTagNameMap>(selectors: K, options?: IntervalQuerySelectorOptions): Observable<NodeListOf<SVGElementTagNameMap[K]>>;
  <K extends keyof MathMLElementTagNameMap>(selectors: K, options?: IntervalQuerySelectorOptions): Observable<NodeListOf<MathMLElementTagNameMap[K]>>;
  <E extends Element = Element>(selectors: string, options?: IntervalQuerySelectorOptions): Observable<NodeListOf<E>>;
};

export const intervalQuerySelectorAll: IntervalQuerySelectorAll = (
  selectors: string,
  options?: IntervalQuerySelectorOptions,
): Observable<NodeListOf<Element>> => (
  intervalQuerySelectorBase((target) => target.querySelectorAll(selectors), options)
);

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
