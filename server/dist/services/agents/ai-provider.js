import { env } from '../../config/env.js';
export class AIServiceProvider {
    static instance;
    apiKey;
    providerName;
    constructor() {
        this.apiKey = env.GEMINI_API_KEY || env.OPENAI_API_KEY;
        this.providerName = env.GEMINI_API_KEY ? 'gemini' : env.OPENAI_API_KEY ? 'openai' : 'none';
    }
    static getInstance() {
        if (!AIServiceProvider.instance) {
            AIServiceProvider.instance = new AIServiceProvider();
        }
        return AIServiceProvider.instance;
    }
    isConfigured() {
        return Boolean(this.apiKey && this.apiKey.trim().length > 0);
    }
    getProviderStatus() {
        return {
            configured: this.isConfigured(),
            provider: this.isConfigured() ? this.providerName : 'Deterministic Intelligent Engine (Offline Mode)',
        };
    }
    getProviderInfo() {
        return this.getProviderStatus();
    }
    /**
     * Generates structured text using LLM if configured, or deterministic rule engine if offline.
     */
    async generateText(prompt, fallbackContent) {
        if (!this.isConfigured()) {
            return {
                success: true,
                content: fallbackContent,
                source: 'deterministic_engine',
                metadata: {
                    note: 'Generated via InternBridge deterministic career intelligence engine (AI API key not configured).',
                },
            };
        }
        try {
            if (this.providerName === 'gemini') {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.2,
                            maxOutputTokens: 1024,
                        },
                    }),
                });
                if (!response.ok) {
                    throw new Error(`Gemini API error: HTTP ${response.status}`);
                }
                const data = await response.json();
                const candidate = data.candidates?.[0];
                const text = candidate?.content?.parts?.[0]?.text;
                if (text) {
                    return {
                        success: true,
                        content: text.trim(),
                        source: 'live_llm',
                        metadata: { model: 'gemini-1.5-flash', provider: 'gemini' },
                    };
                }
            }
            else if (this.providerName === 'openai') {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.apiKey}`,
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.2,
                        max_tokens: 1024,
                    }),
                });
                if (!response.ok) {
                    throw new Error(`OpenAI API error: HTTP ${response.status}`);
                }
                const data = await response.json();
                const text = data.choices?.[0]?.message?.content;
                if (text) {
                    return {
                        success: true,
                        content: text.trim(),
                        source: 'live_llm',
                        metadata: { model: 'gpt-4o-mini', provider: 'openai' },
                    };
                }
            }
            // If API returned empty content, use fallback
            return {
                success: true,
                content: fallbackContent,
                source: 'deterministic_engine',
                metadata: { note: 'Fallback used due to empty LLM response' },
            };
        }
        catch (err) {
            console.warn(`[AI Provider] Error generating text with ${this.providerName}: ${err.message}. Using deterministic fallback.`);
            return {
                success: true,
                content: fallbackContent,
                source: 'deterministic_engine',
                metadata: {
                    note: `Fell back to deterministic engine due to provider error: ${err.message}`,
                },
            };
        }
    }
}
export const aiProvider = AIServiceProvider.getInstance();
