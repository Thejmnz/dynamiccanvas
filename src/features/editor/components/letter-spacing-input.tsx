import { Minus, Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LetterSpacingInputProps {
    value: number;
    onChange: (value: number) => void;
};

export const LetterSpacingInput = ({
    value,
    onChange,
}: LetterSpacingInputProps) => {
    const step = 20;
    const increment = () => onChange(value + step);
    const decrement = () => onChange(value - step);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = parseInt(e.target.value, 10);
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
                className="w-[50px] h-8 focus-visible:ring-offset-0 focus-visible:ring-0 rounded-none text-center"
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
