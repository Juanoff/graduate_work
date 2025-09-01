package edu.juanoff.taskmanager.handler;

import lombok.Getter;

@Getter
public enum AchievementName {
    NEWBIE("Новичок"),
    DEADLINE_MASTER("Мастер дедлайнов"),
    SPRINTER("Спринтер"),
    PLANNER("Планировщик"),
    CATEGORIZER("Категоризатор"),
    PRIORITY_GURU("Приоритетный гуру"),
    SUBTASK_KING("Подзадачный король"),
    NIGHT_WATCHER("Ночной страж"),
    EPIC_FINISH("Эпический финиш");

    private final String displayName;

    AchievementName(String displayName) {
        this.displayName = displayName;
    }
}
