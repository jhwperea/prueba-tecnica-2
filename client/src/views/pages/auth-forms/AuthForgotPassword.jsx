import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// material-ui
import Alert from '@mui/material/Alert';
import AnimateButton from 'ui-component/extended/AnimateButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import CustomFormControl from 'ui-component/extended/Form/CustomFormControl';
import FormControl from '@mui/material/FormControl';
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
import { forgotPasswordAPI, validateCodeAPI, restorePasswordAPI } from 'api/requests/authAPI';

const STEPS = ['Ingresa tu email', 'Código de verificación', 'Nueva contraseña'];

// ===========================|| FORGOT PASSWORD ||=========================== //

export default function ForgotPassword() {
  const navigate = useNavigate();

  // ── Estado global ─────────────────────────────────────────────────────
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  // ── Paso 1: email ────────────────────────────────────────────────────
  const [email, setEmail]   = useState('');
  const [token, setToken]     = useState('');

  // ── Paso 2: código OTP ────────────────────────────────────────────────
  const [otp, setOtp]             = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend]     = useState(false);

  // ── Paso 3: nueva contraseña ──────────────────────────────────────────
  const [nuevaClave, setNuevaClave]         = useState('');
  const [confirmarClave, setConfirmarClave] = useState('');
  const [showPassword, setShowPassword]     = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [strength, setStrength]             = useState(0);
  const [level, setLevel]                   = useState();

  // ── Temporizador reenvío ──────────────────────────────────────────────
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

  // ── OTP helpers ───────────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) document.getElementById(`otp-fp-${index + 1}`)?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0)
      document.getElementById(`otp-fp-${index - 1}`)?.focus();
  };

  const handlePasswordChange = (value) => {
    setNuevaClave(value);
    const temp = strengthIndicator(value);
    setStrength(temp);
    setLevel(strengthColor(temp));
  };

  // ── PASO 1: Enviar email ─────────────────────────────────────────────
  const handleSendEmail = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await forgotPasswordAPI({ email });
      setToken(data.token);
      setActiveStep(1);
    } catch (err) {
      setError(err.response?.data?.message ?? 'No encontramos una cuenta con ese email.');
    } finally {
      setLoading(false);
    }
  };

  // ── PASO 2: Validar código ────────────────────────────────────────────
  const handleValidateCode = async (e) => {
    e.preventDefault();
    setError(null);
    const codeTemp = otp.join('');
    if (codeTemp.length < 6) { setError('Ingresa el código completo.'); return; }

    setLoading(true);
    try {
      await validateCodeAPI({ token, codeTemp });
      setActiveStep(2);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Código incorrecto o expirado.');
    } finally {
      setLoading(false);
    }
  };

  // ── PASO 2: Reenviar código ───────────────────────────────────────────
  const handleResend = async () => {
    if (!canResend) return;
    setError(null);
    setLoading(true);
    try {
      const { data } = await forgotPasswordAPI({ email });
      setToken(data.token);
      setOtp(['', '', '', '', '', '']);
      // El useEffect reinicia el timer porque activeStep sigue en 1
      setResendTimer(60);
      setCanResend(false);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al reenviar el código.');
    } finally {
      setLoading(false);
    }
  };

  // ── PASO 3: Restablecer contraseña ────────────────────────────────────
  const handleRestore = async (e) => {
    e.preventDefault();
    setError(null);

    if (nuevaClave !== confirmarClave) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (strength < 2) {
      setError('La contraseña es muy débil. Usa al menos 8 caracteres con letras y números.');
      return;
    }

    const codeTemp = otp.join('');
    setLoading(true);
    try {
      await restorePasswordAPI({ token, nuevaContrasena: nuevaClave, codeTemp });
      setActiveStep(3);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al restablecer la contraseña.');
    } finally {
      setLoading(false);
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

      {/* ── PASO 1: Ingresar email ── */}
      {activeStep === 0 && (
        <form onSubmit={handleSendEmail}>
          <Stack spacing={1} sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight={600}>¿Olvidaste tu contraseña?</Typography>
            <Typography variant="body2" color="text.secondary">
              Ingresa tu email y te enviaremos un código para restablecerla.
            </Typography>
          </Stack>

          <CustomFormControl fullWidth>
            <InputLabel htmlFor="email-recovery">Correo electrónico</InputLabel>
            <OutlinedInput
              id="email-recovery"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Correo electrónico"
              required
            />
          </CustomFormControl>

          <Box sx={{ mt: 2 }}>
            <AnimateButton>
              <Button
                color="secondary" fullWidth size="large"
                type="submit" variant="contained" disabled={loading}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Enviar código'}
              </Button>
            </AnimateButton>
          </Box>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography
              component={Link} to="/pages/login" variant="body2"
              sx={{ color: 'secondary.main', textDecoration: 'none', fontWeight: 600 }}
            >
              ← Volver al inicio de sesión
            </Typography>
          </Box>
        </form>
      )}

      {/* ── PASO 2: Ingresar código OTP ── */}
      {activeStep === 1 && (
        <form onSubmit={handleValidateCode}>
          <Stack alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight={600}>Revisa tu email</Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Enviamos un código de 6 dígitos a <strong>{email}</strong>
            </Typography>
          </Stack>

          {/* Inputs OTP */}
          <Stack direction="row" justifyContent="center" spacing={1} sx={{ mb: 3 }}>
            {otp.map((digit, i) => (
              <TextField
                key={i}
                id={`otp-fp-${i}`}
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
              onClick={handleResend} disabled={!canResend || loading}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {canResend ? 'Reenviar' : `Reenviar en ${resendTimer}s`}
            </Button>
          </Stack>
        </form>
      )}

      {/* ── PASO 3: Nueva contraseña ── */}
      {activeStep === 2 && (
        <form onSubmit={handleRestore}>
          <Stack spacing={1} sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight={600}>Nueva contraseña</Typography>
            <Typography variant="body2" color="text.secondary">
              Elige una contraseña segura para tu cuenta.
            </Typography>
          </Stack>

          <CustomFormControl fullWidth>
            <InputLabel htmlFor="nueva-clave">Nueva contraseña</InputLabel>
            <OutlinedInput
              id="nueva-clave"
              type={showPassword ? 'text' : 'password'}
              value={nuevaClave}
              onChange={(e) => handlePasswordChange(e.target.value)}
              label="Nueva contraseña" required
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
            <InputLabel htmlFor="confirmar-clave">Confirmar contraseña</InputLabel>
            <OutlinedInput
              id="confirmar-clave"
              type={showConfirm ? 'text' : 'password'}
              value={confirmarClave}
              onChange={(e) => setConfirmarClave(e.target.value)}
              label="Confirmar contraseña" required
              endAdornment={
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirm((p) => !p)} edge="end">
                    {showConfirm ? <Visibility /> : <VisibilityOff />}
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
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Restablecer contraseña'}
              </Button>
            </AnimateButton>
          </Box>
        </form>
      )}

      {/* ── PASO 4: Éxito ── */}
      {activeStep === 3 && (
        <Stack alignItems="center" spacing={3} sx={{ py: 4 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 72, color: 'success.main' }} />
          <Typography variant="h4" fontWeight={700} align="center">
            ¡Contraseña actualizada!
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center">
            Tu contraseña ha sido restablecida correctamente.
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