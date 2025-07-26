// Enhanced African Language Content APIs Integration with Database Caching
import { env } from '$env/dynamic/private';
import { db } from '$lib/db';

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
            // Fallback to demo data for development
            return this.getFallbackLanguageData(language);
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
            return this.getFallbackVocabulary(language, category);
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
            return this.getFallbackPhrases(language, level);
        }
    }
    
    private getFallbackLanguageData(language: string) {
        const fallbackData: Record<string, any> = {
            igbo: {
                name: 'Igbo',
                speakers: 27000000,
                regions: ['Southeast Nigeria'],
                dialects: ['Standard Igbo', 'Owerri', 'Umuahia', 'Onitsha']
            },
            yoruba: {
                name: 'Yoruba',
                speakers: 45000000,
                regions: ['Southwest Nigeria', 'Benin', 'Togo'],
                dialects: ['Standard Yoruba', 'Oyo', 'Lagos', 'Ibadan']
            },
            hausa: {
                name: 'Hausa',
                speakers: 70000000,
                regions: ['Northern Nigeria', 'Niger', 'Chad'],
                dialects: ['Kano Hausa', 'Sokoto Hausa', 'Zaria Hausa']
            }
        };
        return fallbackData[language.toLowerCase()] || { name: language, speakers: 0, regions: [], dialects: [] };
    }
    
    public getFallbackVocabulary(language: string, category?: string) {
        const vocabularyData: Record<string, any> = {
            igbo: {
                greetings: [
                    { word: 'Ndewo', translation: 'Hello', pronunciation: 'n-deh-woh' },
                    { word: 'Kedụ', translation: 'How are you?', pronunciation: 'keh-doo' },
                    { word: 'Ọ dị mma', translation: 'I am fine', pronunciation: 'oh-dee-mah' },
                    { word: 'Dalu', translation: 'Thank you', pronunciation: 'dah-loo' },
                    { word: 'Ka ọ dị', translation: 'Goodbye', pronunciation: 'kah-oh-dee' }
                ],
                family: [
                    { word: 'Nne', translation: 'Mother', pronunciation: 'n-neh' },
                    { word: 'Nna', translation: 'Father', pronunciation: 'n-nah' },
                    { word: 'Nwanne', translation: 'Brother/Sister', pronunciation: 'nwah-neh' },
                    { word: 'Nwa', translation: 'Child', pronunciation: 'nwah' },
                    { word: 'Ezinụlọ', translation: 'Family', pronunciation: 'eh-zee-noo-law' }
                ],
                food: [
                    { word: 'Ofe', translation: 'Soup', pronunciation: 'oh-feh' },
                    { word: 'Ji', translation: 'Yam', pronunciation: 'jee' },
                    { word: 'Nri', translation: 'Food', pronunciation: 'n-ree' },
                    { word: 'Mmiri', translation: 'Water', pronunciation: 'm-mee-ree' },
                    { word: 'Abacha', translation: 'Cassava dish', pronunciation: 'ah-bah-chah' }
                ]
            },
            yoruba: {
                greetings: [
                    { word: 'Bawo', translation: 'Hello', pronunciation: 'bah-woh' },
                    { word: 'Pẹlẹ o', translation: 'Sorry/Hello', pronunciation: 'peh-leh-oh' },
                    { word: 'Ṣe dada ni', translation: 'Are you well?', pronunciation: 'sheh-dah-dah-nee' },
                    { word: 'Ẹ ṣe', translation: 'Thank you', pronunciation: 'eh-sheh' },
                    { word: 'Ó dàbọ̀', translation: 'Goodbye', pronunciation: 'oh-dah-baw' }
                ],
                family: [
                    { word: 'Mama', translation: 'Mother', pronunciation: 'mah-mah' },
                    { word: 'Baba', translation: 'Father', pronunciation: 'bah-bah' },
                    { word: 'Arakunrin', translation: 'Brother', pronunciation: 'ah-rah-koon-reen' },
                    { word: 'Arabinrin', translation: 'Sister', pronunciation: 'ah-rah-been-reen' },
                    { word: 'Ọmọ', translation: 'Child', pronunciation: 'aw-maw' }
                ],
                food: [
                    { word: 'Oúnjẹ', translation: 'Food', pronunciation: 'oh-oon-jeh' },
                    { word: 'Omi', translation: 'Water', pronunciation: 'oh-mee' },
                    { word: 'Àmàlà', translation: 'Yam flour dish', pronunciation: 'ah-mah-lah' },
                    { word: 'Ewa', translation: 'Beans', pronunciation: 'eh-wah' },
                    { word: 'Isu', translation: 'Yam', pronunciation: 'ee-soo' }
                ]
            },
            hausa: {
                greetings: [
                    { word: 'Sannu', translation: 'Hello', pronunciation: 'san-noo' },
                    { word: 'Ina kwana', translation: 'Good morning', pronunciation: 'ee-nah-kwa-nah' },
                    { word: 'Barka da rana', translation: 'Good afternoon', pronunciation: 'bar-kah-dah-rah-nah' },
                    { word: 'Na gode', translation: 'Thank you', pronunciation: 'nah-goh-deh' },
                    { word: 'Sai anjima', translation: 'Goodbye', pronunciation: 'sah-ee-an-jee-mah' }
                ],
                family: [
                    { word: 'Uwa', translation: 'Mother', pronunciation: 'oo-wah' },
                    { word: 'Uba', translation: 'Father', pronunciation: 'oo-bah' },
                    { word: 'Yaya', translation: 'Brother', pronunciation: 'yah-yah' },
                    { word: 'Yar\'uwa', translation: 'Sister', pronunciation: 'yah-roo-wah' },
                    { word: 'Ɗa', translation: 'Child', pronunciation: 'dah' }
                ],
                food: [
                    { word: 'Abinci', translation: 'Food', pronunciation: 'ah-been-chee' },
                    { word: 'Ruwa', translation: 'Water', pronunciation: 'roo-wah' },
                    { word: 'Tuwo', translation: 'Millet porridge', pronunciation: 'too-woh' },
                    { word: 'Masa', translation: 'Rice cake', pronunciation: 'mah-sah' },
                    { word: 'Doya', translation: 'Yam', pronunciation: 'doh-yah' }
                ]
            }
        };
        
        const langData = vocabularyData[language.toLowerCase()] || {};
        return category ? (langData[category] || []) : Object.values(langData).flat();
    }
    
    private getFallbackPhrases(language: string, level: string) {
        const phrasesData: Record<string, any> = {
            igbo: {
                beginner: [
                    { phrase: 'Aha m bụ...', translation: 'My name is...', context: 'introduction' },
                    { phrase: 'Kedụ aha gị?', translation: 'What is your name?', context: 'question' },
                    { phrase: 'Ana m ahụ gị', translation: 'I see you', context: 'greeting' },
                    { phrase: 'Olee ebe ị si?', translation: 'Where are you from?', context: 'question' },
                    { phrase: 'A sịrị na ọ dị mma', translation: 'They say it is good', context: 'expression' }
                ],
                intermediate: [
                    { phrase: 'Gịnị ka ị na-eme?', translation: 'What are you doing?', context: 'conversation' },
                    { phrase: 'M na-agụ akwụkwọ', translation: 'I am reading a book', context: 'activity' },
                    { phrase: 'Ọ bụ oge ole ka ọ dị?', translation: 'What time is it?', context: 'time' }
                ]
            },
            yoruba: {
                beginner: [
                    { phrase: 'Orúkọ mi ni...', translation: 'My name is...', context: 'introduction' },
                    { phrase: 'Kí ni orúkọ rẹ?', translation: 'What is your name?', context: 'question' },
                    { phrase: 'Mo rí ọ', translation: 'I see you', context: 'greeting' },
                    { phrase: 'Níbo ni ọ ti wá?', translation: 'Where are you from?', context: 'question' }
                ]
            },
            hausa: {
                beginner: [
                    { phrase: 'Sunana...', translation: 'My name is...', context: 'introduction' },
                    { phrase: 'Menene sunanka?', translation: 'What is your name?', context: 'question' },
                    { phrase: 'Ina ganinka', translation: 'I see you', context: 'greeting' },
                    { phrase: 'Daga ina kike?', translation: 'Where are you from?', context: 'question' }
                ]
            }
        };
        
        const langPhrases = phrasesData[language.toLowerCase()] || {};
        return langPhrases[level.toLowerCase()] || [];
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
            console.log(`🌍 Generating African language content for ${language} - ${level} - ${topic}`);
            
            // First, try to cache vocabulary in database
            await this.cacheVocabularyToDatabase(language, topic);
            
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
            
            // Get cached vocabulary from database
            const cachedVocab = await this.getCachedVocabulary(language, topic);
            
            // Generate structured content
            const lessons = await this.generateLessons({
                vocabulary: [...(mavenVocab || []), ...cachedVocab],
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
                    sources: ['MAVEN', 'IgboAPI', 'CommonVoice', 'Lanfrica', 'Cached'],
                    vocabularyCount: (mavenVocab?.length || 0) + cachedVocab.length,
                    phrasesCount: phrases?.length || 0,
                    audioClipsCount: audioClips?.length || 0,
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
    
    private async cacheVocabularyToDatabase(language: string, topic: string) {
        try {
            const vocab = this.maven.getFallbackVocabulary(language, topic);
            const languageEnum = language.toUpperCase() as any;
            
            for (const item of vocab) {
                try {
                    // Using raw SQL since Prisma model might not be available yet
                    await db.$executeRaw`
                        INSERT INTO vocabulary (id, language, word, translation, pronunciation, category, source, "createdAt", "updatedAt")
                        VALUES (gen_random_uuid(), ${languageEnum}, ${item.word}, ${item.translation}, ${item.pronunciation || ''}, ${topic}, 'MAVEN_FALLBACK', NOW(), NOW())
                        ON CONFLICT (language, word) DO UPDATE SET
                        translation = EXCLUDED.translation,
                        pronunciation = EXCLUDED.pronunciation,
                        "updatedAt" = NOW()
                    `;
                } catch (dbError) {
                    console.log('Database insert skipped:', dbError);
                }
            }
        } catch (error) {
            console.error('Error caching vocabulary:', error);
        }
    }
    
    private async getCachedVocabulary(language: string, topic?: string) {
        try {
            const languageEnum = language.toUpperCase();
            const query = topic 
                ? `SELECT * FROM vocabulary WHERE language = $1 AND category = $2 LIMIT 20`
                : `SELECT * FROM vocabulary WHERE language = $1 LIMIT 20`;
            
            const params = topic ? [languageEnum, topic] : [languageEnum];
            const vocabulary: any[] = await db.$queryRawUnsafe(query, ...params);
            
            return vocabulary.map((v: any) => ({
                word: v.word,
                translation: v.translation,
                pronunciation: v.pronunciation,
                category: v.category
            }));
        } catch (error) {
            console.error('Error getting cached vocabulary:', error);
            return [];
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
