import { FaArrowRight } from "react-icons/fa"
import { getPathFor, openInNewTab } from "../../../../utils/utils"

const UpgradePlan = ({isPro}) => {
    return (
        <div className="bg-[#f1ecff] rounded-lg m-3 shadow-md grid grid-cols-3 h-56">
                <div className="p-8 flex flex-col justify-between h-full">
                    {
                    isPro ?
                    (
                        <div className="text-center">
                            <div className="text-lg font-semibold">You are using  pro plan</div>
                            <div className="text-sm text-gray-500">Use your pro plan</div>
                        </div>) :
                    (<div className="text-center">
                        <div className="text-lg font-semibold">Upgrade Now</div>
                        <div className="text-sm text-gray-500">Start with a plan</div>
                    </div> )
                    }
                    <div className="flex justify-center">
                        <button onClick={()=> openInNewTab('https://wisemattic.com/wisecampaign/')} className="w-10 h-10 rounded-full bg-white flex justify-center items-center">
                            <FaArrowRight />
                        </button>
                    </div>
                </div>
                <img className="h-56 place-self-end col-span-2 rounded-lg" src={getPathFor('dashboard_below_banner.png')} alt="Below Image" />
            </div>
    )
}

export default UpgradePlan