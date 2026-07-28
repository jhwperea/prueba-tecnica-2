import dashboard from './dashboard';
import pages from './pages';
import utilities from './utilities';
import other from './other';
import security from './security';     // ← nuevo
import taller from './taller';         // ← nuevo

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [dashboard, taller, security, pages, utilities, other]
};

export default menuItems;