import { AccessLevel } from "@/types/task";

export const canEditCategory = <T extends { accessLevel?: AccessLevel }>(task: T): boolean => {
	return task.accessLevel === AccessLevel.OWNER;
}
