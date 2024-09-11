import { ClipboardEvent, useState } from "react";
import Tesseract from "tesseract.js";
import { fetchItems } from "../api";
import { FleaMarketItem, ItemData } from "../types";
import { findItems, preprocessImage, removeDuplicatedItems } from "../utils";
import PriceButton from "./components/priceButton";
import "./styles.css";

const multiplier = 3;
const scanButtons = [
  { text: "Quick scan", greyScale: [80, 70] },
  { text: "Balanced Scan", greyScale: [80, 90, 100] },
  { text: "Deep Scan", greyScale: [70, 80, 90, 100, 110] },
];

export default function ImageRecognition() {
  const [inventoryImage, setInventoryImage] = useState<string | null>(null);
  const [itemsDetected, setItemsDetected] = useState<ItemData[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [highestZIndex, setHighestZIndex] = useState(0);
  const [allItems, setAllItems] = useState<FleaMarketItem[] | undefined>([]);

  const handleButtonClick = () => {
    setHighestZIndex((prev) => prev + 1);
  };

  const handleButtonClose = (item: ItemData) => {
    const index = itemsDetected.findIndex(
      (itemDetected) => itemDetected.coords.x === item.coords.x && itemDetected.coords.y === item.coords.y
    );
    if (index > -1) {
      const newItemsDetected = [...itemsDetected];
      newItemsDetected.splice(index, 1);
      setItemsDetected(newItemsDetected);
    }
  };

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
        const items = allItems?.length === 0 ? await fetchItems() : allItems;

        if (allItems?.length === 0) {
          setAllItems(items);
        }
        const imagesWithFilters = await preprocessImage(inventoryImage, multiplier, greyScale);
        const itemsFromImages: Tesseract.Word[][] = [];

        // Usar for...of para manejar la asincronía correctamente
        for (const image of imagesWithFilters) {
          const result = await Tesseract.recognize(image);
          itemsFromImages.push(result.data.words);
        }

        //setInventoryImage(imagesWithFilters[0]);

        if (items) {
          const detectedItems = findItems(itemsFromImages.flat(), items);
          const finalItems = removeDuplicatedItems(detectedItems);

          console.log({ finalItems });

          setItemsDetected(finalItems);
        }
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
    <div className="container">
      <div onPaste={handlePaste} className="inventoryContainer">
        <p>Paste image here (left-click and CTRL + V)</p>

        <div style={{ position: "relative", display: "block", margin: "0 auto" }}>
          {inventoryImage && <img src={inventoryImage} alt="user inventory" />}

          {itemsDetected.map((item, index) => (
            <PriceButton
              key={item.id + index}
              text={item.avg24hPrice ? `${item.shortName + " $" + item.avg24hPrice.toLocaleString()}` : "Cant sell"}
              multiplier={multiplier}
              item={item}
              highestZIndex={highestZIndex + 1} //Envía el próximo z-index disponible
              onClick={handleButtonClick}
              handleClose={handleButtonClose}
            />
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {itemsDetected.length > 0 ? (
            <p>{inventoryLoading ? "Loading..." : `Total Inventory Value: $${calculateTotalValue()}`}</p>
          ) : (
            <p style={{ fontSize: "20px" }}>SELECT A SCAN</p>
          )}
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-around" }}>
            {scanButtons.map((button) => (
              <button
                key={button.text}
                className="scanButton"
                disabled={!inventoryImage}
                onClick={() => handleDetectItems(button.greyScale)}
              >
                {button.text}
              </button>
            ))}
          </div>
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
