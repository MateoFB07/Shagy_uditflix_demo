import { createRoot } from 'react-dom/client';
import { setupIonicReact } from '@ionic/react';
import App from './App';
import '@ionic/react/css/core.css';
import './theme/base.css';
import './theme/menu.css';
import './theme/navigation.css';
import './theme/atmosphere.css';
import './theme/ionic-bridge.css';

setupIonicReact({ mode: 'md' });
createRoot(document.getElementById('root')!).render(<App />);
