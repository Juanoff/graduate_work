import Link from "next/link";
import { FaGithub, FaTelegram } from "react-icons/fa";

const Footer = () => {
	return (
		<footer className="mt-8 py-10 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm">
			<div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center">
				<p className="mb-2 sm:mb-0">
					© {new Date().getFullYear()} Task Tracker. Все права защищены.
				</p>
				<div className="flex items-center space-x-6">
					<div className="flex space-x-4">
						<Link
							href="/about"
							className="hover:text-blue-600 dark:hover:text-blue-400 transition"
						>
							О проекте
						</Link>
						<Link
							href="/help"
							className="hover:text-blue-600 dark:hover:text-blue-400 transition"
						>
							Помощь
						</Link>
						<Link
							href="/privacy"
							className="hover:text-blue-600 dark:hover:text-blue-400 transition"
						>
							Конфиденциальность
						</Link>
					</div>
					<div className="flex space-x-4 ml-4">
						<a
							href="https://github.com/Juanoff/graduate_work"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="GitHub"
							className="text-gray-600 dark:text-gray-400 hover:text-[#181717] transition"
						>
							<FaGithub className="w-5 h-5" />
						</a>
						<a
							href="https://t.me/somekeks"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Telegram"
							className="text-gray-600 dark:text-gray-400 hover:text-[#0088cc] transition"
						>
							<FaTelegram className="w-5 h-5" />
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
