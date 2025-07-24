import React from 'react';
import styled from 'styled-components';
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
import BannerSettings from '../pages/wisebanner/tabs/setting/BannerSettings';
import BannerCustomizer from '../pages/wisebanner/tabs/customizer/BannerCustomizer';
import BannerDesign from '../pages/wisebanner/tabs/templates/BannerDesign';
import Dashboard from '../pages/wisebanner/tabs/dashboard/Dashboard';

const Navbar = ({isPro}) => {

  const [activeTab, setActiveTab] = React.useState("templates");
  
  const data = [
    {
      label: "Templates",
      value: "templates",
      desc: <BannerDesign/>,
    },
    {
      label: "Banner Customizer",
      value: "Customizer",
      desc: <BannerCustomizer/>,
    },
    {
      label: "Banner Setting",
      value: "setting",
      desc: <BannerSettings/>,
    }
  ];

    return (

      <Tabs value={activeTab} className="mb-5 ml-5 mr-5">
      <TabsHeader
        className="rounded-md shadow-xl bg-white shadow-blue-gray-900/5"
        indicatorProps={{
          className:
            "bg-transparent shadow-none rounded-none",
        }}
      >
        {data.map(({ label, value }) => (
          <Tab
            key={value}
            value={value}
            onClick={() => setActiveTab(value)}
            className={`p-2 ${activeTab === value ? "font-bold" : ""}`}
          >
            {label}
          </Tab>
        ))}
      </TabsHeader>
      <TabsBody>
        {data.map(({ value, desc }) => (
          <TabPanel key={value} value={value}>
            {desc}
          </TabPanel>
        ))}
      </TabsBody>
    </Tabs>

    );
};

export default Navbar;
