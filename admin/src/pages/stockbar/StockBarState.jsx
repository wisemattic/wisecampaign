import ReactSwitch from "react-switch"

export const StockBarState = ({state, setState, componentName}) => {

    return (
        <div className="flex items-center gap-4">
        <span className={`text-sm font-medium ${state ? "text-gray-500" : "text-blue-500" }`}>
          {state ? "Deactive " : "Active "} {componentName}
        </span>
        <ReactSwitch
          checked={state} 
          onChange={() => setState(!state)}
          onColor="#2196F2"
          offColor="#757575"
          height={18}
          width={36}
        />
      </div>
    )

}