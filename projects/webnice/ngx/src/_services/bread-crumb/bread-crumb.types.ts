/** Описание заголовка и хлебных крошек раздела. */
export interface IBreadCrumb {
  /** Название раздела, подраздела. */
  name: string;

  /** Ссылка на раздел, подраздел. */
  urnInternal?: string;
}
