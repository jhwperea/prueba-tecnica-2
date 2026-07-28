import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

// project imports
import { withAlpha } from 'utils/colorUtils';

// assets
import { IconBell, IconAlertTriangle, IconInfoCircle, IconCircleCheck, IconCircleCheckFilled } from '@tabler/icons-react';

function ListItemWrapper({ children }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          bgcolor: withAlpha(theme.palette.grey[200], 0.3)
        }
      }}
    >
      {children}
    </Box>
  );
}

const typeConfig = {
  alert: { color: 'error', icon: IconAlertTriangle },
  warning: { color: 'warning', icon: IconAlertTriangle },
  info: { color: 'info', icon: IconInfoCircle },
  success: { color: 'success', icon: IconCircleCheck },
};

function getTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Ahora';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Hace ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString('es-CO');
}

export default function NotificationList({ notifications = [], onMarkAsRead }) {
  const theme = useTheme();

  if (!notifications.length) {
    return (
      <List sx={{ width: '100%', maxWidth: { xs: 300, md: 330 }, py: 0 }}>
        <ListItemWrapper>
          <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
            <IconBell size={32} stroke={1.5} />
            <Typography variant="body2" sx={{ mt: 1 }}>
              No hay notificaciones
            </Typography>
          </Box>
        </ListItemWrapper>
      </List>
    );
  }

  return (
    <List sx={{ width: '100%', maxWidth: { xs: 300, md: 330 }, py: 0 }}>
      {notifications.map((notif) => {
        const config = typeConfig[notif.not_type] || typeConfig.info;
        const Icon = config.icon;

        return (
          <ListItemWrapper key={notif.not_id}>
            <ListItem
              alignItems="center"
              disablePadding
              secondaryAction={
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                  <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
                    {getTimeAgo(notif.not_created_at)}
                  </Typography>
                  {!notif.not_is_read && (
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); onMarkAsRead?.(notif.not_id); }}
                      sx={{ color: 'success.main', p: 0.5 }}
                    >
                      <IconCircleCheck size={18} stroke={1.5} />
                    </IconButton>
                  )}
                </Box>
              }
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    color: `${config.color}.dark`,
                    bgcolor: withAlpha(theme.palette[config.color]?.light || '#e0e0e0', 0.5)
                  }}
                >
                  <Icon stroke={1.5} size="20px" />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: notif.not_is_read ? 400 : 700 }}>
                    {notif.not_title}
                  </Typography>
                }
              />
            </ListItem>
            <Box sx={{ pl: 7 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                {notif.not_message}
              </Typography>
              {!notif.not_is_read && (
                <Chip label="Nuevo" color="error" size="small" sx={{ width: 'min-content' }} />
              )}
            </Box>
          </ListItemWrapper>
        );
      })}
    </List>
  );
}

NotificationList.propTypes = {
  notifications: PropTypes.array,
  onMarkAsRead: PropTypes.func,
};

ListItemWrapper.propTypes = { children: PropTypes.node };
