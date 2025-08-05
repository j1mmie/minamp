export function dumbCopy<T>(obj:T):T {
  return JSON.parse(JSON.stringify(obj)) as unknown as T
}
