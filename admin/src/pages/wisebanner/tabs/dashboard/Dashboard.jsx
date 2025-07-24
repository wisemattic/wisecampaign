import React from "react";
import DashboardCard from "./DashboardCard";
import ActivityReport from "./ActivityReport";
import DashboardWelcome from "./DashboardWelcome";
import UpgradePlan from "./UpgradePlan";
import { openInNewTab } from "../../../../utils/utils";

const Dashboard = ({ isPro }) => {
  return (
    <div className="grid gap-4">
      {/*<h2>Welcome back, Ayo</h2>*/}
      {/*<p>You’ve achieved 70% of your goal this week!</p>*/}

      <div className="">
        <DashboardWelcome />
      </div>

      <div className="grid grid-cols-12 gap-4 relative group">
        <div className="col-span-8 row-span-2">
          <ActivityReport />
        </div>
        <div className="col-span-4 grid grid-cols-3 grid-rows-4 gap-2">
          <div className="row-span-2">
            <DashboardCard title="Daily Views" value="05" description="Today" />
          </div>
          <div className="col-span-2 row-span-3">
            <DashboardCard
              title="Weekly Views"
              value="27"
              description="This Week"
            />
          </div>
          <div className="row-span-2">
            <DashboardCard
              title="Total CTA Clicks"
              value="169"
              description="All Time"
            />
          </div>
          <div className="col-span-2">
            <DashboardCard
              title="Today's Click"
              value="05"
              description="Click Today"
            />
          </div>
        </div>

        <div className="absolute inset-0 bg-white bg-opacity-60 flex flex-col items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <p className="text-sm mb-2">
            {isPro
              ? "This feature is upcomming"
              : "Viewing test data. Upgrade your plan to view Live Data."}
          </p>
          {isPro ? (
            <button
              onClick={() =>
                openInNewTab("https://wisemattic.com/wisecampaign/")
              }
              className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors"
            >
              See Features
            </button>
          ) : (
            <button
              onClick={() =>
                openInNewTab("https://wisemattic.com/wisecampaign/")
              }
              className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors"
            >
              Upgrade to Pro
            </button>
          )}
        </div>
      </div>

      <div className="">
        <UpgradePlan isPro={isPro}/>
      </div>
    </div>
  );
};

export default Dashboard;
