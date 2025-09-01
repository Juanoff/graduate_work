package edu.juanoff.taskmanager.filter;

import edu.juanoff.taskmanager.entity.Task;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class TaskSpecificationBuilder {

    public Specification<Task> build(TaskSearchRequestDTO request) {
        Specification<Task> spec = Specification.where(((root, q, cb) -> cb.isNull(root.get("parentTask"))));
        LocalDate today = LocalDate.now();

        if (request.query() != null && !request.query().isEmpty()) {
            String lowerQuery = "%" + request.query().toLowerCase() + "%";
            spec = spec.and((root, q, cb) ->
                    cb.or(
                            cb.like(cb.lower(root.get("title")), lowerQuery),
                            cb.like(cb.lower(root.get("description")), lowerQuery)
                    ));
        }

        if (request.status() != null) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("status"), request.status()));
        }

        if (request.priority() != null) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("priority"), request.priority()));
        }

        if (request.categoryId() != null) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("category").get("id"), request.categoryId()));
        }

        if (request.dueDateFilter() != null) {
            spec = switch (request.dueDateFilter()) {
                case "today" -> spec.and((root, q, cb) -> cb.equal(root.get("dueDate"), today));
                case "week" -> spec.and((root, q, cb) -> cb.between(root.get("dueDate"), today, today.plusDays(7)));
                case "overdue" -> spec.and((root, q, cb) -> cb.and(
                        cb.isNotNull(root.get("dueDate")),
                        cb.lessThan(root.get("dueDate"), today)));
                case "noDate" -> spec.and((root, q, cb) -> cb.isNull(root.get("dueDate")));
                default -> spec;
            };
        }

        if (request.accessLevel() != null && request.userId() != null) {
            spec = spec.and((root, q, cb) -> cb.and(
                    cb.equal(root.join("taskAccesses").get("user").get("id"), request.userId()),
                    cb.equal(root.join("taskAccesses").get("accessLevel"), request.accessLevel())));
        } else if (request.userId() != null) {
            spec = spec.and((root, q, cb) ->
                    cb.equal(root.join("taskAccesses").get("user").get("id"), request.userId()));
        }

        return spec;
    }
}
