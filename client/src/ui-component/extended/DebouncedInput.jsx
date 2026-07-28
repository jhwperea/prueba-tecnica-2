import React, { useState, useEffect, useCallback } from "react";
import TextField from "@mui/material/TextField";
import { debounce } from "lodash";
import CurrencyInput from "react-currency-input-field";

const DebouncedInput = ({ value, onChange, type = "text", delay = 1000, ...rest }) => {
    const [inputValue, setInputValue] = useState(value);

    const debouncedChange = useCallback(
        debounce((newValue) => {
            onChange(newValue);
        }, delay),
        [onChange, delay]
    );

    const handleChange = (newValue) => {
        if (type === "currency" && isNaN(Number(newValue))) {
            return;
        }
        setInputValue(newValue);
        debouncedChange(newValue);
    };

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    if (type === "currency") {
        return (
            <CurrencyInput
                value={inputValue}
                onValueChange={handleChange}
                onBlur={() => onChange(inputValue)}
                {...rest}
            />
        );
    }

    return (
        <TextField
            value={inputValue}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={() => onChange(inputValue)}
            size="small"
            fullWidth
            multiline={type === "textarea"}
            rows={type === "textarea" ? 3 : undefined}
            {...rest}
        />
    );
};

export default DebouncedInput;
