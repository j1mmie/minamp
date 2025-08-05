export type Shift<T extends any[]> = ((...t: T) => any) extends ((
  first: any,
  ...rest: infer Rest
) => any)
  ? Rest
  : never;

// use a distributed conditional type here
type ShiftUnion<T> = T extends any[] ? Shift<T> : never;

export type DeepRequired<T, P extends string[]> = T extends object
  ? (Omit<T, Extract<keyof T, P[0]>> &
      Required<
        {
          [K in Extract<keyof T, P[0]>]: NonNullable<
            DeepRequired<T[K], ShiftUnion<P>>
          >
        }
      >)
  : T;
