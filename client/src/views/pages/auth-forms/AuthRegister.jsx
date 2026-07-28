import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// material-ui
import Alert from '@mui/material/Alert';
import AnimateButton from 'ui-component/extended/AnimateButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import CustomFormControl from 'ui-component/extended/Form/CustomFormControl';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// utils
import { strengthColor, strengthIndicator } from 'utils/password-strength';

// API
import { registerAPI, verifyOtpAPI, resendOtpAPI } from 'api/requests/authAPI';

const STEPS = ['Tus datos', 'Verificar correo'];

// ===========================|| REGISTER ||=========================== //

export default function AuthRegister() {
  const navigate = useNavigate();

  // ── Stepper ──────────────────────────────────────────────────────────
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  // ── Paso 1: datos del usuario ─────────────────────────────────────────
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    correo: '',
    usuario: '',
    clave: '',
    confirmarClave: '',
  });
  const [showPassword, setShowPassword]         = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [strength, setStrength]                 = useState(0);
  const [level, setLevel]                       = useState();

  // ── Paso 2: OTP ───────────────────────────────────────────────────────
  const [useId, setUseId]       = useState(null);
  const [otp, setOtp]           = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend]     = useState(false);

  // ── Temporizador reenvío OTP ──────────────────────────────────────────
  useEffect(() => {
    if (activeStep !== 1) return;
    setResendTimer(60);
    setCanResend(false);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); setCanResend(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeStep]);

  // ── Helpers contraseña ────────────────────────────────────────────────
  const handlePasswordChange = (value) => {
    setFormData((prev) => ({ ...prev, clave: value }));
    const temp = strengthIndicator(value);
    setStrength(temp);
    setLevel(strengthColor(temp));
  };

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // ── OTP input ─────────────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  // ── Paso 1: Registro ──────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.clave !== formData.confirmarClave) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await registerAPI({
        nombre:   formData.nombre,
        telefono: formData.telefono,
        correo:   formData.correo,
        usuario:  formData.usuario,
        clave:    formData.clave,
      });
      setUseId(data.useId);
      setActiveStep(1);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al registrar. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // ── Paso 2: Verificar OTP ─────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    const codigo = otp.join('');
    if (codigo.length < 6) { setError('Ingresa el código completo.'); return; }

    setLoading(true);
    try {
      await verifyOtpAPI({ useId, codigo });
      setActiveStep(2); // éxito
    } catch (err) {
      setError(err.response?.data?.message ?? 'Código incorrecto o expirado.');
    } finally {
      setLoading(false);
    }
  };

  // ── Reenviar OTP ──────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (!canResend) return;
    setError(null);
    try {
      await resendOtpAPI({ useId });
      setOtp(['', '', '', '', '', '']);
      setActiveStep(1); // reinicia el timer via useEffect
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al reenviar el código.');
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <Box>
      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Error global */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* ── PASO 1: Formulario de registro ── */}
      {activeStep === 0 && (
        <form onSubmit={handleRegister}>
          <Grid container spacing={{ xs: 0, sm: 2 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormControl fullWidth>
                <InputLabel htmlFor="nombre">Nombre completo</InputLabel>
                <OutlinedInput
                  id="nombre" name="nombre"
                  value={formData.nombre} onChange={handleChange}
                  label="Nombre completo" required
                />
              </CustomFormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormControl fullWidth>
                <InputLabel htmlFor="telefono">Teléfono</InputLabel>
                <OutlinedInput
                  id="telefono" name="telefono"
                  value={formData.telefono} onChange={handleChange}
                  label="Teléfono" required
                />
              </CustomFormControl>
            </Grid>
          </Grid>

          <CustomFormControl fullWidth>
            <InputLabel htmlFor="correo">Correo electrónico</InputLabel>
            <OutlinedInput
              id="correo" name="correo" type="email"
              value={formData.correo} onChange={handleChange}
              label="Correo electrónico" required
            />
          </CustomFormControl>

          <CustomFormControl fullWidth>
            <InputLabel htmlFor="usuario">Usuario</InputLabel>
            <OutlinedInput
              id="usuario" name="usuario"
              value={formData.usuario} onChange={handleChange}
              label="Usuario" required
            />
          </CustomFormControl>

          <CustomFormControl fullWidth>
            <InputLabel htmlFor="clave">Contraseña</InputLabel>
            <OutlinedInput
              id="clave" name="clave"
              type={showPassword ? 'text' : 'password'}
              value={formData.clave}
              onChange={(e) => handlePasswordChange(e.target.value)}
              label="Contraseña" required
              endAdornment={
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((p) => !p)} edge="end">
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </CustomFormControl>

          {/* Indicador de fortaleza */}
          {strength !== 0 && (
            <FormControl fullWidth>
              <Box sx={{ mb: 2 }}>
                <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
                  <Box sx={{ width: 85, height: 8, borderRadius: '7px', bgcolor: level?.color }} />
                  <Typography variant="subtitle1" sx={{ fontSize: '0.75rem' }}>
                    {level?.label}
                  </Typography>
                </Stack>
              </Box>
            </FormControl>
          )}

          <CustomFormControl fullWidth>
            <InputLabel htmlFor="confirmarClave">Confirmar contraseña</InputLabel>
            <OutlinedInput
              id="confirmarClave" name="confirmarClave"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmarClave} onChange={handleChange}
              label="Confirmar contraseña" required
              endAdornment={
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword((p) => !p)} edge="end">
                    {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </CustomFormControl>

          <Box sx={{ mt: 2 }}>
            <AnimateButton>
              <Button
                color="secondary" fullWidth size="large"
                type="submit" variant="contained" disabled={loading}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Crear cuenta'}
              </Button>
            </AnimateButton>
          </Box>

          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" align="center">
            ¿Ya tienes cuenta?{' '}
            <Typography
              component={Link} to="/pages/login" variant="body2"
              sx={{ color: 'secondary.main', textDecoration: 'none', fontWeight: 600 }}
            >
              Iniciar sesión
            </Typography>
          </Typography>
        </form>
      )}

      {/* ── PASO 2: Verificar OTP ── */}
      {activeStep === 1 && (
        <form onSubmit={handleVerifyOtp}>
          <Stack alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight={600}>Verifica tu correo</Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Enviamos un código de 6 dígitos a <strong>{formData.correo}</strong>
            </Typography>
          </Stack>

          {/* Inputs OTP */}
          <Stack direction="row" justifyContent="center" spacing={1} sx={{ mb: 3 }}>
            {otp.map((digit, i) => (
              <TextField
                key={i}
                id={`otp-${i}`}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                inputProps={{
                  maxLength: 1,
                  style: { textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, padding: '12px 0', width: 44 }
                }}
              />
            ))}
          </Stack>

          <AnimateButton>
            <Button
              color="secondary" fullWidth size="large"
              type="submit" variant="contained" disabled={loading}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Verificar código'}
            </Button>
          </AnimateButton>

          <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              ¿No recibiste el código?
            </Typography>
            <Button
              variant="text" size="small" color="secondary"
              onClick={handleResendOtp} disabled={!canResend}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {canResend ? 'Reenviar' : `Reenviar en ${resendTimer}s`}
            </Button>
          </Stack>
        </form>
      )}

      {/* ── PASO 3: Éxito ── */}
      {activeStep === 2 && (
        <Stack alignItems="center" spacing={3} sx={{ py: 4 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 72, color: 'success.main' }} />
          <Typography variant="h4" fontWeight={700} align="center">
            ¡Cuenta verificada!
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center">
            Tu cuenta ha sido creada y verificada correctamente.
          </Typography>
          <AnimateButton>
            <Button
              color="secondary" size="large" variant="contained"
              onClick={() => navigate('/pages/login')}
            >
              Ir a iniciar sesión
            </Button>
          </AnimateButton>
        </Stack>
      )}
    </Box>
  );
}