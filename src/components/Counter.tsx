import { useState } from "react";
import { MinusIcon, PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";

export default function Counter() {
    const [count, setCount] = useState(0);

    return (
        <ButtonGroup aria-label="Counter">
            <Button
                variant="outline"
                size="icon"
                aria-label="Decrement"
                onClick={() => setCount((c) => c - 1)}
            >
                <MinusIcon />
            </Button>
            <ButtonGroupText
                className="min-w-12 justify-center font-mono text-sm tabular-nums"
                aria-live="polite"
            >
                {count}
            </ButtonGroupText>
            <Button
                variant="outline"
                size="icon"
                aria-label="Increment"
                onClick={() => setCount((c) => c + 1)}
            >
                <PlusIcon />
            </Button>
        </ButtonGroup>
    );
}
