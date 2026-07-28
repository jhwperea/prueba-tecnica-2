import { format, formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";

// ----------------------------------------------------------------------

export function fDate(date) {
  return format(new Date(date), "dd MMMM yyyy");
}

export function fDateTime(date) {
  return format(new Date(date), "dd MMM yyyy HH:mm");
}

export function fDateTimeSuffix(date) {
  return format(new Date(date), "dd/MM/yyyy hh:mm p");
}

export function fToNow(date) {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
  });
}

// Función para corregir localización de fecha
export function fLocalDate(date, formatDate = "MMMM dd, yyyy") {
  const [year, month, day] = date.split("T")[0].split("-");
  const localDate = new Date(year, month - 1, day); // mes empieza en 0
  return format(localDate, formatDate, { locale: es });
}

export const toLocalDate = (s) => {
  if (!s) return null;
  const [y, m, d] = String(s).slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d); // medianoche local
};

// ----------------------------------------------------------------------
export const formatNotificationDate = (dateString) => {
    const date = parseISO(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return "Hoy";
    } else if (date.toDateString() === yesterday.toDateString()) {
        return "Ayer";
    } else {
        return format(date, "EEEE d MMMM yyyy", { locale: es });
    }
};

// HORA RELATIVA SI LA HORA ES MENOR A 24 HORAS RETORANAR YA SEA QUE HACE UN MINUTO HACE 2 HORAS, ETC, SI NO RETORNA LA HORA
export const formatNotificationTime = (dateString) => {
    const date = parseISO(dateString);
    const now = new Date();
    const diff = now - date;

    if (diff < 24 * 60 * 60 * 1000) {
        return formatDistanceToNow(date, { addSuffix: true, locale: es });
    }

    return format(date, "p", { locale: es });
};

export const formatNotificationDateTime = (dateString) => {
    if (!dateString) return;
    const date = parseISO(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let datePart;

    if (date.toDateString() === today.toDateString()) {
        datePart = "Hoy";
    } else if (date.toDateString() === yesterday.toDateString()) {
        datePart = "Ayer";
    } else {
        datePart = date ? format(date, "EEE, d MMMM yyyy", { locale: es }) : "";
    }

    const diff = today - date;

    if (diff < 24 * 60 * 60 * 1000) {
        const timePart = formatDistanceToNow(date, { addSuffix: true, locale: es });
        return `${datePart} ${timePart}`;
    }

    const timePart = format(date, "p", { locale: es });
    return `${datePart} ${timePart}`;
};

export const formatearHoraAMPM = (hora24) => {
    const [hora, minuto] = hora24?.split(":").map(Number);
    const ampm = hora >= 12 ? "PM" : "AM";
    const hora12 = hora % 12 || 12; // Convierte 0 a 12
    return `${hora12}:${minuto?.toString().padStart(2, "0")} ${ampm}`;
};

export const formatearTotalJornada = (horaInicio, horaFinal) => {
    if (!horaFinal || !horaInicio) {
        return "-";
    }
    const [hInicio, mInicio] = horaInicio.split(":").map(Number);
    const [hFinal, mFinal] = horaFinal.split(":").map(Number);

    let inicio = hInicio * 60 + mInicio;
    let fin = hFinal * 60 + mFinal;

    // Si la hora final es menor que la de inicio, asumimos que pasó a medianoche
    if (fin < inicio) {
        fin += 24 * 60;
    }

    const diff = fin - inicio;
    const horas = Math.floor(diff / 60);
    const minutos = diff % 60;

    return `${horas}h ${minutos}m`;
}