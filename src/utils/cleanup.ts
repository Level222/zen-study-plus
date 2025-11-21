import type { Observable, OperatorFunction, SubscriptionLike } from 'rxjs';
import { pipe, scan, Subject } from 'rxjs';

export type CleanupFunction = () => void;

export class Cleanup {
  private children: Cleanup[] = [];
  private _executeCount = 0;
  private _executed$ = new Subject<number>();

  public static empty(): Cleanup {
    return new Cleanup();
  }

  public static fromProperties<T>(obj: T, cleanupProperties: Partial<T>): Cleanup {
    return new Cleanup(() => {
      for (const [key, value] of Object.entries(cleanupProperties) as [keyof T, T[keyof T]][]) {
        obj[key] = value;
      }
    });
  }

  public static fromCurrentProperties<T>(obj: T, propertiesNames: (keyof T)[]) {
    return Cleanup.fromProperties(
      obj,
      Object.fromEntries(propertiesNames.map((key) => [key, obj[key]])) as Partial<T>,
    );
  }

  public static fromSubscription(subscription: SubscriptionLike): Cleanup {
    return new Cleanup(() => {
      subscription.unsubscribe();
    });
  }

  public static fromAddedNode(node: ChildNode): Cleanup {
    return new Cleanup(() => {
      node.remove();
    });
  }

  public constructor(
    private cleanupFunction?: CleanupFunction,
  ) {}

  /**
   * 2回目以降の呼び出しは、`add()` で追加された子 `Cleanup` のみ実行される。
   */
  public execute(): void {
    if (this.executeCount === 0) {
      this.cleanupFunction?.();
    }

    for (const child of this.children) {
      child.execute();
    }

    this._executeCount++;
    this._executed$.next(this._executeCount);
  }

  public add(...cleanupList: Cleanup[]): void {
    this.children.push(...cleanupList);
  }

  public get executeCount(): number {
    return this._executeCount;
  }

  public get executed$(): Observable<number> {
    return this._executed$;
  }
}

export type Cleanable<T> = {
  value: T;
  previousCleanup: Cleanup;
  cleanup: Cleanup;
};

export const cleanable = <T>(): OperatorFunction<T, Cleanable<T>> => pipe(
  scan<T, Cleanable<T>, Pick<Cleanable<T>, 'cleanup'>>(({ cleanup }, value) => ({
    value,
    previousCleanup: cleanup,
    cleanup: Cleanup.empty(),
  }), { cleanup: Cleanup.empty() }),
);

/**
 * Works like `Object.assign` and returns cleanup
 */
export const modifyProperties = <T extends object>(
  obj: T,
  properties: Partial<T>,
): Cleanup => {
  const saved = (Object.entries(properties) as [keyof T, T[keyof T]][])
    .map(([key, value]) => {
      const savedValue = obj[key];
      obj[key] = value;
      return [key, savedValue] as const;
    });

  return Cleanup.fromProperties(obj, Object.fromEntries(saved) as Partial<T>);
};

export class AdditionalStylesheet {
  private sheet: CSSStyleSheet = new CSSStyleSheet();
  private currentRules = new Map<string, CSSRule>();

  /**
   * Only change updated rules
   */
  public replaceRules(newRules: string[]) {
    for (const [ruleText, rule] of this.currentRules) {
      if (!newRules.includes(ruleText)) {
        this.sheet.deleteRule([...this.sheet.cssRules].indexOf(rule));
        this.currentRules.delete(ruleText);
      }
    }

    for (const ruleText of newRules) {
      if (!this.currentRules.has(ruleText)) {
        const ruleIndex = this.sheet.insertRule(ruleText);
        const rule = this.sheet.cssRules[ruleIndex];
        this.currentRules.set(ruleText, rule);
      }
    }
  }

  public insert(): Cleanup {
    if (!document.adoptedStyleSheets.includes(this.sheet)) {
      document.adoptedStyleSheets.push(this.sheet);
    }

    return new Cleanup(() => {
      this.remove();
    });
  }

  public remove() {
    const sheetIndex = document.adoptedStyleSheets.indexOf(this.sheet);

    if (sheetIndex) {
      document.adoptedStyleSheets.splice(sheetIndex, 1);
    }
  }
}
