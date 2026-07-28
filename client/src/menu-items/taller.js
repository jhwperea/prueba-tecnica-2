// assets
import { IconTool, IconUserCircle, IconMotorbike, IconClipboardList } from '@tabler/icons-react';

// constant
const icons = { IconTool, IconUserCircle, IconMotorbike, IconClipboardList };

// ==============================|| TALLER MENU ITEMS ||============================== //

const taller = {
  id: 'taller',
  title: 'Taller',
  type: 'group',
  children: [
    {
      id: 'taller-collapse',
      title: 'Taller',
      type: 'collapse',
      icon: icons.IconTool,
      children: [
        {
          id: 'taller-clients',
          title: 'Clientes',
          type: 'item',
          url: '/taller/clients',
          icon: icons.IconUserCircle,
          breadcrumbs: true
        },
        {
          id: 'taller-bikes',
          title: 'Motos',
          type: 'item',
          url: '/taller/bikes',
          icon: icons.IconMotorbike,
          breadcrumbs: true
        },
        {
          id: 'taller-work-orders',
          title: 'Órdenes de Trabajo',
          type: 'item',
          url: '/taller/work-orders',
          icon: icons.IconClipboardList,
          breadcrumbs: true
        }
      ]
    }
  ]
};

export default taller;
