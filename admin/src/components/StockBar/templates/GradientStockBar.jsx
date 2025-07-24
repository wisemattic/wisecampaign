import { Card, Progress, Typography } from "@material-tailwind/react";

export default function GradientStockBar({
  progressValue,
  progressStartColor,
  progressEndColor,
  progressBgColor,
  backgroundColor = "#ffffff",
  textColor = "#000000",
  borderColor = "#e5e7eb",
  totalSold = 21,
  availableItems = 110
}) {
  return (
    <Card 
      className="flex flex-col gap-1 p-4 rounded-md"
      style={{
        backgroundColor: backgroundColor,
        color: textColor,
        border: `1px solid ${borderColor}`
      }}
    >
      <div className="flex justify-between">
        <Typography className="text-sm" style={{ color: textColor }}>
          Total Sold: {totalSold}
        </Typography>
        <Typography className="text-sm" style={{ color: textColor }}>
          Available Item: {availableItems}
        </Typography>
      </div>
      <div 
        className="relative w-full h-2 rounded-md overflow-hidden"
        style={{ backgroundColor: progressBgColor }}
      >
        <div
          className="h-full"
          style={{ 
            width: progressValue + "%",
            background: `linear-gradient(to right, ${progressStartColor}, ${progressEndColor})`
          }}
        ></div>
      </div>
      <Typography className="text-sm text-center" style={{ color: textColor }}>
        Hurry! Only {availableItems} items left in stock. Order now before it's gone!
      </Typography>
    </Card>
  );
}
