import { useState } from "react";
import { useBannerContext } from "../../../../context/BannerContext";
import { BannerSection } from "./BannerSection";
import { BogoSection } from "./BogoSection";
import { HeadlineSection } from "./HeadlineSection";
import { SubHeadlineSection } from "./SubHeadlineSection";
import { ButtonSection } from "./ButtonSection";
import { CountdownSection } from "./CountdownSection";

export default function NewBannerCustomizer() {
  const [activeSection, setActiveSection] = useState("background");
  const {
      updateActiveBanner,
      activeBanner
    } = useBannerContext();
  
    // Handle non-nested changes (e.g., banner settings)
    const handleChange =
     (section: keyof FormValues["banner"], key: string, unit?: string) =>
     (e: React.ChangeEvent<HTMLInputElement>) => {
        let value =
          e.target.type === "file" ? e.target.files?.[0] || null : e.target.value;
  
        if (unit) {
          value = value + unit;
        }
  
  
  
        // Preserve the id while updating form values
      const updatedValues = {
        ...activeBanner,
        banner: {
          ...activeBanner.banner,
          [section]: {
            ...activeBanner.banner[section],
            [key]: value,
          },
          id: activeBanner.banner?.id || null, // Ensure the ID is preserved
        },
      };
  
        updateActiveBanner(updatedValues);
      };

  const sectionTitles = {
    background: "Background Customization",
    text: "Text & Typography Settings",
    bogo: "Bogo Setting Options",
    button: "Button & CTA Options",
    countdown: "Countdown Timer Settings",
    advanced: "Advanced Configuration",
  };

  const sectionDescriptions = {
    background: "Customize banner background colors, images, and visual elements.",
    text: "Edit headlines, fonts, sizes, alignment, and text styling.",
    bogo: "Configure Bogo settings, including discounts and offers.",
    button: "Configure button text, colors, actions, and call-to-action elements.",
    countdown: "Set countdown timers, urgency elements, and time-based features.",
    advanced: "Configure display rules, targeting, positioning, and advanced options.",
  };


  const sectionUI = {
    background: <BannerSection formValues={activeBanner} handleChange={handleChange}/>,
    bogo: <BogoSection formValues={activeBanner} handleChange={handleChange} />,
    text: <div className="grid grid-cols-1">
      <div>
        <h3>Headline</h3>
        <hr />
      <HeadlineSection formValues={activeBanner} handleChange={handleChange} />
      </div>
      <div>
        <h3>Sub Headline</h3>
        <hr />
      <SubHeadlineSection formValues={activeBanner} handleChange={handleChange} />
      </div>
    </div>,
    button: <ButtonSection formValues={activeBanner} handleChange={handleChange} />,
    countdown: <CountdownSection formValues={activeBanner} handleChange={handleChange} />,
    advanced: "Configure display rules, targeting, positioning, and advanced options.",
  };

  const sections = [
    {
      key: "background",
      icon: "🎨",
      title: "Background",
      description: "Customize banner background, colors, and images",
    },
    {
      key: "text",
      icon: "📝",
      title: "Text & Typography",
      description: "Edit headlines, fonts, sizes, and text alignment",
    },
    {
      key: "bogo",
      icon: "🎁",
      title: "Bogo Settings",
      description: "Configure Bogo discounts and offers",
    },
    {
      key: "button",
      icon: "🔘",
      title: "Button & CTA",
      description: "Customize button text, colors, and actions",
    },
    {
      key: "countdown",
      icon: "⏰",
      title: "Countdown Timer",
      description: "Set countdown timers and urgency elements",
    },
    {
      key: "advanced",
      icon: "⚙️",
      title: "Advanced Settings",
      description: "Display rules, targeting, and positioning",
    },
  ];

  return (
    <div className="mt-6">
      {/* Layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Left Sidebar - Sections */}
        <div className="bg-white shadow rounded-sm p-4">
          <h2 className="text-lg font-semibold mb-4">Banner Sections</h2>
          <div className="space-y-3">
            {sections.map((section) => (
              <div
                key={section.key}
                className={`flex items-start p-3 rounded-sm cursor-pointer transition border ${
                  activeSection === section.key
                    ? "bg-blue-50 border-blue-400"
                    : "hover:bg-gray-50 border-gray-200"
                }`}
                onClick={() => setActiveSection(section.key)}
              >
                <div className="text-2xl mr-3">{section.icon}</div>
                <div>
                  <h3 className="font-medium">{section.title}</h3>
                  <p className="text-sm text-gray-500">{section.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Options */}
        <div className="md:col-span-2 bg-white shadow rounded-sm p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              {sectionTitles[activeSection] || "Customization Options"}
            </h2>
            <p className="text-sm text-gray-500">
              {sectionDescriptions[activeSection] ||
                "Select a section from the left to customize its properties."}
            </p>
          </div>

          <div className="border rounded-sm p-4">
            
              { activeBanner && sectionUI && sectionUI[activeSection] }
  
          </div>
        </div>
      </div>
    </div>
  );
}
