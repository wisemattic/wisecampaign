import {
  Popover,
  PopoverHandler,
  PopoverContent,
  Button,
} from "@material-tailwind/react";
import { FaCartPlus, FaShoppingCart } from "react-icons/fa";
import { HiCursorClick } from "react-icons/hi";
import BannerDesign from "./BannerDesign";
import WiseWrapper from "../../../../components/WiseWrapper";
export function PopoverCustomAnimation({ popoverOptions, componentName, deactivationButton }) {
  return (
    <Popover
      animate={{
        mount: { scale: 1, y: 0 },
        unmount: { scale: 0, y: 25 },
      }}
    >
      <div className="flex items-center justify-center gap-2 p-2 bg-blue-gray-50/50 rounded-lg">
        <span className="text-gray-700">This is your {componentName} preview. You can</span>
        <PopoverHandler>
          <Button 
            size="sm" 
            variant="text" 
            className="flex items-center gap-2 px-2 py-1 text-blue-500 hover:bg-blue-50 min-h-0"
          >
            <HiCursorClick className="h-4 w-4" />
            <span>Choose</span>
          </Button>
        </PopoverHandler>
        <span className="text-gray-700 flex items-center gap-2">
          from other available templates or {deactivationButton}
        </span>
      </div>
      <PopoverContent className="w-full max-w-[70vw] max-h-[70vh] overflow-y-auto p-0 border-2">
      <WiseWrapper>
        {popoverOptions}
        </WiseWrapper>
      </PopoverContent>
    </Popover>
  );
}