import { AvailableModels } from "@rumbl/laserbeak";
import { useState } from "react";

interface SidebarProps {
    selectedModel: AvailableModels | null;
    setSelectedModel: (model: AvailableModels | null) => void;
    noneSelected: boolean;
}

export default function Sidebar(props: SidebarProps) {
    const { selectedModel, setSelectedModel, noneSelected } = props;
    const [repetitionPenalty, setRepetitionPenalty] = useState(1.0);
    return (
        <div className="flex flex-col p-8 md:w-1/4 mx-auto bg-zinc-900">
            <h1 className="text-white text-lg font-semibold mx-auto tracking-wide">
                playground
            </h1>
            <div className="flex flex-col w-full text-sm gap-8 pt-12">
                <div>
                    <label
                        htmlFor="model"
                        className="mr-2 mb-2 text-white text-sm font-light mr-auto"
                    >
                        Select Model
                    </label>
                    <select
                        id="model"
                        value={selectedModel ? selectedModel : "None"}
                        onChange={(e) => {
                            if (e.target.value !== selectedModel) {
                                setSelectedModel(
                                    e.target.value as AvailableModels
                                );
                            }
                        }}
                        className={`transition ease-in-out delay-150 bg-zinc-800 text-white p-2 rounded-md border ${
                            noneSelected ? "border-red-500" : "border-zinc-700"
                        }`}
                    >
                        <option value="None">None</option>
                        {Object.values(AvailableModels).map((model) => (
                            <option key={model} value={model}>
                                {model}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <div className="flex flex-row justify-between items-center">
                        <label
                            htmlFor="repetition-penalty"
                            className="mr-2 mb-2 text-white text-sm font-light mr-auto"
                        >
                            Repetition Penalty
                        </label>
                        <label
                            htmlFor="repetition-penalty"
                            className="mr-2 mb-2 text-white text-lg font-normal ml-auto"
                        >
                            {repetitionPenalty}
                        </label>
                    </div>
                    <input
                        id="repetition-penalty"
                        type="range"
                        defaultValue={1.0}
                        min={0.01}
                        max={2.0}
                        step={0.01}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-400"
                        onChange={(e) => {
                            setRepetitionPenalty(parseFloat(e.target.value));
                        }}
                    ></input>
                </div>
            </div>
        </div>
    );
}
