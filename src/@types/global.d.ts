declare type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends readonly (infer U)[] // eslint-disable-line prettier/prettier
    ? readonly RecursivePartial<U>[]
    : RecursivePartial<T[P]>
};
