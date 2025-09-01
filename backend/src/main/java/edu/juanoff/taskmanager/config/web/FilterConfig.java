//package edu.juanoff.taskmanager.config.web;
//
//import edu.juanoff.taskmanager.filter.TraceIdFilter;
//import org.springframework.boot.web.servlet.FilterRegistrationBean;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//
//@Configuration
//public class FilterConfig {
//
//    @Bean
//    public FilterRegistrationBean<TraceIdFilter> traceIdFilterRegistration() {
//        FilterRegistrationBean<TraceIdFilter> registration = new FilterRegistrationBean<>();
//        registration.setFilter(new TraceIdFilter());
//        registration.addUrlPatterns("/*");
//        registration.setOrder(1);
//        return registration;
//    }
//}
