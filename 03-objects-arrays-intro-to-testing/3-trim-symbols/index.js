/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  const charArr = [...string];
  const result = [];

  let counter = 0;
  let previousChar;

  for (const char of charArr) {
    if (previousChar !== char) {
      counter = 0;
    }

    if (counter === size) {
      continue;
    }

    result.push(char);
    counter++;
    previousChar = char;
  }

  return result.join('');
}
