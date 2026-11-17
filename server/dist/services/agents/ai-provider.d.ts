export interface AIProviderResponse {
    success: boolean;
    content: string;
    source: 'live_llm' | 'deterministic_engine';
    metadata?: Record<string, unknown>;
}
export declare class AIServiceProvider {
    private static instance;
    private apiKey?;
    private providerName;
    private constructor();
    static getInstance(): AIServiceProvider;
    isConfigured(): boolean;
    getProviderStatus(): {
        configured: boolean;
        provider: string;
    };
    getProviderInfo(): {
        configured: boolean;
        provider: string;
    };
    /**
     * Generates structured text using LLM if configured, or deterministic rule engine if offline.
     */
    generateText(prompt: string, fallbackContent: string): Promise<AIProviderResponse>;
}
export declare const aiProvider: AIServiceProvider;
