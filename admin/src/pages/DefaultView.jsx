import DashboardWelcome from "./wisebanner/tabs/dashboard/DashboardWelcome"
import UpgradePlan from "./wisebanner/tabs/dashboard/UpgradePlan"

export default function DefaultView({isPro}) {
    return(
        <div className="flex flex-col m-5 gap-2">
            <DashboardWelcome />
            <UpgradePlan isPro={isPro} />
          </div>
    )
}