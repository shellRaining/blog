export function deleteUndefinedFields(target: Record<any, any>) {
  for (const key in target) {
    if (target.hasOwnProperty(key) && target[key] === undefined) {
      delete target[key];
    }
  }
  return target;
}
