import { ClipboardEvent, useState } from "react";
import Tesseract from "tesseract.js";
import { fetchItems } from "../api";
import { FleaMarketItem, ItemData } from "../types";
import { calculateTotalValue, findItems, preprocessImage, removeDuplicatedItems } from "../utils";
import LoadingSpinner from "./components/LoadingSpinner";
import PriceButton from "./components/PriceButton";
import "./styles.css";

const multiplier = 3;
const scanButtons = [
  { text: "Quick Scan", grayScale: [70, 80] },
  { text: "Balanced Scan", grayScale: [80, 90, 100] },
  { text: "Deep Scan", grayScale: [70, 80, 90, 100, 110] },
];

export default function ImageRecognition() {
  const [inventoryImage, setInventoryImage] = useState<string | null>(null);
  const [itemsDetected, setItemsDetected] = useState<{ message: string; items: ItemData[] }>({
    message: "",
    items: [],
  });
  const [lastScanSelected, setLastScanSelected] = useState(-1); //Avoid analyzing with same filters if image was previously analized
  const [highestZIndex, setHighestZIndex] = useState(0);
  const [allItems, setAllItems] = useState<FleaMarketItem[]>([]);
  const [loadingMsg, setLoadingMsg] = useState<string>("");
  const [loadingTestImage, setLoadingTestImage] = useState<string>("");

  const handleButtonClick = () => {
    setHighestZIndex((prev) => prev + 1);
  };

  const handleButtonClose = (item: ItemData) => {
    const index = itemsDetected.items.findIndex(
      (itemDetected) => itemDetected.coords.x === item.coords.x && itemDetected.coords.y === item.coords.y
    );
    if (index > -1) {
      setLastScanSelected(-1);
      const newItemsDetected = [...itemsDetected.items];
      newItemsDetected.splice(index, 1);
      setItemsDetected({ message: calculateTotalValue(newItemsDetected), items: newItemsDetected });
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const userInventory = event.clipboardData.items;

    for (const item of userInventory) {
      if (item.type.indexOf("image") !== -1) {
        const blob = item.getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setInventoryImage(event.target.result as string);
              setItemsDetected({ message: "", items: [] });
              setLastScanSelected(-1);
            }
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  const handleDetectItems = async (grayScale: number[], scanTypeId: number) => {
    let filteredGrayScale = grayScale;
    try {
      if (inventoryImage) {
        //Selecting a lighter Scan does not filter the gray scale, going foward it does so it is faster
        if (lastScanSelected > -1 && lastScanSelected < scanTypeId) {
          console.log(filteredGrayScale);
          filteredGrayScale = filteredGrayScale.filter((scale) => !scanButtons[lastScanSelected].grayScale.includes(scale));
          console.log(filteredGrayScale);
        }

        let items: FleaMarketItem[] = [];
        if (allItems && allItems?.length === 0) {
          setLoadingMsg("Getting items prices");
          items = await fetchItems();
        } else {
          items = allItems;
        }

        setLoadingMsg("Analyzing image");

        if (allItems?.length === 0) {
          setAllItems(items);
        }

        if (items && filteredGrayScale.length > 0) {
          const imagesWithFilters = await preprocessImage(inventoryImage, multiplier, filteredGrayScale);
          const itemsFromImages: Tesseract.Word[][] = [];

          // Usar for...of para manejar la asincronía correctamente
          for (const image of imagesWithFilters) {
            const result = await Tesseract.recognize(image);
            itemsFromImages.push(result.data.words);
          }

          //setInventoryImage(imagesWithFilters[0]);

          const detectedItems = findItems(itemsFromImages.flat(), items);
          const finalItems = removeDuplicatedItems(detectedItems.concat(itemsDetected.items));
          const message = calculateTotalValue(finalItems);

          setItemsDetected({ message, items: finalItems });
          setLastScanSelected(scanTypeId);
        }
        setLoadingMsg("");
      }
    } catch (error) {
      console.error("Error al detectar el texto:", error);
    }
  };

  const handleTestImage = (src: string, id: string) => {
    if (!loadingTestImage.includes(id) && src) {
      setLastScanSelected(-1);
      setInventoryImage(null);
      setItemsDetected({ message: "", items: [] });
      setLoadingTestImage("Loading image" + id);

      fetch(src)
        .then((response) => response.blob())
        .then((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setInventoryImage(reader.result as string); // Data URL
            //setLoadingTestImage("");
          };
          reader.readAsDataURL(blob);
        })
        .catch((error) => console.error("Error al convertir la imagen:", error));
    }
  };

  return (
    <div className="container">
      <div className="inventoryContainer">
        <div onPaste={handlePaste} className="pasteContainer">
          <span>Paste image here (Left-Click and CTRL + V)</span>
          <div className="testImagesContainer">
            <button disabled={loadingTestImage.includes("1")} onClick={() => handleTestImage("https://i.ibb.co/cJk6dmb/inv.png", "1")}>
              Test image 1
            </button>
            <button disabled={loadingTestImage.includes("2")} onClick={() => handleTestImage("https://i.ibb.co/bd9tfkX/inv2.png", "2")}>
              Test image 2
            </button>
          </div>
          {loadingTestImage && !inventoryImage && <span>Loading image...</span>}

          <div style={{ position: "relative", display: "block", margin: "0 auto" }}>
            {inventoryImage && <img src={inventoryImage} alt="user inventory" />}

            {itemsDetected.items.map((item, index) => (
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
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: "24px" }}>
              {loadingMsg ? (
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: "16px" }}>
                  <LoadingSpinner />
                  <span style={{ fontSize: "20px" }}>{loadingMsg}</span>
                </div>
              ) : (
                <span>{itemsDetected.message}</span>
              )}

              {!loadingMsg && <span style={{ fontSize: "20px" }}>SELECT A SCAN</span>}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-around", paddingTop: "8px" }}>
          {scanButtons.map((button, index) => (
            <button
              key={button.text}
              className="scanButton"
              disabled={!inventoryImage || !!loadingMsg || lastScanSelected === index}
              onClick={() => handleDetectItems(button.grayScale, index)}
            >
              {button.text}
            </button>
          ))}
        </div>
      </div>

      <div className="market">
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
