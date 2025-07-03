package edu.juanoff.taskmanager.mapper;

import edu.juanoff.taskmanager.dto.category.CategoryRequestDTO;
import edu.juanoff.taskmanager.dto.category.CategoryResponseDTO;
import edu.juanoff.taskmanager.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    Category toEntity(CategoryRequestDTO dto);

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "isOwned", ignore = true)
    CategoryResponseDTO toDto(Category category);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    void updateEntityFromDto(CategoryRequestDTO dto, @MappingTarget Category category);
}
