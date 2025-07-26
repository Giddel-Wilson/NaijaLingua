/**
 * Integrated African Language Content Generator
 * Combines MAVEN, Igbo API, CommonVoice, and Lanfrica datasets
 * to automatically generate comprehensive language learning modules
 */

import { igboApi, type IgboWord } from './igbo-api';
import { lanfricaService, type LanfricaResource } from './lanfrica';
import { mavenService } from './maven';
import type { Language, Level } from '@prisma/client';

export interface GeneratedLesson {
  title: string;
  description: string;
  contentHtml: string;
  vocabulary: Array<{
    word: string;
    translation: string;
    pronunciation?: string;
    audioUrl?: string;
    examples: string[];
  }>;
  exercises: Array<{
    type: 'vocabulary' | 'pronunciation' | 'grammar' | 'listening' | 'cultural';
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
    audioUrl?: string;
  }>;
  culturalNotes: string[];
  audioResources: string[];
}

export interface GeneratedCourse {
  title: string;
  description: string;
  language: Language;
  level: Level;
  lessons: GeneratedLesson[];
  totalDuration: number;
  skills: string[];
}

export class AfricanLanguageContentGenerator {
  private readonly languageMap: Record<string, string> = {
    YORUBA: 'yo',
    IGBO: 'ig',
    HAUSA: 'ha',
    SWAHILI: 'sw',
    AMHARIC: 'am',
    EFIK: 'ef',
    TIV: 'tiv',
    FULFULDE: 'ff',
    KANURI: 'kr',
    IBIBIO: 'ibb',
    EDO: 'edo',
    IJAW: 'ijw',
    PIDGIN: 'pcm'
  };

  /**
   * Generate a complete course for an African language
   */
  async generateCourse(
    language: Language,
    level: Level,
    targetLessons = 10
  ): Promise<GeneratedCourse> {
    const langCode = this.languageMap[language];
    if (!langCode) {
      throw new Error(`Language ${language} not supported for content generation`);
    }

    console.log(`Generating ${level} course for ${language}...`);

    // Get base content from various sources
    const [
      vocabularyWords,
      culturalResources,
      lanfricaContent
    ] = await Promise.all([
      this.getVocabularyForLevel(langCode, level),
      lanfricaService.getLearningResources(langCode),
      lanfricaService.processDatasetToModules(`${langCode}-dataset`)
    ]);

    // Generate lessons
    const lessons: GeneratedLesson[] = [];
    const wordsPerLesson = Math.ceil(vocabularyWords.length / targetLessons);

    for (let i = 0; i < targetLessons; i++) {
      const lessonWords = vocabularyWords.slice(i * wordsPerLesson, (i + 1) * wordsPerLesson);
      const lesson = await this.generateLesson(
        language,
        level,
        i + 1,
        lessonWords,
        lanfricaContent,
        culturalResources.slice(i, i + 2)
      );
      lessons.push(lesson);
    }

    return {
      title: `Complete ${language} Course - ${level} Level`,
      description: this.generateCourseDescription(language, level),
      language,
      level,
      lessons,
      totalDuration: lessons.reduce((sum, lesson) => sum + this.estimateLessonDuration(lesson), 0),
      skills: this.getSkillsForLevel(level)
    };
  }

  /**
   * Generate a single lesson
   */
  private async generateLesson(
    language: Language,
    level: Level,
    lessonNumber: number,
    vocabularyWords: IgboWord[],
    lanfricaContent: {
      vocabulary: Array<{ word: string; translation: string; examples: string[] }>;
      grammar: Array<{ rule: string; explanation: string; examples: string[] }>;
      culture: Array<{ topic: string; content: string; context: string }>;
      stories: Array<{ title: string; content: string; moral?: string }>;
    },
    culturalResources: LanfricaResource[]
  ): Promise<GeneratedLesson> {
    const langCode = this.languageMap[language];
    
    // Generate lesson content
    const vocabulary = await this.processVocabulary(vocabularyWords, langCode);
    const exercises = await this.generateExercises(vocabularyWords, level, langCode);
    const culturalNotes = this.extractCulturalNotes(culturalResources);
    
    const title = this.generateLessonTitle(language, lessonNumber);
    const contentHtml = await this.generateLessonContent(
      title,
      vocabulary,
      culturalNotes,
      lanfricaContent.grammar.slice(0, 2)
    );

    return {
      title,
      description: `Lesson ${lessonNumber}: Learn essential ${language} vocabulary and pronunciation`,
      contentHtml,
      vocabulary,
      exercises,
      culturalNotes,
      audioResources: vocabulary.map(v => v.audioUrl).filter(Boolean) as string[]
    };
  }

  /**
   * Get vocabulary appropriate for the learning level
   */
  private async getVocabularyForLevel(langCode: string, level: Level): Promise<IgboWord[]> {
    if (langCode === 'ig') {
      return await igboApi.getWordsByDifficulty(
        level === 'BEGINNER' ? 'beginner' : 
        level === 'INTERMEDIATE' ? 'intermediate' : 'advanced'
      );
    }
    
    // For other languages, return mock data based on common patterns
    return this.generateMockVocabulary(langCode, level);
  }

  /**
   * Process vocabulary with pronunciation and audio
   */
  private async processVocabulary(words: IgboWord[], langCode: string) {
    const vocabulary = [];

    for (const word of words.slice(0, 10)) { // Limit to 10 words per lesson
      try {
        // Generate pronunciation audio using MAVEN
        const ttsResult = await mavenService.textToSpeech(word.word, langCode);
        
        vocabulary.push({
          word: word.word,
          translation: word.definitions[0]?.definitions[0] || 'Translation not available',
          pronunciation: word.pronunciation || word.wordPronunciation,
          audioUrl: ttsResult.audioUrl,
          examples: word.examples?.map(ex => ex.igbo) || []
        });
      } catch (error) {
        console.warn(`Failed to process word ${word.word}:`, error);
        vocabulary.push({
          word: word.word,
          translation: word.definitions[0]?.definitions[0] || 'Translation not available',
          pronunciation: word.pronunciation || word.wordPronunciation,
          examples: word.examples?.map(ex => ex.igbo) || []
        });
      }
    }

    return vocabulary;
  }

  /**
   * Generate interactive exercises
   */
  private async generateExercises(words: IgboWord[], level: Level, langCode: string) {
    const exercises = [];

    // Vocabulary matching exercises
    for (let i = 0; i < Math.min(5, words.length); i++) {
      const word = words[i];
      const correctAnswer = word.definitions[0]?.definitions[0] || 'Translation';
      
      // Generate distractors from other words
      const distractors = words
        .filter((_, idx) => idx !== i)
        .slice(0, 3)
        .map(w => w.definitions[0]?.definitions[0] || 'Translation');

      exercises.push({
        type: 'vocabulary' as const,
        question: `What does "${word.word}" mean?`,
        options: [correctAnswer, ...distractors].sort(() => 0.5 - Math.random()),
        correctAnswer,
        explanation: `"${word.word}" means "${correctAnswer}". ${word.examples?.[0]?.english || ''}`
      });
    }

    // Pronunciation exercises
    if (level !== 'BEGINNER') {
      for (let i = 0; i < 3; i++) {
        const word = words[i];
        if (word) {
          const ttsResult = await mavenService.textToSpeech(word.word, langCode);
          exercises.push({
            type: 'pronunciation' as const,
            question: `Listen and repeat: "${word.word}"`,
            correctAnswer: word.word,
            explanation: `Practice the pronunciation of "${word.word}". Pay attention to tone and rhythm.`,
            audioUrl: ttsResult.audioUrl
          });
        }
      }
    }

    // Grammar exercises for intermediate/advanced
    if (level === 'INTERMEDIATE' || level === 'ADVANCED') {
      exercises.push({
        type: 'grammar' as const,
        question: 'Which greeting is most appropriate in the morning?',
        options: ['Ndeewo', 'Ka chi fo', 'Dalu', 'Biko'],
        correctAnswer: 'Ka chi fo',
        explanation: '"Ka chi fo" means "good morning" and is used specifically for morning greetings.'
      });
    }

    return exercises;
  }

  /**
   * Generate lesson content HTML
   */
  private async generateLessonContent(
    title: string,
    vocabulary: Array<{
      word: string;
      translation: string;
      pronunciation?: string;
      audioUrl?: string;
      examples: string[];
    }>,
    culturalNotes: string[],
    grammarRules: Array<{ rule: string; explanation: string; examples: string[] }>
  ): Promise<string> {
    return `
      <div class="lesson-content">
        <h1>${title}</h1>
        
        <section class="vocabulary-section">
          <h2>Vocabulary</h2>
          <div class="vocabulary-grid">
            ${vocabulary.map(word => `
              <div class="vocabulary-item">
                <div class="word">${word.word}</div>
                <div class="pronunciation">[${word.pronunciation || 'pronunciation'}]</div>
                <div class="translation">${word.translation}</div>
                ${word.audioUrl ? `<audio controls><source src="${word.audioUrl}" type="audio/mpeg"></audio>` : ''}
                ${word.examples.length > 0 ? `
                  <div class="examples">
                    <strong>Examples:</strong>
                    <ul>${word.examples.map(ex => `<li>${ex}</li>`).join('')}</ul>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </section>

        ${grammarRules.length > 0 ? `
          <section class="grammar-section">
            <h2>Grammar Notes</h2>
            ${grammarRules.map(rule => `
              <div class="grammar-rule">
                <h3>${rule.rule}</h3>
                <p>${rule.explanation}</p>
                <div class="examples">
                  ${rule.examples.map(ex => `<div class="example">${ex}</div>`).join('')}
                </div>
              </div>
            `).join('')}
          </section>
        ` : ''}

        ${culturalNotes.length > 0 ? `
          <section class="cultural-section">
            <h2>Cultural Notes</h2>
            ${culturalNotes.map(note => `<div class="cultural-note">${note}</div>`).join('')}
          </section>
        ` : ''}

        <section class="practice-section">
          <h2>Practice</h2>
          <p>Complete the exercises below to test your understanding of this lesson.</p>
        </section>
      </div>
    `;
  }

  /**
   * Helper methods
   */
  private generateCourseDescription(language: Language, level: Level): string {
    return `Learn ${language} through authentic African content. This ${level.toLowerCase()}-level course uses real language data from native speakers, cultural contexts, and voice-enabled learning to help you master ${language} effectively.`;
  }

  private generateLessonTitle(language: Language, lessonNumber: number): string {
    const themes = [
      'Greetings and Basic Expressions',
      'Family and Relationships',
      'Food and Cooking',
      'Daily Activities',
      'Weather and Seasons',
      'Shopping and Market',
      'Travel and Transportation',
      'Work and Professions',
      'Health and Body',
      'Celebrations and Traditions'
    ];
    
    return `Lesson ${lessonNumber}: ${themes[lessonNumber - 1] || `Vocabulary Set ${lessonNumber}`}`;
  }

  private extractCulturalNotes(resources: LanfricaResource[]): string[] {
    return resources
      .filter(r => r.category === 'culture')
      .map(r => r.content)
      .slice(0, 3);
  }

  private estimateLessonDuration(lesson: GeneratedLesson): number {
    // Estimate based on content complexity
    const vocabularyTime = lesson.vocabulary.length * 2; // 2 minutes per word
    const exerciseTime = lesson.exercises.length * 1.5; // 1.5 minutes per exercise
    const readingTime = Math.ceil(lesson.contentHtml.length / 1000) * 2; // Reading speed
    
    return vocabularyTime + exerciseTime + readingTime;
  }

  private getSkillsForLevel(level: Level): string[] {
    const skills = {
      BEGINNER: ['Basic Vocabulary', 'Pronunciation', 'Simple Greetings', 'Numbers', 'Colors'],
      INTERMEDIATE: ['Conversational Skills', 'Grammar Rules', 'Cultural Understanding', 'Listening Comprehension'],
      ADVANCED: ['Fluent Communication', 'Literature Appreciation', 'Advanced Grammar', 'Cultural Nuances', 'Professional Language']
    };
    
    return skills[level] || skills.BEGINNER;
  }

  private generateMockVocabulary(langCode: string, level: Level): IgboWord[] {
    // Generate mock vocabulary for languages other than Igbo
    const mockWords = {
      yo: { // Yoruba
        beginner: ['mo', 'bawo', 'emi', 'iwo', 'wa', 'lo', 'nibo', 'nigbati'],
        intermediate: ['oriṣiriṣi', 'alapọju', 'iyipada', 'imọlara', 'iṣoro'],
        advanced: ['aṣekára', 'amọdaju', 'iṣẹlọpọ', 'iyalẹnu', 'aṣeyori']
      },
      ha: { // Hausa
        beginner: ['ina', 'kwana', 'yaya', 'ina', 'kai', 'ni', 'mu', 'su'],
        intermediate: ['mutane', 'gidan', 'kasuwa', 'aikin', 'kayan'],
        advanced: ['manufa', 'haɗuwa', 'tsarin', 'al\'ada', 'hikima']
      }
    };

    const levelWords = mockWords[langCode as keyof typeof mockWords];
    if (!levelWords) return [];

    const words = levelWords[level.toLowerCase() as keyof typeof levelWords] || levelWords.beginner;
    
    return words.map((word, index) => ({
      id: `${langCode}-${word}-${index}`,
      word,
      wordPronunciation: word,
      definitions: [{
        wordClass: 'noun',
        definitions: [`Translation of ${word}`]
      }],
      examples: [{
        igbo: `Example with ${word}`,
        english: `English example with ${word}`
      }]
    }));
  }
}

// Export singleton instance
export const contentGenerator = new AfricanLanguageContentGenerator();
