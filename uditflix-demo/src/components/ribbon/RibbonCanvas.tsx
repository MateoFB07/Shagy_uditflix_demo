
export function RibbonCanvas() {
  return (
    <div className="stage"><canvas id="ribbon" tabIndex={0} aria-label="Cinta de cómics. Usa las flechas para explorar." /><div id="error" className="error" hidden>No se ha podido mostrar la cinta. Puedes explorar el catálogo a continuación.</div></div>
  );
}
