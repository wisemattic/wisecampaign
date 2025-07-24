import { Switch } from "@material-tailwind/react";
import StockBarPlayGround from "./StockBarPlayGround";
import { StockBarProvider } from "../../context/StockbarContext";
import { ToastProvider } from "../../provider/ToastProvider";

export default function () {
  return (
    <>
      <StockBarProvider>
        <ToastProvider>
        <StockBarPlayGround />
        </ToastProvider>
      </StockBarProvider>
    </>
  );
}
