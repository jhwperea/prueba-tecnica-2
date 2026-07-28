import { useState, cloneElement } from 'react';
import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

export default function ConfirmPopper({ children, message, onConfirm }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      {cloneElement(children, { onClick: handleClick })}
      <Popper open={Boolean(anchorEl)} anchorEl={anchorEl} placement="left" disablePortal>
        <Paper sx={{ p: 2, maxWidth: 280, boxShadow: 4 }}>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            {message}
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button size="small" variant="outlined" onClick={handleClose}>
              Cancelar
            </Button>
            <Button size="small" variant="contained" color="error" onClick={() => { onConfirm(); handleClose(); }}>
              Eliminar
            </Button>
          </Stack>
        </Paper>
      </Popper>
    </>
  );
}
