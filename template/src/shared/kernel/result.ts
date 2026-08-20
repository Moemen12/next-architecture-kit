export type Result<T, E = Error> =
  | Readonly<{ ok: true; value: T }>
  | Readonly<{ ok: false; error: E }>;

export const Result = {
  ok<T>(value: T): Result<T> {
    return { ok: true, value };
  },
  fail<E>(error: E): Result<never, E> {
    return { ok: false, error };
  },
};
