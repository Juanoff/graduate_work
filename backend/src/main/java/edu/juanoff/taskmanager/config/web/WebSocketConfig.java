package edu.juanoff.taskmanager.config.web;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("https://graduate-work-frontend.onrender.com")
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            @NonNull
            public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
                StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    if (auth != null && auth.isAuthenticated()) {
                        accessor.setUser(auth);
                    }
                }
                return message;
            }
        });
    }

//    @Override
//    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
//        registration.addDecoratorFactory(new WebSocketHandlerDecoratorFactory() {
//            @Override
//            public WebSocketHandler decorate(WebSocketHandler handler) {
//                return new LoggingWebSocketHandlerDecorator(handler) {
//                    @Override
//                    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
//                        if (exception instanceof IOException &&
//                                exception.getMessage().contains("Программа на вашем хост-компьютере разорвала установленное подключение")) {
//                            log.debug("Client disconnected gracefully: {}", session.getId());
//                            return; // Подавляем исключение
//                        }
//                        super.handleTransportError(session, exception);
//                    }
//
//                    @Override
//                    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
//                        log.debug("WebSocket connection closed: {} with status {}", session.getId(), closeStatus);
//                        super.afterConnectionClosed(session, closeStatus);
//                    }
//                };
//            }
//        });
//    }
}
