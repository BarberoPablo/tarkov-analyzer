//import { FleaMarketItem } from "./types";

/* 
Letters that get confused
e and o
c and g
s and e
a and o (fcand => fcond)

also try the word without "-"
-t-plug, remove "-" at beggining and at the end

*/

export const specialWords: { [key: string]: string | undefined } = {
  //ALL THE KEYS SHOULD BE IN LOWERCASE
  backpack: undefined,
  tactical: undefined,
  rig: undefined,
  "aa battery": "AA batt.",
  pnwde215: "pnwde 215",
  batt: "AA batt.",
  nalls: "Nails",
  gmtube: "MTube",
  miube: "Mtube",
  gmigbe: "Mtube",
  fleace: "Fleece",
  hulbex: "Bulbex",
  "j-rlug": "T-Plug",
  "t-rlug": "T-Plug",
  "j-fplug": "T-Plug",
  "st-rlug": "T-Plug",
  trlug: "T-Plug",
  tplug: "T-Plug",
  "s1-plug": "T-Plug",
  "i-plug": "T-Plug",
  tsplug: "T-Plug",
  krasawch: "Krasavch.",
  //ALL THE KEYS SHOULD BE IN LOWERCASE
  krasaveh: "Krasavch.",
  krasaven: "krasavch.",
  schews: "Screws",
  schrews: "Screws",
  saat: "Salt",
  sait: "Salt",
  ms2eee: "MS2000",
  nippel: "Nippers",
  nippegs: "Nippers",
  nippess: "Nippers",
  nipp: "Nippers",
  nippesgs: "Nippers",
  car: "Car",
  tose: "Hose",
  mparts: "M.parts",
  wfiiter: "WFilter",
  lusd: "USD",
  ausd: "USD",
  mscissars: "MScissors",
  mseissors: "MScissors",
  milape: "MTape",
  miape: "MTape",
  jape: "Tape",
  meetin: "TG meeting",
  syginge: "Syringe",
  ofuel: "DFuel",
  dfuell: "DFuel",
  lms: "CMS",
  ezripstop: "Ripstop",
  cpu: "CPU fan",
  fan: "CPU fan",
  se5: "SE-5",
  ses: "SE-5",
  alkall: "Alkali",
  beard0oll: "BeardOil",
  aceess: "Access",
  //lamp: "ES Lamp",
  survi2: "Surv12",
  boits: "Bolts",
  "4bulb": "Bulb",
  //ALL THE KEYS SHOULD BE IN LOWERCASE
  m8s5: "M855",
  hydrassho: "HydraSho",
  rpllers: "RPliers",
  cru: "CPU",
  r025: "RDG-2B",
  "ro5-28": "RDG-2B",
  "rog-2b": "RDG-2B",
  ductytape: "Duct tape",
  ductatape: "Duct tape",
  poxegam: "Poxeram",
  rge28: "RG028",
  rg28: "RG028",
  bangage: "Bandage",
  "ov lampl": "UV Lamp",
  huts: "Nuts",
  "5123": "6L23",
  dorm114: "Dorm 114",
  sso: "SSD",
};
