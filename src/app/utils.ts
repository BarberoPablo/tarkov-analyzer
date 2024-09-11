import { createCanvas, loadImage } from "canvas";
import { specialWords } from "./constants";
import { FleaMarketItem, ItemData } from "./types";

//Compare with shortName and return the full name (name)
const coordThreshold = 90;

export function findItems(words: Tesseract.Word[], allItems: FleaMarketItem[]) {
  const detected: ItemData[] = [];
  let itemFound: FleaMarketItem | undefined = undefined;

  words.forEach((word, index) => {
    const parsedWord = word.text.length > 0 && getRealWord(word.text.replace(/[^a-zA-Z0-9\s-]/g, "").trim());
    let previousItem: FleaMarketItem | undefined = undefined;

    if (parsedWord && parsedWord?.length < 3 && index > 0 && index < words.length - 1) {
      const possibleItemNames: string[] = [];
      const previousWord = words[index - 1].text
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .toLowerCase()
        .trim();
      const nextWord = words[index + 1].text
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .toLowerCase()
        .trim();

      //If the previousItem was a founded item then dont use it to generate a possible new item
      if (!previousItem && previousWord && previousWord.length + parsedWord.length > 3) {
        possibleItemNames.push(getRealWord(`${previousWord} ${parsedWord}`));
        possibleItemNames.push(getRealWord(`${previousWord}-${parsedWord}`));
      }

      if (nextWord && nextWord.length + parsedWord.length > 3) {
        possibleItemNames.push(getRealWord(`${parsedWord} ${nextWord}`));
        possibleItemNames.push(getRealWord(`${parsedWord}-${nextWord}`));
      }

      possibleItemNames.forEach((possibleItemName) => {
        itemFound = allItems.find((item) => {
          return (
            (possibleItemNames.includes(item.shortName.toLowerCase()) || possibleItemNames.includes(item.shortName)) &&
            possibleItemName.length + 2 > item.shortName.length &&
            !item.name.includes("ammo pack")
          );
        });

        if (itemFound?.shortName) {
          console.log(`%c${possibleItemName} | ${itemFound?.shortName}`, "color: green");
          previousItem = itemFound;
        } else {
          console.log(`%c${possibleItemName} | ${itemFound?.shortName}`, "color: red");
          previousItem = undefined;
        }
      });
    }

    if (parsedWord && parsedWord?.length >= 3) {
      //To avoid finding ammo packs lets search for the items that does not includes "ammo"
      itemFound = allItems.find((item) => {
        return (
          parsedWord.length + 2 > item.shortName.length &&
          item.shortName.toLowerCase().includes(parsedWord.toLowerCase()) &&
          !item.name.includes("ammo pack")
        );
      });

      if (itemFound?.shortName) {
        console.log(`%c${parsedWord} | ${itemFound?.shortName}`, "color: green");
      } else {
        console.log(`%c${parsedWord} | ${itemFound?.shortName}`, "color: red");
      }
    }

    if (itemFound) {
      let sameItem = false;
      if (detected.length > 0) {
        const lastItemDetected = detected[detected.length - 1];

        if (
          lastItemDetected.shortName.toLowerCase() === parsedWord &&
          Math.abs(lastItemDetected.coords.x - word.bbox.x0) < coordThreshold &&
          Math.abs(lastItemDetected.coords.y - word.bbox.y0) < coordThreshold
        ) {
          sameItem = true;
        }
      }

      if (!sameItem) {
        console.log(`%c${itemFound.shortName}`, `color: purple`);

        detected.push({ ...itemFound, coords: { x: word.bbox.x0, y: word.bbox.y0 } });
      }
    }
    itemFound = undefined;
  });

  return detected;
}

function getRealWord(word: string) {
  const newWord = specialWords[word.toLowerCase()] || word.toLowerCase();
  return newWord;
}

export function removeDuplicatedItems(items: ItemData[]) {
  const uniqueItems: ItemData[] = [];

  items.forEach((item) => {
    const findItems = uniqueItems.filter((uniqueItem) => uniqueItem.shortName === item.shortName);

    if (findItems.length === 0) {
      uniqueItems.push(item);
    } else {
      //compare coords
      let isNewItem = true;
      findItems.forEach((findItem) => {
        if (Math.abs(findItem.coords.x - item.coords.x) < coordThreshold && Math.abs(findItem.coords.y - item.coords.y) < coordThreshold) {
          isNewItem = false;
        }
      });

      if (isNewItem) {
        uniqueItems.push(item);
      }
    }
  });

  return uniqueItems;
}

export async function preprocessImageWithGreyScale(imageSrc: string, avgMin: number, multiplier: number) {
  const img = await loadImage(imageSrc);
  const newWidth = img.width * multiplier;
  const newHeight = img.height * multiplier;

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
}

export async function preprocessImageWithTargetColor(imageSrc: string, multiplier: number) {
  //This method paints all the image to black except for the colors similar to the targetColor
  const img = await loadImage(imageSrc);
  const newWidth = img.width * multiplier;
  const newHeight = img.height * multiplier;

  const canvas = createCanvas(newWidth, newHeight);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(img, 0, 0, newWidth, newHeight);

  const imageData = ctx.getImageData(0, 0, newWidth, newHeight);

  const data = imageData.data;

  const targetColor = [140, 160, 160]; //203 210 201
  const tolerance = 90;

  const [targetR, targetG, targetB] = targetColor;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const distance = Math.sqrt(Math.pow(r - targetR, 2) + Math.pow(g - targetG, 2) + Math.pow(b - targetB, 2));

    if (distance > tolerance) {
      data[i] = data[i + 1] = data[i + 2] = 0; // Black
    }
  }

  ctx.putImageData(imageData, 0, 0);

  return canvas.toDataURL();
}

export async function preprocessImage(imageSrc: string, multiplier: number, greyScale: number[]) {
  const greyScalePromises = greyScale.map((filter) => preprocessImageWithGreyScale(imageSrc, filter, multiplier));
  const targetColorPromise = preprocessImageWithTargetColor(imageSrc, multiplier);

  const imagesWithFilters = await Promise.all([...greyScalePromises, targetColorPromise]);

  return imagesWithFilters;
}
