import React, { useEffect, useState } from "react";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Cropper from "react-easy-crop";

export const EasyCrop = ({
    originalImg = null,
    onClose,
    onImageCropped,
    aspect = 0.7,
    minZoom = 0.7,
    maxZoom = 3,
}) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [imageURL, setImageURL] = useState(null);
    const [blobFile, setBlobFile] = useState(null);

    useEffect(() => {
        const imageURL = URL.createObjectURL(originalImg);
        setImageURL(imageURL);

        return () => {
            // Liberar urls temporales para evitar fugas de memoria
            URL.revokeObjectURL(imageURL);
        };
        // eslint-disable-next-line
    }, [originalImg]);

    const getCroppedImg = (imageSrc, croppedAreaPixels) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
            return null;
        }

        const image = new Image();
        image.src = imageSrc;

        return new Promise((resolve, reject) => {
            image.onload = () => {
                // Configura el tamaño del canvas al área recortada
                canvas.width = croppedAreaPixels.width;
                canvas.height = croppedAreaPixels.height;

                // Dibuja la parte recortada de la imagen en el canvas
                ctx.drawImage(
                    image,
                    croppedAreaPixels.x, // Coordenada x de inicio del recorte
                    croppedAreaPixels.y, // Coordenada y de inicio del recorte
                    croppedAreaPixels.width, // Ancho del recorte
                    croppedAreaPixels.height, // Alto del recorte
                    0,
                    0, // Coordenadas de inicio en el canvas
                    croppedAreaPixels.width, // Ancho en el canvas
                    croppedAreaPixels.height // Alto en el canvas
                );

                // Convierte el contenido del canvas a un Blob
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error("No se pudo generar un Blob."));
                            return;
                        }
                        resolve(blob);
                    },
                    originalImg.type, // Tipo MIME de la salida
                    1 // Calidad de la imagen (máxima)
                );
            };

            image.onerror = (error) => {
                reject(error);
            };
        });
    };

    const handleCropComplete = async (_croppedArea, croppedAreaPixels) => {
        if (imageURL) {
            const blobFile = await getCroppedImg(imageURL, croppedAreaPixels);
            setBlobFile(blobFile);
        }
    };

    return (
        <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Ajustar Tamaño</DialogTitle>
            <DialogContent>
                <div style={{ position: "relative", width: "100%", height: "400px", marginTop: 8 }}>
                    <Cropper
                        image={imageURL}
                        crop={crop}
                        zoom={zoom}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={handleCropComplete}
                        restrictPosition={false}
                        aspect={aspect}
                        minZoom={minZoom}
                        maxZoom={maxZoom}
                        style={{
                            containerStyle: { position: "relative", width: "100%", height: "100%" },
                        }}
                    />
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => onImageCropped(blobFile)}
                    disabled={!blobFile || !onImageCropped}
                >
                    Guardar
                </Button>
            </DialogActions>
        </Dialog>
    );
};
