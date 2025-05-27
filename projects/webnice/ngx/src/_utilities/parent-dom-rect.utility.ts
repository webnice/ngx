/**
 * Поиск вышестоящего HTML элемента, который должен являться одним из HTML тегов
 * перечисленных в переменной tags и получение координат этого элемента @type(DOMRect).
 * @param $event - События клика мышкой.
 * @param tags   - Список искомых HTML элементов.
 */
export function getParentByTargetDomRect($event: MouseEvent, ...tags: string[]): DOMRect {
  let ret: Partial<DOMRect> = {};
  let elm: HTMLElement | HTMLTableCellElement | null | undefined;

  elm = $event.target as HTMLElement;
  while (!isTag(tags, elm)) {
    elm = elm?.parentElement;
  }
  if (isTag(tags, elm)) {
    ret = (elm as HTMLTableCellElement).getBoundingClientRect();
  }

  return ret as DOMRect;
}

/**
 * Сравнение HTML элемента с искомыми тегами.
 * @param tags - Список искомых HTML элементов.
 * @param elm  - Текущий HTML элемент.
 */
function isTag(tags: string[], elm: HTMLElement | HTMLTableCellElement | null | undefined): boolean {
  let ret: boolean = false;

  if (elm === undefined || elm === null) return ret;
  tags.forEach((nm: string): void => {
    if (nm === elm.nodeName) ret = true;
  });

  return ret;
}
