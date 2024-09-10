import { useState } from "react";
import { ItemData } from "../../../types";

export default function PriceButton({
  text,
  multiplier,
  item,
  highestZIndex,
  onClick,
}: {
  text: string;
  multiplier: number;
  item: ItemData;
  highestZIndex: number;
  onClick: () => void;
}) {
  const [zIndex, setZIndex] = useState(0);

  const handleClick = () => {
    setZIndex(highestZIndex); // Solo este botón obtiene el nuevo z-index
    onClick(); // Actualiza el highestZIndex en el componente padre
  };

  return (
    <button
      onClick={handleClick}
      style={{
        position: "absolute",
        maxWidth: "55px",
        top: item.coords.y / multiplier + "px",
        left: item.coords.x / multiplier + "px",
        fontSize: "12px",
        color: "white",
        backgroundColor: "black",
        border: "1px solid crimson",
        padding: "2px 4px",
        filter: "drop-shadow(3px 3px 3px black)",
        transform: "translate(-40%, 0%)", // Para centrar el texto en las coordenadas}}>{text}</button>;
        zIndex: zIndex, // Solo este botón tiene el z-index actualizado
      }}
    >
      {text}
    </button>
  );
}
