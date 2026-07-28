import { useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { IconFilter, IconCheck } from '@tabler/icons-react';

const colorMap = {
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
  default: 'default',
};

export default function StatusTabs({ statusTabs, selectedStatus, onChange, hideAll }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);

  const totalCount = statusTabs.reduce((acc, s) => acc + s.total, 0);

  const selectedLabel = selectedStatus === 'all'
    ? 'Todos'
    : statusTabs.find((s) => (s.staId ?? s.id) === selectedStatus)?.staName
      ?? statusTabs.find((s) => (s.staId ?? s.id) === selectedStatus)?.name
      ?? '';

  const handleSelect = (value) => {
    setAnchorEl(null);
    onChange(null, value);
  };

  if (isMobile) {
    return (
      <>
        <Button
          variant="outlined"
          size="small"
          startIcon={<IconFilter size={18} />}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          {selectedLabel}
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          {!hideAll && (
            <MenuItem onClick={() => handleSelect('all')} selected={selectedStatus === 'all'}>
              <Stack direction="row" alignItems="center" sx={{ width: 1, gap: 1 }}>
                <Stack direction="row" alignItems="center" sx={{ flex: 1, gap: 1 }}>
                  {selectedStatus === 'all' && <IconCheck size={16} />}
                  <span>Todos</span>
                </Stack>
                <Chip label={totalCount} size="small" color="default" />
              </Stack>
            </MenuItem>
          )}
          {statusTabs.map((status) => {
            const val = status.staId ?? status.id;
            return (
              <MenuItem key={val} onClick={() => handleSelect(val)} selected={selectedStatus === val}>
                <Stack direction="row" alignItems="center" sx={{ width: 1, gap: 1 }}>
                  <Stack direction="row" alignItems="center" sx={{ flex: 1, gap: 1 }}>
                    {selectedStatus === val && <IconCheck size={16} />}
                    <span>{status.staName ?? status.name}</span>
                  </Stack>
                  <Chip
                    label={status.total ?? status.count}
                    size="small"
                    color={colorMap[status.staColor ?? status.color] ?? 'default'}
                  />
                </Stack>
              </MenuItem>
            );
          })}
        </Menu>
      </>
    );
  }

  return (
    <Tabs
      value={selectedStatus}
      onChange={onChange}
      variant="scrollable"
      scrollButtons="auto"
      sx={{ mb: 2, minHeight: 48 }}
    >
      {!hideAll && (
        <Tab
          label={
            <Stack direction="row" alignItems="center" spacing={1}>
              <span>Todos</span>
              <Chip label={totalCount} size="small" color="default" />
            </Stack>
          }
          value="all"
          sx={{ minHeight: 48 }}
        />
      )}
      {statusTabs.map((status) => (
        <Tab
          key={status.staId ?? status.id}
          label={
            <Stack direction="row" alignItems="center" spacing={1}>
              <span>{status.staName ?? status.name}</span>
              <Chip
                label={status.total ?? status.count}
                size="small"
                color={colorMap[status.staColor ?? status.color] ?? 'default'}
              />
            </Stack>
          }
          value={status.staId ?? status.id}
          sx={{ minHeight: 48 }}
        />
      ))}
    </Tabs>
  );
}

StatusTabs.propTypes = {
  statusTabs: PropTypes.arrayOf(
    PropTypes.shape({
      staId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      staName: PropTypes.string,
      name: PropTypes.string,
      staColor: PropTypes.string,
      color: PropTypes.string,
      total: PropTypes.number,
      count: PropTypes.number,
    })
  ).isRequired,
  selectedStatus: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  hideAll: PropTypes.bool,
};
