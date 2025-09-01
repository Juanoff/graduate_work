import { z } from "zod";

export const userUpdateSchema = z
	.object({
		username: z.string().min(3, "Минимум 3 символа").max(50, "Максимум 50 символов").optional(),
		bio: z.string().max(160, "Максимум 160 символов").nullable().optional(),
		email: z.string().email("Некорректный email").optional(),
		currentPassword: z.string().optional(),
		newPassword: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		if (data.currentPassword && !data.newPassword) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["newPassword"],
				message: "Введите новый пароль, если указан текущий",
			});
		}
		if (data.newPassword && (data.newPassword.length < 8 || data.newPassword.length > 100)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["newPassword"],
				message: "Новый пароль должен быть от 8 до 100 символов",
			});
		}
	});

export type UserUpdateForm = z.infer<typeof userUpdateSchema>;