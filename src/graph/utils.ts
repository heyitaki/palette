/**
 * Non-secure quick hash function
 * @param str String to hash
 */
export function hash(str) {
  let char, hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    char = str.charCodeAt(i);
    hash = ((hash<<5)-hash)+char;
    // Convert to 32-bit integer
    hash = hash & hash; 
  }

  return hash;
}