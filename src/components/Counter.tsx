import { useState } from "react";

export default function Counter() {
    const [count, setCount] = useState(0);

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-2xl font-bold">{count}</p>
            <div className="flex gap-4">
                <button
                    className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    onClick={() => setCount(count + 1)}
                >
                    Increment
                </button>
                <button
                    className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                    onClick={() => setCount(count - 1)}
                >
                    Decrement
                </button>
            </div>
        </div>
    );
}
