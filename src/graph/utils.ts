import { color } from "d3-color";
import { INVALID_COLOR } from "./constants/error";

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

/**
 * Convert color string to hex format.
 * @param colorString Color, in any format
 */
export function colorToHex(colorString) {
  const parsedColor = color(colorString);
  if (!parsedColor) throw INVALID_COLOR;
  return parsedColor.hex();
}
