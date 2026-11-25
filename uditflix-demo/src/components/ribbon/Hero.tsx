import { AmbientBackground } from '../atmosphere/AmbientBackground';
import { RibbonCanvas } from './RibbonCanvas';
import { RibbonControls } from './RibbonControls';
export function Hero() {
  return <section className="hero" aria-label="Cómics destacados">
    <AmbientBackground />
    <div className="intro shell"><h1>Historias<em>en movimiento.</em></h1><p>Descubre cómics, teasers y videojuegos.</p></div>
    <RibbonCanvas />
    <div className="shell"><RibbonControls /></div>
  </section>;
}
