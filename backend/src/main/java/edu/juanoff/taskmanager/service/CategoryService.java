package edu.juanoff.taskmanager.service;

import edu.juanoff.taskmanager.dto.category.CategoryRequestDTO;
import edu.juanoff.taskmanager.dto.category.CategoryResponseDTO;
import edu.juanoff.taskmanager.entity.Category;
import edu.juanoff.taskmanager.entity.Task;
import edu.juanoff.taskmanager.entity.User;
import edu.juanoff.taskmanager.exception.ResourceNotFoundException;
import edu.juanoff.taskmanager.mapper.CategoryMapper;
import edu.juanoff.taskmanager.repository.CategoryRepository;
import edu.juanoff.taskmanager.repository.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final UserService userService;
    private final TaskRepository taskRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponseDTO> getAllCategories(Long userId) {
        List<Category> userCategories = categoryRepository.findByUserId(userId);
//        List<Task> accessibleTasks = taskRepository.findAllAccessibleTasks(userId);
//        List<Category> accessibleCategories = accessibleTasks.stream()
//                .map(Task::getCategory)
//                .filter(Objects::nonNull)
//                .distinct()
//                .toList();

        Set<Category> allCategories = new LinkedHashSet<>(userCategories);
        // allCategories.addAll(userCategories);
       // allCategories.addAll(accessibleCategories);

        return allCategories.stream()
                .map(category -> CategoryResponseDTO.fromEntity(category, userId))
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponseDTO getCategoryByIdAndUserId(Long id, Long userId) {
        Category category = categoryRepository.findByIdAndUserId(id, userId)
                .orElseGet(() -> {
                    List<Task> accessibleTasks = taskRepository.findAllAccessibleTasks(userId);
                    Optional<Category> cat = accessibleTasks.stream()
                            .map(Task::getCategory)
                            .filter(Objects::nonNull)
                            .distinct()
                            .filter(c -> Objects.equals(c.getId(), id))
                            .findFirst();
                    return cat.orElse(null);
                });

        if (category == null) {
            throw new EntityNotFoundException("Task not found");
        }

        return CategoryResponseDTO.fromEntity(category, userId);
    }

    @Transactional
    public CategoryResponseDTO createCategory(CategoryRequestDTO categoryDto, Long userId) {
        User user = userService.getUserById(userId);
        Category category = categoryMapper.toEntity(categoryDto);
        category.setUser(user);
        return CategoryResponseDTO.fromEntity(categoryRepository.save(category), userId);
    }

    @Transactional
    public CategoryResponseDTO updateCategory(Long id, CategoryRequestDTO categoryDto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        categoryMapper.updateEntityFromDto(categoryDto, category);
        return CategoryResponseDTO.fromEntity(categoryRepository.save(category), category.getUser().getId());
    }

    @Transactional(readOnly = true)
    public Category getCategoryEntityById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    @Transactional
    public void deleteCategory(Long categoryId) {
        categoryRepository.deleteById(categoryId);
    }
}
