import { memo, useEffect, useState } from 'react';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

// project imports
import NavGroup from './NavGroup';
import { useGetMenuMaster } from 'api/menu';
import { useAuth } from 'contexts/authContext';
import { getMenuAPI } from 'api/requests/appApi';
import * as TablerIcons from '@tabler/icons-react';

// ==============================|| SIDEBAR MENU LIST ||============================== //

let cachedMenu = null;
let cachedUserId = null;

const getIconByName = (iconName) => {
  if (!iconName) return null;
  const name = iconName.toLowerCase();
  if (name.includes('home') || name.includes('chart') || name.includes('bar') || name.includes('dashboard')) {
    return TablerIcons.IconDashboard || TablerIcons.IconHome;
  }
  if (name.includes('user') || name.includes('users')) {
    return TablerIcons.IconUsers;
  }
  if (name.includes('key') || name.includes('lock') || name.includes('shield') || name.includes('permissions')) {
    return TablerIcons.IconShield;
  }
  if (name.includes('id') || name.includes('card')) {
    return TablerIcons.IconId;
  }
  return TablerIcons.IconCircleDot || null;
};

function MenuList() {
  const { menuMaster } = useGetMenuMaster();
  const { user } = useAuth();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const [menuList, setMenuList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedID, setSelectedID] = useState('');

  useEffect(() => {
    if (!user?.proId || !user?.useId) return;
    if (cachedUserId === user.useId && cachedMenu) {
      setMenuList(cachedMenu);
      setLoading(false);
      return;
    }

    const fetchMenu = async () => {
      try {
        const { data } = await getMenuAPI({ per: user.proId, idu: user.useId });
        // Transform data to Berry group items format
        const transformMenu = (padres, hijos) => {
          const mapped = padres.map((padre) => {
            const childrenOfPadre = hijos.filter((hijo) => hijo.padre === padre.id);
            
            if (childrenOfPadre.length > 0) {
              return {
                id: `group-${padre.id}`,
                title: padre.label || padre.pag_description,
                type: 'group',
                children: childrenOfPadre.map((hijo) => ({
                  id: hijo.toa || `item-${hijo.id}`,
                  title: hijo.label || hijo.pag_description,
                  type: 'item',
                  url: hijo.toa?.startsWith('/') ? hijo.toa : hijo.toa ? `/${hijo.toa}` : '#',
                  icon: getIconByName(hijo.icon)
                }))
              };
            } else {
              return {
                id: `group-${padre.id}`,
                title: padre.label || padre.pag_description,
                type: 'group',
                children: [
                  {
                  id: padre.toa || `item-${padre.id}`,
                  title: padre.label || padre.pag_description,
                  type: 'item',
                  url: padre.toa?.startsWith('/') ? padre.toa : padre.toa ? `/${padre.toa}` : '#',
                  icon: getIconByName(padre.icon)
                  }
                ]
              };
            }
          });

          return mapped;
        };

        const transformed = transformMenu(data.padres || [], data.hijos || []);
        cachedMenu = transformed;
        cachedUserId = user.useId;
        setMenuList(transformed);
      } catch (err) {
        console.error("Error loading menu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [user]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" sx={{ py: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  const navItems = menuList.map((item, index) => {
    switch (item.type) {
      case 'group':
        return (
          <NavGroup
            key={item.id}
            setSelectedID={setSelectedID}
            selectedID={selectedID}
            item={item}
          />
        );
      default:
        return (
          <Typography key={item.id} variant="h6" align="center" sx={{ color: 'error.main' }}>
            Menu Items Error
          </Typography>
        );
    }
  });

  return <Box {...(drawerOpen && { sx: { mt: 1.5 } })}>{navItems}</Box>;
}

export default memo(MenuList);
