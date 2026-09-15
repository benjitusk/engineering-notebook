import { useState } from "react";

export default function Counter() {
    const [count, setCount] = useState(0);

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-2xl font-bold">{count}</p>
            <div className="flex gap-4">
                <button
                    className="rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                    onClick={() => setCount(count + 1)}
                >
                    Increment
                </button>
                <button
                    className="rounded border border-border bg-secondary px-4 py-2 text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setCount(count - 1)}
                >
                    Decrement
                </button>
            </div>
        </div>
    );
}
