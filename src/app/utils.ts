import { allItems, specialWords } from "./constants";
import { ItemData } from "./types";

//Compare with shortName and return the full name (name)
export function findItems(words: Tesseract.Word[]) {
  const detected: { [id: string]: ItemData } = {};

  words.forEach((word) => {
    const parsedWord = getRealWord(word.text.replace(/[^a-zA-Z0-9\s-]/g, "").trim());

    if (parsedWord?.length > 2) {
      const itemFound = allItems.find((item) => {
        return item.shortName.toLowerCase().includes(parsedWord.toLowerCase()) && parsedWord.length + 2 > item.shortName.length;
      });

      console.log("word: ", parsedWord.toLowerCase(), "found: ", itemFound?.shortName);

      if (itemFound) {
        detected[itemFound.id] = { ...itemFound, coords: { x: word.bbox.x0, y: word.bbox.y0 } };
      }
    }
  });

  return detected;
}

function getRealWord(word: string) {
  const newWord = specialWords[word.toLowerCase()];
  return newWord || word;
}

/* array of coords
if (itemFound) {
        if (detected[itemFound.id]) {
          detected[itemFound.id] = {
            ...detected[itemFound.id],
            coords: [...detected[itemFound.id].coords, { x: word.bbox.x0, y: word.bbox.y0 }],
          };
        } else {
          detected[itemFound.id] = { ...itemFound, coords: [{ x: word.bbox.x0, y: word.bbox.y0 }] };
        }
      }

*/
