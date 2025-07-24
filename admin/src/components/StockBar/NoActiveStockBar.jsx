import { Typography } from "@material-tailwind/react";
import { useStockBarContext } from "../../context/StockbarContext";

export default function NoActiveStockBar() {
  const { stockBars, setActiveStockBar, renderStockBar } = useStockBarContext();

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <Typography variant="h5" className="mb-6 text-center">
        Select a Template to Get Started
      </Typography>
      <div className="space-y-4 max-w-2xl mx-auto">
        {stockBars.map((stockBar) => (
          <div
            key={stockBar.id}
            onClick={() => setActiveStockBar(stockBar)}
            className="p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md hover:border-blue-500"
          >
            {renderStockBar(stockBar)}
          </div>
        ))}
      </div>
    </div>
  );
}