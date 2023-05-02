import React from "react";

interface RangeSliderProps {
    name: string;
    value: number;
    setValue: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
}

export default function RangeSlider(props: RangeSliderProps) {
    const { name, value, setValue, min, max, step } = props;

    return (
        <div>
            <div className="flex flex-row justify-between items-center">
                <label
                    htmlFor={name}
                    className="mr-2 mb-2 text-white text-sm font-light mr-auto"
                >
                    {name}
                </label>
                <input
                    type="number"
                    className="mr-2 w-16 mb-2 text-white bg-transparent text-lg font-normal ml-auto text-center border-zinc-700 border rounded-md"
                    value={value}
                    onChange={(e) => {
                        setValue(parseFloat(e.target.value));
                    }}
                />
            </div>
            <input
                id={name}
                type="range"
                defaultValue={1.0}
                min={min ? min : 0.0}
                max={max ? max : 100.0}
                step={step ? step : 1.0}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-400"
                onChange={(e) => {
                    setValue(parseFloat(e.target.value));
                }}
                value={value}
            ></input>
        </div>
    );
}
