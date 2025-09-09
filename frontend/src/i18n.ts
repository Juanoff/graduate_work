import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
	ru: {
		translation: {
			// Ошибки и success сообщения связанные с загрузкой аватарки
			FILE_EMPTY: 'Файл не может быть пустым',
			FILE_TOO_LARGE: 'Файл превышает лимит в 5 МБ',
			INVALID_FILE_NAME: 'Некорректное имя файла',
			INVALID_MIME_TYPE: 'Недопустимый тип файла (только JPEG, PNG, GIF)',
			INVALID_FILE_PATH: 'Недопустимый путь к файлу',
			INTERNAL_SERVER_ERROR: 'Произошла ошибка сервера',
			UPLOAD_SUCCESS: 'Аватар успешно загружен',
			UPLOAD_AVATAR: 'Загрузить аватар',
			TASKS_COUNT: 'Задач: {{count}}',
		},
	},
};

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources,
		fallbackLng: 'ru',
		debug: process.env.NODE_ENV === 'development',
		interpolation: {
			escapeValue: false,
		},
	});

export default i18n;
