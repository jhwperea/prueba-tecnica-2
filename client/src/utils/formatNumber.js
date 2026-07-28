
// Formato moneda con decimales si no es entero
export function fCurrency(number, locale = "es-CO", currency = "COP") {
    if (number == null || isNaN(number)) return "";
    const options = {
        style: "currency",
        currency,
        minimumFractionDigits: Number.isInteger(number) ? 0 : 2,
        maximumFractionDigits: 2,
    };
    return new Intl.NumberFormat(locale, options).format(number);
}

// Moneda sin decimales
export function fCurrencyWithOutDecimal(number, locale = "es-CO", currency = "COP") {
    if (number == null || isNaN(number)) return "";
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(number);
}

// Porcentaje con un decimal
export function fPercent(number, locale = "es-CO") {
    if (number == null || isNaN(number)) return "";
    return (number / 100).toLocaleString(locale, {
        style: "percent",
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    });
}

// Número estándar con separadores
export function fNumber(number, locale = "es-CO") {
    if (number == null || isNaN(number)) return "";
    return number.toLocaleString(locale);
}

// Números abreviados (K, M, B, T)
export function fShortenNumber(number, locale = "es-CO") {
    if (number == null || isNaN(number)) return "";
    if (number === 0) return "0";
    const abs = Math.abs(number);
    const suffixes = ["", "K", "M", "B", "T"];
    const tier = Math.floor(Math.log10(abs) / 3);
    if (tier <= 0) return number.toLocaleString(locale);
    const scaled = number / Math.pow(10, tier * 3);
    return `${scaled.toFixed(2)}${suffixes[tier]}`;
}

// Formato de bytes (ej: 3.5 MB)
export function fData(bytes, locale = "es-CO") {
    if (bytes == null || isNaN(bytes)) return "";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);
    return `${size.toLocaleString(locale, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    })} ${sizes[i]}`;
}

// Formato genérico de número con 2 decimales
export const formatNumber = (value, locale = "es-CO") => {
    if (value === null || value === undefined || value === "" || isNaN(value)) return "";
    const num = parseFloat(value);
    return num.toLocaleString(locale, {
        minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
        maximumFractionDigits: 2,
    });
};
