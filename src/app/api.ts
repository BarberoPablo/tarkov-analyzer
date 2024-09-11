import axios from "axios";
import { FleaMarketItem } from "./types";

export const fetchItems = async () => {
  try {
    const response = await axios.get("https://tarkov-analyzer-backend.vercel.app/api/items");
    console.log({ response });
    return response.data as FleaMarketItem[];
  } catch (error) {
    console.error("Error fetching items:", error);
    return [];
  }
};
