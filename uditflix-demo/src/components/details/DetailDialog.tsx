
export function DetailDialog() {
  return (
    <dialog id="dialog" aria-labelledby="detailTitle"><button className="close" aria-label="Cerrar ficha" id="close">×</button><div className="detail"><img id="detailImage" alt="" /><div><span className="genre" id="detailGenre"></span><h2 id="detailTitle"></h2><p id="detailDescription"></p></div></div></dialog>
  );
}
