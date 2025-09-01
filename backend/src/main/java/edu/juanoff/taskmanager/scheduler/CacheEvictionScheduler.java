package edu.juanoff.taskmanager.scheduler;

import edu.juanoff.taskmanager.util.CacheNames;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class CacheEvictionScheduler {

    @Value("${cache.eviction.enabled:true}")
    private boolean enabled;

    @Scheduled(fixedRateString = "${cache.eviction.interval:3600000}")
    public void evictCaches() {
        if (!enabled) return;

        try {
            evictTaskOwnershipCache();
        } catch (Exception e) {
            log.error("Cache eviction failed", e);
        }
    }

    @CacheEvict(value = CacheNames.TASK_OWNERSHIP, allEntries = true)
    public void evictTaskOwnershipCache() {
        log.info("Task ownership cache evicted");
    }
}
