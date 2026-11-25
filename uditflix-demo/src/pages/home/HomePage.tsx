import { Component } from 'react';
import { MinimalNavigation } from '../../components/navigation/MinimalNavigation';
import { Hero } from '../../components/ribbon/Hero';
import { AtmosphereLab } from '../../components/atmosphere/AtmosphereLab';
import { ExploreSection } from '../../components/catalog/ExploreSection';
import { SideMenu } from '../../components/menu/SideMenu';
import { DetailDialog } from '../../components/details/DetailDialog';
import { mountRibbon } from '../../animations/ribbon.js';
import { mountCatalog } from '../../animations/catalog.js';
import { mountSideMenu } from '../../animations/sideMenu.js';
import { mountNavigation } from '../../animations/navigation.js';
import { mountAtmosphere } from '../../animations/atmosphere.js';
import { mountPerformance } from '../../animations/performance.js';

// Single lifecycle boundary for the ported animation engines. React owns the DOM;
// engines own frame-by-frame geometry, visibility and transient animation state.
export class HomePage extends Component {
  private host: HTMLDivElement | null = null;
  private setHost = (node: HTMLDivElement | null) => { this.host = node; };
  private cleanups: Array<() => void> = [];
  componentDidMount() {
    const root = this.host;
    if (!root) return;
    for (const mount of [mountRibbon, mountCatalog, mountSideMenu, mountNavigation, mountAtmosphere, mountPerformance]) {
      this.cleanups.push(mount(root));
    }
  }
  componentWillUnmount() { this.cleanups.reverse().forEach(dispose => dispose()); this.cleanups = []; }
  render() {
    return <div className="udit-root" ref={this.setHost}>
      <main id="inicio">
        <MinimalNavigation />
        <Hero />
        <AtmosphereLab />
        <ExploreSection />
        <footer className="footer shell"><span>Uditflix</span><a href="#inicio">Volver arriba ↑</a></footer>
      </main>
      <SideMenu />
      <DetailDialog />
    </div>;
  }
}
