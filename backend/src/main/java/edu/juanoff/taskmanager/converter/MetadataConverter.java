package edu.juanoff.taskmanager.converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.juanoff.taskmanager.entity.NotificationMetadata;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class MetadataConverter implements AttributeConverter<NotificationMetadata, String> {

    private static final ObjectMapper mapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(NotificationMetadata metadata) {
        try {
            return mapper.writeValueAsString(metadata);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Cannot convert metadata to JSON", e);
        }
    }

    @Override
    public NotificationMetadata convertToEntityAttribute(String dbData) {
        try {
            return mapper.readValue(dbData, NotificationMetadata.class);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Cannot convert JSON to metadata", e);
        }
    }
}