export type ContentType = 'Cómics' | 'Teasers' | 'Videojuegos';
export type CatalogFilter = 'Todos' | ContentType;
export interface CatalogEntry {
  title: string;
  type: ContentType;
  genre: string;
  description: string;
  color: string;
  image: string;
  art: string;
}
