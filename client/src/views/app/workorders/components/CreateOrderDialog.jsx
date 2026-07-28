import { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { showError } from 'services/ToastService';
import { searchBikesByPlateAPI } from 'api/requests/bikesApi';
import { createWorkOrderAPI } from 'api/requests/workOrdersApi';

import BaseDialog from 'ui-component/extended/BaseDialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import InputAdornment from '@mui/material/InputAdornment';
import { IconSearch, IconPlus } from '@tabler/icons-react';

import QuickRegisterDialog from './QuickRegisterDialog';

const CreateOrderDialog = forwardRef(({ onCreated }, ref) => {
  const [visible, setVisible] = useState(false);
  const [plateQuery, setPlateQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchExecuted, setSearchExecuted] = useState(false);
  const [selectedBike, setSelectedBike] = useState(null);
  const [faultDescription, setFaultDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const quickRegisterRef = useRef(null);

  const open = () => {
    setPlateQuery('');
    setSelectedBike(null);
    setFaultDescription('');
    setError(null);
    setSearchExecuted(false);
    setVisible(true);
  };

  useImperativeHandle(ref, () => ({ open }));

  const handleSearchBike = async () => {
    if (!plateQuery.trim()) return;
    setSearching(true);
    setError(null);
    setSearchExecuted(true);
    setSelectedBike(null);
    try {
      const { data } = await searchBikesByPlateAPI({ plate: plateQuery.trim() });
      if (data && data.length > 0) {
        const exact = data.find((b) => b.placa.toUpperCase() === plateQuery.trim().toUpperCase());
        const found = exact || data[0];
        setSelectedBike({
          id: found.id,
          placa: found.placa,
          brand: found.brand,
          model: found.model,
          cylinder: found.cylinder,
          client: { name: found.clientName, phone: found.clientPhone, email: found.clientEmail },
        });
      }
    } catch (err) {
      setError('Error al consultar vehículo por placa.');
    } finally {
      setSearching(false);
    }
  };

  const handleQuickRegisterSuccess = (bike) => {
    setSelectedBike(bike);
    setPlateQuery(bike.placa);
    setSearchExecuted(true);
  };

  const handleSubmitOrder = async () => {
    if (!selectedBike) {
      setError('Debes seleccionar o registrar una motocicleta válida.');
      return;
    }
    if (!faultDescription.trim()) {
      setError('La descripción del fallo reportado es obligatoria.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const { data } = await createWorkOrderAPI({
        bikId: selectedBike.id,
        faultDescription: faultDescription.trim(),
      });
      setVisible(false);
      onCreated(data);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo crear la orden de trabajo.');
      showError(err.response?.data?.message || 'No se pudo crear la orden de trabajo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <BaseDialog
        open={visible}
        onClose={() => setVisible(false)}
        title="Crear Orden de Trabajo"
        maxWidth="sm"
        actions={
          <>
            <Button onClick={() => setVisible(false)}>Cancelar</Button>
            <Button variant="contained" color="secondary" onClick={handleSubmitOrder} disabled={!selectedBike || submitting}>
              {submitting ? 'Creando...' : 'Crear Orden'}
            </Button>
          </>
        }
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <Typography variant="subtitle2">1. Identificación del Vehículo y Cliente</Typography>

          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              fullWidth
              placeholder="Ingresa la placa (Ej. XYZ123)"
              value={plateQuery}
              onChange={(e) => setPlateQuery(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearchBike();
                }
              }}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><IconSearch size={16} /></InputAdornment> } }}
            />
            <Button variant="outlined" onClick={handleSearchBike} disabled={searching}>
              {searching ? 'Buscando…' : 'Buscar'}
            </Button>
          </Stack>

          {selectedBike ? (
            <Card variant="outlined" sx={{ borderColor: 'success.main' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700}>
                  Placa: {selectedBike.placa}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedBike.brand} {selectedBike.model} {selectedBike.cylinder ? `(${selectedBike.cylinder} cc)` : ''}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  Propietario: <strong>{selectedBike.client?.name}</strong> (Tel: {selectedBike.client?.phone})
                </Typography>
                <Button size="small" sx={{ mt: 1 }} onClick={() => setSelectedBike(null)}>
                  Cambiar Moto
                </Button>
              </CardContent>
            </Card>
          ) : searchExecuted && !searching ? (
            <Card variant="outlined" sx={{ borderColor: 'warning.main' }}>
              <CardContent>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  No se encontró ninguna moto registrada con la placa &quot;{plateQuery}&quot;.
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<IconPlus size={16} />}
                  onClick={() => quickRegisterRef.current?.open(plateQuery)}
                >
                  Registro Rápido de Cliente + Moto
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Typography variant="caption" color="text.secondary">
              Busca una placa registrada o utiliza el registro rápido si es un cliente nuevo.
            </Typography>
          )}

          <Typography variant="subtitle2">2. Falla Reportada y Diagnóstico Inicial</Typography>
          <TextField
            multiline
            minRows={3}
            fullWidth
            placeholder="Describe detalladamente los problemas reportados por el cliente o trabajos requeridos..."
            value={faultDescription}
            onChange={(e) => setFaultDescription(e.target.value)}
          />
        </Stack>
      </BaseDialog>

      <QuickRegisterDialog ref={quickRegisterRef} onSuccess={handleQuickRegisterSuccess} />
    </>
  );
});

export default CreateOrderDialog;
