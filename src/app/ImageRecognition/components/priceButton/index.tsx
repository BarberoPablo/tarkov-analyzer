import { useState } from "react";
import { ItemData } from "../../../types";

export default function PriceButton({
  text,
  multiplier,
  item,
  highestZIndex,
  onClick,
  handleClose,
}: {
  text: string;
  multiplier: number;
  item: ItemData;
  highestZIndex: number;
  onClick: () => void;
  handleClose: (item: ItemData) => void;
}) {
  const [zIndex, setZIndex] = useState(0);

  const handleClick = () => {
    setZIndex(highestZIndex); // Solo este botón obtiene el nuevo z-index
    onClick(); // Actualiza el highestZIndex en el componente padre
  };

  return (
    <div
      style={{
        position: "absolute",
        top: item.coords.y / multiplier + "px",
        left: item.coords.x / multiplier + "px",
        zIndex: zIndex, // Solo este botón tiene el z-index actualizado
        maxWidth: "55px",
        border: "1px solid crimson",
        borderRadius: "8px",
        transform: "translate(-40%, 0%)", // Para centrar el texto en las coordenadas
        filter: "drop-shadow(3px 3px 3px black)",
        backgroundColor: "black",
      }}
    >
      <button
        onClick={handleClick}
        style={{
          fontSize: "12px",
          width: "100%",
          backgroundColor: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        {text}
      </button>

      <button
        onClick={() => handleClose(item)}
        style={{
          position: "absolute",
          top: "-8px",
          right: "-6px",
          width: "15px",
          height: "15px",
          fontSize: "10px",
          color: "white",
          backgroundColor: "crimson",
          border: "none",
          borderRadius: "50%",
          cursor: "pointer",
          padding: 0,
        }}
      >
        X
      </button>
    </div>
  );
}
