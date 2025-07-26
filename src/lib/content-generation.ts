// African Language Content APIs Integration
import { env } from '$env/dynamic/private';

// MAVEN API Integration for African languages
export class MavenAPI {
    private baseUrl = 'https://api.maven-africa.com/v1';
    
    async getLanguageData(language: string) {
        try {
            const response = await fetch(`${this.baseUrl}/languages/${language}/data`, {
                headers: {
                    'Authorization': `Bearer ${env.MAVEN_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            return await response.json();
        } catch (error) {
            console.error('MAVEN API Error:', error);
            return null;
        }
    }
    
    async getVocabulary(language: string, category?: string) {
        try {
            const url = category 
                ? `${this.baseUrl}/languages/${language}/vocabulary?category=${category}`
                : `${this.baseUrl}/languages/${language}/vocabulary`;
                
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${env.MAVEN_API_KEY}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('MAVEN Vocabulary Error:', error);
            return [];
        }
    }
    
    async getPhrases(language: string, level: string) {
        try {
            const response = await fetch(`${this.baseUrl}/languages/${language}/phrases?level=${level}`, {
                headers: {
                    'Authorization': `Bearer ${env.MAVEN_API_KEY}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('MAVEN Phrases Error:', error);
            return [];
        }
    }
}

// Igbo API Integration
export class IgboAPI {
    private baseUrl = 'https://igboapi.com/api/v1';
    
    async getWords(query?: string) {
        try {
            const url = query 
                ? `${this.baseUrl}/words?keyword=${encodeURIComponent(query)}`
                : `${this.baseUrl}/words`;
                
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Igbo API Error:', error);
            return [];
        }
    }
    
    async getExamples(wordId: string) {
        try {
            const response = await fetch(`${this.baseUrl}/words/${wordId}/examples`);
            return await response.json();
        } catch (error) {
            console.error('Igbo Examples Error:', error);
            return [];
        }
    }
    
    async searchByDefinition(definition: string) {
        try {
            const response = await fetch(`${this.baseUrl}/words?definition=${encodeURIComponent(definition)}`);
            return await response.json();
        } catch (error) {
            console.error('Igbo Search Error:', error);
            return [];
        }
    }
}

// CommonVoice Integration for Audio Content
export class CommonVoiceAPI {
    private baseUrl = 'https://commonvoice.mozilla.org/api/v1';
    
    async getAudioClips(language: string, limit = 50) {
        try {
            const response = await fetch(`${this.baseUrl}/clips?locale=${language}&limit=${limit}`);
            return await response.json();
        } catch (error) {
            console.error('CommonVoice Error:', error);
            return [];
        }
    }
    
    async getLanguageStats(language: string) {
        try {
            const response = await fetch(`${this.baseUrl}/stats?locale=${language}`);
            return await response.json();
        } catch (error) {
            console.error('CommonVoice Stats Error:', error);
            return null;
        }
    }
}

// Lanfrica Datasets Integration
export class LanfricaAPI {
    private baseUrl = 'https://api.lanfrica.com/v1';
    
    async getDatasets(language?: string) {
        try {
            const url = language 
                ? `${this.baseUrl}/datasets?language=${language}`
                : `${this.baseUrl}/datasets`;
                
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Lanfrica Error:', error);
            return [];
        }
    }
    
    async getCorpusData(datasetId: string) {
        try {
            const response = await fetch(`${this.baseUrl}/datasets/${datasetId}/corpus`);
            return await response.json();
        } catch (error) {
            console.error('Lanfrica Corpus Error:', error);
            return [];
        }
    }
    
    async getTranslations(text: string, sourceLang: string, targetLang: string) {
        try {
            const response = await fetch(`${this.baseUrl}/translate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text,
                    source_language: sourceLang,
                    target_language: targetLang
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Lanfrica Translation Error:', error);
            return null;
        }
    }
}

// Content Generation Service
export class AfricanContentGenerator {
    private maven = new MavenAPI();
    private igbo = new IgboAPI();
    private commonVoice = new CommonVoiceAPI();
    private lanfrica = new LanfricaAPI();
    
    async generateCourseContent(language: string, level: string, topic: string) {
        try {
            console.log(`Generating content for ${language} - ${level} - ${topic}`);
            
            // Get vocabulary from multiple sources
            const [mavenVocab, igboWords, lanfricaData] = await Promise.all([
                this.maven.getVocabulary(language, topic),
                language.toLowerCase() === 'igbo' ? this.igbo.getWords(topic) : Promise.resolve([]),
                this.lanfrica.getDatasets(language)
            ]);
            
            // Get phrases and examples
            const phrases = await this.maven.getPhrases(language, level);
            
            // Get audio content
            const audioClips = await this.commonVoice.getAudioClips(language);
            
            // Generate structured content
            const lessons = await this.generateLessons({
                vocabulary: mavenVocab || [],
                igboWords: igboWords || [],
                phrases: phrases || [],
                audioClips: audioClips || [],
                lanfricaData: lanfricaData || [],
                language,
                level,
                topic
            });
            
            return {
                success: true,
                lessons,
                metadata: {
                    language,
                    level,
                    topic,
                    sources: ['MAVEN', 'IgboAPI', 'CommonVoice', 'Lanfrica'],
                    generatedAt: new Date().toISOString()
                }
            };
            
        } catch (error) {
            console.error('Content generation error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                lessons: []
            };
        }
    }
    
    private async generateLessons(data: any) {
        const { vocabulary, igboWords, phrases, audioClips, language, level, topic } = data;
        const lessons = [];
        
        // Lesson 1: Basic Vocabulary
        if (vocabulary.length > 0 || igboWords.length > 0) {
            lessons.push({
                title: `${topic} - Basic Vocabulary`,
                description: `Learn essential ${language} vocabulary for ${topic}`,
                type: 'vocabulary',
                content: {
                    words: [...(vocabulary || []), ...(igboWords || [])].slice(0, 20),
                    exercises: this.generateVocabularyExercises(vocabulary, igboWords)
                },
                audioContent: audioClips.slice(0, 5)
            });
        }
        
        // Lesson 2: Common Phrases
        if (phrases.length > 0) {
            lessons.push({
                title: `${topic} - Common Phrases`,
                description: `Master useful ${language} phrases for ${topic}`,
                type: 'phrases',
                content: {
                    phrases: phrases.slice(0, 15),
                    exercises: this.generatePhraseExercises(phrases)
                },
                audioContent: audioClips.slice(5, 10)
            });
        }
        
        // Lesson 3: Conversational Practice
        lessons.push({
            title: `${topic} - Conversation Practice`,
            description: `Practice ${language} conversations about ${topic}`,
            type: 'conversation',
            content: {
                dialogues: this.generateDialogues(phrases, vocabulary),
                exercises: this.generateConversationExercises(phrases)
            },
            audioContent: audioClips.slice(10, 15)
        });
        
        // Lesson 4: Cultural Context
        lessons.push({
            title: `${topic} - Cultural Context`,
            description: `Understand the cultural context of ${language} in ${topic}`,
            type: 'culture',
            content: {
                culturalNotes: this.generateCulturalNotes(language, topic),
                examples: phrases.slice(0, 10)
            }
        });
        
        return lessons;
    }
    
    private generateVocabularyExercises(vocabulary: any[], igboWords: any[]) {
        const exercises = [];
        const allWords = [...vocabulary, ...igboWords];
        
        if (allWords.length > 0) {
            // Multiple choice exercises
            exercises.push({
                type: 'multiple_choice',
                question: 'Choose the correct translation',
                options: allWords.slice(0, 4).map(word => ({
                    text: word.word || word.igbo,
                    translation: word.translation || word.english,
                    correct: true
                }))
            });
            
            // Fill in the blanks
            exercises.push({
                type: 'fill_blank',
                question: 'Complete the word',
                items: allWords.slice(0, 5).map(word => ({
                    sentence: `The word for ${word.translation || word.english} is ____`,
                    answer: word.word || word.igbo
                }))
            });
        }
        
        return exercises;
    }
    
    private generatePhraseExercises(phrases: any[]) {
        return [
            {
                type: 'translation',
                question: 'Translate these phrases',
                items: phrases.slice(0, 5).map(phrase => ({
                    source: phrase.phrase,
                    target: phrase.translation
                }))
            },
            {
                type: 'matching',
                question: 'Match phrases with their meanings',
                pairs: phrases.slice(0, 6).map(phrase => ({
                    left: phrase.phrase,
                    right: phrase.translation
                }))
            }
        ];
    }
    
    private generateConversationExercises(phrases: any[]) {
        return [
            {
                type: 'dialogue_completion',
                question: 'Complete the conversation',
                dialogue: phrases.slice(0, 4).map((phrase, index) => ({
                    speaker: index % 2 === 0 ? 'A' : 'B',
                    text: phrase.phrase,
                    translation: phrase.translation
                }))
            }
        ];
    }
    
    private generateDialogues(phrases: any[], vocabulary: any[]) {
        if (!phrases.length) return [];
        
        return [
            {
                title: 'Basic Conversation',
                participants: ['Speaker A', 'Speaker B'],
                lines: phrases.slice(0, 6).map((phrase, index) => ({
                    speaker: index % 2,
                    text: phrase.phrase,
                    translation: phrase.translation
                }))
            }
        ];
    }
    
    private generateCulturalNotes(language: string, topic: string) {
        const culturalContext: Record<string, Record<string, string>> = {
            igbo: {
                greetings: "In Igbo culture, greetings are very important and show respect...",
                family: "Family structures in Igbo society are traditionally extended...",
                food: "Igbo cuisine features staples like cassava, yam, and plantain..."
            },
            yoruba: {
                greetings: "Yoruba greetings vary by time of day and social status...",
                family: "Respect for elders is paramount in Yoruba culture...",
                food: "Yoruba food is known for its rich spices and diverse flavors..."
            },
            hausa: {
                greetings: "Hausa greetings often include Islamic influences...",
                family: "Hausa society values community and collective responsibility...",
                food: "Northern Nigerian cuisine features grains and meat dishes..."
            }
        };
        
        return culturalContext[language.toLowerCase()]?.[topic.toLowerCase()] || 
               `Learn about the cultural significance of ${topic} in ${language} communities.`;
    }
}

// Export the main content generator
export const contentGenerator = new AfricanContentGenerator();
