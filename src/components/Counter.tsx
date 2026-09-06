import { useState } from 'react';

export const Counter = () => {
	const [count, setCount] = useState(0);

	return (
		<button
			onClick={() => setCount((c) => c + 1)}
			className="px-4 py-2 bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-md hover:bg-zinc-700 transition-colors"
		>
			Count: {count}
		</button>
	);
};
