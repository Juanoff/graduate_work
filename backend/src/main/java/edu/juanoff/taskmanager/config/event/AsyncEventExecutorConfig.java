package edu.juanoff.taskmanager.config.event;

import edu.juanoff.taskmanager.util.AsyncExecutorNames;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

@Configuration
@Slf4j
public class AsyncEventExecutorConfig {

    @Value("${achievement.executor.core-pool-size:2}")
    private int corePoolSize;

    @Value("${achievement.executor.max-pool-size:4}")
    private int maxPoolSize;

    @Value("${achievement.executor.queue-capacity:50}")
    private int queueCapacity;

    @Value("${achievement.executor.thread-name-prefix:Achievements-}")
    private String threadNamePrefix;

    @Bean(AsyncExecutorNames.ACHIEVEMENT)
    public Executor achievementTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(corePoolSize);
        executor.setMaxPoolSize(maxPoolSize);
        executor.setQueueCapacity(queueCapacity);
        executor.setThreadNamePrefix(threadNamePrefix);
        executor.setRejectedExecutionHandler((r, e) -> {
            log.warn("Achievements executor rejected task: {}", r);
            new ThreadPoolExecutor.CallerRunsPolicy().rejectedExecution(r, e);
        });
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        executor.initialize();
        return executor;
    }
}
