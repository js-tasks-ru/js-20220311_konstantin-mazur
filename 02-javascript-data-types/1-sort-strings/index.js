/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const result = [...arr];
    
  return param === 'asc' 
    ? result.sort((a, b) => compare(a, b))
    : result.sort((a, b) => compare(b, a));
}

function compare(a, b) {
  return a.localeCompare(b, 'ru', { caseFirst: 'upper' });
}
