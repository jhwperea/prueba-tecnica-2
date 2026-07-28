// assets
import { IconShield, IconUsers, IconId } from '@tabler/icons-react';

// constant
const icons = { IconShield, IconUsers, IconId };

// ==============================|| SECURITY MENU ITEMS ||============================== //

const security = {
  id: 'security',
  title: 'Seguridad',
  type: 'group',
  children: [
    {
      id: 'security-collapse',
      title: 'Seguridad',
      type: 'collapse',
      icon: icons.IconShield,
      children: [
        {
          id: 'profiles',
          title: 'Perfiles',
          type: 'item',
          url: '/security/profiles',
          icon: icons.IconId,
          breadcrumbs: true
        },
        {
          id: 'users',
          title: 'Usuarios',
          type: 'item',
          url: '/security/users',
          icon: icons.IconUsers,
          breadcrumbs: true
        }
      ]
    }
  ]
};

export default security;