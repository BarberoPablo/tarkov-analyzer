//import { items } from "../constants";
import { ClipboardEvent, useState } from "react";
import Tesseract from "tesseract.js";
import { createCanvas, loadImage } from "canvas";
import { findItems } from "../utils";
import { ItemData } from "../types";
import { Img } from "react-image";

const multiplier = 3;

const preprocessImage = async (imageSrc: string) => {
  const img = await loadImage(imageSrc);

  const newWidth = img.width * multiplier;
  const newHeight = img.height * multiplier;

  // Duplica el tamaño de la imagen
  const canvas = createCanvas(newWidth, newHeight);
  const ctx = canvas.getContext("2d");

  // Dibujar la imagen escalada
  ctx.drawImage(img, 0, 0, newWidth, newHeight);

  const imageData = ctx.getImageData(0, 0, newWidth, newHeight);

  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const contrastFactor = 1.5; // Ajusta este valor según sea necesario
    data[i] = Math.min(255, avg * contrastFactor);
    data[i + 1] = Math.min(255, avg * contrastFactor);
    data[i + 2] = Math.min(255, avg * contrastFactor);
  }

  ctx.putImageData(imageData, 0, 0);

  return canvas.toDataURL(); // Devuelve la imagen preprocesada como Data URL
};

export default function ImageRecognition() {
  const [inventoryImage, setInventoryImage] = useState<string | null>(null);
  const [itemsDetected, setItemsDetected] = useState<ItemData[]>([]);

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();

    setItemsDetected([]);

    const userInventory = event.clipboardData.items;
    for (const item of userInventory) {
      if (item.type.indexOf("image") !== -1) {
        const blob = item.getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setInventoryImage(event.target.result as string);
            }
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  const handleDetectItems = async () => {
    if (inventoryImage) {
      // Usa Tesseract.js para detectar texto en la imagen
      try {
        const {
          data: { words },
        } = await Tesseract.recognize(await preprocessImage(inventoryImage));
        // Extrae las frases y sus coordenadas
        const detectedItems = findItems(words);

        console.log({ words });
        console.log({ detectedItems });

        setItemsDetected(detectedItems);
      } catch (error) {
        console.error("Error al detectar el texto:", error);
      }
    }
  };

  const calculateTotalValue = () => {
    let total = 0;
    itemsDetected.forEach((item) => {
      total += item.avg24hPrice || 0;
    });
    return total;
  };

  return (
    <div
      onPaste={handlePaste}
      style={{ width: "100%", display: "flex", flexDirection: "column", border: "2px dashed #ccc", padding: "20px", textAlign: "center" }}
    >
      <p>Paste image here (click and CTRL + V)</p>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {inventoryImage && (
          <Img
            src={inventoryImage}
            alt="user inventory"
            style={{
              width: "100%", // Ajusta el tamaño deseado
              height: "auto",
              imageRendering: "crisp-edges",
            }}
            loader={<div>Loading...</div>} // Placeholder mientras carga la imagen
          />
        )}

        {itemsDetected.map((item, index) => (
          <p
            key={item.id + index}
            style={{
              position: "absolute",
              width: "50px",
              top: (item.coords.y / multiplier) * 1.2,
              left: (item.coords.x / multiplier) * 1.2,
              fontSize: "12px",
              color: "white",
              backgroundColor: "black",
              fontWeight: "bold",
              border: "1px solid crimson",
              padding: "2px 4px",
              filter: "drop-shadow(3px 3px 3px black)",
              transform: "translate(-50%, -50%)", // Para centrar el texto en las coordenadas
            }}
          >
            {item.avg24hPrice ? `${item.shortName + " $" + item.avg24hPrice}` : "Cant sell"}
          </p>
        ))}
      </div>

      {itemsDetected.length > 0 && <p>Total Inventory Value: ${calculateTotalValue()}</p>}

      <button onClick={handleDetectItems}>Detect Items</button>
    </div>
  );
}
