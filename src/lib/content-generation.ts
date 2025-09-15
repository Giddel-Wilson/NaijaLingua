// Enhanced African Language Content APIs Integration with Database Caching
import { IGBO_API_KEY, MAVEN_API_KEY } from '$lib/env';
import { db } from '$lib/db';
import { IgboApiService } from '$lib/api/igbo-api';

// Initialize Igbo API with key
const igboApi = new IgboApiService(IGBO_API_KEY);

// Enhanced detailed content generator for Igbo
export class DetailedIgboContentGenerator {
    private igboApi: IgboApiService;

    constructor() {
        this.igboApi = new IgboApiService(IGBO_API_KEY);
    }

    async generateCourse(level: string, topic: string) {
        console.log(`Generating comprehensive Igbo course: ${level.toUpperCase()} - ${topic}`);
        
        try {
            // Step 1: Generate focused lessons (reduced count)
            const lessons = await this.generateDetailedLessons(level, topic);
            
            // Step 2: Generate real vocabulary from Igbo API
            const vocabulary = await this.generateExtensiveVocabulary(level, topic);
            
            // Step 3: Generate practical exercises with real questions
            const exercises = await this.generateComprehensiveExercises(level, topic);
            
            // Remove unnecessary sections that were causing repetition
            const metadata = {
                vocabularyCount: vocabulary.length,
                phrasesCount: lessons.length * 6, // Approximate based on lessons
                exercisesCount: exercises.length,
                audioClipsCount: vocabulary.length, // One per vocabulary item
                grammarSections: 3, // Reduced from 6
                culturalNotes: 2 // Reduced from 5
            };

            console.log('Content generation completed successfully:', metadata);

            return {
                success: true,
                lessons: lessons,
                vocabulary: vocabulary,
                exercises: exercises,
                metadata: metadata
            };
        } catch (error) {
            console.error('Error in course generation:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    private async generateDetailedLessons(level: string, topic: string) {
        console.log(`Step 1: Generating detailed lessons...`);
        
        // Reduced lesson count to avoid repetition and focus on quality
        const lessonCount = 8; // Fixed to 8 focused lessons instead of 15+
        const lessons = [];

        for (let i = 1; i <= lessonCount; i++) {
            console.log(`Creating detailed lesson ${i} for ${topic}`);
            const lesson = await this.createDetailedLesson(i, level, topic);
            lessons.push(lesson);
        }

        console.log(`Generated ${lessons.length} lessons`);
        return lessons;
    }

    private getLessonCount(level: string): number {
        // Simplified to focus on quality over quantity
        return 8; // All levels get 8 focused lessons
    }

    private async createDetailedLesson(lessonNumber: number, level: string, topic: string) {
        console.log(`Creating detailed lesson ${lessonNumber} for ${topic}`);
        
        // Get unique vocabulary for each lesson to avoid repetition
        const vocabulary = this.getUniqueVocabularyForLesson(lessonNumber, level, topic, 8);
        const examples = this.getUniqueExamplesForLesson(lessonNumber, topic, 5);

        return {
            id: lessonNumber,
            title: this.generateLessonTitle(lessonNumber, topic),
            description: `Lesson ${lessonNumber}: Learn ${topic} vocabulary, phrases, and cultural context in Igbo language. This lesson covers essential words, pronunciation, and practical usage.`,
            type: this.getLessonType(lessonNumber),
            objectives: this.generateLearningObjectives(lessonNumber, level, topic),
            content: {
                introduction: this.generateLessonIntroduction(lessonNumber, topic),
                vocabulary: this.formatVocabularyForLesson(vocabulary),
                words: this.formatVocabularyForLesson(vocabulary), // Add words for component compatibility
                phrases: this.formatPhrasesForLesson(examples),
                grammar: this.generateGrammarExplanation(lessonNumber, level),
                culturalNotes: this.generateCulturalNotes(topic),
                pronunciation: this.generatePronunciationNotes(vocabulary),
                exercises: this.generateLessonExercises(lessonNumber, vocabulary, examples),
                summary: this.generateLessonSummary(lessonNumber, topic)
            },
            difficulty: level,
            estimatedTime: this.calculateLessonTime(level),
            prerequisites: lessonNumber > 1 ? [`Lesson ${lessonNumber - 1}`] : [],
            audioContent: this.generateAudioContent(vocabulary, examples)
        };
    }

    private getUniqueVocabularyForLesson(lessonNumber: number, level: string, topic: string, size: number) {
        // Generate lesson-specific vocabulary based on lesson theme
        console.log(`🎯 Generating vocabulary for lesson ${lessonNumber} on topic: ${topic}`);
        
        // Get lesson title to determine specific vocabulary theme
        const lessonTitle = this.generateLessonTitle(lessonNumber, topic);
        console.log(`📖 Lesson title: ${lessonTitle}`);
        
        // Create lesson-specific vocabulary based on title content
        if (lessonTitle.includes('Business') || lessonTitle.includes('Azụmahịa')) {
            console.log('💼 Using business-focused vocabulary');
            return this.getBusinessNumbersVocabulary(size);
        } else if (lessonTitle.includes('Years') || lessonTitle.includes('Months') || lessonTitle.includes('Ọnwa')) {
            console.log('📅 Using time-focused vocabulary');
            return this.getTimeRelatedVocabulary(size);
        } else if (lessonTitle.includes('Colors') || lessonTitle.includes('Agba')) {
            console.log('🎨 Using color-specific vocabulary');
            return this.getColorVocabulary(size);
        } else if (lessonTitle.includes('Food') || lessonTitle.includes('Nri') || lessonTitle.includes('Kitchen') || lessonTitle.includes('Cooking')) {
            console.log('🍳 Using food and cooking vocabulary');
            return this.getFoodAndCookingVocabulary(size);
        }
        
        // Default: get diverse vocabulary from the main topic pool
        console.log(`📚 Using general ${topic} vocabulary with offset for lesson ${lessonNumber}`);
        const allVocab = this.getFallbackVocabulary(level, topic, size * 10); // Get larger pool
        const startIndex = (lessonNumber - 1) * size;
        const endIndex = startIndex + size;
        return allVocab.slice(startIndex, endIndex);
    }

    private getUniqueExamplesForLesson(lessonNumber: number, topic: string, size: number) {
        // Generate unique examples for each lesson
        const allExamples = this.getFallbackExamples(topic, size * 10); // Get larger pool
        const startIndex = (lessonNumber - 1) * size;
        const endIndex = startIndex + size;
        return allExamples.slice(startIndex, endIndex);
    }

    private getLessonType(lessonNumber: number): string {
        const types = ['vocabulary', 'phrases', 'conversation', 'culture'];
        return types[(lessonNumber - 1) % types.length];
    }

    private generateAudioContent(vocabulary: any[], examples: any[]) {
        return [
            ...vocabulary.map((word, index) => ({
                id: `vocab_${index}`,
                text: word.igbo,
                pronunciation: word.pronunciation,
                type: 'vocabulary'
            })),
            ...examples.map((phrase, index) => ({
                id: `phrase_${index}`,
                text: phrase.igbo,
                pronunciation: phrase.pronunciation,
                type: 'phrase'
            }))
        ];
    }

    private generateLessonTitle(lessonNumber: number, topic: string): string {
        const topicTitles = {
            greetings: [
                'Ekele na Nkwurịta Okwu - Basic Greetings and Introductions',
                'Ajụjụ na Azịza - Questions and Responses in Greetings',
                'Oge na Ebe - Time and Place in Greetings',
                'Nsọpụrụ na Omenala - Respect and Cultural Greetings',
                'Nkwurịta Okwu Kwa Ụbọchị - Daily Greeting Conversations',
                'Ekele n\'Ọgbakọ - Greetings in Gatherings',
                'Nkewa na Nkwurịta - Farewells and Exchanges',
                'Mmekọrịta Ọha - Community Greetings'
            ],
            family: [
                'Ezinụlọ na Mmekọrịta - Family and Relationships',
                'Ọrụ na Ọnọdụ - Roles and Positions in Family',
                'Ememe na Omenala Ezinụlọ - Family Celebrations and Traditions',
                'Nkwurịta Okwu n\'Ezinụlọ - Family Conversations',
                'Ọzụzụ Ụmụaka - Child Rearing in Igbo Culture',
                'Mmekọrịta Agbụrụ - Extended Family Relations',
                'Nsọpụrụ Ndị Okenye - Respecting Elders',
                'Omenala Alụmdi na Nwunye - Marriage Traditions'
            ],
            food_and_eating: [
                'Nri na Ihe Oriri - Food and Eating Basics',
                'Nri Ọdịnala Igbo - Traditional Igbo Foods',
                'Esi Nri na Ngwa Nri - Cooking and Kitchen Tools',
                'Omenala Nri na Oriri - Food Culture and Eating Customs',
                'Ahịa Nri na Ịzụ Ahịa - Food Markets and Shopping',
                'Ememe Nri - Food Festivals and Celebrations',
                'Nri Ahụike na Ọgwụgwọ - Nutritious Foods and Health',
                'Mmekọrịta na Nri - Social Aspects of Eating'
            ],
            numbers: [
                'Ọnụọgụgụ Ndị Bụ Isi - Basic Numbers and Counting',
                'Ịgụ Ọnụ n\'Azụmahịa - Numbers in Business and Trade',
                'Oge na Ọnụọgụgụ - Time and Numbers',
                'Ego na Ọnụọgụgụ - Money and Numerical Values',
                'Ọnụọgụgụ n\'Ndụ Kwa Ụbọchị - Numbers in Daily Life',
                'Ịtụ Ihe na Ọnụọgụgụ - Measurements and Quantities',
                'Afọ na Ọnwa - Years and Months',
                'Mmekọrịta Ọnụọgụgụ - Mathematical Relationships'
            ],
            colors: [
                'Agba Ndị Bụ Isi - Basic Colors and Shades',
                'Agba n\'Okike - Colors in Nature',
                'Uwe na Agba - Clothing and Colors',
                'Agba n\'Omenala - Colors in Igbo Culture',
                'Agba Ememe - Festival and Ceremonial Colors',
                'Agba Ụlọ - Colors in Home Decoration',
                'Agba n\'Nka - Colors in Art and Crafts',
                'Mmetụta Agba - Color Emotions and Meanings'
            ],
            travel: [
                'Ije na Njem - Travel and Journeys',
                'Ụgbọ na Ije - Vehicles and Transportation',
                'Ebe na Okporo Ụzọ - Places and Roads',
                'Njem Omenala - Cultural and Traditional Travels',
                'Ije Azụmahịa - Business Travel',
                'Nleta Ezinụlọ - Family Visits',
                'Ije Mba Ọzọ - International Travel',
                'Nchekwa n\'Ije - Travel Safety'
            ],
            business: [
                'Azụmahịa na Ego - Business and Money',
                'Ahịa na Ịzụ Ahịa - Markets and Trading',
                'Ọrụ na Oru Aka - Work and Craftsmanship',
                'Mmekọrịta Azụmahịa - Business Relationships',
                'Ego na Ụgwọ - Money and Payments',
                'Ọganihu Azụmahịa - Business Growth',
                'Omenala Azụmahịa - Business Traditions',
                'Ikpe na Nkwekọrịta - Contracts and Agreements'
            ]
        };

        const titlesForTopic = topicTitles[topic as keyof typeof topicTitles] || topicTitles.greetings;
        const titleIndex = (lessonNumber - 1) % titlesForTopic.length;
        return titlesForTopic[titleIndex];
    }

    private generateLearningObjectives(lessonNumber: number, level: string, topic: string): string[] {
        const baseObjectives = [
            `Master ${5 + lessonNumber * 2} essential Igbo vocabulary words related to ${topic}`,
            `Understand and use ${3 + lessonNumber} key phrases in context`,
            `Demonstrate proper pronunciation of new vocabulary`,
            `Apply grammatical structures learned in previous lessons`,
            `Recognize cultural contexts and appropriate usage`
        ];

        if (level === 'intermediate' || level === 'advanced') {
            baseObjectives.push(
                'Construct complex sentences using new vocabulary',
                'Engage in conversational exchanges',
                'Understand dialectical variations'
            );
        }

        if (level === 'advanced') {
            baseObjectives.push(
                'Analyze linguistic nuances and idiomatic expressions',
                'Demonstrate understanding of formal vs informal usage',
                'Create original content using lesson vocabulary'
            );
        }

        return baseObjectives;
    }

    private formatVocabularyForLesson(apiWords: any[]): any[] {
        return apiWords.map(word => ({
            igbo: word.igbo || word.word,
            english: word.english || word.definitions?.[0]?.definitions?.[0],
            pronunciation: word.pronunciation || word.wordPronunciation,
            partOfSpeech: word.partOfSpeech || word.definitions?.[0]?.wordClass || 'noun',
            examples: word.examples?.slice(0, 2) || [
                {
                    igbo: `${word.igbo || word.word} dị mma`,
                    english: `The ${word.english} is good`,
                    pronunciation: `${word.pronunciation} di m-ma`
                }
            ],
            variations: word.variations || [],
            culturalNote: this.generateCulturalNote(word.igbo || word.word)
        }));
    }

    private generateCulturalNote(word: string): string {
        const culturalNotes: Record<string, string> = {
            'nnọọ': 'A warm greeting that conveys respect and welcome, often accompanied by a slight bow',
            'aha': 'Names in Igbo culture often carry deep meaning and reflect family history or circumstances of birth',
            'ezinụlọ': 'Family extends beyond immediate relatives to include extended family and close family friends',
            'nri': 'Food sharing is a fundamental aspect of Igbo hospitality and community bonding'
        };

        return culturalNotes[word] || `The word "${word}" carries cultural significance in Igbo tradition and daily life.`;
    }

    private generateGrammarExplanation(lessonNumber: number, level: string): string {
        const grammarTopics = [
            'Igbo Nouns and Basic Sentence Structure - Subject-Verb-Object patterns',
            'Verb Conjugation and Tense Markers - Present, past, and future tense formation',
            'Pronouns and Possessives - Personal pronouns and showing ownership',
            'Question Formation - How to ask questions using kedụ, gịnị, ebe, mgbe',
            'Adjectives and Descriptive Language - Describing people, places, and things',
            'Prepositions and Location - Expressing spatial and temporal relationships'
        ];

        const explanation = grammarTopics[lessonNumber - 1] || `Advanced grammar concepts for lesson ${lessonNumber}`;
        
        if (level === 'beginner') {
            return `${explanation}. Focus on basic patterns and common usage.`;
        } else if (level === 'intermediate') {
            return `${explanation}. Explore variations and exceptions to basic rules.`;
        } else {
            return `${explanation}. Master complex constructions and nuanced usage.`;
        }
    }

    private async generateExtensiveVocabulary(level: string, topic: string) {
        console.log(`Step 2: Generating extensive vocabulary for ${topic}...`);
        console.log(`🚀 NEW ENHANCED LOGIC ACTIVE - Topic filtering enabled!`);
        
        // ALWAYS use topic-specific vocabulary to ensure content matches lesson topics
        const vocabularySize = level === 'beginner' ? 12 : level === 'intermediate' ? 16 : 20;
        
        try {
            // Get real Igbo API data for supplementation
            const apiWords = await this.igboApi.getWordsByDifficulty(level as 'beginner' | 'intermediate' | 'advanced');
            
            if (apiWords && apiWords.length > 0) {
                console.log(`Got ${apiWords.length} real words from Igbo API`);
                
                // Start with topic-specific vocabulary (ensures content accuracy)
                const topicVocab = this.getFallbackVocabulary(level, topic, vocabularySize);
                console.log(`🎯 Starting with ${topicVocab.length} topic-specific vocabulary items for ${topic}`);
                
                // Supplement with API words that might be relevant to the topic
                const relevantApiWords = this.filterApiWordsByTopic(apiWords, topic);
                console.log(`🔍 Found ${relevantApiWords.length} potentially relevant API words for ${topic}`);
                
                // Combine topic-specific vocabulary with relevant API words (topic vocab takes priority)
                const combinedVocab = this.combineVocabulary(topicVocab, relevantApiWords, vocabularySize);
                
                console.log(`✅ Generated ${combinedVocab.length} TOPIC-ACCURATE vocabulary items combining real API data with ${topic}-specific content`);
                return combinedVocab;
            }
        } catch (error) {
            console.error('Error fetching vocabulary from Igbo API:', error);
        }
        
        // Pure topic-specific fallback ensures content always matches lesson topic
        console.log(`🎯 Using PURE topic-specific vocabulary for ${topic} to ensure content accuracy`);
        const fallbackVocab = this.getFallbackVocabulary(level, topic, vocabularySize);
        console.log(`Generated ${fallbackVocab.length} topic-specific vocabulary items for ${topic}`);
        return fallbackVocab;
    }

    /**
     * Filter API words to find ones relevant to the topic
     */
    private filterApiWordsByTopic(apiWords: any[], topic: string): any[] {
        const topicKeywords: Record<string, string[]> = {
            greetings: ['hello', 'greet', 'welcome', 'name', 'how', 'meet', 'good', 'morning', 'evening'],
            family: ['family', 'father', 'mother', 'child', 'brother', 'sister', 'parent', 'relative', 'home'],
            food_and_eating: ['food', 'eat', 'cook', 'kitchen', 'meal', 'drink', 'rice', 'yam', 'soup', 'water', 'meat', 'fish', 'pot', 'knife', 'plate', 'bowl', 'cup', 'cooking', 'utensil', 'fire', 'stove', 'mortar', 'pestle', 'ladle', 'spoon'],
            numbers: ['one', 'two', 'three', 'number', 'count', 'many', 'few', 'first', 'second', 'ten'],
            colors: ['color', 'red', 'blue', 'green', 'yellow', 'black', 'white', 'bright', 'dark'],
            travel: ['go', 'come', 'travel', 'road', 'vehicle', 'place', 'here', 'there', 'far', 'near'],
            business: ['business', 'money', 'buy', 'sell', 'market', 'work', 'trade', 'price', 'cost']
        };

        const keywords = topicKeywords[topic] || [];
        
        return apiWords.filter(word => {
            const englishDef = word.definitions?.[0]?.definitions?.[0]?.toLowerCase() || '';
            const igboWord = (word.word || '').toLowerCase();
            
            // Check if any topic keyword matches the English definition
            return keywords.some(keyword => 
                englishDef.includes(keyword) || 
                igboWord.includes(keyword)
            );
        });
    }

    /**
     * Combine topic-specific vocabulary with relevant API words
     */
    private combineVocabulary(topicVocab: any[], apiWords: any[], targetSize: number): any[] {
        const result = [...topicVocab]; // Start with topic vocabulary (ensures accuracy)
        
        // Add relevant API words if we have space and they don't duplicate
        for (const apiWord of apiWords) {
            if (result.length >= targetSize) break;
            
            const igboWord = apiWord.word || apiWord.igbo;
            const isDuplicate = result.some(item => item.igbo === igboWord);
            
            if (!isDuplicate) {
                result.push({
                    id: result.length + 1,
                    igbo: igboWord,
                    english: apiWord.definitions?.[0]?.definitions?.[0] || apiWord.english || `Definition for ${igboWord}`,
                    pronunciation: apiWord.pronunciation || this.generatePronunciationTips(igboWord),
                    partOfSpeech: apiWord.wordClass || 'noun',
                    examples: apiWord.examples || [],
                    difficulty: 'beginner',
                    topic: topicVocab[0]?.topic || 'general'
                });
            }
        }
        
        return result.slice(0, targetSize); // Return exactly the target size
    }

    private getFallbackVocabulary(level: string, topic: string, size: number) {
        // Topic-specific vocabulary - MUST match the topic!
        const topicVocabulary: Record<string, any[]> = {
            greetings: [
                { igbo: 'nnọọ', english: 'hello/welcome', pronunciation: 'nno-oh', partOfSpeech: 'interjection' },
                { igbo: 'kedụ', english: 'how/what', pronunciation: 'ke-du', partOfSpeech: 'pronoun' },
                { igbo: 'ka ọ dị', english: 'how are you', pronunciation: 'ka o di', partOfSpeech: 'phrase' },
                { igbo: 'ọ dị mma', english: 'it is good/fine', pronunciation: 'o di mma', partOfSpeech: 'phrase' },
                { igbo: 'dalụ', english: 'thank you', pronunciation: 'da-lu', partOfSpeech: 'interjection' },
                { igbo: 'ndewo', english: 'hello (formal)', pronunciation: 'nde-wo', partOfSpeech: 'interjection' },
                { igbo: 'ka chi fo', english: 'good morning', pronunciation: 'ka chi fo', partOfSpeech: 'phrase' },
                { igbo: 'ka emere', english: 'good afternoon', pronunciation: 'ka e-me-re', partOfSpeech: 'phrase' }
            ],
            family: [
                { igbo: 'ezinụlọ', english: 'family', pronunciation: 'e-zi-nu-lo', partOfSpeech: 'noun' },
                { igbo: 'nna', english: 'father', pronunciation: 'nna', partOfSpeech: 'noun' },
                { igbo: 'nne', english: 'mother', pronunciation: 'nne', partOfSpeech: 'noun' },
                { igbo: 'nwanne', english: 'sibling', pronunciation: 'nwa-nne', partOfSpeech: 'noun' },
                { igbo: 'nwa', english: 'child', pronunciation: 'nwa', partOfSpeech: 'noun' },
                { igbo: 'nna ochie', english: 'grandfather', pronunciation: 'nna o-chie', partOfSpeech: 'noun' },
                { igbo: 'nne ochie', english: 'grandmother', pronunciation: 'nne o-chie', partOfSpeech: 'noun' },
                { igbo: 'ada', english: 'first daughter', pronunciation: 'a-da', partOfSpeech: 'noun' }
            ],
            food_and_eating: [
                // Basic food items
                { igbo: 'nri', english: 'food', pronunciation: 'nri', partOfSpeech: 'noun' },
                { igbo: 'ji', english: 'yam', pronunciation: 'ji', partOfSpeech: 'noun' },
                { igbo: 'akpu', english: 'cassava fufu', pronunciation: 'a-kpu', partOfSpeech: 'noun' },
                { igbo: 'ofe', english: 'soup', pronunciation: 'o-fe', partOfSpeech: 'noun' },
                { igbo: 'mmiri', english: 'water', pronunciation: 'm-mi-ri', partOfSpeech: 'noun' },
                { igbo: 'anụ', english: 'meat', pronunciation: 'a-nu', partOfSpeech: 'noun' },
                { igbo: 'azụ', english: 'fish', pronunciation: 'a-zu', partOfSpeech: 'noun' },
                
                // Cooking and Kitchen Tools - CORE TOPIC MATCH
                { igbo: 'ite', english: 'pot/cooking pot', pronunciation: 'i-te', partOfSpeech: 'noun' },
                { igbo: 'ekwe', english: 'wooden mortar', pronunciation: 'e-kwe', partOfSpeech: 'noun' },
                { igbo: 'ikwe', english: 'pestle', pronunciation: 'i-kwe', partOfSpeech: 'noun' },
                { igbo: 'okwu', english: 'ladle/cooking spoon', pronunciation: 'o-kwu', partOfSpeech: 'noun' },
                { igbo: 'mma', english: 'knife', pronunciation: 'mma', partOfSpeech: 'noun' },
                { igbo: 'efere', english: 'plate/bowl', pronunciation: 'e-fe-re', partOfSpeech: 'noun' },
                { igbo: 'iko', english: 'cup/glass', pronunciation: 'i-ko', partOfSpeech: 'noun' },
                { igbo: 'ngwa nri', english: 'kitchen utensils', pronunciation: 'ngwa nri', partOfSpeech: 'noun phrase' },
                { igbo: 'ebe nsi nri', english: 'kitchen/cooking place', pronunciation: 'e-be nsi nri', partOfSpeech: 'noun phrase' },
                { igbo: 'ọkụ', english: 'fire/stove', pronunciation: 'o-ku', partOfSpeech: 'noun' },
                { igbo: 'nkpo ọkụ', english: 'firewood', pronunciation: 'nkpo o-ku', partOfSpeech: 'noun' },
                { igbo: 'esi nri', english: 'cooking food', pronunciation: 'e-si nri', partOfSpeech: 'verb phrase' },
                { igbo: 'iri nri', english: 'eating food', pronunciation: 'i-ri nri', partOfSpeech: 'verb phrase' }
            ],
            numbers: [
                { igbo: 'otu', english: 'one', pronunciation: 'o-tu', partOfSpeech: 'number' },
                { igbo: 'abụọ', english: 'two', pronunciation: 'a-bu-o', partOfSpeech: 'number' },
                { igbo: 'atọ', english: 'three', pronunciation: 'a-to', partOfSpeech: 'number' },
                { igbo: 'anọ', english: 'four', pronunciation: 'a-no', partOfSpeech: 'number' },
                { igbo: 'ise', english: 'five', pronunciation: 'i-se', partOfSpeech: 'number' },
                { igbo: 'isii', english: 'six', pronunciation: 'i-si-i', partOfSpeech: 'number' },
                { igbo: 'asaa', english: 'seven', pronunciation: 'a-sa-a', partOfSpeech: 'number' },
                { igbo: 'asatọ', english: 'eight', pronunciation: 'a-sa-to', partOfSpeech: 'number' }
            ],
            colors: [
                { igbo: 'ọcha', english: 'white', pronunciation: 'o-cha', partOfSpeech: 'adjective' },
                { igbo: 'ojii', english: 'black', pronunciation: 'o-ji-i', partOfSpeech: 'adjective' },
                { igbo: 'uhie', english: 'red', pronunciation: 'u-hie', partOfSpeech: 'adjective' },
                { igbo: 'akwụkwọ ndụ', english: 'green', pronunciation: 'a-kwu-kwo ndu', partOfSpeech: 'adjective' },
                { igbo: 'acha odo odo', english: 'yellow', pronunciation: 'a-cha o-do o-do', partOfSpeech: 'adjective' },
                { igbo: 'nchara', english: 'brown', pronunciation: 'n-cha-ra', partOfSpeech: 'adjective' }
            ],
            travel: [
                { igbo: 'ije', english: 'journey/travel', pronunciation: 'i-je', partOfSpeech: 'noun' },
                { igbo: 'ụgbọ', english: 'vehicle', pronunciation: 'u-gbo', partOfSpeech: 'noun' },
                { igbo: 'okporo ụzọ', english: 'road', pronunciation: 'o-kpo-ro u-zo', partOfSpeech: 'noun' },
                { igbo: 'ọdụ ụgbọ', english: 'bus stop', pronunciation: 'o-du u-gbo', partOfSpeech: 'noun' },
                { igbo: 'ebe', english: 'place', pronunciation: 'e-be', partOfSpeech: 'noun' }
            ],
            business: [
                { igbo: 'azụmahịa', english: 'business', pronunciation: 'a-zu-ma-hi-a', partOfSpeech: 'noun' },
                { igbo: 'ego', english: 'money', pronunciation: 'e-go', partOfSpeech: 'noun' },
                { igbo: 'ahịa', english: 'market', pronunciation: 'a-hi-a', partOfSpeech: 'noun' },
                { igbo: 'ọrụ', english: 'work', pronunciation: 'o-ru', partOfSpeech: 'noun' },
                { igbo: 'onye ahịa', english: 'trader/seller', pronunciation: 'o-nye a-hi-a', partOfSpeech: 'noun' }
            ]
        };

        // Get topic-specific vocabulary or fallback to greetings
        const vocabularyForTopic = topicVocabulary[topic as keyof typeof topicVocabulary] || topicVocabulary.greetings;
        
        // Return the exact number requested, cycling through if needed
        const result = [];
        for (let i = 0; i < size; i++) {
            const vocabItem = vocabularyForTopic[i % vocabularyForTopic.length];
            result.push({
                ...vocabItem,
                id: i + 1,
                difficulty: level,
                topic: topic
            });
        }

        return result;
    }

    private getFallbackExamples(topic: string, size: number) {
        const topicExamples: Record<string, any[]> = {
            greetings: [
                { igbo: 'Nnọọ, kedụ ka ị mere?', english: 'Hello, how are you doing?', pronunciation: 'nno-oh, ke-du ka i me-re' },
                { igbo: 'Aha m bụ Chidi', english: 'My name is Chidi', pronunciation: 'a-ha m bu Chi-di' },
                { igbo: 'Kedụ aha gị?', english: 'What is your name?', pronunciation: 'ke-du a-ha gi' },
                { igbo: 'Dalụ nke ukwuu', english: 'Thank you very much', pronunciation: 'da-lu nke u-kwu-u' },
                { igbo: 'Ka chi fo', english: 'Good morning', pronunciation: 'ka chi fo' }
            ],
            family: [
                { igbo: 'Ezinụlọ m dị ukwuu', english: 'My family is large', pronunciation: 'e-zi-nu-lo m di u-kwu-u' },
                { igbo: 'Nna m na-arụ ọrụ', english: 'My father works', pronunciation: 'nna m na-a-ru o-ru' },
                { igbo: 'Nne m na-esi nri', english: 'My mother cooks food', pronunciation: 'nne m na-e-si nri' },
                { igbo: 'Nwanne m nọ n\'ụlọ akwụkwọ', english: 'My sibling is at school', pronunciation: 'nwa-nne m no n\'u-lo a-kwu-kwo' }
            ],
            food_and_eating: [
                // Basic food examples
                { igbo: 'Ana m eri nri', english: 'I am eating food', pronunciation: 'a-na m e-ri nri' },
                { igbo: 'Ji na ofe mmiri mmiri', english: 'Yam and watery soup', pronunciation: 'ji na o-fe mmi-ri mmi-ri' },
                { igbo: 'Akpu dị ụtọ', english: 'Cassava fufu is sweet/delicious', pronunciation: 'a-kpu di u-to' },
                
                // Cooking and Kitchen Tools examples - TOPIC MATCH
                { igbo: 'Ite a dị ọcha', english: 'This pot is clean', pronunciation: 'i-te a di o-cha' },
                { igbo: 'Were mma gee nri ahụ', english: 'Use the knife to cut that food', pronunciation: 'we-re mma gee nri a-hu' },
                { igbo: 'Efere ndị a dị n\'ebe nsi nri', english: 'These plates are in the kitchen', pronunciation: 'e-fe-re ndi a di n\'e-be nsi nri' },
                { igbo: 'Kwọ iko ahụ', english: 'Wash that cup', pronunciation: 'kwo i-ko a-hu' },
                { igbo: 'Gbanyee ọkụ ka ị sie nri', english: 'Light the fire so you can cook food', pronunciation: 'gba-nye-e o-ku ka i sie nri' },
                { igbo: 'Jiri okwu kpalie ofe ahụ', english: 'Use the ladle to stir that soup', pronunciation: 'ji-ri o-kwu kpa-lie o-fe a-hu' },
                { igbo: 'Ngwa nri ndị a dị mkpa', english: 'These kitchen utensils are important', pronunciation: 'ngwa nri ndi a di mkpa' },
                { igbo: 'Kụọ ji n\'ekwe', english: 'Pound yam in the mortar', pronunciation: 'ku-o ji n\'e-kwe' }
            ],
            numbers: [
                { igbo: 'Ọ nwere otu nwa', english: 'He/She has one child', pronunciation: 'o nwe-re o-tu nwa' },
                { igbo: 'Abụọ ka mma', english: 'Two is better', pronunciation: 'a-bu-o ka mma' },
                { igbo: 'Atọ n\'ime anọ', english: 'Three out of four', pronunciation: 'a-to n\'i-me a-no' }
            ],
            colors: [
                { igbo: 'Uwe ọcha', english: 'White clothes', pronunciation: 'u-we o-cha' },
                { igbo: 'Ntutu ojii', english: 'Black hair', pronunciation: 'ntu-tu o-ji-i' },
                { igbo: 'Ọbara uhie', english: 'Red blood', pronunciation: 'o-ba-ra u-hie' }
            ],
            travel: [
                { igbo: 'Ana m aga ije', english: 'I am going on a journey', pronunciation: 'a-na m a-ga i-je' },
                { igbo: 'Ụgbọ ahụ adịghị arụ ọrụ', english: 'That vehicle is not working', pronunciation: 'u-gbo a-hu a-di-ghi a-ru o-ru' },
                { igbo: 'Okporo ụzọ a mebiri', english: 'This road is damaged', pronunciation: 'o-kpo-ro u-zo a me-bi-ri' }
            ],
            business: [
                { igbo: 'Azụmahịa m na-aga nke ọma', english: 'My business is going well', pronunciation: 'a-zu-ma-hi-a m na-a-ga nke o-ma' },
                { igbo: 'Ego ole ka ị nwere?', english: 'How much money do you have?', pronunciation: 'e-go o-le ka i nwe-re' },
                { igbo: 'Ana m aga ahịa taa', english: 'I am going to the market today', pronunciation: 'a-na m a-ga a-hi-a ta-a' }
            ]
        };

        // Get topic-specific examples or fallback to greetings
        const examplesForTopic = topicExamples[topic as keyof typeof topicExamples] || topicExamples.greetings;
        return examplesForTopic.slice(0, size);
    }

    /**
     * Specialized vocabulary for business-focused number lessons
     */
    private getBusinessNumbersVocabulary(size: number) {
        const businessNumbers = [
            { igbo: 'ego', english: 'money', pronunciation: 'e-go', partOfSpeech: 'noun' },
            { igbo: 'ahịa', english: 'market/business', pronunciation: 'a-hi-a', partOfSpeech: 'noun' },
            { igbo: 'azụmahịa', english: 'trade/commerce', pronunciation: 'a-zu-ma-hi-a', partOfSpeech: 'noun' },
            { igbo: 'ọnụ ahịa', english: 'price', pronunciation: 'o-nu a-hi-a', partOfSpeech: 'noun' },
            { igbo: 'otu naira', english: 'one naira', pronunciation: 'o-tu nai-ra', partOfSpeech: 'noun' },
            { igbo: 'abụọ naira', english: 'two naira', pronunciation: 'a-bu-o nai-ra', partOfSpeech: 'noun' },
            { igbo: 'ire ere', english: 'buying and selling', pronunciation: 'i-re e-re', partOfSpeech: 'noun' },
            { igbo: 'ọrụ azụmahịa', english: 'business work', pronunciation: 'o-ru a-zu-ma-hi-a', partOfSpeech: 'noun' },
            { igbo: 'ego ole?', english: 'how much money?', pronunciation: 'e-go o-le', partOfSpeech: 'phrase' },
            { igbo: 'uru', english: 'profit', pronunciation: 'u-ru', partOfSpeech: 'noun' },
            { igbo: 'ọnụ ọgụgụ', english: 'number/count', pronunciation: 'o-nu o-gu-gu', partOfSpeech: 'noun' },
            { igbo: 'narị', english: 'hundred', pronunciation: 'na-ri', partOfSpeech: 'noun' }
        ];
        return businessNumbers.slice(0, size).map((item, index) => ({
            id: index + 1,
            ...item,
            difficulty: 'beginner',
            topic: 'business_numbers'
        }));
    }

    /**
     * Specialized vocabulary for time-related lessons (years, months)
     */
    private getTimeRelatedVocabulary(size: number) {
        const timeVocabulary = [
            { igbo: 'afọ', english: 'year', pronunciation: 'a-fo', partOfSpeech: 'noun' },
            { igbo: 'ọnwa', english: 'month', pronunciation: 'o-nwa', partOfSpeech: 'noun' },
            { igbo: 'izu', english: 'week', pronunciation: 'i-zu', partOfSpeech: 'noun' },
            { igbo: 'ụbọchị', english: 'day', pronunciation: 'u-bo-chi', partOfSpeech: 'noun' },
            { igbo: 'oge', english: 'time', pronunciation: 'o-ge', partOfSpeech: 'noun' },
            { igbo: 'otu afọ', english: 'one year', pronunciation: 'o-tu a-fo', partOfSpeech: 'phrase' },
            { igbo: 'abụọ ọnwa', english: 'two months', pronunciation: 'a-bu-o o-nwa', partOfSpeech: 'phrase' },
            { igbo: 'atọ izu', english: 'three weeks', pronunciation: 'a-to i-zu', partOfSpeech: 'phrase' },
            { igbo: 'oge gara aga', english: 'past time', pronunciation: 'o-ge ga-ra a-ga', partOfSpeech: 'phrase' },
            { igbo: 'oge na-abịa', english: 'future time', pronunciation: 'o-ge na-a-bi-a', partOfSpeech: 'phrase' },
            { igbo: 'oge ugbu a', english: 'current time', pronunciation: 'o-ge u-gbu a', partOfSpeech: 'phrase' },
            { igbo: 'ọnwa iri na abụọ', english: 'twelve months', pronunciation: 'o-nwa i-ri na a-bu-o', partOfSpeech: 'phrase' }
        ];
        return timeVocabulary.slice(0, size).map((item, index) => ({
            id: index + 1,
            ...item,
            difficulty: 'beginner',
            topic: 'time_numbers'
        }));
    }

    /**
     * Specialized vocabulary for color lessons
     */
    private getColorVocabulary(size: number) {
        const colorVocabulary = [
            { igbo: 'agba', english: 'color', pronunciation: 'a-gba', partOfSpeech: 'noun' },
            { igbo: 'ọcha', english: 'white', pronunciation: 'o-cha', partOfSpeech: 'adjective' },
            { igbo: 'ojii', english: 'black', pronunciation: 'o-ji-i', partOfSpeech: 'adjective' },
            { igbo: 'uhie', english: 'red', pronunciation: 'u-hie', partOfSpeech: 'adjective' },
            { igbo: 'akwụkwọ ndụ', english: 'green', pronunciation: 'a-kwu-kwo n-du', partOfSpeech: 'adjective' },
            { igbo: 'acha odo odo', english: 'yellow', pronunciation: 'a-cha o-do o-do', partOfSpeech: 'adjective' },
            { igbo: 'nchara', english: 'brown', pronunciation: 'n-cha-ra', partOfSpeech: 'adjective' },
            { igbo: 'agba mara mma', english: 'beautiful color', pronunciation: 'a-gba ma-ra mma', partOfSpeech: 'phrase' }
        ];
        return colorVocabulary.slice(0, size).map((item, index) => ({
            id: index + 1,
            ...item,
            difficulty: 'beginner',
            topic: 'colors'
        }));
    }

    /**
     * Specialized vocabulary for food and cooking lessons
     */
    private getFoodAndCookingVocabulary(size: number) {
        const cookingVocabulary = [
            { igbo: 'ite', english: 'pot/cooking pot', pronunciation: 'i-te', partOfSpeech: 'noun' },
            { igbo: 'mma', english: 'knife', pronunciation: 'mma', partOfSpeech: 'noun' },
            { igbo: 'efere', english: 'plate/bowl', pronunciation: 'e-fe-re', partOfSpeech: 'noun' },
            { igbo: 'ngwa nri', english: 'kitchen utensils', pronunciation: 'ngwa nri', partOfSpeech: 'noun' },
            { igbo: 'ọkụ', english: 'fire', pronunciation: 'o-ku', partOfSpeech: 'noun' },
            { igbo: 'sie nri', english: 'cook food', pronunciation: 'sie nri', partOfSpeech: 'verb' },
            { igbo: 'ebe nsi nri', english: 'kitchen', pronunciation: 'e-be nsi nri', partOfSpeech: 'noun' },
            { igbo: 'kwọ efere', english: 'wash plates', pronunciation: 'kwo e-fe-re', partOfSpeech: 'verb' },
            { igbo: 'gee nri', english: 'cut food', pronunciation: 'gee nri', partOfSpeech: 'verb' },
            { igbo: 'iko', english: 'cup', pronunciation: 'i-ko', partOfSpeech: 'noun' },
            { igbo: 'okwu', english: 'ladle', pronunciation: 'o-kwu', partOfSpeech: 'noun' },
            { igbo: 'ekwe', english: 'mortar', pronunciation: 'e-kwe', partOfSpeech: 'noun' }
        ];
        return cookingVocabulary.slice(0, size).map((item, index) => ({
            id: index + 1,
            ...item,
            difficulty: 'beginner',
            topic: 'food_and_eating'
        }));
    }

    private getFallbackDetailedContent(level: string, topic: string) {
        return {
            success: true,
            lessons: this.generateFallbackLessons(level, topic),
            metadata: {
                vocabularyCount: 150,
                phrasesCount: 75,
                exercisesCount: 45,
                audioClipsCount: 120,
                grammarSections: 12,
                culturalNotes: 25
            }
        };
    }

    private generateFallbackLessons(level: string, topic: string) {
        const lessonCount = this.getLessonCount(level);
        return Array.from({ length: lessonCount }, (_, i) => ({
            id: i + 1,
            title: this.generateLessonTitle(i + 1, topic),
            objectives: this.generateLearningObjectives(i + 1, level, topic),
            content: {
                introduction: `Welcome to Lesson ${i + 1} focusing on ${topic} in Igbo language.`,
                vocabulary: [],
                phrases: [],
                grammar: this.generateGrammarExplanation(i + 1, level),
                culturalNotes: `Cultural context for ${topic} in Igbo society.`,
                exercises: []
            },
            difficulty: level,
            estimatedTime: this.calculateLessonTime(level)
        }));
    }

    private calculateLessonTime(level: string): string {
        const times = {
            'beginner': '45-60 minutes',
            'intermediate': '60-75 minutes', 
            'advanced': '75-90 minutes'
        };
        return times[level as keyof typeof times] || '60 minutes';
    }

    private generateLessonIntroduction(lessonNumber: number, topic: string): string {
        return `Welcome to Lesson ${lessonNumber}! In this comprehensive lesson, we'll explore the rich world of ${topic} in Igbo language and culture. You'll learn authentic vocabulary, practical phrases, and cultural insights that will deepen your understanding of Igbo-speaking communities.`;
    }

    private generateCulturalNotes(topic: string): string {
        const notes: Record<string, string> = {
            greetings: 'In Igbo culture, greetings are more than mere pleasantries - they establish respect, acknowledge social hierarchy, and strengthen community bonds. The way you greet someone reflects your understanding of cultural values.',
            family: 'Family structure in Igbo society is deeply rooted in tradition, with extended family playing crucial roles in decision-making, child-rearing, and community support systems.',
            food: 'Food in Igbo culture represents hospitality, celebration, and community. Traditional dishes carry historical significance and are central to festivals and gatherings.'
        };

        return notes[topic] || `Understanding ${topic} in Igbo culture provides insight into traditional values and modern practices.`;
    }

    private formatPhrasesForLesson(examples: any[]): any[] {
        return examples.map(example => ({
            igbo: example.igbo,
            english: example.english,
            pronunciation: example.pronunciation,
            context: this.determineContext(example.igbo),
            formality: this.determineFormalityLevel(example.igbo)
        }));
    }

    private determineContext(phrase: string): string {
        if (phrase.includes('nnọọ') || phrase.includes('kedụ')) return 'greeting';
        if (phrase.includes('ahụ') && phrase.includes('anya')) return 'emotion';
        if (phrase.includes('nri') || phrase.includes('oriri')) return 'food';
        return 'general';
    }

    private determineFormalityLevel(phrase: string): 'formal' | 'informal' | 'neutral' {
        if (phrase.includes('nnọọnụ') || phrase.includes('ndewo')) return 'formal';
        if (phrase.includes('nwa m') || phrase.includes('onye')) return 'informal';
        return 'neutral';
    }

    private generateLessonExercises(lessonNumber: number, vocabulary: any[], examples: any[]) {
        return [
            {
                type: 'vocabulary_matching',
                title: 'Match Igbo words with English meanings',
                items: vocabulary.slice(0, 5)
            },
            {
                type: 'phrase_completion',
                title: 'Complete the Igbo phrases',
                items: examples.slice(0, 3)
            },
            {
                type: 'pronunciation_practice',
                title: 'Practice pronunciation',
                items: vocabulary.slice(0, 8)
            },
            {
                type: 'cultural_context',
                title: 'Cultural understanding questions',
                items: this.generateCulturalQuestions(lessonNumber)
            }
        ];
    }

    private generateCulturalQuestions(lessonNumber: number): any[] {
        return [
            {
                question: 'When is it appropriate to use formal greetings in Igbo culture?',
                options: ['With elders and respected community members', 'Only in business settings', 'Never necessary', 'Only during festivals'],
                correct: 0
            }
        ];
    }

    private generateLessonSummary(lessonNumber: number, topic: string): string {
        return `In this lesson, you've gained comprehensive knowledge about ${topic} in Igbo language and culture. You've learned essential vocabulary, practical phrases, cultural contexts, and grammatical structures that will enhance your communication skills and cultural understanding.`;
    }

    private generatePronunciationNotes(vocabulary: any[]): any[] {
        return vocabulary.map(word => ({
            word: word.igbo || word.word,
            pronunciation: word.pronunciation || word.wordPronunciation,
            notes: this.generatePronunciationTips(word.igbo || word.word),
            tones: this.analyzeTones(word.igbo || word.word)
        }));
    }

    private generatePronunciationTips(word: string): string {
        const tips: Record<string, string> = {
            'nnọọ': 'Elongate the "ọọ" sound with a slight nasal quality',
            'aha': 'Short "a" sounds, avoid English "ay" pronunciation',
            'kedụ': 'The "ụ" is pronounced like "oo" in "book"',
            'gịnị': 'The "ị" is a high front unrounded vowel, shorter than "ee"'
        };

        return tips[word] || `Practice the vowel sounds carefully - Igbo has 8 vowels including dotted letters.`;
    }

    private analyzeTones(word: string): string {
        // Basic tone analysis for Igbo words
        if (word.includes('á') || word.includes('é') || word.includes('í') || word.includes('ó') || word.includes('ú')) {
            return 'high tone';
        } else if (word.includes('à') || word.includes('è') || word.includes('ì') || word.includes('ò') || word.includes('ù')) {
            return 'low tone';
        }
        return 'mid tone';
    }

    private async generateGrammarSection(level: string) {
        // Generate comprehensive grammar explanations
        return Array.from({ length: 6 }, (_, i) => ({
            id: i + 1,
            title: `Grammar Section ${i + 1}`,
            content: this.generateGrammarExplanation(i + 1, level)
        }));
    }

    private async generateCulturalContext(topic: string) {
        return Array.from({ length: 5 }, (_, i) => ({
            id: i + 1,
            title: `Cultural Context ${i + 1}`,
            content: this.generateCulturalNotes(topic)
        }));
    }

    private async generateComprehensiveExercises(level: string, topic: string) {
        console.log(`Step 5: Generating comprehensive exercises...`);
        const exerciseCount = level === 'beginner' ? 15 : level === 'intermediate' ? 20 : 25;
        
        const exerciseTypes = [
            'vocabulary_translation',
            'multiple_choice',
            'fill_in_blank',
            'pronunciation_practice',
            'cultural_understanding',
            'grammar_conjugation'
        ];

        const exercises = [];
        
        for (let i = 0; i < exerciseCount; i++) {
            const type = exerciseTypes[i % exerciseTypes.length];
            const exercise = this.createExerciseByType(type, level, topic, i + 1);
            exercises.push(exercise);
        }

        console.log(`Generated ${exercises.length} exercises`);
        return exercises;
    }

    private createExerciseByType(type: string, level: string, topic: string, id: number): any {
        const exercises = {
            vocabulary_translation: {
                id,
                type: 'translation',
                difficulty: level,
                question: 'Translate the following Igbo word to English:',
                content: 'nnọọ',
                options: ['hello', 'goodbye', 'yes', 'no'],
                correctAnswer: 'hello',
                explanation: 'Nnọọ is a common Igbo greeting meaning hello or welcome.'
            },
            multiple_choice: {
                id,
                type: 'multiple_choice',
                difficulty: level,
                question: 'Which of the following is the correct way to ask "What is your name?" in Igbo?',
                options: [
                    'Kedụ aha gị?',
                    'Kedụ ka ị mere?',
                    'Gịnị ka ị na-eme?',
                    'Oleé ka ị dị?'
                ],
                correctAnswer: 'Kedụ aha gị?',
                explanation: 'Kedụ aha gị? literally means "What is your name?" in Igbo.'
            },
            fill_in_blank: {
                id,
                type: 'fill_blank',
                difficulty: level,
                question: 'Complete the sentence: "Aha m _____ Chidi"',
                content: 'Aha m _____ Chidi',
                correctAnswer: 'bụ',
                explanation: 'The verb "bụ" means "is" in Igbo, completing "My name is Chidi".'
            },
            pronunciation_practice: {
                id,
                type: 'pronunciation',
                difficulty: level,
                question: 'Practice pronouncing this Igbo word correctly:',
                content: 'ezinụlọ',
                pronunciation: 'e-zi-nu-lo',
                explanation: 'Break it down into syllables: e-zi-nu-lo (family)'
            },
            cultural_understanding: {
                id,
                type: 'cultural',
                difficulty: level,
                question: 'In Igbo culture, what is the significance of greeting elders first?',
                options: [
                    'It shows respect and acknowledges their wisdom',
                    'It is just a random tradition',
                    'It helps you remember their names',
                    'It is required by law'
                ],
                correctAnswer: 'It shows respect and acknowledges their wisdom',
                explanation: 'Respecting elders is fundamental in Igbo culture, reflecting values of wisdom and community hierarchy.'
            },
            grammar_conjugation: {
                id,
                type: 'grammar',
                difficulty: level,
                question: 'How would you conjugate "to go" (ịga) for "I am going"?',
                options: ['Ana m aga', 'Aga m', 'M ga-aga', 'Ana aga m'],
                correctAnswer: 'Ana m aga',
                explanation: 'Ana m aga means "I am going" - ana indicates present continuous tense.'
            }
        };

        return exercises[type as keyof typeof exercises] || exercises.vocabulary_translation;
    }

    private async generatePronunciationGuide(level: string) {
        const guideCount = level === 'beginner' ? 50 : level === 'intermediate' ? 75 : 100;
        
        return Array.from({ length: guideCount }, (_, i) => ({
            id: i + 1,
            word: `word_${i + 1}`,
            pronunciation: `pronunciation_${i + 1}`,
            audioUrl: `audio_${i + 1}.mp3`
        }));
    }
}

// MAVEN API Integration for African languages
export class MavenAPI {
    private baseUrl = 'https://api.maven-africa.com/v1';
    
    async getLanguageData(language: string) {
        try {
            const response = await fetch(`${this.baseUrl}/languages/${language}/data`, {
                headers: {
                    'Authorization': `Bearer ${MAVEN_API_KEY}`,
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
                    'Authorization': `Bearer ${MAVEN_API_KEY}`
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
                    'Authorization': `Bearer ${MAVEN_API_KEY}`
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
            const [mavenVocabRaw, igboWordsRaw, lanfricaDataRaw] = await Promise.all([
                this.maven.getVocabulary(language, topic).catch(() => []),
                language.toLowerCase() === 'igbo' ? this.igbo.getWords(topic).catch(() => []) : Promise.resolve([]),
                this.lanfrica.getDatasets(language).catch(() => [])
            ]);
            const mavenVocab = Array.isArray(mavenVocabRaw) ? mavenVocabRaw : [];
            const igboWords = Array.isArray(igboWordsRaw) ? igboWordsRaw : [];
            const lanfricaData = Array.isArray(lanfricaDataRaw) ? lanfricaDataRaw : [];
            
            // Get phrases and examples
            let phrases = [];
            try {
                const result = await this.maven.getPhrases(language, level);
                phrases = Array.isArray(result) ? result : [];
            } catch { phrases = []; }

            // Get audio content
            let audioClips = [];
            try {
                const result = await this.commonVoice.getAudioClips(language);
                audioClips = Array.isArray(result) ? result : [];
            } catch { audioClips = []; }
            
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
            const languageEnum = language.toUpperCase();
            for (const item of vocab) {
                try {
                    await db.$executeRawUnsafe(
                        `INSERT INTO vocabulary (id, language, word, translation, pronunciation, category, source, "createdAt", "updatedAt")
                        VALUES (gen_random_uuid(), $1::"Language", $2, $3, $4, $5, 'MAVEN_FALLBACK', NOW(), NOW())
                        ON CONFLICT (language, word) DO UPDATE SET
                        translation = EXCLUDED.translation,
                        pronunciation = EXCLUDED.pronunciation,
                        "updatedAt" = NOW()`,
                        languageEnum,
                        item.word,
                        item.translation,
                        item.pronunciation || '',
                        topic
                    );
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
                ? `SELECT * FROM vocabulary WHERE language = $1::"Language" AND category = $2 LIMIT 20`
                : `SELECT * FROM vocabulary WHERE language = $1::"Language" LIMIT 20`;
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
        
        console.log(`🎯 Generating structured lessons for ${topic} with ${vocabulary?.length || 0} vocabulary items and ${phrases?.length || 0} phrases`);
        
        // Generate multiple lessons using the enhanced lesson generation
        const lessonCount = this.getLessonCount(level);
        console.log(`📚 Creating ${lessonCount} lessons for ${level} level`);
        
        for (let i = 1; i <= lessonCount; i++) {
            const lesson = await this.generateDetailedLesson(i, level, topic);
            
            // Add specific vocabulary and phrases if available
            if (vocabulary?.length > 0 || igboWords?.length > 0) {
                const vocabForLesson = [...(vocabulary || []), ...(igboWords || [])].slice((i-1) * 5, i * 5);
                if (vocabForLesson.length > 0) {
                    lesson.vocabulary = vocabForLesson.map((item, idx) => ({
                        id: idx + 1,
                        word: item.word || item.igbo,
                        translation: item.translation || item.english,
                        pronunciation: item.pronunciation || '',
                        difficulty: level.toUpperCase(),
                        audioUrl: '',
                        imageUrl: ''
                    }));
                }
            }
            
            // Add specific phrases if available
            if (phrases?.length > 0) {
                const phrasesForLesson = phrases.slice((i-1) * 3, i * 3);
                lesson.phrases = phrasesForLesson;
            }
            
            // Add audio content if available
            if (audioClips?.length > 0) {
                lesson.audioContent = audioClips.slice((i-1) * 2, i * 2);
            }
            
            lessons.push(lesson);
        }
        
        console.log(`✅ Generated ${lessons.length} complete lessons with vocabulary, content, and structure`);
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

// Export both generators
export const detailedIgboGenerator = new DetailedIgboContentGenerator();
export const contentGenerator = new AfricanContentGenerator();

// Enhanced content generator that uses detailed Igbo generator for Igbo content
export class EnhancedContentGenerator {
    private igboGenerator = new DetailedIgboContentGenerator();
    private generalGenerator = new AfricanContentGenerator();

    async generateCourseContent(language: string, level: string, topic: string) {
        if (language.toLowerCase() === 'igbo') {
            console.log('Using detailed Igbo content generator');
            return await this.igboGenerator.generateCourse(level, topic);
        } else {
            console.log('Using general content generator');
            return await this.generalGenerator.generateCourseContent(language, level, topic);
        }
    }
}

// Export the enhanced content generator as the main one
export const enhancedContentGenerator = new EnhancedContentGenerator();
