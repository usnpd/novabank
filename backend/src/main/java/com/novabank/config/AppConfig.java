package com.novabank.config;

import com.google.genai.Client;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.ai.chat.model.ChatModel;

@Configuration(proxyBeanMethods = false)
@Slf4j
public class AppConfig {

    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }

    @Bean
    public Client googleGenAiClient(@Value("${spring.ai.google.genai.api-key:}") String apiKey) {
        String keyToUse = apiKey;
        if (keyToUse == null || keyToUse.trim().isEmpty() || keyToUse.contains("dummy-key")) {
            log.warn("GEMINI_API_KEY environment variable is missing or empty. " +
                     "Using a placeholder key to allow application startup. " +
                     "AI features will fall back to local rule-based simulation.");
            keyToUse = "AIzaSyDummyKeyPlaceholderToAllowStartup";
        } else {
            log.info("Configuring googleGenAiClient with provided API key.");
        }
        return Client.builder()
                .apiKey(keyToUse)
                .build();
    }

    @Bean
    @Primary
    public ChatModel activeChatModel(
            @Value("${novabank.ai.provider:google}") String aiProvider,
            ApplicationContext context) {
        log.info("Configuring active ChatModel. Selected provider: {}", aiProvider);
        try {
            String[] beanNames = context.getBeanNamesForType(ChatModel.class);
            log.info("Available ChatModel bean names in context: {}", java.util.Arrays.toString(beanNames));
        } catch (Exception e) {
            log.warn("Failed to retrieve ChatModel bean names: {}", e.getMessage());
        }
        if ("ollama".equalsIgnoreCase(aiProvider)) {
            try {
                ChatModel ollamaModel = context.getBean("ollamaChatModel", ChatModel.class);
                log.info("Ollama ChatModel successfully selected and autowired.");
                return ollamaModel;
            } catch (Exception e) {
                log.warn("Ollama ChatModel bean 'ollamaChatModel' not found. " +
                         "Ensure 'spring-ai-starter-model-ollama' dependency is present. " +
                         "Falling back to Google GenAI ChatModel.");
            }
        }
        try {
            ChatModel googleModel = context.getBean("googleGenAiChatModel", ChatModel.class);
            log.info("Google GenAI ChatModel successfully selected and autowired.");
            return googleModel;
        } catch (Exception e) {
            log.warn("Google GenAI ChatModel bean 'googleGenAiChatModel' not found. " +
                     "Returning null. AI features will use local simulation fallback.");
            return null;
        }
    }
}
