import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon, ChevronUpIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { Category } from "@/types/task";

interface CategoryFilterProps {
	categories: Category[];
	authUserId: number;
	setEditCategory: (category: Category | null) => void;
	setNewCategory: (category: { name: string; color: string }) => void;
	setIsCategoryModalOpen: (open: boolean) => void;
	handleDeleteItem: (type: "category", id: number) => void;
}

const CategoryFilter = ({
	categories,
	authUserId,
	setEditCategory,
	setNewCategory,
	setIsCategoryModalOpen,
	handleDeleteItem,
}: CategoryFilterProps) => {
	const [isOwnedOpen, setIsOwnedOpen] = useState(true);
	const [isSharedOpen, setIsSharedOpen] = useState(true);
	const ownedCategories = categories.filter((cat) => cat.isOwned);
	const sharedCategories = categories.filter((cat) => !cat.isOwned);
	const [showOwnedGradient, setShowOwnedGradient] = useState(false);
	const [showSharedGradient, setShowSharedGradient] = useState(false);
	const [showOwnedTopGradient, setShowOwnedTopGradient] = useState(false);
	const [showSharedTopGradient, setShowSharedTopGradient] = useState(false);
	// const [isOwnedAtBottom, setIsOwnedAtBottom] = useState(false);
	// const [isSharedAtBottom, setIsSharedAtBottom] = useState(false);
	const ownedRef = useRef<HTMLDivElement>(null);
	const sharedRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (ownedRef.current) {
			const { scrollHeight, clientHeight } = ownedRef.current;
			setShowOwnedGradient(scrollHeight > clientHeight && ownedCategories.length > 0);
		}
		if (sharedRef.current) {
			const { scrollHeight, clientHeight } = sharedRef.current;
			setShowSharedGradient(scrollHeight > clientHeight && sharedCategories.length > 0);
		}
	}, [categories, ownedCategories.length, sharedCategories.length]);

	if (authUserId == 0) {
		console.log("Пользователь не авторизован")
		return;
	}

	const handleToggleOwned = () => setIsOwnedOpen(!isOwnedOpen);
	const handleToggleShared = () => setIsSharedOpen(!isSharedOpen);

	const handleOwnedScroll = () => {
		if (ownedRef.current) {
			const { scrollTop, scrollHeight, clientHeight } = ownedRef.current;
			const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
			const isAtTop = scrollTop <= 1;
			setShowOwnedGradient(scrollHeight > clientHeight && !isAtBottom);
			setShowOwnedTopGradient(scrollHeight > clientHeight && !isAtTop);
		}
	};

	// Отслеживание прокрутки для "Доступные категории"
	const handleSharedScroll = () => {
		if (sharedRef.current) {
			const { scrollTop, scrollHeight, clientHeight } = sharedRef.current;
			const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
			const isAtTop = scrollTop <= 1;
			setShowSharedGradient(scrollHeight > clientHeight && !isAtBottom);
			setShowSharedTopGradient(scrollHeight > clientHeight && !isAtTop);
		}
	};

	return (
		<motion.div
			initial={{ x: -50, opacity: 0 }}
			animate={{ x: 0, opacity: 1 }}
			transition={{ duration: 0.3 }}
			className="rounded-l-lg w-72 p-6 bg-white shadow-lg flex-shrink-0"
		>
			{/* Мои категории */}
			<div className="relative mb-4">
				<button
					onClick={handleToggleOwned}
					className={`ml-2 text-xl font-semibold text-gray-800 flex items-center justify-between w-full ${ownedCategories.length > 0 ? "mb-4" : ""}`}
				>
					Мои категории
					{isOwnedOpen ? (
						<ChevronUpIcon className={`w-5 h-5 text-gray-500 mr-4`} /> // ${ownedCategories.length > 5 ? "mr-2" : "mr-4"}
					) : (
						<ChevronDownIcon className={`w-5 h-5 text-gray-500 mr-4`} />
					)}
				</button>
				<AnimatePresence>
					{isOwnedOpen && (
						<motion.div
							initial={{ height: 0 }}
							animate={{ height: "auto" }}
							exit={{ height: 0 }}
							transition={{ duration: 0.2 }}
							className="relative overflow-hidden"
						>
							<div
								ref={ownedRef}
								onScroll={handleOwnedScroll}
								className={`relative max-h-[290px] overflow-y-auto no-scrollbar`}
							>
								<ul className="space-y-3">
									{ownedCategories.map((category) => (
										<li
											key={category.id}
											className={`flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer`}
											onClick={() => {
												setEditCategory(category);
												setNewCategory({
													name: category.name,
													color: category.color,
												});
												setIsCategoryModalOpen(true);
											}}
										>
											<div className="flex items-center gap-2">
												<span
													className="w-3 h-3 rounded-full"
													style={{ backgroundColor: category.color }}
												/>
												<span className="ml-1 text-gray-700 line-clamp-1">{category.name}</span>
											</div>
											<button
												onClick={(e) => {
													e.stopPropagation();
													handleDeleteItem("category", category.id);
												}}
												className="text-gray-500 hover:text-red-600 transition-colors ml-auto"
											>
												<TrashIcon className="w-4 h-4" />
											</button>
										</li>
									))}
								</ul>
							</div>
							<div
								className={`absolute top-0 left-0 right-0 h-14 bg-gradient-to-b from-white to-transparent pointer-events-none transition-opacity duration-200 ${showOwnedTopGradient ? "opacity-100" : "opacity-0"
									}`}
							/>
							<div
								className={`absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-white to-transparent pointer-events-none transition-opacity duration-200 ${showOwnedGradient ? "opacity-100" : "opacity-0"
									}`}
							/>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			<button
				onClick={() => {
					setEditCategory(null);
					setNewCategory({ name: "", color: "#000000" });
					setIsCategoryModalOpen(true);
				}}
				className="mt-1 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
			>
				Новая категория
			</button>

			{/* Доступные категории */}
			{sharedCategories.length > 0 && (
				<div className="relative mt-8">
					<button
						onClick={handleToggleShared}
						className={`ml-2 text-xl font-semibold text-gray-800 flex items-center justify-between w-full ${sharedCategories.length > 0 ? "mb-4" : ""}`}
					>
						Доступные
						{isSharedOpen ? (
							<ChevronUpIcon className={`w-5 h-5 text-gray-500 mr-4`} />
						) : (
							<ChevronDownIcon className={`w-5 h-5 text-gray-500 mr-4`} />
						)}
					</button>
					<AnimatePresence>
						{isSharedOpen && (
							<motion.div
								initial={{ height: 0 }}
								animate={{ height: "auto" }}
								exit={{ height: 0 }}
								transition={{ duration: 0.2 }}
								className="relative overflow-hidden"
							>
								<div
									ref={sharedRef}
									onScroll={handleSharedScroll}
									className={`relative max-h-[290px] overflow-y-auto no-scrollbar`}
								>
									<ul
										className={`space-y-3`}
									>
										{sharedCategories.map((category) => (
											<li
												key={category.id}
												className={`flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors`}
											>
												<div className="flex items-center gap-2">
													<span
														className="w-3 h-3 rounded-full"
														style={{ backgroundColor: category.color }}
													/>
													<span className="ml-1 text-gray-700 line-clamp-1">{category.name}</span>
												</div>
												<EyeIcon className="w-4 h-4 text-gray-400" title="Только просмотр" />
											</li>
										))}
									</ul>
								</div>
								<div
									className={`absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-white to-transparent pointer-events-none transition-opacity duration-200 ${showSharedTopGradient ? "opacity-100" : "opacity-0"
										}`}
								/>
								<div
									className={`absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none transition-opacity duration-200 ${showSharedGradient ? "opacity-100" : "opacity-0"
										}`}
								/>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			)}
		</motion.div >
	);
};

export default CategoryFilter;
