import scrollbarPlugin from "tailwind-scrollbar";

module.exports = {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	safelist: [
		'text-orange-500',
		'text-red-600',
		'text-gray-500',
		'peer',
		'peer-checked',
		'translate-x-5',
		'transition',
		'duration-200',
		'ease-in-out',
	],
	theme: {
		extend: {
			colors: {
				background: "var(--background)",
				foreground: "var(--foreground)",
			},
			animation: {
				glow: "glow 1.5s infinite alternate ease-in-out",
			},
			// keyframes: {
			// 	glow: {
			// 		"0%": { filter: "brightness(100%)" },
			// 		"100%": { filter: "brightness(180%)" },
			// 	},
			// },
		},
	},
	plugins: [
		scrollbarPlugin({ nocompatible: true }),
	],
};
