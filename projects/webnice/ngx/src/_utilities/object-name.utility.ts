// noinspection JSUnusedGlobalSymbols

/**
 * Получение названия класса объекта.
 * @param obj - Анализируемый объект.
 */
export function getClassName(obj: any): string {
  let prototype: any;
  let className: any;
  let ret: string = '';

  if (obj === undefined || obj === null) return ret;
  if (typeof obj !== 'object') return ret;
  prototype = Object.getPrototypeOf(obj);
  className = prototype.constructor.name;
  ret = className as string;

  return ret;
}

/**
 * Получение объекта с данными прототипа класса анализируемого объекта.
 * @param obj - Анализируемый объект.
 */
export function getPrototypeByObject(obj: any): any {
  let prototype: any;
  let ret: any;

  if (obj === undefined || obj === null) return undefined;
  if (typeof obj !== 'object') return undefined;
  prototype = Object.getPrototypeOf(obj);
  ret = Object.getPrototypeOf(prototype);

  return ret;
}

/**
 * Создание нового объекта на основе данных класса анализируемого объекта.
 * @param obj - Анализируемый объект.
 */
export function getNewByObject(obj: any): any {
  const prototype: any = getPrototypeByObject(obj);
  let constructor: any;

  if (obj === undefined || obj === null) return undefined;
  if (prototype === undefined) return undefined;
  constructor = obj.constructor;

  return new constructor();
}
