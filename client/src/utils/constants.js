export const STATUS_OPTIONS = [
  { value: 1, label: 'Activo' },
  { value: 2, label: 'Inactivo' },
];

const dev = import.meta.env.DEV;

export const urlSocket = import.meta.env.VITE_SOCKET_URL || (
  dev ? "http://localhost:4000" : "https://pavastecnologia.com"
);

export const pathSocket = import.meta.env.VITE_SOCKET_PATH || (
  dev ? "/socket.io" : "/template/socket.io"
);

export const toBr = (str) => {
  const replaceStr = "<br />";
  return str !== null && str !== undefined && str !== ""
      ? str.replace(/<\s*\/?br\s*\/?>/gi, replaceStr)
      : "";
};

export const toNlBr = (str, replaceMode, isXhtml) => {
  const breakTag = isXhtml ? "<br />" : "<br>";
  const replaceStr = replaceMode ? "$1" + breakTag : "$1" + breakTag + "$2";
  return (str + "").replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, replaceStr);
};


export const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  if (text.length > maxLength) {
    return toNlBr(text?.substring(0, maxLength)) + "...";
  }
  return toNlBr(text);
};
