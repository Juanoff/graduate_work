package edu.juanoff.taskmanager.config.scheduler;

import edu.juanoff.taskmanager.util.AsyncExecutorNames;
import lombok.extern.slf4j.Slf4j;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.Semaphore;
import java.util.concurrent.ThreadPoolExecutor;

@Configuration
@Slf4j
public class SchedulerConfig implements AsyncConfigurer {

    @Value("${notification.executor.core-pool-size:4}")
    private int corePoolSize;

    @Value("${notification.executor.max-pool-size:8}")
    private int maxPoolSize;

    @Value("${notification.executor.queue-capacity:100}")
    private int queueCapacity;

    @Value("${notification.executor.thread-name-prefix:Notification-}")
    private String threadNamePrefix;

    @Value("${notification.executor.max-concurrent-users:20}")
    private int maxConcurrentUsers;

    @Bean
    public Semaphore notificationConcurrencySemaphore() {
        return new Semaphore(maxConcurrentUsers);
    }

    @Bean(AsyncExecutorNames.NOTIFICATION)
    public Executor taskExecutor() {
        if (corePoolSize <= 0) {
            throw new IllegalArgumentException("corePoolSize must be greater than 0");
        }
        if (maxPoolSize <= 0 || maxPoolSize < corePoolSize) {
            throw new IllegalArgumentException("maxPoolSize must be greater than 0 and not less than corePoolSize");
        }
        if (queueCapacity < 0) {
            throw new IllegalArgumentException("queueCapacity must not be less than 0");
        }

        return getThreadPoolTaskExecutor();
    }

    private Executor getThreadPoolTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(corePoolSize);
        executor.setMaxPoolSize(maxPoolSize);
        executor.setQueueCapacity(queueCapacity);
        executor.setThreadNamePrefix(threadNamePrefix);
        executor.setRejectedExecutionHandler((r, e) -> {
            log.warn("Task rejected: {}", r);
            new ThreadPoolExecutor.CallerRunsPolicy().rejectedExecution(r, e);
        });
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        executor.setBeanName("notificationTaskExecutor");
        executor.initialize();
        return executor;
    }

    @Override
    @NonNull
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return (ex, method, params) -> log.error("Async error in method {} with params {}: {}",
                method, params, ex.getMessage(), ex);
    }
}
