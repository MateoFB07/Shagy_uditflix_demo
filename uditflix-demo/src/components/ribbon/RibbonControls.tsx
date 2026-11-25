
export function RibbonControls() {
  return (
    <div className="ribbonbar"><div className="index"><b id="number">03</b><span>/ 05</span><span className="ud-ribbon-dots" aria-hidden="true"><i></i><i></i><i className="is-current"></i><i></i><i></i></span></div><div className="feature"><span className="selected" id="name" aria-live="polite">El último guardián</span><button className="textbtn" id="featuredDetail" data-index="2">Ver ficha ↗</button></div><div className="controls"><button id="prev" aria-label="Anterior">←</button><button id="pause" aria-label="Pausar">Ⅱ</button><button id="next" aria-label="Siguiente">→</button></div></div>
  );
}
