import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import NotificationList from './NotificationList';
import { useAuth } from 'contexts/authContext';
import { useSocket } from 'socket/SocketProvider';
import {
  getNotificationCountAPI,
  paginationNotificationsAPI,
  markAsReadAPI,
  markAllAsReadAPI,
} from 'api/requests/notificationsApi';

// ==============================|| NOTIFICATION ||============================== //

export default function NotificationSection() {
  const theme = useTheme();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const socket = useSocket();

  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const anchorRef = useRef(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!user?.useId) return;
    try {
      const response = await getNotificationCountAPI({ userId: user.useId });
      setUnreadCount(response.data);
    } catch (err) {
      console.error('Error fetching notification count:', err);
    }
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!user?.useId) return;
    try {
      const response = await paginationNotificationsAPI({ userId: user.useId, page: 1, limit: 10 });
      setNotifications(response.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = () => {
      setUnreadCount((prev) => prev + 1);
    };

    socket.on('newNotification', handleNewNotification);

    return () => {
      socket.off('newNotification', handleNewNotification);
    };
  }, [socket]);

  const handleToggle = () => {
    setOpen((prevOpen) => {
      if (!prevOpen) {
        fetchNotifications();
      }
      return !prevOpen;
    });
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsReadAPI(notificationId).then((r) => r.data);
      setNotifications((prev) =>
        prev.map((n) =>
          n.not_id === notificationId ? { ...n, not_is_read: 1, not_read_at: new Date().toISOString() } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.useId) return;
    try {
      await markAllAsReadAPI({ userId: user.useId }).then((r) => r.data);
      setNotifications((prev) =>
        prev.map((n) => (n.not_is_read ? n : { ...n, not_is_read: 1 })),
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  return (
    <>
      <Box sx={{ ml: 2 }}>
        <Badge badgeContent={unreadCount} color="error">
          <Avatar
            variant="rounded"
            sx={{
              ...theme.typography.commonAvatar,
              ...theme.typography.mediumAvatar,
              transition: 'all .2s ease-in-out',
              color: theme.vars.palette.warning.dark,
              background: theme.vars.palette.warning.light,
              '&:hover, &[aria-controls="menu-list-grow"]': {
                color: theme.vars.palette.warning.light,
                background: theme.vars.palette.warning.dark
              }
            }}
            ref={anchorRef}
            aria-controls={open ? 'menu-list-grow' : undefined}
            aria-haspopup="true"
            onClick={handleToggle}
          >
            <span role="img" aria-label="notifications">🔔</span>
          </Avatar>
        </Badge>
      </Box>
      <Popper
        placement={downMD ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        modifiers={[{ name: 'offset', options: { offset: [downMD ? 5 : 0, 20] } }]}
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClose}>
            <Transitions position={downMD ? 'top' : 'top-right'} in={open} {...TransitionProps}>
              <Paper>
                <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]} sx={{ maxWidth: 330 }}>
                  <Stack sx={{ gap: 2 }}>
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', pt: 2, px: 2 }}>
                      <Stack direction="row" sx={{ gap: 2 }}>
                        <Typography variant="subtitle1">Notificaciones</Typography>
                        {unreadCount > 0 && (
                          <Chip size="small" label={unreadCount} variant="filled" sx={{ color: 'background.default', bgcolor: 'warning.dark' }} />
                        )}
                      </Stack>
                      {unreadCount > 0 && (
                        <Typography
                          component="span"
                          variant="subtitle2"
                          sx={{ color: 'primary.main', cursor: 'pointer' }}
                          onClick={handleMarkAllAsRead}
                        >
                          Marcar todas leídas
                        </Typography>
                      )}
                    </Stack>
                    <Divider sx={{ mt: 0 }} />
                    <Box sx={{ maxHeight: 'calc(100vh - 205px)', overflowX: 'hidden', '&::-webkit-scrollbar': { width: 5 } }}>
                      <NotificationList notifications={notifications} onMarkAsRead={handleMarkAsRead} />
                    </Box>
                  </Stack>
                  <CardActions sx={{ p: 1.25, justifyContent: 'center' }}>
                    <Button size="small" disableElevation>
                      Ver todas
                    </Button>
                  </CardActions>
                </MainCard>
              </Paper>
            </Transitions>
          </ClickAwayListener>
        )}
      </Popper>
    </>
  );
}
