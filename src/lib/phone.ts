// Phone numbers as written in the CMS -> tel: links and the shown text. Pure, tested in tests/phone.test.ts.

/**
 * German numbers in any common notation to an international tel: link.
 * "0170 - 90 42 408" -> "tel:+491709042408"; "+49 (0)203 44005952" -> "tel:+4920344005952"; "0049 2065 679631" -> "tel:+492065679631".
 */
export function telHref(value: string): string {
  let n = value.replace(/\(0\)/g, '').replace(/[^\d+]/g, '');
  if (n.startsWith('00')) n = '+' + n.slice(2);
  else if (n.startsWith('0')) n = '+49' + n.slice(1);
  return 'tel:' + n;
}

/** The number as shown on the site: the CMS notation without the dash groups ("0170 - 90 42 408" -> "0170 90 42 408").
 *  One place, so footer, FAQ, contact band and offline page always show it the same way. */
export const phoneLabel = (value: string) => value.replace(/\s+-\s+/g, ' ').trim();
