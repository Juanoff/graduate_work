package edu.juanoff.taskmanager.service;

import edu.juanoff.taskmanager.dto.user.UserAchievementResponseDTO;
import edu.juanoff.taskmanager.entity.Achievement;
import edu.juanoff.taskmanager.entity.User;
import edu.juanoff.taskmanager.entity.UserAchievement;
import edu.juanoff.taskmanager.event.AchievementsUpdatedEvent;
import edu.juanoff.taskmanager.handler.*;
import edu.juanoff.taskmanager.mapper.UserAchievementMapper;
import edu.juanoff.taskmanager.repository.UserAchievementRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserAchievementService {

    private final UserAchievementRepository userAchievementRepository;
    private final UserAchievementMapper userAchievementMapper;
    private final List<AchievementHandler> achievementHandlerList;
    private Map<String, AchievementHandler> achievementHandlers;

    @PostConstruct
    public void initAchievementHandlers() {
        achievementHandlers = new HashMap<>();
        achievementHandlers.put(AchievementName.NEWBIE.getDisplayName(), findHandler(NewbieAchievementHandler.class));
        achievementHandlers.put(AchievementName.DEADLINE_MASTER.getDisplayName(), findHandler(DeadlineMasterAchievementHandler.class));
        achievementHandlers.put(AchievementName.SPRINTER.getDisplayName(), findHandler(SprintAchievementHandler.class));
        achievementHandlers.put(AchievementName.PLANNER.getDisplayName(), findHandler(PlannerAchievementHandler.class));
        achievementHandlers.put(AchievementName.CATEGORIZER.getDisplayName(), findHandler(CategorizerAchievementHandler.class));
        achievementHandlers.put(AchievementName.PRIORITY_GURU.getDisplayName(), findHandler(PriorityGuruAchievementHandler.class));
    }

    //achievementHandlers.put(AchievementName.SUBTASK_KING, findHandler(SubtaskKingAchievementHandler.class));
    //achievementHandlers.put(AchievementName.NIGHT_WATCHER, findHandler(NightWatcherAchievementHandler.class));
    //achievementHandlers.put(AchievementName.EPIC_FINISH, findHandler(EpicFinishAchievementHandler.class));

    private AchievementHandler findHandler(Class<? extends AchievementHandler> handlerClass) {
        return achievementHandlerList.stream()
                .filter(handlerClass::isInstance)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Handler not found for " + handlerClass.getSimpleName()));
    }

    @Transactional
    public void createUserAchievement(User user, Achievement savedAchievement) {
        UserAchievement userAchievement = UserAchievement.builder()
                .user(user)
                .achievement(savedAchievement)
                .build();
        userAchievementRepository.save(userAchievement);
    }

    @Transactional(readOnly = true)
    public List<UserAchievementResponseDTO> getUserAchievements(Long userId) {
        return userAchievementRepository.findByUserId(userId)
                .stream()
                .map(userAchievementMapper::toDto)
                .toList();
    }

    public void processAchievementUpdate(AchievementsUpdatedEvent event) {
        List<UserAchievement> userAchievements = userAchievementRepository.findByUserId(event.userId());

        for (UserAchievement userAchievement : userAchievements) {
            if (!userAchievement.getCompleted()) {
                AchievementHandler handler = achievementHandlers.get(userAchievement.getAchievement().getName());
                if (handler != null) {
                    handler.handle(userAchievement, event.currentTask(), event.newTask(), event.action());
                    userAchievementRepository.save(userAchievement);
                }
            }
        }
    }
}
