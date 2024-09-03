import { allItems, specialWords } from "./constants";
import { FleaMarketItem, ItemData } from "./types";

//Compare with shortName and return the full name (name)
export function findItems(words: Tesseract.Word[]) {
  //const detected: { [id: string]: ItemData } = {};
  const detected: ItemData[] = [];
  let itemFound: FleaMarketItem | undefined = undefined;

  words.forEach((word, index) => {
    const parsedWord = word.text.length > 0 && getRealWord(word.text.replace(/[^a-zA-Z0-9\s-]/g, "").trim());
    let previousItem: FleaMarketItem | undefined = undefined;

    if (parsedWord && parsedWord?.length < 3 && index > 0 && index < words.length - 1) {
      console.log("SHORT WORD: ", parsedWord);
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
          console.log("Setting previous item: ", previousItem.shortName);
        } else {
          console.log(`%c${possibleItemName} | ${itemFound?.shortName}`, "color: red");
          previousItem = undefined;
        }
      });
    }

    if (parsedWord && parsedWord?.length >= 3) {
      //To avoid finding ammo packs lets search for the items that does not includes "ammo"
      console.log("LONG WORD: ", parsedWord);

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
          Math.abs(lastItemDetected.coords.x - word.bbox.x0) < 90 &&
          Math.abs(lastItemDetected.coords.y - word.bbox.y0) < 100
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
  console.log("Getting real Word: ", word, " => ", newWord);
  return newWord;
}
