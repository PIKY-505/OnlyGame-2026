import React from "react";
import "../../styles/ShinyText.scss";

const ShinyText = ({
  text,
  disabled = false,
  speed = 3,
  className = "",
  color = "#7c7c7c", // Tu gris oscuro
  shineColor = "#ffffff", // El brillo blanco
  direction = "right", // Por defecto hacia la derecha como querías
}) => {
  return (
    <div
      className={`shiny-text ${direction} ${
        disabled ? "disabled" : ""
      } ${className}`}
      style={{
        // Pasamos las variables al CSS
        "--shiny-speed": `${speed}s`,
        "--base-color": color,
        "--shine-color": shineColor,
      }}>
      {text}
    </div>
  );
};

export default ShinyText;
