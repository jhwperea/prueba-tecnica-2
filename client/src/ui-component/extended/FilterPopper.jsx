import { useCallback, useState, useEffect } from "react";
import PropTypes from "prop-types";
import Popover from "@mui/material/Popover";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import CloseIcon from "@mui/icons-material/Close";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import { debounce } from "lodash-es";
import { useSocket } from "socket/SocketProvider";

const normalizeOptions = (options = []) =>
  options.map((option) => {
    if (option && typeof option === "object") {
      return {
        value: option.value ?? option.id ?? option,
        label: option.label ?? option.name ?? String(option.value ?? option.id ?? option),
      };
    }
    return { value: option, label: String(option) };
  });

const SocketDropdownFilter = ({ filter, value, updateFilter }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const socket = useSocket();

  const fetchOptions = useCallback(async () => {
    if (!filter.fetchApi) return;
    setLoading(true);
    try {
      const res = await filter.fetchApi();
      const data = res?.data ?? res ?? [];
      setOptions(
        data.map((opt) => ({
          value: opt.value ?? opt.id,
          label: opt.label ?? opt.nombre ?? String(opt.value ?? opt.id),
        }))
      );
    } catch (err) {
      console.error("Error fetching socket dropdown options:", err);
    } finally {
      setLoading(false);
    }
  }, [filter.fetchApi]);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  useEffect(() => {
    if (!socket || !filter.socketEvent) return;
    const handler = () => fetchOptions();
    socket.on(filter.socketEvent, handler);
    return () => socket.off(filter.socketEvent, handler);
  }, [socket, filter.socketEvent, fetchOptions]);

  return (
    <Autocomplete
      value={options.find((o) => o.value === value) ?? null}
      onChange={(event, newValue) => updateFilter(filter.key, newValue?.value ?? "", true)}
      options={options}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, val) => option.value === val.value}
      loading={loading}
      size="small"
      fullWidth
      renderInput={(params) => <TextField {...params} label={filter.label} />}
    />
  );
};

const FilterPopper = ({
  anchorEl,
  open,
  onClose,
  filters,
  setFilters,
  initialFilters,
  placement = "bottom-end",
  width = 560,
  title = "Filtros",
}) => {
  const debounceSetFilters = useCallback(
    debounce((fieldKey, value) => {
      setFilters((prev) => ({ ...prev, [fieldKey]: value }));
    }, 300),
    [setFilters]
  );

  const updateFilter = (fieldKey, value, immediate = false) => {
    if (immediate) {
      setFilters((prev) => ({ ...prev, [fieldKey]: value }));
      return;
    }
    debounceSetFilters(fieldKey, value);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const renderField = (filter) => {
    const value = filter.filtro ?? "";
    const options = normalizeOptions(filter.props?.options || []);

    switch (filter.type) {
      case "dropdown":
        return (
          <Autocomplete
            value={options.find((o) => o.value === value) ?? null}
            onChange={(event, newValue) => updateFilter(filter.key, newValue?.value ?? "", true)}
            options={options}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, val) => option.value === val.value}
            size="small"
            fullWidth
            renderInput={(params) => <TextField {...params} label={filter.label} />}
          />
        );
      case "input":
        return (
          <TextField
            fullWidth
            size="small"
            label={filter.label}
            value={value}
            onChange={(event) => updateFilter(filter.key, event.target.value, true)}
          />
        );
      case "calendar":
        return (
          <TextField
            fullWidth
            size="small"
            type="date"
            label={filter.label}
            value={value ?? ""}
            InputLabelProps={{ shrink: true }}
            onChange={(event) => updateFilter(filter.key, event.target.value, true)}
          />
        );
      case "calendar-range": {
        const range = Array.isArray(value) ? value : ["", ""];
        const labelFrom = filter.props?.labelFrom || "Desde";
        const labelTo = filter.props?.labelTo || "Hasta";
        return (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1, alignItems: "center" }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label={labelFrom}
              InputLabelProps={{ shrink: true }}
              value={range[0] || ""}
              onChange={(event) => updateFilter(filter.key, [event.target.value, range[1]], true)}
            />
            <TextField
              fullWidth
              size="small"
              type="date"
              label={labelTo}
              InputLabelProps={{ shrink: true }}
              value={range[1] || ""}
              onChange={(event) => updateFilter(filter.key, [range[0], event.target.value], true)}
            />
          </Box>
        );
      }
      case "selectButton":
        return (
          <Box>
            <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
              {filter.label}
            </Typography>
            <ToggleButtonGroup
              fullWidth
              size="small"
              exclusive
              value={value ?? null}
              onChange={(_, next) => updateFilter(filter.key, next, true)}
            >
              {options.map((option) => (
                <ToggleButton key={option.value} value={option.value}>
                  {option.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        );
      case "multiSelect": {
        const selected = options.filter((option) => Array.isArray(value) && value.includes(option.value));
        return (
          <Autocomplete
            multiple
            options={options}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, val) => option.value === val.value}
            value={selected}
            onChange={(_, next) => updateFilter(filter.key, next.map((item) => item.value), true)}
            renderInput={(params) => <TextField {...params} size="small" label={filter.label} />}
          />
        );
      }
      case "socketDropdown": {
        return (
          <SocketDropdownFilter filter={filter} value={value} updateFilter={updateFilter} />
        );
      }
      case "chips":
        return (
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={Array.isArray(value) ? value : []}
            onChange={(_, next) => updateFilter(filter.key, next, true)}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip key={`${option}-${index}`} label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => <TextField {...params} label={filter.label} size="small" />}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      PaperProps={{
        sx: {
          width: { xs: '100vw', sm: width },
          minWidth: { sm: width },
          maxWidth: width,
          p: 2,
          boxShadow: 6,
          borderRadius: 2,
          overflow: 'hidden',
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Grid container spacing={2} alignItems="stretch">
        {filters.map((filter) => {
          const gridSizes = filter.grid ?? { xs: 12 };
          return (
            <Grid
              key={filter.key}
              size={gridSizes}
              sx={{
                minWidth: 0,
              }}
            >
              <Box sx={{ width: '100%' }}>{renderField(filter)}</Box>
            </Grid>
          );
        })}
      </Grid>
      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
        <Button
          size="small"
          startIcon={<ClearAllIcon />}
          onClick={clearFilters}
          variant="outlined"
        >
          Limpiar
        </Button>
      </Stack>
    </Popover>
  );
};

FilterPopper.propTypes = {
  anchorEl: PropTypes.any,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      filtro: PropTypes.any,
      props: PropTypes.object,
      grid: PropTypes.object,
    })
  ).isRequired,
  setFilters: PropTypes.func.isRequired,
  initialFilters: PropTypes.object,
  placement: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string,
};

FilterPopper.defaultProps = {
  initialFilters: {},
  placement: "bottom-end",
  width: 560,
  title: "Filtros",
};

export default FilterPopper;
