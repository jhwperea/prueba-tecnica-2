import { useState, useEffect, useCallback } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useSocket } from "socket/SocketProvider";

function RequiredLabel({ required, label }) {
  return (
    <>
      {required && <span style={{ color: "red" }}>* </span>}
      {label}
    </>
  );
}

const SelectSocket = ({
  value,
  onChange,
  error,
  disabled,
  label,
  required,
  fetchApi,
  mapOptions,
  socketEvent,
  onOptionChange,
}) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const socket = useSocket();

  const refreshOptions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi();
      const data = res?.data ?? res ?? [];
      setOptions(mapOptions ? mapOptions(data) : data);
    } catch (err) {
      console.error("Error fetching socket options:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchApi, mapOptions]);

  useEffect(() => {
    refreshOptions();
  }, [refreshOptions]);

  useEffect(() => {
    if (!socket || !socketEvent) return;

    const handler = () => {
      refreshOptions();
    };

    socket.on(socketEvent, handler);
    return () => {
      socket.off(socketEvent, handler);
    };
  }, [socket, socketEvent, refreshOptions]);

  const hasError = Boolean(error);

  const selectedOption = options.find(
    (o) => (o.value ?? o.id) === value
  ) ?? null;

  return (
    <Autocomplete
      value={selectedOption}
      onChange={(event, newValue) => {
        onChange(newValue?.value ?? newValue?.id ?? "");
        if (onOptionChange && newValue) onOptionChange(newValue);
      }}
      options={options}
      getOptionLabel={(opt) => opt.label ?? opt.nombre ?? ""}
      isOptionEqualToValue={(opt, val) =>
        (opt.value ?? opt.id) === (val.value ?? val.id)
      }
      loading={loading}
      disabled={disabled}
      size="small"
      fullWidth
      renderInput={(params) => (
        <TextField
          {...params}
          label={<RequiredLabel required={required} label={label} />}
          error={hasError}
          helperText={hasError ? error.message : null}
        />
      )}
    />
  );
};

export default SelectSocket;
