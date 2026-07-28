import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

const BaseDialog = ({
    open,
    onClose,
    title,
    maxWidth = "sm",
    loading = false,
    children,
    actions,
}) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
            <DialogTitle sx={{ variant: 'h3', fontWeight: 600 }}>{title}</DialogTitle>
            <DialogContent dividers>
                {loading && (
                    <Box display="flex" justifyContent="center" sx={{ py: 4 }}>
                        <CircularProgress />
                    </Box>
                )}
                {!loading && children}
            </DialogContent>
            {actions && (
                <DialogActions>
                    {actions}
                </DialogActions>
            )}
        </Dialog>
    );
};

export default BaseDialog;
