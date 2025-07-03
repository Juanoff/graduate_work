import { useState, useEffect, useRef, useCallback, memo } from "react";
import { motion } from "framer-motion";
import {
	PlayIcon,
	PauseIcon,
	ArrowPathIcon,
	ArrowRightIcon,
	Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

// Типы
interface PomodoroSettings {
	workDuration: number; // Минуты
	shortBreakDuration: number;
	longBreakDuration: number;
	rounds: number;
}

interface PomodoroState {
	time: number; // Текущее время в секундах
	initialTime: number; // Начальное время текущей фазы
	isRunning: boolean;
	lastUpdated: number;
	phase: "work" | "shortBreak" | "longBreak";
	round: number; // Текущий раунд (1–N)
	settings: PomodoroSettings;
}

// Начальное состояние
const initialPomodoroState: PomodoroState = {
	time: 25 * 60,
	initialTime: 25 * 60,
	isRunning: false,
	lastUpdated: Date.now(),
	phase: "work",
	round: 1,
	settings: {
		workDuration: 25,
		shortBreakDuration: 5,
		longBreakDuration: 15,
		rounds: 4,
	},
};

const PomodoroTimer = ({
	isOpen,
	onClose,
	minimized,
	onMinimizeToggle,
}: {
	isOpen: boolean;
	onClose: () => void;
	minimized: boolean;
	onMinimizeToggle: (minimized: boolean) => void;
}) => {
	const [isRunning, setIsRunning] = useState(false);
	const [time, setTime] = useState(initialPomodoroState.time);
	const [phase, setPhase] = useState<"work" | "shortBreak" | "longBreak">(
		initialPomodoroState.phase
	);
	const [round, setRound] = useState(initialPomodoroState.round);
	const [settings, setSettings] = useState<PomodoroSettings>(
		initialPomodoroState.settings
	);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const stateRef = useRef<PomodoroState>(
		JSON.parse(localStorage.getItem("pomodoroState") || "null") ||
		initialPomodoroState
	);

	// Синхронизация начального состояния
	useEffect(() => {
		setIsRunning(stateRef.current.isRunning);
		setTime(stateRef.current.time);
		setPhase(stateRef.current.phase);
		setRound(stateRef.current.round);
		setSettings(stateRef.current.settings);
	}, []);

	// Сохранение состояния в localStorage
	const saveState = useCallback((state: PomodoroState) => {
		stateRef.current = state;
		localStorage.setItem("pomodoroState", JSON.stringify(state));
		//console.log("State saved:", state);
	}, []);

	// Форматирование времени
	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, "0")}:${secs
			.toString()
			.padStart(2, "0")}`;
	};

	// Получение длительности для текущей фазы
	const getPhaseDuration = () => {
		switch (phase) {
			case "work":
				return settings.workDuration * 60;
			case "shortBreak":
				return settings.shortBreakDuration * 60;
			case "longBreak":
				return settings.longBreakDuration * 60;
			default:
				return settings.workDuration * 60;
		}
	};

	// Логика тика таймера
	const tick = useCallback(() => {
		if (isRunning && time > 0) {
			const newTime = time - 1;
			setTime(newTime);
			saveState({
				...stateRef.current,
				time: newTime,
				lastUpdated: Date.now(),
			});

			if (newTime === 0) {
				setIsRunning(false);
				// Определяем следующую фазу
				let nextPhase: "work" | "shortBreak" | "longBreak" = "work";
				let nextRound = round;
				if (phase === "work") {
					nextRound = round + 1;
					if (nextRound > settings.rounds) {
						nextPhase = "longBreak";
						nextRound = 1;
					} else {
						nextPhase = "shortBreak";
					}
				}
				const nextInitialTime =
					nextPhase === "work"
						? settings.workDuration * 60
						: nextPhase === "shortBreak"
							? settings.shortBreakDuration * 60
							: settings.longBreakDuration * 60;
				setPhase(nextPhase);
				setRound(nextRound);
				setTime(nextInitialTime);
				saveState({
					...stateRef.current,
					isRunning: false,
					time: nextInitialTime,
					initialTime: nextInitialTime,
					phase: nextPhase,
					round: nextRound,
					lastUpdated: Date.now(),
				});
				if (audioRef.current) {
					audioRef.current.play().catch((error) => {
						console.error("Ошибка воспроизведения звука:", error);
					});
				}
				if (Notification.permission === "granted") {
					new Notification("Pomodoro завершен!", {
						body:
							nextPhase === "work"
								? "Время перерыва закончилось. Пора работать!"
								: "Время работы закончилось. Сделайте перерыв!",
					});
				}
			} else {
				timerRef.current = setTimeout(tick, 1000);
			}
		}
	}, [isRunning, time, phase, round, settings, saveState]);

	// Обработка видимости вкладки
	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.hidden) {
				saveState({ ...stateRef.current, lastUpdated: Date.now() });
				if (timerRef.current) {
					clearTimeout(timerRef.current);
					timerRef.current = null;
				}
			} else {
				const now = Date.now();
				const elapsed = Math.floor(
					(now - stateRef.current.lastUpdated) / 1000
				);
				if (isRunning && elapsed > 0) {
					const newTime = Math.max(0, time - elapsed);
					setTime(newTime);
					saveState({
						...stateRef.current,
						time: newTime,
						lastUpdated: now,
					});
					if (newTime > 0 && !timerRef.current) {
						timerRef.current = setTimeout(tick, 1000);
					}
				}
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () =>
			document.removeEventListener("visibilitychange", handleVisibilityChange);
	}, [isRunning, time, saveState, tick]);

	// Инициализация таймера
	useEffect(() => {
		if (isRunning && !timerRef.current) {
			timerRef.current = setTimeout(tick, 1000);
		}
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
		};
	}, [isRunning, tick]);

	// Обработчик Play/Pause
	const handleTogglePlay = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			if (isRunning) {
				setIsRunning(false);
				saveState({
					...stateRef.current,
					isRunning: false,
					lastUpdated: Date.now(),
				});
				if (timerRef.current) {
					clearTimeout(timerRef.current);
					timerRef.current = null;
				}
			} else {
				setIsRunning(true);
				saveState({
					...stateRef.current,
					isRunning: true,
					lastUpdated: Date.now(),
				});
				if (!timerRef.current) {
					timerRef.current = setTimeout(tick, 1000);
				}
			}
		},
		[isRunning, saveState, tick]
	);

	// Обработчик сброса
	const handleReset = useCallback(
		(e: React.MouseEvent | null) => {
			if (e) e.stopPropagation();
			const newTime = settings.workDuration * 60;
			setIsRunning(false);
			setTime(newTime);
			setPhase("work");
			setRound(1);
			saveState({
				time: newTime,
				initialTime: newTime,
				isRunning: false,
				phase: "work",
				round: 1,
				lastUpdated: Date.now(),
				settings,
			});
			if (timerRef.current) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
		},
		[saveState, settings]
	);

	// Обработчик кнопки "Далее"
	const handleNext = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			let nextPhase: "work" | "shortBreak" | "longBreak" = "work";
			let nextRound = round;
			if (phase === "work") {
				nextRound = round + 1;
				if (nextRound > settings.rounds) {
					nextPhase = "longBreak";
					nextRound = 1;
				} else {
					nextPhase = "shortBreak";
				}
			}
			const nextInitialTime =
				nextPhase === "work"
					? settings.workDuration * 60
					: nextPhase === "shortBreak"
						? settings.shortBreakDuration * 60
						: settings.longBreakDuration * 60;
			setIsRunning(false);
			setTime(nextInitialTime);
			setPhase(nextPhase);
			setRound(nextRound);
			saveState({
				...stateRef.current,
				time: nextInitialTime,
				initialTime: nextInitialTime,
				isRunning: false,
				phase: nextPhase,
				round: nextRound,
				lastUpdated: Date.now(),
			});
			if (timerRef.current) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
		},
		[phase, round, settings, saveState]
	);

	// Обработчик изменения настроек
	const handleSettingsChange = (key: keyof PomodoroSettings, value: number) => {
		const newSettings = { ...settings, [key]: value };
		setSettings(newSettings);
		// Если текущая фаза зависит от измененной настройки, обновляем время
		const newInitialTime = getPhaseDuration();
		setTime(newInitialTime);
		saveState({
			...stateRef.current,
			settings: newSettings,
			time: newInitialTime,
			initialTime: newInitialTime,
			lastUpdated: Date.now(),
		});
	};

	if (!isOpen) return null;

	return (
		<motion.div
			className={`fixed bottom-4 right-4 ${minimized ? "w-64" : "w-80"
				} bg-white rounded-lg shadow-xl border ${isRunning ? "border-red-500" : "border-gray-300"
				}`}
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.8 }}
			transition={{ duration: 0.2 }}
		>
			<div className="p-2 bg-gray-100 rounded-t-lg flex items-center">
				<span className="text-sm ml-1">🍅</span>
				<span className="text-sm font-semibold text-gray-800 ml-2">
					Таймер
				</span>
				<button
					onClick={() => setIsSettingsOpen(true)}
					className="absolute top-2 right-14 ml-auto text-gray-500 hover:text-gray-700"
					aria-label="Открыть настройки"
				>
					<Cog6ToothIcon className="w-4 h-4" />
				</button>
			</div>
			<audio ref={audioRef} src="/sounds/notification_v2.mp3" preload="auto" />
			{minimized ? (
				<div className="flex items-center justify-center h-12 text-gray-800 font-semibold">
					<span>{formatTime(time)}</span>
					<button
						onClick={() => onMinimizeToggle(false)}
						className="absolute top-2 right-8 text-gray-500 hover:text-blue-700 ml-2"
						aria-label="Раскрыть таймер"
					>
						<svg
							className="w-4 h-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M12 4v16m8-8H4"
							/>
						</svg>
					</button>
					<button
						onClick={() => {
							onClose();
							handleReset(null);
						}}
						className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
						aria-label="Закрыть таймер"
					>
						<svg
							className="w-4 h-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
					<div className="flex gap-2 justify-center ml-6">
						<button
							onClick={handleReset}
							className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 disabled:hover:bg-gray-400"
							aria-label="Сбросить таймер"
						>
							<ArrowPathIcon className="w-4 h-4" />
						</button>
						<motion.button
							onClick={handleTogglePlay}
							className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 disabled:bg-gray-400 disabled:hover:bg-gray-400"
							aria-label={isRunning ? "Поставить на паузу" : "Запустить таймер"}
							whileTap={{ scale: 0.9 }}
						>
							{isRunning ? (
								<PauseIcon className="w-4 h-4" />
							) : (
								<PlayIcon className="w-4 h-4" />
							)}
						</motion.button>
						<button
							onClick={handleNext}
							disabled={isRunning}
							className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 disabled:bg-gray-400 disabled:hover:bg-gray-400"
							aria-label="Следующая фаза"
						>
							<ArrowRightIcon className="w-4 h-4" />
						</button>
					</div>
				</div>
			) : (
				<div className="p-4">
					<button
						onClick={() => onMinimizeToggle(true)}
						className="absolute top-2 right-8 text-gray-500 hover:text-blue-700"
						aria-label="Скрыть таймер"
					>
						<svg
							className="w-4 h-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M20 12H4"
							/>
						</svg>
					</button>
					<button
						onClick={() => {
							onClose();
							handleReset(null);
						}}
						className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
						aria-label="Закрыть таймер"
					>
						<svg
							className="w-4 h-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
					<div className="relative w-24 h-24 mx-auto mb-4">
						<CircularProgressbar
							value={(time / stateRef.current.initialTime) * 100}
							text={formatTime(time)}
							styles={buildStyles({
								pathColor: isRunning ? "#ef4444" : "#3b82f6",
								textColor: "#111827",
								trailColor: "#e5e7eb",
								textSize: "20px",
								pathTransitionDuration: 0.5,
							})}
						/>
					</div>
					<div className="text-center mb-4 text-sm text-gray-600">
						{phase === "work"
							? `Работа, раунд ${round}/${settings.rounds}`
							: phase === "shortBreak"
								? "Короткий перерыв"
								: "Длинный перерыв"}
					</div>
					<div className="flex gap-4 justify-center mb-4">
						<button
							onClick={handleReset}
							className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 disabled:hover:bg-gray-400"
							aria-label="Сбросить таймер"
						>
							<ArrowPathIcon className="w-6 h-6" />
						</button>
						<motion.button
							onClick={handleTogglePlay}
							className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 disabled:bg-gray-400 disabled:hover:bg-gray-400"
							aria-label={isRunning ? "Поставить на паузу" : "Запустить таймер"}
							whileTap={{ scale: 0.9 }}
						>
							{isRunning ? (
								<PauseIcon className="w-6 h-6" />
							) : (
								<PlayIcon className="w-6 h-6" />
							)}
						</motion.button>
						<button
							onClick={handleNext}
							disabled={isRunning}
							className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 disabled:bg-gray-400 disabled:hover:bg-gray-400"
							aria-label="Следующая фаза"
						>
							<ArrowRightIcon className="w-6 h-6" />
						</button>
					</div>
					{/* Панель настроек */}
					{isSettingsOpen && (
						<motion.div
							className="absolute top-0 left-0 w-full h-full bg-white rounded-lg p-5 shadow-lg"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 20 }}
						>
							<div className="flex flex-col h-full">
								<div className="flex justify-between items-center mb-4">
									<h3 className="text-lg font-semibold">Настройки</h3>
									<button
										onClick={() => setIsSettingsOpen(false)}
										className="text-gray-500 hover:text-red-600"
										aria-label="Закрыть настройки"
									>
										<svg
											className="w-4 h-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</div>
								<div className="space-y-2 overflow-y-auto max-h-[70vh] pr-5">
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Работа ({settings.workDuration} мин)
										</label>
										<input
											type="range"
											min="5"
											max="60"
											step="5"
											value={settings.workDuration}
											onChange={(e) =>
												handleSettingsChange("workDuration", Number(e.target.value))
											}
											className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Короткий перерыв ({settings.shortBreakDuration} мин)
										</label>
										<input
											type="range"
											min="1"
											max="15"
											step="1"
											value={settings.shortBreakDuration}
											onChange={(e) =>
												handleSettingsChange(
													"shortBreakDuration",
													Number(e.target.value)
												)
											}
											className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Длинный перерыв ({settings.longBreakDuration} мин)
										</label>
										<input
											type="range"
											min="10"
											max="60"
											step="5"
											value={settings.longBreakDuration}
											onChange={(e) =>
												handleSettingsChange(
													"longBreakDuration",
													Number(e.target.value)
												)
											}
											className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Раунды ({settings.rounds})
										</label>
										<input
											type="range"
											min="1"
											max="8"
											step="1"
											value={settings.rounds}
											onChange={(e) =>
												handleSettingsChange("rounds", Number(e.target.value))
											}
											className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
										/>
									</div>
								</div>
							</div>
						</motion.div>
					)}
				</div>
			)}
		</motion.div>
	);
};

export default memo(PomodoroTimer);
