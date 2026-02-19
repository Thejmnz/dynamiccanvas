import { Minus, Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LineHeightInputProps {
    value: number;
    onChange: (value: number) => void;
};

export const LineHeightInput = ({
    value,
    onChange,
}: LineHeightInputProps) => {
    const step = 0.1;

    const increment = () => onChange(parseFloat((value + step).toFixed(2)));
    const decrement = () => onChange(parseFloat((value - step).toFixed(2)));

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = parseFloat(e.target.value);
        onChange(isNaN(value) ? 0 : value);
    };

    return (
        <div className="flex items-center">
            <Button
                onClick={decrement}
                variant="outline"
                className="p-2 rounded-r-none border-r-0"
                size="icon"
            >
                <Minus className="size-4" />
            </Button>
            <Input
                onChange={handleChange}
                value={value}
                className="w-[60px] h-8 focus-visible:ring-offset-0 focus-visible:ring-0 rounded-none text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden [-moz-appearance:textfield]"
                type="number"
                step={0.1}
            />
            <Button
                onClick={increment}
                variant="outline"
                className="p-2 rounded-l-none border-l-0"
                size="icon"
            >
                <Plus className="size-4" />
            </Button>
        </div>
    );
};
