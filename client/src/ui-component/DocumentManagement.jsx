import { useContext, useEffect, useState, useRef } from "react";
import { useAuth } from "contexts/authContext";
import { showSuccess, showError, showPromise } from "services/ToastService";
import { formatNotificationDateTime } from "utils/formatTime";
import { paginationDocsApi } from "api/requests/documentsAPI";
import { uploadFile, deleteFileByPath } from "api/firebase/handleFirebaseDocs";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";

import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DescriptionIcon from "@mui/icons-material/Description";

const getFileIcon = (extension, mimeType) => {
    if (mimeType?.startsWith("image/")) return <ImageIcon sx={{ fontSize: 32, color: "#4caf50" }} />;
    if (extension === "pdf" || mimeType === "application/pdf") return <PictureAsPdfIcon sx={{ fontSize: 32, color: "#f44336" }} />;
    return <DescriptionIcon sx={{ fontSize: 32, color: "#1976d2" }} />;
};

const getFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
};

function FileRow({ file, onDelete, onPreview }) {
    return (
        <Paper
            sx={{
                display: "flex", alignItems: "center", gap: 2, p: 1.5, borderRadius: 1,
                "&:hover": { bgcolor: "action.hover" }, cursor: "pointer",
            }}
            onClick={() => onPreview(file)}
        >
            {getFileIcon(file.extension, file.mimeType)}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap>{file.nombre}</Typography>
                <Typography variant="caption" color="text.secondary">
                    {getFileSize(file.tamanio)} &middot; {file.usuReg || "Sistema"}
                </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                {file.fecReg ? formatNotificationDateTime(file.fecReg) : ""}
            </Typography>
            <Tooltip title="Eliminar">
                <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onDelete(file); }}>
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        </Paper>
    );
}

export default function DocumentManagement({
    docConfig,
    docs: externalDocs,
    setDocs,
    disabled = false,
    onInitialLoad,
    multipleFiles = true,
}) {
    const { user } = useAuth();
    const userId = user?.useId;
    const userName = user?.fullName;

    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [fileToPreview, setFileToPreview] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const loadingRef = useRef(false);

    const moduloId = docConfig?.moduloId;
    const modulo = docConfig?.modulo;

    const loadData = async () => {
        if (loadingRef.current || !moduloId) return;
        loadingRef.current = true;
        setLoading(true);
        try {
            if (moduloId > 0) {
                const { data } = await paginationDocsApi({
                    nombre: "",
                    docType: modulo,
                    docIdRef: moduloId,
                    rows: 100,
                    first: 0,
                    sortField: "doc_name",
                    sortOrder: 1,
                });
                const apiDocs = data?.results || [];
                setFiles(apiDocs.filter((d) => d.tipo === "archivo"));
                if (typeof onInitialLoad === "function") {
                    onInitialLoad({ hasExistingDocs: apiDocs.length > 0, fileCount: apiDocs.length });
                }
            }
        } catch (error) {
            console.error("Error al cargar documentación:", error);
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    };

    useEffect(() => {
        if (!moduloId) { setFiles([]); return; }
        loadData();
        // eslint-disable-next-line
    }, [moduloId]);

    useEffect(() => {
        if (!externalDocs?.length || moduloId) return;
        const localFiles = externalDocs.filter((d) => d.tipo === "archivo");
        if (localFiles.length) setFiles((prev) => {
            const existingIds = new Set(prev.map((f) => f.id));
            const newOnes = localFiles.filter((f) => !existingIds.has(f.id));
            return newOnes.length ? [...newOnes, ...prev] : prev;
        });
    }, [externalDocs, moduloId]);

    const handlePreviewFile = (file) => {
        setFileToPreview(file);
        setPreviewOpen(true);
    };

    const handleDeleteConfirmed = async () => {
        const target = deleteTarget;
        setDeleteTarget(null);
        if (!target) return;

        const deleteTask = (async () => {
            if (moduloId > 0) {
                await deleteFileByPath(target.docPathStorage, target.id, userId);
            }
            setFiles((prev) => prev.filter((f) => f.id !== target.id));
            if (typeof setDocs === "function") setDocs((prev) => prev.filter((d) => d.id !== target.id));
        })();

        showPromise(deleteTask, {
            pending: "Eliminando archivo...",
            success: "Archivo eliminado correctamente.",
            error: "Error al eliminar.",
        });
    };

    const handleFilesSelected = async (selectedFiles) => {
        const filesToUpload = multipleFiles ? selectedFiles : [selectedFiles[0]];
        if (!filesToUpload.length) return;
        setUploading(true);
        try {
            const existingNames = new Set(files.map((f) => f.nombre.toLowerCase()));
            const newFiles = filesToUpload.filter((f) => {
                const exists = existingNames.has(f.name.toLowerCase());
                if (exists) showError(`El archivo "${f.name}" ya existe.`);
                return !exists;
            });
            if (!newFiles.length) { setUploading(false); return; }

            if (moduloId > 0) {
                const uploads = await Promise.all(
                    newFiles.map((file) => uploadFile(moduloId, file, userId, userName, modulo))
                );
                const nuevos = uploads.map(({ savedDoc }) => savedDoc);
                setFiles((prev) => [...nuevos, ...prev]);
            } else {
                const nuevos = newFiles.map((file) => ({
                    id: Date.now() + Math.random(),
                    nombre: file.name,
                    tipo: "archivo",
                    extension: file.name.split(".").pop(),
                    mimeType: file.type || "application/octet-stream",
                    tamanio: file.size,
                    fecReg: new Date().toISOString(),
                }));
                if (typeof setDocs === "function") setDocs((prev) => [...prev, ...nuevos]);
                setFiles((prev) => [...nuevos, ...prev]);
            }
            showSuccess("Archivos cargados correctamente");
        } catch (error) {
            console.error(error);
            showError("Error al subir los archivos");
        } finally {
            setUploading(false);
        }
    };

    return (
        <Box>
            {loading ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Cargando...</Typography>
                </Box>
            ) : (
                <Box>
                    {files.length > 0 && (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                            {files.map((file) => (
                                <FileRow
                                    key={file.id}
                                    file={file}
                                    onDelete={(f) => setDeleteTarget(f)}
                                    onPreview={handlePreviewFile}
                                />
                            ))}
                        </Box>
                    )}

                    {(!multipleFiles && files.length > 0) ? null : (
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 3, textAlign: "center", borderStyle: "dashed",
                            bgcolor: "action.hover", cursor: "pointer",
                            "&:hover": { bgcolor: "action.selected" },
                        }}
                        onClick={() => document.getElementById("doc-upload-input")?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => { e.preventDefault(); handleFilesSelected(Array.from(e.dataTransfer.files)); }}
                    >
                        <input
                            id="doc-upload-input" type="file" hidden
                            {...(multipleFiles ? { multiple: true } : {})}
                            onChange={(e) => { handleFilesSelected(Array.from(e.target.files)); e.target.value = ""; }}
                        />
                        <CloudUploadIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                            Arrastra archivos aquí o haz clic para seleccionar
                        </Typography>
                    </Paper>)}
                    {uploading && (
                        <Box sx={{ textAlign: "center", py: 1 }}>
                            <CircularProgress size={24} />
                        </Box>
                    )}

                    {/* {files.length === 0 && !uploading && (
                        <Box sx={{ textAlign: "center", py: 4 }}>
                            <DescriptionIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                            <Typography variant="body2" color="text.disabled">
                                No hay documentos aún. Arrastra archivos o haz clic en el área de carga.
                            </Typography>
                        </Box>
                    )} */}
                </Box>
            )}

            <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>{fileToPreview?.nombre}</DialogTitle>
                <DialogContent>
                  {fileToPreview?.mimeType?.startsWith("image/") ? (
                        <Box
                            component="img"
                            src={fileToPreview.url}
                            alt={fileToPreview.nombre}
                            sx={{ maxWidth: "100%", maxHeight: "70vh", display: "block", mx: "auto" }}
                        />
                    ) : (fileToPreview?.extension === "doc" || fileToPreview?.extension === "docx") && fileToPreview?.url ? (
                        <Box sx={{ width: "100%", height: "70vh" }}>
                            <iframe
                                src={`https://docs.google.com/gview?url=${encodeURIComponent(fileToPreview.url)}&embedded=true`}
                                title={fileToPreview.nombre}
                                style={{ width: "100%", height: "100%", border: "none", borderRadius: 8 }}
                            />
                        </Box>
                    ) : fileToPreview?.extension === "pdf" && fileToPreview?.url ? (
                        <Box sx={{ width: "100%", height: "70vh" }}>
                            <iframe
                                src={fileToPreview.url}
                                title={fileToPreview.nombre}
                                style={{ width: "100%", height: "100%", border: "none", borderRadius: 8 }}
                            />
                        </Box>
                    ) : fileToPreview?.url ? (
                        <Box sx={{ textAlign: "center", py: 4 }}>
                            <DescriptionIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                            <Typography>Vista previa no disponible.</Typography>
                            <Button variant="contained" href={fileToPreview.url} target="_blank" sx={{ mt: 2 }}>
                                Abrir archivo
                            </Button>
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: "center", py: 4 }}>
                            <DescriptionIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                            <Typography>Vista previa no disponible para este tipo de archivo.</Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewOpen(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Confirmar eliminación</DialogTitle>
                <DialogContent>
                    <Typography>¿Estás seguro que deseas eliminar "{deleteTarget?.nombre}"?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
                    <Button onClick={handleDeleteConfirmed} color="error" variant="contained">
                        Sí, eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
