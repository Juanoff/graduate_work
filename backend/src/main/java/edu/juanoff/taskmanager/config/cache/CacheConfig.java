package edu.juanoff.taskmanager.config.cache;

import com.github.benmanes.caffeine.cache.Caffeine;
import edu.juanoff.taskmanager.util.CacheNames;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.time.Duration;
import java.util.Arrays;

@Configuration
@EnableCaching
@Slf4j
public class CacheConfig {

    @Value("${cache.caffeine.expire-after-write:10m}")
    private String expireAfterWrite;

    @Value("${cache.caffeine.maximum-size:1000}")
    private long maximumSize;

    @Bean
    public CacheManager cacheManager() {
        try {
            CaffeineCacheManager cacheManager = new CaffeineCacheManager();
            cacheManager.setCacheNames(Arrays.asList(CacheNames.TASK_OWNERSHIP, CacheNames.TASK_ACCESS));

            Caffeine<Object, Object> caffeine = Caffeine.newBuilder()
                    .expireAfterWrite(Duration.parse("PT" + expireAfterWrite.toUpperCase()))
                    .maximumSize(maximumSize)
                    .recordStats();

            cacheManager.setCaffeine(caffeine);
            log.info("CacheManager configured with names: {}, expireAfterWrite: {}, maximumSize: {}",
                    Arrays.asList(CacheNames.TASK_OWNERSHIP, CacheNames.TASK_ACCESS), expireAfterWrite, maximumSize);

            return cacheManager;
        } catch (Exception e) {
            log.error("Failed to configure CacheManager", e);
            throw new IllegalStateException("Cache configuration failed", e);
        }
    }
}
