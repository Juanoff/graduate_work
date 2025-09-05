import { z } from "zod";

export const registrationSchema = z
	.object({
		username: z.string()
			.min(3, "Минимум 3 символа")
			.max(50, "Максимум 50 символов"),
		email: z.string().email("Некорректный email"),
		password: z.string()
			.min(8, "Пароль должен содержать минимум 8 символов")
			.regex(/[A-Za-z]/, "Пароль должен содержать хотя бы одну букву")
			.regex(/\d/, "Пароль должен содержать хотя бы одну цифру"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Пароли не совпадают",
		path: ["confirmPassword"],
	});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
