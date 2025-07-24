
interface SettingElementLayoutProps {
  title: string,
  element: React.ReactNode;
}

const SettingElementLayout: React.FC<SettingElementLayoutProps> = ({title, element}) => {
    return (
      <div className="block rounded-lg p-4 shadow-sm bg-white shadow-indigo-100">
        <div className="grid grid-cols-2">
          <span className="justify-self-start place-self-center font-semibold text-sm">{title}</span>
          <div className="justify-self-end place-self-center ml-4">{element}</div>
        </div>
      </div>
    );
  };
  
  export default SettingElementLayout;
  