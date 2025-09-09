import toast from 'react-hot-toast';
import { XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';

type ToastType = 'success' | 'error';

interface ToastOptions {
	duration?: number;
	iconSize?: number;
}

export const showToast = debounce(
	(type: ToastType, messageKey: string, options: ToastOptions = {}) => {
		const { duration = 3000, iconSize = 25 } = options;
		const { t } = useTranslation();

		const toastConfig = {
			duration,
			style: {
				borderRadius: '12px',
				background: '#ffffff',
				color: '#1f2937',
				boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
				padding: '12px 16px',
				border: '1px solid #e5e7eb',
			},
			ariaProps: { role: 'alert', 'aria-live': 'polite' } as const,
		};

		const iconMap = {
			success: (
				<CheckCircleIcon
					style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
					className="text-green-500 mr-2"
				/>
			),
			error: (
				<XCircleIcon
					style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
					className="text-red-500 mr-2"
				/>
			),
		};

		toast[type](t(messageKey, { defaultValue: messageKey }), {
			...toastConfig,
			icon: iconMap[type],
		});
	},
	1000,
	{ leading: true, trailing: false }
);
