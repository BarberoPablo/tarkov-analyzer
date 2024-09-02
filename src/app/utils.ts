import { allItems, specialWords } from "./constants";
import { ItemData } from "./types";

//Compare with shortName and return the full name (name)
export function findItems(words: Tesseract.Word[]) {
  //const detected: { [id: string]: ItemData } = {};
  const detected: ItemData[] = [];

  words.forEach((word /* index */) => {
    const parsedWord = getRealWord(word.text.replace(/[^a-zA-Z0-9\s-]/g, "").trim());

    if (parsedWord?.length > 2) {
      //To avoid finding ammo packs lets search for the items that does not includes "ammo"
      const itemFound = allItems.find((item) => {
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

      if (itemFound) {
        let sameItem = false;
        if (detected.length > 0) {
          /* if(words[index-1]){
          } */
          const lastItemDetected = detected[detected.length - 1];
          console.log(lastItemDetected);
          if (Math.abs(lastItemDetected.coords.x - word.bbox.x0) < 90 && Math.abs(lastItemDetected.coords.y - word.bbox.y0) < 10) {
            console.log(`Same item`);
            sameItem = true;
          } else {
            console.log("Different item");
          }
        }

        if (!sameItem) {
          detected.push({ ...itemFound, coords: { x: word.bbox.x0, y: word.bbox.y0 } });
        }
      }

      /* 
        if the previous item is the same as the one here, calculate the coords to check if its the same item
        (65,774) vs (141,774) | dif = (76,0)

        Nails vs Meds
        (118,585) vs (299,585) | dif = (181,0)
        
        Ripstop vs Matches
        (261,396) vs (434,396) | dif = (173,0)
        

      */
    }
  });

  return detected;
}

function getRealWord(word: string) {
  const newWord = specialWords[word.toLowerCase()];

  return newWord || word;
}
