import debounce from "lodash/debounce";
import { XCircleIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export const showOverdueSuccessToast = debounce((
	error: string,
	duration: number = 3000,
	iconSize: number = 25,
) => {
	toast.error(error, {
		duration: duration,
		style: {
			borderRadius: "12px",
			background: "#ffffff",
			color: "#1f2937",
			boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
			padding: "12px 16px",
			border: "1px solid #e5e7eb",
		},
		icon: <XCircleIcon
			style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
			className={`text-red-500 mr-2`}
		/>,
		ariaProps: { role: "alert", "aria-live": "polite" },
	});
}, 1000);
