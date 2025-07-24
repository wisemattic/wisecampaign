import { useState } from "react";
import { TemplateType } from "./TeplateType";
import GradientStockBar from "./templates/GradientStockBar";
import SolidStockBar from "./templates/SolidStockBar";

function App() {
  const {
    progressValue,
    totalSold,
    availableItems,
    stockbar
  } = wiseStockbarData;

  const {
    type,
    progressStartColor,
    progressEndColor,
    progressBgColor,
    progressColor,
    backgroundColor,
    textColor,
    borderColor
  } = stockbar;

  const commonProps = {
    progressValue,
    totalSold,
    availableItems,
    progressBgColor,
    backgroundColor,
    textColor,
    borderColor
  };

  return (
    stockbar && (
      <div className="mt-2 mb-2">
        {type === TemplateType.GRADIENT ? (
          <GradientStockBar
            {...commonProps}
            progressStartColor={progressStartColor}
            progressEndColor={progressEndColor}
          />
        ) : (
          <SolidStockBar
            {...commonProps}
            progressColor={progressColor}
          />
        )}
      </div>
    )
  );
}

export default App;
