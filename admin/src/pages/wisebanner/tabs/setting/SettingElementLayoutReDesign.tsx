
interface SettingElementLayoutProps {
  title: string;
  element: React.ReactNode;
}

const SettingElementLayoutReDesign: React.FC<SettingElementLayoutProps> = ({ title, element }) => {
  return (
    <div className="flex items-center gap-4 py-2">
      <h3 className="text-gray-700 font-medium min-w-[120px]">{title}</h3>
      <div className="flex items-center">{element}</div>
    </div>
  );
};

export default SettingElementLayoutReDesign;
  