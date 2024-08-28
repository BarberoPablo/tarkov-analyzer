export type ItemData = FleaMarketItem & {
  coords: {
    x: number;
    y: number;
  };
};
export type FleaMarketItem = {
  id: string;
  name: string;
  shortName: string;
  avg24hPrice: number | null;
  lastOfferCount: number | null;
  lastLowPrice: number | null;
};
