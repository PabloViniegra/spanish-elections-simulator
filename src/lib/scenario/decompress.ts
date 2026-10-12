// lz-string's decompressFromEncodedURIComponent (v1.5.0), stopping once the
// output passes `maxLength`: crafted input expands quadratically, so a short
// link could otherwise make the server build a string of tens of megabytes.
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
const VALUES = new Map([...ALPHABET].map((char, value) => [char, value]));
const RESET = 32;

// The decompressed text, or null when it is broken or longer than `maxLength`.
export function decompressBounded(input: string, maxLength: number): string | null {
  if (input === "") return null;
  const text = input.replace(/ /g, "+");
  const valueAt = (index: number) => VALUES.get(text.charAt(index)) ?? 0;
  let value = valueAt(0);
  let position = RESET;
  let index = 1;
  const read = (bitCount: number) => {
    let bits = 0;
    for (let power = 1; power !== 1 << bitCount; power <<= 1) {
      if (value & position) bits |= power;
      position >>= 1;
      if (position === 0) {
        position = RESET;
        value = valueAt(index++);
      }
    }
    return bits;
  };

  // Codes 0 and 1 introduce an 8- or 16-bit character, 2 ends the stream.
  const dictionary: string[] = [];
  let enlargeIn = 4;
  let size = 4;
  let bitCount = 3;
  const first = read(2);
  if (first === 2) return "";
  // lz-string carries on with an undefined character here; no encoder writes it.
  if (first === 3) return null;
  let previous = String.fromCharCode(read(first === 0 ? 8 : 16));
  dictionary[3] = previous;
  const result = [previous];
  let length = previous.length;
  const grow = () => {
    if (--enlargeIn === 0) enlargeIn = 2 ** bitCount++;
  };

  while (true) {
    if (index > text.length) return "";
    let code = read(bitCount);
    if (code === 2) return result.join("");
    if (code < 2) {
      dictionary[size++] = String.fromCharCode(read(code === 0 ? 8 : 16));
      code = size - 1;
      grow();
    }
    const entry = dictionary[code] ?? (code === size ? previous + previous.charAt(0) : null);
    if (entry === null) return null;
    length += entry.length;
    if (length > maxLength) return null;
    result.push(entry);
    dictionary[size++] = previous + entry.charAt(0);
    grow();
    previous = entry;
  }
}
