/**
 * Genera una contraseña segura de 12 caracteres con al menos:
 * una mayúscula, una minúscula, un número y un carácter especial.
 * @returns {string}
 */
export const generatePassword = () => {
  const upper   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower   = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()';
  const all     = upper + lower + numbers + special;

  let password =
    upper  [Math.floor(Math.random() * upper.length)]   +
    lower  [Math.floor(Math.random() * lower.length)]   +
    numbers[Math.floor(Math.random() * numbers.length)] +
    special[Math.floor(Math.random() * special.length)];

  for (let i = 4; i < 12; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Mezclar para que el orden no sea predecible
  return password
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('');
};

/**
 * Calcula el color de texto (negro u blanco) con mejor contraste
 * sobre un fondo hexadecimal dado.
 * @param {string} hexColor - Color en formato hex, ej: "#F9D689"
 * @returns {string} "#000000" o "#ffffff"
 */
export const getContrastingTextColor = (hexColor = '#F9D689') => {
  const hex = hexColor?.replace('#', '') ?? 'F9D689';
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.7 ? '#000000' : '#ffffff';
};