import { getPathFor } from "../utils/utils";

export default function UpComming() {
    return <div className="flex justify-center items-center">
        <img className="h-fit place-self-end col-span-2 rounded-lg" src={getPathFor('commingsoon.png')} alt="Comming soon Image" />
    </div>
}