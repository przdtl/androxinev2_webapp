function transliterateCyrillic(input: string): string {
  let result = '';

  for (const ch of input.toLowerCase()) {
    switch (ch) {
      case 'а': result += 'a'; break;
      case 'б': result += 'b'; break;
      case 'в': result += 'v'; break;
      case 'г': result += 'g'; break;
      case 'д': result += 'd'; break;
      case 'е': result += 'e'; break;
      case 'ё': result += 'e'; break;
      case 'ж': result += 'zh'; break;
      case 'з': result += 'z'; break;
      case 'и': result += 'i'; break;
      case 'й': result += 'y'; break;
      case 'к': result += 'k'; break;
      case 'л': result += 'l'; break;
      case 'м': result += 'm'; break;
      case 'н': result += 'n'; break;
      case 'о': result += 'o'; break;
      case 'п': result += 'p'; break;
      case 'р': result += 'r'; break;
      case 'с': result += 's'; break;
      case 'т': result += 't'; break;
      case 'у': result += 'u'; break;
      case 'ф': result += 'f'; break;
      case 'х': result += 'h'; break;
      case 'ц': result += 'ts'; break;
      case 'ч': result += 'ch'; break;
      case 'ш': result += 'sh'; break;
      case 'щ': result += 'sch'; break;
      case 'ъ': break;
      case 'ы': result += 'y'; break;
      case 'ь': break;
      case 'э': result += 'e'; break;
      case 'ю': result += 'yu'; break;
      case 'я': result += 'ya'; break;
      default:
        result += ch;
    }
  }

  return result;
}

export function buildExerciseShort(title: string): string {
  const slug = transliterateCyrillic(title)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

  return slug.slice(0, 10);
}
