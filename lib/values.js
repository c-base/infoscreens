export function parseValue(val) {
  if (typeof val === 'boolean') {
    if (val) {
      return 1;
    }
    return 0;
  }
  return parseFloat(val);
}

export default parseValue;
