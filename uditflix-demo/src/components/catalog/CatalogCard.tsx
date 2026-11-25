import type { CSSProperties } from 'react';
import type { CatalogEntry } from '../../models/catalog';

interface Props { entry: CatalogEntry; index: number; position: number }
export function CatalogCard({ entry, index, position }: Props) {
  return (
    <button className="comic" data-entry-index={index} style={{ '--card': entry.color } as CSSProperties} aria-label={`Ver ficha de ${entry.title}`}>
      <span className="card-copy">
        <span className="card-top"><span className="card-type">{entry.type}</span><span className="card-arrow" aria-hidden="true">↗</span></span>
        <span className="comic-title">{entry.title}</span><span className="card-genre">{entry.genre}</span>
      </span>
      <span className="poster"><img src={entry.art} alt="" draggable={false} /></span>
      <span className="spine" aria-hidden="true">{String(position+1).padStart(2,'0')} / {entry.type}</span>
    </button>
  );
}
