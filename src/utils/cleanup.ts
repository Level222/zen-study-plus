import { type OperatorFunction, pipe, scan, type SubscriptionLike } from 'rxjs';

export type CleanupFunction = () => void;

export class Cleanup {
  private children: Cleanup[] = [];
  private _executeCount = 0;

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
   * 2回目以降の呼び出しはadd()で追加された子Cleanupのみ実行される
   */
  public execute(): void {
    if (this.executeCount === 0) {
      this.cleanupFunction?.();
    }

    for (const child of this.children) {
      child.execute();
    }

    this._executeCount++;
  }

  public add(...cleanupList: Cleanup[]): void {
    this.children.push(...cleanupList);
  }

  public get executeCount(): number {
    return this._executeCount;
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
