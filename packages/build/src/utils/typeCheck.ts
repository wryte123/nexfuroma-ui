export function isObjectLike(val: unknown) {
  return val !== null && typeof val === 'object';
}

export function isFunction(val: unknown): val is Function {
  return typeof val === 'function';
}
