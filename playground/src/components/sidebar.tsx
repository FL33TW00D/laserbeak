import { Manrope } from "@next/font/google";
import { AvailableModels } from "@rumbl/laserbeak";
import { useState } from "react";
import RangeSlider from "./rangeSlider";
const manrope = Manrope({ subsets: ["latin"] });

interface SidebarProps {
    selectedModel: AvailableModels | null;
    setSelectedModel: (model: AvailableModels | null) => void;
    noneSelected: boolean;
}

export default function Sidebar(props: SidebarProps) {
    const { selectedModel, setSelectedModel, noneSelected } = props;
    const [repetitionPenalty, setRepetitionPenalty] = useState(1.0);
    const [maxLength, setMaxLength] = useState(512);
    return (
        <div className="flex flex-col p-8 md:w-1/4 mx-auto bg-zinc-900">
            <h1 className={`text-white text-lg font-semibold mx-auto tracking- ${manrope.className}`}>
                playground
            </h1>
            <div className="flex flex-col w-full text-sm gap-8 pt-12">
                <div className="flex flex-col">
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
                        className={`transition duration-100 ease-in-out bg-zinc-800 text-white p-2 rounded-md border ${
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

                <RangeSlider
                    name="Repetition Penalty"
                    value={repetitionPenalty}
                    setValue={setRepetitionPenalty}
                    min={0.0}
                    max={2.0}
                    step={0.01}
                />
                <RangeSlider
                    name="Max Length"
                    value={maxLength}
                    setValue={setMaxLength}
                    min={1}
                    max={1024}
                    step={1}
                />
            </div>
        </div>
    );
}
