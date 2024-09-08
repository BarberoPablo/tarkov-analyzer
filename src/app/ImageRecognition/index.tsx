import { createCanvas, loadImage } from "canvas";
import { ClipboardEvent, useState } from "react";
import { Img } from "react-image";
import Tesseract from "tesseract.js";
import { ItemData } from "../types";
import { findItems, removeDuplicatedItems } from "../utils";

const multiplier = 3;
let imageFullWidth = 0;
let imageFullHeight = 0;

const preprocessImage = async (imageSrc: string, avgMin: number) => {
  const img = await loadImage(imageSrc);

  const newWidth = img.width * multiplier;
  const newHeight = img.height * multiplier;

  imageFullWidth = newWidth;
  imageFullHeight = newHeight;

  const canvas = createCanvas(newWidth, newHeight);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(img, 0, 0, newWidth, newHeight);

  const imageData = ctx.getImageData(0, 0, newWidth, newHeight);

  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const threshold = avg > avgMin ? 0 : 255;
    data[i] = data[i + 1] = data[i + 2] = threshold;
  }

  ctx.putImageData(imageData, 0, 0);

  return canvas.toDataURL();
};

export default function ImageRecognition() {
  const [inventoryImage, setInventoryImage] = useState<string | null>(null);
  const [itemsDetected, setItemsDetected] = useState<ItemData[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);

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

  const handleDetectItems = async (greyScale: number[]) => {
    if (inventoryImage) {
      setInventoryLoading(true);
      try {
        const imagesWithFilters = await Promise.all(greyScale.map((filter) => preprocessImage(inventoryImage, filter)));

        const itemsFromImages: Tesseract.Word[][] = [];

        // Usar for...of para manejar la asincronía correctamente
        for (const image of imagesWithFilters) {
          const result = await Tesseract.recognize(image);
          itemsFromImages.push(result.data.words);
        }

        //setInventoryImage(imagesWithFilters[1]);

        const detectedItems = findItems(itemsFromImages.flat());
        const finalItems = removeDuplicatedItems(detectedItems);

        console.log({ finalItems });

        setItemsDetected(finalItems);
      } catch (error) {
        console.error("Error al detectar el texto:", error);
      }
      setInventoryLoading(false);
    }
  };

  const calculateTotalValue = () => {
    let total = 0;
    itemsDetected.forEach((item) => {
      total += item.avg24hPrice || 0;
    });
    return total.toLocaleString();
  };

  return (
    <div
      style={{
        width: "100%",
        height: "95vh",
        maxHeight: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <div
        onPaste={handlePaste}
        style={{
          width: "50%",
          height: "90%",
          display: "flex",
          flexDirection: "column",
          border: "2px dashed #ccc",
          padding: "20px",
          textAlign: "center",
          overflow: "auto",
        }}
      >
        <p>Paste image here (click and CTRL + V)</p>

        <div style={{ position: "relative", display: "flex", flexDirection: "row", width: "100%", height: "100%" }}>
          {inventoryImage && (
            <Img
              src={inventoryImage}
              alt="user inventory"
              style={{
                width: "100%",
                height: "auto",
              }}
              loader={<div>Loading...</div>}
            />
          )}

          {itemsDetected.map((item, index) => (
            <p
              key={item.id + index}
              style={{
                position: "absolute",
                width: "50px",
                top: (item.coords.y * 100) / imageFullHeight + "%",
                left: (item.coords.x * 100) / imageFullWidth + "%",
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
              {item.avg24hPrice ? `${item.shortName + " $" + item.avg24hPrice.toLocaleString()}` : "Cant sell"}
            </p>
          ))}
        </div>

        {itemsDetected.length > 0 ? (
          <p>{inventoryLoading ? "Loading..." : `Total Inventory Value: $${calculateTotalValue()}`}</p>
        ) : (
          <p>Select a scan</p>
        )}
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-around" }}>
          <button disabled={!inventoryImage} onClick={() => handleDetectItems([80, 70])}>
            Quick Scan
          </button>
          <button disabled={!inventoryImage} onClick={() => handleDetectItems([80, 90, 100])}>
            Balanced Scan
          </button>
          <button disabled={!inventoryImage} onClick={() => handleDetectItems([70, 80, 90, 100, 110])}>
            Deep Scan
          </button>
        </div>
      </div>

      <div style={{ width: 900, height: "100%" }}>
        <iframe
          src="https://tarkov-market.com/"
          title="Tarkov Market"
          width="100%"
          height="100%"
          style={{ border: "none" }}
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}
