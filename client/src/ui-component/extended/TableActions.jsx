import { useState } from 'react';
import PropTypes from 'prop-types';

import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { IconDotsVertical } from '@tabler/icons-react';

import ConfirmDialog from './ConfirmDialog';

export default function TableActions({ items }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmItem, setConfirmItem] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleCommand = (item) => {
    handleClose();
    if (item.confirm) {
      setConfirmItem(item);
    } else {
      item.command?.();
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <>
      <IconButton size="small" onClick={handleOpen}>
        <IconDotsVertical size={16} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {items.map((item, i) => (
          <MenuItem
            key={i}
            disabled={item.disabled}
            sx={{ color: item.color }}
            onClick={() => handleCommand(item)}
          >
            {item.icon && (
              <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>
                {item.icon}
              </ListItemIcon>
            )}
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      <ConfirmDialog
        open={!!confirmItem}
        onClose={() => setConfirmItem(null)}
        onConfirm={() => confirmItem?.command?.()}
        title={confirmItem?.confirmTitle || 'Confirmar'}
        message={confirmItem?.confirm || '¿Está seguro de realizar esta acción?'}
        confirmLabel={confirmItem?.confirmLabel || 'Eliminar'}
        confirmColor={confirmItem?.confirmColor || 'error'}
      />
    </>
  );
}

TableActions.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
      command: PropTypes.func,
      disabled: PropTypes.bool,
      color: PropTypes.string,
      confirm: PropTypes.string,
      confirmTitle: PropTypes.string,
      confirmLabel: PropTypes.string,
      confirmColor: PropTypes.string,
    })
  ).isRequired,
};
