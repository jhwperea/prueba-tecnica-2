import { memo, useMemo, useCallback } from "react";
import { Controller, useFormContext } from "react-hook-form";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import Checkbox from "@mui/material/Checkbox";
import Switch from "@mui/material/Switch";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import SelectSocket from "./SelectSocket";

function PendingDropdownField({ field }) {
  const { control } = useFormContext();

  const {
    name,
    label,
    options = [],
    disabled,
    placeholder = "Seleccionar...",
    dropdownProps = {},
    onUserChange,
    showPending,
    pendingLabel,
    onConfirmPending,
    onCancelPending,
  } = field;

  return (
    <Grid size={{ xs: 12, md: 6 }}>
      {label && (
        <InputLabel sx={{ mb: 0.5, fontWeight: 500 }}>{label}</InputLabel>
      )}
      <FormControl fullWidth size="small" disabled={disabled}>
        <Controller
          name={name}
          control={control}
          render={({ field: rhfField }) => (
            <>
              <Select
                {...rhfField}
                {...dropdownProps}
                value={rhfField.value ?? ""}
                onChange={(e) => {
                  onUserChange(e.target.value);
                }}
                displayEmpty
              >
                <MenuItem value="">
                  <em>{placeholder}</em>
                </MenuItem>
                {options.map((opt) => (
                  <MenuItem key={opt.value ?? opt.id} value={opt.value ?? opt.id}>
                    {opt.label ?? opt.nombre}
                  </MenuItem>
                ))}
              </Select>
              {showPending && (
                <Box sx={{ display: "flex", gap: 0.5, mt: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      flex: 1,
                      bgcolor: "#f5f5f5",
                      color: "#000000e8",
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                    }}
                  >
                    {pendingLabel}
                  </Typography>
                  <IconButton
                    size="small"
                    color="success"
                    onClick={onConfirmPending}
                    disabled={disabled}
                  >
                    <CheckIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={onCancelPending}
                    disabled={disabled}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </>
          )}
        />
      </FormControl>
    </Grid>
  );
}

function findOption(options, value) {
  if (!options) return null;
  for (const opt of options) {
    if ((opt.value ?? opt.id) === value) return opt;
    if (opt.children) {
      const found = findOption(opt.children, value);
      if (found) return found;
    }
  }
  return null;
}

function flattenOptions(options) {
  if (!options) return [];
  const result = [];
  for (const opt of options) {
    result.push(opt);
    if (opt.children) {
      result.push(...flattenOptions(opt.children));
    }
  }
  return result;
}

function RequiredLabel({ required, label }) {
  return (
    <>
      {required && <span style={{ color: "red" }}>* </span>}
      {label}
    </>
  );
}

const GenericFormSection = memo(
  ({ fields, disabled: globalDisabled = false }) => {
    const {
      setValue,
      watch,
      control,
      formState: { errors },
    } = useFormContext();

    const currentYear = new Date().getFullYear();
    const years = useMemo(
      () =>
        Array.from(new Array(11), (_, index) => ({
          label: String(currentYear - index),
          value: currentYear - index,
        })),
      [currentYear]
    );

    const renderField = useCallback(
      (field, index) => {
        const error = errors[field.name];
        const hasError = Boolean(error);
        const gridSizes = field.grid ?? { xs: 12 };

        switch (field.type) {
          case "pendingDropdown":
            return <PendingDropdownField key={field.key} field={field} />;

          case "text":
            return (
              <Grid
                size={gridSizes}
                sx={{ mt: 2 }}
                key={`${field.key}-${index}`}
              >
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field: controllerField }) => (
                    <TextField
                      {...controllerField}
                      {...field.props}
                      value={controllerField.value ?? ""}
                      label={
                        <RequiredLabel
                          required={field.required}
                          label={field.label}
                        />
                      }
                      fullWidth
                      size="small"
                      error={hasError}
                      helperText={hasError ? error.message : null}
                      disabled={field.disabled || globalDisabled}
                      slotProps={{
                        htmlInput: {
                          maxLength: field.maxLength ?? 50,
                          autoComplete: "off",
                        },
                      }}
                    />
                  )}
                />
              </Grid>
            );

          case "time":
            return (
              <Grid
                size={gridSizes}
                sx={{ mt: 2 }}
                key={`${field.key}-${index}`}
              >
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field: controllerField }) => {
                    const listId = `${field.name}-time-list`;
                    const value = controllerField.value ?? "";
                    return (
                      <>
                        <TextField
                          {...controllerField}
                          {...field.props}
                          type="time"
                          value={value}
                          label={
                            <RequiredLabel
                              required={field.required}
                              label={field.label}
                            />
                          }
                          fullWidth
                          size="small"
                          error={hasError}
                          helperText={hasError ? error.message : null}
                          disabled={field.disabled || globalDisabled}
                          slotProps={{
                            htmlInput: {
                              step: field?.props?.step ?? 60,
                              list:
                                Array.isArray(field.options) &&
                                field.options.length
                                  ? listId
                                  : undefined,
                            },
                          }}
                          onChange={(e) => {
                            let v = e.target.value || "";
                            if (v.length === 8) v = v.slice(0, 5);
                            controllerField.onChange(v);
                          }}
                        />
                        {Array.isArray(field.options) &&
                          field.options.length > 0 && (
                            <datalist id={listId}>
                              {field.options.map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                  {opt.nombre}
                                </option>
                              ))}
                            </datalist>
                          )}
                      </>
                    );
                  }}
                />
              </Grid>
            );

          case "checkbox":
            return (
              <Grid
                size={gridSizes}
                sx={{ mt: 2 }}
                key={`${field.key}-${index}`}
              >
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field: controllerField }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          {...controllerField}
                          checked={Boolean(controllerField.value)}
                          onChange={(e) =>
                            controllerField.onChange(e.target.checked)
                          }
                          disabled={field.disabled || globalDisabled}
                        />
                      }
                      label={
                        <RequiredLabel
                          required={field.required}
                          label={field.label}
                        />
                      }
                    />
                  )}
                />
                {hasError && (
                  <FormHelperText error>{error.message}</FormHelperText>
                )}
              </Grid>
            );

          case "multiselect":
            return (
              <Grid
                size={gridSizes}
                sx={{ mt: 2 }}
                key={`${field.key}-${index}`}
              >
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field: controllerField }) => (
                    <FormControl
                      fullWidth
                      size="small"
                      error={hasError}
                      disabled={field.disabled || globalDisabled}
                    >
                      <InputLabel>
                        <RequiredLabel
                          required={field.required}
                          label={field.label}
                        />
                      </InputLabel>
                      <Select
                        {...controllerField}
                        {...field.props}
                        multiple
                        value={controllerField.value || []}
                        onChange={(e) =>
                          controllerField.onChange(e.target.value)
                        }
                        input={<OutlinedInput label={field.label} />}
                        renderValue={(selected) => (
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 0.5,
                            }}
                          >
                            {selected.map((val) => {
                              const opt = field.options?.find(
                                (o) => (o.value ?? o.id) === val
                              );
                              return (
                                <Chip
                                  key={val}
                                  label={opt?.label ?? opt?.nombre ?? val}
                                  size="small"
                                />
                              );
                            })}
                          </Box>
                        )}
                      >
                        {field.options?.map((opt) => (
                          <MenuItem
                            key={opt.value ?? opt.id}
                            value={opt.value ?? opt.id}
                          >
                            {opt.label ?? opt.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                      {hasError && (
                        <FormHelperText>{error.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
            );

          case "rangeCalendar":
            return (
              <Grid
                size={gridSizes}
                sx={{ mt: 2 }}
                key={`${field.key}-${index}`}
              >
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field: controllerField }) => {
                    const val = controllerField.value ?? {};
                    return (
                      <>
                        <InputLabel sx={{ mb: 0.5, fontWeight: 500 }}>
                          <RequiredLabel
                            required={field.required}
                            label={field.label}
                          />
                        </InputLabel>
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                          <TextField
                            type="date"
                            size="small"
                            value={val.start ?? ""}
                            disabled={field.disabled || globalDisabled}
                            onChange={(e) =>
                              controllerField.onChange({
                                ...val,
                                start: e.target.value,
                              })
                            }
                            slotProps={{ inputLabel: { shrink: true } }}
                            sx={{ flex: 1 }}
                          />
                          <Typography>—</Typography>
                          <TextField
                            type="date"
                            size="small"
                            value={val.end ?? ""}
                            disabled={field.disabled || globalDisabled}
                            onChange={(e) =>
                              controllerField.onChange({
                                ...val,
                                end: e.target.value,
                              })
                            }
                            slotProps={{ inputLabel: { shrink: true } }}
                            sx={{ flex: 1 }}
                          />
                        </Box>
                        {hasError && (
                          <FormHelperText error>
                            {error.message}
                          </FormHelperText>
                        )}
                      </>
                    );
                  }}
                />
              </Grid>
            );

          case "date":
            return (
              <Grid
                size={gridSizes}
                sx={{ mt: 2 }}
                key={`${field.key}-${index}`}
              >
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field: controllerField }) => (
                    <TextField
                      {...controllerField}
                      {...field.props}
                      type="date"
                      value={controllerField.value ?? ""}
                      label={
                        <RequiredLabel
                          required={field.required}
                          label={field.label}
                        />
                      }
                      fullWidth
                      size="small"
                      error={hasError}
                      helperText={hasError ? error.message : null}
                      disabled={field.disabled || globalDisabled}
                      slotProps={{ inputLabel: { shrink: true } }}
                      onChange={(e) =>
                        controllerField.onChange(e.target.value)
                      }
                    />
                  )}
                />
              </Grid>
            );

          case "year":
            return (
              <Grid
                size={gridSizes}
                sx={{ mt: 2 }}
                key={`${field.key}-${index}`}
              >
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field: controllerField }) => (
                    <FormControl
                      fullWidth
                      size="small"
                      error={hasError}
                      disabled={field.disabled || globalDisabled}
                    >
                      <InputLabel>
                        <RequiredLabel
                          required={field.required}
                          label={field.label}
                        />
                      </InputLabel>
                      <Select
                        {...controllerField}
                        value={controllerField.value ?? currentYear}
                        onChange={(e) =>
                          controllerField.onChange(e.target.value)
                        }
                        label={field.label}
                      >
                        {years.map((y) => (
                          <MenuItem key={y.value} value={y.value}>
                            {y.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {hasError && (
                        <FormHelperText>{error.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
            );

          case "textarea":
            return (
              <Grid size={{ xs: 12 }} sx={{ mt: 2 }} key={`${field.key}-${index}`}>
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field: controllerField }) => (
                    <TextField
                      {...controllerField}
                      value={controllerField.value ?? ""}
                      label={
                        <RequiredLabel
                          required={field.required}
                          label={field.label}
                        />
                      }
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                      error={hasError}
                      helperText={hasError ? error.message : null}
                      disabled={field.disabled || globalDisabled}
                    />
                  )}
                />
              </Grid>
            );

          case "dropdown": {
            const opts = field.options ?? [];
            return (
              <Grid
                size={gridSizes}
                sx={{ mt: 2 }}
                key={`${field.key}-${index}`}
              >
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field: controllerField }) => (
                    <Autocomplete
                      value={opts.find((o) => (o.value ?? o.id) === (controllerField.value ?? "")) ?? null}
                      onChange={(event, newValue) => {
                        const val = newValue?.value ?? newValue?.id ?? "";
                        if (field.onUserChange) {
                          field.onUserChange(val);
                        } else {
                          controllerField.onChange(val);
                        }
                      }}
                      options={opts}
                      getOptionLabel={(opt) => opt.label ?? opt.nombre ?? ""}
                      isOptionEqualToValue={(opt, val) =>
                        (opt.value ?? opt.id) === (val.value ?? val.id)
                      }
                      disableClearable
                      disabled={field.disabled || globalDisabled}
                      size="small"
                      fullWidth
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={
                            <RequiredLabel
                              required={field.required}
                              label={field.label}
                            />
                          }
                          error={hasError}
                          helperText={hasError ? error.message : null}
                        />
                      )}
                    />
                  )}
                />
              </Grid>
            );
          }

          case "socketDropdown":
            return (
              <Grid
                size={gridSizes}
                sx={{ mt: 2 }}
                key={`${field.key}-${index}`}
              >
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field: controllerField }) => (
                    <SelectSocket
                      {...controllerField}
                      {...field.props}
                      label={field.label}
                      required={field.required}
                      error={hasError}
                      disabled={field.disabled || globalDisabled}
                      fetchApi={field.fetchApi}
                      mapOptions={field.mapOptions}
                      socketEvent={field.socketEvent}
                    />
                  )}
                />
              </Grid>
            );

          case "treeSelect":
            return (
              <Grid
                size={gridSizes}
                sx={{ mt: 2 }}
                key={`${field.key}-${index}`}
              >
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field: controllerField }) => {
                    const flat = flattenOptions(field.options);
                    return (
                      <FormControl
                        fullWidth
                        size="small"
                        error={hasError}
                        disabled={field.disabled || globalDisabled}
                      >
                        <InputLabel>
                          <RequiredLabel
                            required={field.required}
                            label={field.label}
                          />
                        </InputLabel>
                        <Select
                          {...controllerField}
                          {...field.props}
                          value={
                            controllerField.value ??
                            (field.multiple ? [] : "")
                          }
                          onChange={(e) =>
                            controllerField.onChange(e.target.value)
                          }
                          label={field.label}
                          multiple={field.multiple}
                          renderValue={(selected) => {
                            if (!field.multiple) {
                              const opt = findOption(
                                field.options,
                                selected
                              );
                              return (
                                opt?.label ?? opt?.nombre ?? selected
                              );
                            }
                            return (
                              <Box
                                sx={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 0.5,
                                }}
                              >
                                {(selected || []).map((val) => {
                                  const opt = findOption(
                                    field.options,
                                    val
                                  );
                                  return (
                                    <Chip
                                      key={val}
                                      label={
                                        opt?.label ?? opt?.nombre ?? val
                                      }
                                      size="small"
                                    />
                                  );
                                })}
                              </Box>
                            );
                          }}
                        >
                          {flat.map((opt) => (
                            <MenuItem
                              key={opt.value ?? opt.id}
                              value={opt.value ?? opt.id}
                            >
                              {opt.label ?? opt.nombre}
                            </MenuItem>
                          ))}
                        </Select>
                        {hasError && (
                          <FormHelperText>{error.message}</FormHelperText>
                        )}
                      </FormControl>
                    );
                  }}
                />
              </Grid>
            );

          case "upload":
            return (
              <Grid
                size={gridSizes}
                sx={{ mt: 2 }}
                key={`${field.key}-${index}`}
              >
                <Controller
                  name={field.name}
                  control={control}
                  render={() => (
                    <Button
                      variant="outlined"
                      component="label"
                      disabled={field.disabled || globalDisabled}
                      fullWidth
                    >
                      {watch(field.name)?.name || field.label}
                      <input
                        type="file"
                        hidden
                        onChange={(e) =>
                          setValue(field.name, e.target.files[0])
                        }
                      />
                    </Button>
                  )}
                />
              </Grid>
            );

          case "selectButton":
            return (
              <Grid
                size={gridSizes}
                sx={{ mt: 2 }}
                key={`${field.key}-${index}`}
              >
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field: controllerField }) => (
                    <FormControl
                      fullWidth
                      size="small"
                      error={hasError}
                      sx={{ position: "relative" }}
                    >
                      <Box
                        sx={{
                          border: 1,
                          borderColor: hasError
                            ? "error.main"
                            : "divider",
                          borderRadius: 1,
                          px: 1.5,
                          py: 0.60,
                        }}
                      >
                        <ToggleButtonGroup
                          {...controllerField}
                          {...field.props}
                          value={controllerField.value ?? ""}
                          exclusive
                          onChange={(e, newVal) =>
                            newVal !== null &&
                            controllerField.onChange(newVal)
                          }
                          disabled={field.disabled || globalDisabled}
                          fullWidth
                          size="small"
                          sx={{
                            "& .MuiToggleButton-root": {
                              py: 0.60,
                              lineHeight: 1.2,
                              fontSize: "0.75rem",
                              "&.Mui-selected": {
                                bgcolor: "primary.main",
                                color: "primary.contrastText",
                                "&:hover": {
                                  bgcolor: "primary.dark",
                                },
                              },
                            },
                          }}
                        >
                          {field.options?.map((opt) => (
                            <ToggleButton
                              key={opt.value ?? opt.id}
                              value={opt.value ?? opt.id}
                            >
                              {opt.label ?? opt.nombre}
                            </ToggleButton>
                          ))}
                        </ToggleButtonGroup>
                      </Box>
                      <Box
                        component="span"
                        sx={{
                          position: "absolute",
                          top: -7,
                          left: 12,
                          px: 0.5,
                          fontSize: 12,
                          lineHeight: 1,
                          bgcolor: "background.paper",
                          color: hasError
                            ? "error.main"
                            : "text.secondary",
                        }}
                      >
                        <RequiredLabel
                          required={field.required}
                          label={field.label}
                        />
                      </Box>
                      {hasError && (
                        <FormHelperText>{error.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
            );

          case "custom": {
            const CustomComponent = field.component;
            return (
              <Grid
                size={gridSizes}
                sx={{ mt: 2 }}
                key={`${field.key}-${index}`}
              >
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field: controllerField }) => (
                    <>
                      <InputLabel sx={{ mb: 0.5, fontWeight: 500 }}>
                        <RequiredLabel
                          required={field.required}
                          label={field.label}
                        />
                      </InputLabel>
                      <CustomComponent
                        {...controllerField}
                        {...field.props}
                        error={hasError}
                        disabled={field.disabled || globalDisabled}
                      />
                    </>
                  )}
                />
              </Grid>
            );
          }

          case "checkGroup":
            return (
              <Grid
                size={gridSizes}
                sx={{ mt: 2 }}
                key={`${field.key}-${index}`}
              >
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field: controllerField }) => (
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <Controller
                        name={field.valCheck}
                        control={control}
                        render={({ field: checkField }) => (
                          <Checkbox
                            {...checkField}
                            checked={Boolean(watch(field.valCheck))}
                            onChange={(e) =>
                              setValue(field.valCheck, e.target.checked)
                            }
                            disabled={field.disabled || globalDisabled}
                          />
                        )}
                      />
                      {(() => {
                        const subProps = {
                          ...controllerField,
                          ...field.props,
                          value: controllerField.value ?? "",
                          size: "small",
                          disabled: field.disabled || globalDisabled,
                          sx: { flex: 1 },
                        };
                        switch (field.subType) {
                          case "text":
                            return (
                              <TextField
                                {...subProps}
                                onChange={(e) =>
                                  controllerField.onChange(e.target.value)
                                }
                                slotProps={{
                                  htmlInput: {
                                    maxLength: field.maxLength ?? 50,
                                  },
                                }}
                              />
                            );
                          case "dropdown":
                            return (
                              <FormControl
                                fullWidth
                                size="small"
                                disabled={field.disabled || globalDisabled}
                              >
                                <Select
                                  {...controllerField}
                                  value={controllerField.value ?? ""}
                                  onChange={(e) =>
                                    controllerField.onChange(e.target.value)
                                  }
                                >
                                  {field.options?.map((opt) => (
                                    <MenuItem
                                      key={opt.value ?? opt.id}
                                      value={opt.value ?? opt.id}
                                    >
                                      {opt.label ?? opt.nombre}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            );
                          case "multiselect":
                            return (
                              <FormControl
                                fullWidth
                                size="small"
                                disabled={field.disabled || globalDisabled}
                              >
                                <Select
                                  {...controllerField}
                                  multiple
                                  value={controllerField.value || []}
                                  onChange={(e) =>
                                    controllerField.onChange(e.target.value)
                                  }
                                  input={<OutlinedInput />}
                                  renderValue={(selected) => (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 0.5,
                                      }}
                                    >
                                      {selected.map((val) => (
                                        <Chip
                                          key={val}
                                          label={val}
                                          size="small"
                                        />
                                      ))}
                                    </Box>
                                  )}
                                >
                                  {field.options?.map((opt) => (
                                    <MenuItem
                                      key={opt.value ?? opt.id}
                                      value={opt.value ?? opt.id}
                                    >
                                      {opt.label ?? opt.nombre}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            );
                          case "calendar":
                          case "date":
                            return (
                              <TextField
                                {...subProps}
                                type="date"
                                onChange={(e) =>
                                  controllerField.onChange(e.target.value)
                                }
                                slotProps={{ inputLabel: { shrink: true } }}
                              />
                            );
                          case "textarea":
                            return (
                              <TextField
                                {...subProps}
                                multiline
                                rows={1}
                                onChange={(e) =>
                                  controllerField.onChange(e.target.value)
                                }
                              />
                            );
                          case "selectButton":
                            return (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  flex: 1,
                                }}
                              >
                                <Typography variant="caption">
                                  {field.label}
                                </Typography>
                                <ToggleButtonGroup
                                  {...controllerField}
                                  {...field.props}
                                  value={controllerField.value ?? ""}
                                  exclusive
                                  onChange={(e, newVal) =>
                                    newVal !== null &&
                                    controllerField.onChange(newVal)
                                  }
                                  disabled={field.disabled || globalDisabled}
                                  size="small"
                                  sx={{
                                    "& .MuiToggleButton-root.Mui-selected": {
                                      bgcolor: "primary.main",
                                      color: "primary.contrastText",
                                      "&:hover": {
                                        bgcolor: "primary.dark",
                                      },
                                    },
                                  }}
                                >
                                  {field.options?.map((opt) => (
                                    <ToggleButton
                                      key={opt.value ?? opt.id}
                                      value={opt.value ?? opt.id}
                                    >
                                      {opt.label ?? opt.nombre}
                                    </ToggleButton>
                                  ))}
                                </ToggleButtonGroup>
                              </Box>
                            );
                          case "custom": {
                            const CustomComponent = field.component;
                            return (
                              <CustomComponent
                                {...controllerField}
                                {...field.props}
                                error={hasError}
                                disabled={field.disabled || globalDisabled}
                              />
                            );
                          }
                          default:
                            return null;
                        }
                      })()}
                      {field.subType !== "selectButton" && (
                        <Typography variant="body2">
                          {field.label}
                          {field.required && (
                            <span style={{ color: "red" }}> *</span>
                          )}
                        </Typography>
                      )}
                    </Box>
                  )}
                />
                {hasError && (
                  <FormHelperText error>{error.message}</FormHelperText>
                )}
              </Grid>
            );

          case "inputSwitch":
            return (
              <Grid
                size={gridSizes}
                sx={{ mt: 2 }}
                key={`${field.key}-${index}`}
              >
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field: controllerField }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          {...controllerField}
                          checked={Boolean(controllerField.value)}
                          onChange={(e) =>
                            controllerField.onChange(e.target.checked)
                          }
                          disabled={field.disabled || globalDisabled}
                        />
                      }
                      label={
                        <RequiredLabel
                          required={field.required}
                          label={field.label}
                        />
                      }
                    />
                  )}
                />
                {hasError && (
                  <FormHelperText error>{error.message}</FormHelperText>
                )}
              </Grid>
            );

          case "password":
            return (
              <Grid
                size={gridSizes}
                sx={{ mt: 2 }}
                key={`${field.key}-${index}`}
              >
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field: controllerField }) => (
                    <TextField
                      {...controllerField}
                      {...field.props}
                      type="password"
                      value={controllerField.value ?? ""}
                      label={
                        <RequiredLabel
                          required={field.required}
                          label={field.label}
                        />
                      }
                      fullWidth
                      size="small"
                      error={hasError}
                      helperText={hasError ? error.message : null}
                      disabled={field.disabled || globalDisabled}
                    />
                  )}
                />
              </Grid>
            );

          case "currency":
            return (
              <Grid
                size={gridSizes}
                sx={{ mt: 2 }}
                key={`${field.key}-${index}`}
              >
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field: controllerField }) => {
                    const formatCurrency = (num) => {
                      if (num === '' || num == null) return '';
                      return num.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
                    };
                    const rawValue = controllerField.value;
                    const displayValue = typeof rawValue === 'number' ? formatCurrency(rawValue) : rawValue ?? '';

                    return (
                      <TextField
                        {...field.props}
                        value={displayValue}
                        label={
                          <RequiredLabel
                            required={field.required}
                            label={field.label}
                          />
                        }
                        fullWidth
                        size="small"
                        type="text"
                        inputMode="decimal"
                        error={hasError}
                        helperText={hasError ? error.message : null}
                        disabled={field.disabled || globalDisabled}
                        onKeyDown={(e) => {
                          const allowed = /^[0-9]$/;
                          const navKeys = ['Backspace','Delete','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Tab','Home','End','Enter'];
                          if (navKeys.includes(e.key)) return;
                          if (!allowed.test(e.key)) e.preventDefault();
                        }}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
                          if (raw === '') {
                            controllerField.onChange('');
                          } else {
                            controllerField.onChange(Number(raw));
                          }
                        }}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                $
                              </InputAdornment>
                            ),
                          },
                          htmlInput: {
                            inputMode: 'decimal',
                          },
                        }}
                      />
                    );
                  }}
                />
              </Grid>
            );

          case "groupConcat": {
            const isCurrency = field.inputType === "currency";
            const maxOptionLength = Math.max(
              ...(field.options || []).map(
                (opt) => (opt.label || "").length
              ),
              4
            );
            const dropdownWidth = Math.min(
              Math.max(maxOptionLength * 12, 80),
              140
            );

            return (
              <Grid
                size={gridSizes}
                sx={{ mt: 2 }}
                key={`${field.key}-${index}`}
              >
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field: controllerField }) => (
                    <FormControl fullWidth size="small" error={hasError}>
                      <Typography
                        variant="caption"
                        sx={{
                          mb: 0.5,
                          color: hasError
                            ? "error.main"
                            : "text.secondary",
                        }}
                      >
                        <RequiredLabel
                          required={field.required}
                          label={field.label}
                        />
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "stretch",
                        }}
                      >
                        {isCurrency ? (
                          <TextField
                            type="number"
                            value={controllerField.value?.valor ?? ""}
                            onChange={(e) =>
                              controllerField.onChange({
                                ...controllerField.value,
                                valor:
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value),
                              })
                            }
                            disabled={field.disabled || globalDisabled}
                            placeholder={field.placeholder || "Valor"}
                            size="small"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderTopRightRadius: 0,
                                borderBottomRightRadius: 0,
                              },
                              flex: 1,
                            }}
                            slotProps={{
                              input: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    $
                                  </InputAdornment>
                                ),
                              },
                            }}
                          />
                        ) : (
                          <TextField
                            type="number"
                            value={controllerField.value?.valor ?? 0}
                            onChange={(e) =>
                              controllerField.onChange({
                                ...controllerField.value,
                                valor:
                                  e.target.value === ""
                                    ? 0
                                    : Number(e.target.value),
                              })
                            }
                            disabled={field.disabled || globalDisabled}
                            placeholder={field.placeholder || "Valor"}
                            size="small"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderTopRightRadius: 0,
                                borderBottomRightRadius: 0,
                              },
                              flex: 1,
                            }}
                          />
                        )}
                        <Select
                          value={
                            controllerField.value?.tipo ??
                            field.options?.[0]?.value ??
                            ""
                          }
                          onChange={(e) =>
                            controllerField.onChange({
                              ...controllerField.value,
                              tipo: e.target.value,
                            })
                          }
                          disabled={field.disabled || globalDisabled}
                          sx={{
                            minWidth: dropdownWidth,
                            maxWidth: 180,
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderTopLeftRadius: 0,
                              borderBottomLeftRadius: 0,
                              borderLeft: "none",
                            },
                          }}
                        >
                          {field.options?.map((opt) => (
                            <MenuItem
                              key={opt.value ?? opt.id}
                              value={opt.value ?? opt.id}
                            >
                              {opt.label ?? opt.nombre}
                            </MenuItem>
                          ))}
                        </Select>
                      </Box>
                      {hasError && (
                        <FormHelperText>{error.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
            );
          }

          case "number":
            return (
              <Grid
                size={gridSizes}
                sx={{ mt: 2 }}
                key={`${field.key}-${index}`}
              >
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field: controllerField }) => (
                    <TextField
                      {...controllerField}
                      {...field.props}
                      value={controllerField.value ?? ""}
                      label={
                        <RequiredLabel
                          required={field.required}
                          label={field.label}
                        />
                      }
                      fullWidth
                      size="small"
                      error={hasError}
                      helperText={hasError ? error.message : null}
                      disabled={field.disabled || globalDisabled}
                      slotProps={{
                        htmlInput: {
                          maxLength: field.maxLength ?? 50,
                          autoComplete: "off",
                          onKeyDown: (e) => {
                            const allowedKeys = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"];
                            if (allowedKeys.includes(e.key)) return;
                            if (!/^[0-9]$/.test(e.key)) e.preventDefault();
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>
            );

          case "float":
            return (
              <Grid
                size={gridSizes}
                sx={{ mt: 2 }}
                key={`${field.key}-${index}`}
              >
                <Controller
                  name={field.name}
                  control={control}
                  rules={field.validation}
                  render={({ field: controllerField }) => (
                    <TextField
                      {...controllerField}
                      {...field.props}
                      value={controllerField.value ?? ""}
                      label={
                        <RequiredLabel
                          required={field.required}
                          label={field.label}
                        />
                      }
                      fullWidth
                      size="small"
                      error={hasError}
                      helperText={hasError ? error.message : null}
                      disabled={field.disabled || globalDisabled}
                      slotProps={{
                        htmlInput: {
                          maxLength: field.maxLength ?? 50,
                          autoComplete: "off",
                          onKeyDown: (e) => {
                            const allowedKeys = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"];
                            if (allowedKeys.includes(e.key)) return;
                            if (e.key === "." && !e.target.value.includes(".")) return;
                            if (!/^[0-9]$/.test(e.key)) e.preventDefault();
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>
            );

          default:
            return null;
        }
      },
      [control, errors, watch, setValue, years, currentYear]
    );

    return (
      <Grid container spacing={2}>
        {fields.map((field, index) => renderField(field, index))}
      </Grid>
    );
  }
);

export default GenericFormSection;
