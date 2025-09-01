//package edu.juanoff.taskmanager.filter;
//
//import jakarta.servlet.*;
//import jakarta.servlet.http.HttpServletResponse;
//import org.slf4j.MDC;
//import org.springframework.stereotype.Component;
//
//import java.io.IOException;
//import java.util.UUID;
//
//@Component
//public class TraceIdFilter implements Filter {
//
//    @Override
//    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
//            throws IOException, ServletException {
//        String traceId = UUID.randomUUID().toString();
//        MDC.put("traceId", traceId);
//        HttpServletResponse httpResponse = (HttpServletResponse) response;
//        httpResponse.setHeader("X-Trace-Id", traceId);
//        try {
//            chain.doFilter(request, response);
//        } finally {
//            MDC.clear();
//        }
//    }
//}
