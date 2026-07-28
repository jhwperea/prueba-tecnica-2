import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', pt: 3, mt: 'auto' }}>
      <Typography variant="caption">Copyright &copy; {year} PAVAS S.A.S. Todos los derechos reservados.</Typography>
    </Stack>
  );
}
