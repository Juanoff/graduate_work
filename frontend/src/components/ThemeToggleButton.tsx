"use client";

import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeToggleButton({ isDarkMode, toggleDarkMode }: { isDarkMode: boolean, toggleDarkMode: () => void }) {
	return (
		<button
			onClick={toggleDarkMode}
			className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-yellow-400 focus:outline-none flex items-center"
			aria-label="Переключить тему"
		>
			<AnimatePresence mode="wait" initial={false}>
				<motion.div
					key={isDarkMode ? "moon" : "sun"}
					initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
					animate={{ opacity: 1, rotate: 0, scale: 1 }}
					exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
					transition={{ duration: 0.25 }}
				>
					{isDarkMode ? (
						<MoonIcon className="w-5 h-5 sm:w-6 sm:h-6" />
					) : (
						<SunIcon className="w-5 h-5 sm:w-6 sm:h-6" />
					)}
				</motion.div>
			</AnimatePresence>
		</button>
	);
}
