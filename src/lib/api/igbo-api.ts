/**
 * Igbo API Integration
 * Official Igbo API for authentic Igbo language content
 * https://igboapi.com/
 */

export interface IgboWord {
  id: string;
  word: string;
  wordPronunciation: string;
  definitions: Array<{
    wordClass: string;
    definitions: string[];
    igboDefinitions?: Array<{
      igbo: string;
      english: string;
    }>;
  }>;
  examples: Array<{
    igbo: string;
    english: string;
    pronunciation?: string;
  }>;
  pronunciation?: string;
  variations?: string[];
  stems?: string[];
  relatedTerms?: string[];
  hypernyms?: string[];
  hyponyms?: string[];
}

export interface IgboExample {
  id: string;
  igbo: string;
  english: string;
  pronunciation?: string;
  associatedWords: string[];
}

export class IgboApiService {
  private baseUrl = 'https://igboapi.com/api/v1';
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(endpoint: string, params: Record<string, any> = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Add common parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });

    // Try different authentication methods
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add API key - try multiple formats
    if (this.apiKey) {
      // Try the most common formats
      url.searchParams.append('key', this.apiKey);
      headers['X-API-Key'] = this.apiKey;
      headers['Authorization'] = `Bearer ${this.apiKey}`;
      headers['api-key'] = this.apiKey;
    }

    try {
      console.log(`Making Igbo API request to: ${url.toString()}`);
      console.log(`Using API key: ${this.apiKey ? 'Yes' : 'No'}`);
      
      const response = await fetch(url.toString(), { 
        headers,
        method: 'GET'
      });

      console.log(`Igbo API response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Igbo API error details:`, errorText);
        console.log('Using fallback data due to API error');
        return this.getFallbackData(endpoint, params);
      }

      const data = await response.json();
      console.log('Igbo API response received:', Array.isArray(data) ? `${data.length} items` : 'data object');
      return data;
    } catch (error) {
      console.error('Igbo API request failed:', error);
      console.log('Using fallback data instead');
      // Return fallback data for development
      return this.getFallbackData(endpoint, params);
    }
  }

  private getFallbackData(endpoint: string, params: Record<string, any>) {
    console.log('Providing fallback data for:', endpoint, params);
    
    // Comprehensive fallback data for when API is unavailable
    if (endpoint.includes('/words')) {
      return this.getFallbackWords(params);
    }
    if (endpoint.includes('/examples')) {
      return this.getFallbackExamples(params);
    }
    return [];
  }

  private getFallbackWords(params: Record<string, any>): IgboWord[] {
    const fallbackWords: IgboWord[] = [
      {
        id: '1',
        word: 'nnọọ',
        wordPronunciation: 'nno-oh',
        definitions: [{
          wordClass: 'interjection',
          definitions: ['hello', 'welcome', 'greeting'],
          igboDefinitions: [{
            igbo: 'ekele',
            english: 'greeting'
          }]
        }],
        examples: [
          {
            igbo: 'Nnọọ nwa m',
            english: 'Hello my child',
            pronunciation: 'nno-oh nwa m'
          },
          {
            igbo: 'Nnọọ, kedụ ka ị mere?',
            english: 'Hello, how are you doing?',
            pronunciation: 'nno-oh, ke-du ka i me-re'
          }
        ],
        variations: ['nnọ', 'nnọọnụ'],
        relatedTerms: ['ekele', 'ndewo']
      },
      {
        id: '2',
        word: 'aha',
        wordPronunciation: 'a-ha',
        definitions: [{
          wordClass: 'noun',
          definitions: ['name', 'title', 'designation'],
          igboDefinitions: [{
            igbo: 'ihe a na-akpọ mmadụ',
            english: 'what a person is called'
          }]
        }],
        examples: [
          {
            igbo: 'Aha m bụ Chidi',
            english: 'My name is Chidi',
            pronunciation: 'a-ha m bu Chi-di'
          },
          {
            igbo: 'Kedụ aha gị?',
            english: 'What is your name?',
            pronunciation: 'ke-du a-ha gi'
          }
        ],
        relatedTerms: ['aha nne', 'aha nna']
      },
      {
        id: '3',
        word: 'azụmahịa',
        wordPronunciation: 'a-zu-ma-hi-a',
        definitions: [{
          wordClass: 'noun',
          definitions: ['business', 'trade', 'commerce'],
          igboDefinitions: [{
            igbo: 'ọrụ ahịa',
            english: 'trade work'
          }]
        }],
        examples: [
          {
            igbo: 'Azụmahịa m na-aga nke ọma',
            english: 'My business is going well',
            pronunciation: 'a-zu-ma-hi-a m na-a-ga nke o-ma'
          }
        ],
        relatedTerms: ['ahịa', 'ọrụ', 'ego']
      },
      {
        id: '4',
        word: 'ego',
        wordPronunciation: 'e-go',
        definitions: [{
          wordClass: 'noun',
          definitions: ['money', 'wealth', 'riches'],
          igboDefinitions: [{
            igbo: 'ihe e ji azụ ahịa',
            english: 'what is used for trading'
          }]
        }],
        examples: [
          {
            igbo: 'Ego m dị ole?',
            english: 'How much money do I have?',
            pronunciation: 'e-go m di o-le'
          }
        ],
        relatedTerms: ['naira', 'ọlaedo', 'akụ']
      },
      {
        id: '5',
        word: 'ahịa',
        wordPronunciation: 'a-hi-a',
        definitions: [{
          wordClass: 'noun',
          definitions: ['market', 'trade', 'goods'],
          igboDefinitions: [{
            igbo: 'ebe e na-ere ihe',
            english: 'place where things are sold'
          }]
        }],
        examples: [
          {
            igbo: 'Ana m aga ahịa taa',
            english: 'I am going to the market today',
            pronunciation: 'a-na m a-ga a-hi-a ta-a'
          }
        ],
        relatedTerms: ['ọkaahịa', 'ndị na-ere ahịa']
      },
      {
        id: '6',
        word: 'ọrụ',
        wordPronunciation: 'o-ru',
        definitions: [{
          wordClass: 'noun',
          definitions: ['work', 'job', 'task'],
          igboDefinitions: [{
            igbo: 'ihe mmadụ na-eme',
            english: 'what a person does'
          }]
        }],
        examples: [
          {
            igbo: 'Ọrụ m dị mma',
            english: 'My work is good',
            pronunciation: 'o-ru m di m-ma'
          }
        ],
        relatedTerms: ['ọrụ aka', 'ọrụ ubi']
      },
      {
        id: '7',
        word: 'onye',
        wordPronunciation: 'o-nye',
        definitions: [{
          wordClass: 'noun',
          definitions: ['person', 'someone', 'individual'],
          igboDefinitions: [{
            igbo: 'mmadụ',
            english: 'human being'
          }]
        }],
        examples: [
          {
            igbo: 'Onye ahụ bụ onye ọma',
            english: 'That person is a good person',
            pronunciation: 'o-nye a-hu bu o-nye o-ma'
          }
        ],
        relatedTerms: ['mmadụ', 'nwoke', 'nwanyị']
      },
      {
        id: '8',
        word: 'ụlọ',
        wordPronunciation: 'u-lo',
        definitions: [{
          wordClass: 'noun',
          definitions: ['house', 'building', 'home'],
          igboDefinitions: [{
            igbo: 'ebe mmadụ na-ebi',
            english: 'where a person lives'
          }]
        }],
        examples: [
          {
            igbo: 'Ụlọ m dị mma',
            english: 'My house is beautiful',
            pronunciation: 'u-lo m di m-ma'
          }
        ],
        relatedTerms: ['ụlọ obibi', 'ụlọ akwụkwọ']
      },
      {
        id: '9',
        word: 'nri',
        wordPronunciation: 'nri',
        definitions: [{
          wordClass: 'noun',
          definitions: ['food', 'meal', 'nutrition'],
          igboDefinitions: [{
            igbo: 'ihe mmadụ na-eri',
            english: 'what a person eats'
          }]
        }],
        examples: [
          {
            igbo: 'Nri a na-atọ ụtọ',
            english: 'This food is delicious',
            pronunciation: 'nri a na-a-to u-to'
          }
        ],
        relatedTerms: ['oriri', 'ụtọ', 'rie']
      },
      {
        id: '10',
        word: 'mmadụ',
        wordPronunciation: 'm-ma-du',
        definitions: [{
          wordClass: 'noun',
          definitions: ['person', 'human being', 'people'],
          igboDefinitions: [{
            igbo: 'ihe ndụ nwere ọgụgụ isi',
            english: 'living thing with intelligence'
          }]
        }],
        examples: [
          {
            igbo: 'Mmadụ niile kwesịrị nsọpụrụ',
            english: 'All people deserve respect',
            pronunciation: 'm-ma-du ni-le kwe-si-ri nso-pu-ru'
          }
        ],
        relatedTerms: ['onye', 'nwa mmadụ']
      }
    ];

    const limit = parseInt(params.range?.match(/\d+/)?.[0] || '20');
    return fallbackWords.slice(0, Math.min(limit, fallbackWords.length));
  }

  private getFallbackExamples(params: Record<string, any>): IgboExample[] {
    const fallbackExamples: IgboExample[] = [
      {
        id: '1',
        igbo: 'Ana m ahụ gị n\'anya',
        english: 'I love you',
        pronunciation: 'a-na m a-hu gi n\'a-nya',
        associatedWords: ['ahụ', 'anya', 'hụ']
      },
      {
        id: '2',
        igbo: 'Nri a na-atọ ụtọ',
        english: 'This food is delicious',
        pronunciation: 'nri a na-a-to u-to',
        associatedWords: ['nri', 'atọ', 'ụtọ']
      },
      {
        id: '3',
        igbo: 'Azụmahịa m na-aga nke ọma',
        english: 'My business is going well',
        pronunciation: 'a-zu-ma-hi-a m na-a-ga nke o-ma',
        associatedWords: ['azụmahịa', 'aga', 'ọma']
      },
      {
        id: '4',
        igbo: 'Ego ole ka ị nwere?',
        english: 'How much money do you have?',
        pronunciation: 'e-go o-le ka i nwe-re',
        associatedWords: ['ego', 'ole', 'nwere']
      },
      {
        id: '5',
        igbo: 'Ana m aga ahịa taa',
        english: 'I am going to the market today',
        pronunciation: 'a-na m a-ga a-hi-a ta-a',
        associatedWords: ['aga', 'ahịa', 'taa']
      },
      {
        id: '6',
        igbo: 'Ọrụ m dị mma',
        english: 'My work is good',
        pronunciation: 'o-ru m di m-ma',
        associatedWords: ['ọrụ', 'dị', 'mma']
      },
      {
        id: '7',
        igbo: 'Onye ahụ bụ enyi m',
        english: 'That person is my friend',
        pronunciation: 'o-nye a-hu bu e-nyi m',
        associatedWords: ['onye', 'enyi', 'ahụ']
      },
      {
        id: '8',
        igbo: 'Ụlọ m dị na Lagos',
        english: 'My house is in Lagos',
        pronunciation: 'u-lo m di na La-gos',
        associatedWords: ['ụlọ', 'dị', 'Lagos']
      }
    ];

    const limit = parseInt(params.range?.match(/\d+/)?.[0] || '20');
    return fallbackExamples.slice(0, Math.min(limit, fallbackExamples.length));
  }

  /**
   * Search for Igbo words
   */
  async searchWords(query: string, limit = 20): Promise<IgboWord[]> {
    const response = await this.makeRequest('/words', {
      keyword: query,
      page: 0,
      size: limit,
      dialects: true,
      examples: true,
      pronunciation: true
    });
    return response;
  }

  /**
   * Get a specific word by ID
   */
  async getWord(id: string): Promise<IgboWord> {
    const response = await this.makeRequest(`/words/${id}`, {
      dialects: true,
      examples: true,
      pronunciation: true
    });
    return response;
  }

  /**
   * Get examples for learning
   */
  async getExamples(limit = 50): Promise<IgboExample[]> {
    const response = await this.makeRequest('/examples', {
      page: 0,
      size: limit,
      pronunciation: true
    });
    return response;
  }

  /**
   * Search examples by keyword
   */
  async searchExamples(keyword: string, limit = 20): Promise<IgboExample[]> {
    const response = await this.makeRequest('/examples', {
      keyword,
      page: 0,
      size: limit,
      pronunciation: true
    });
    return response;
  }

  /**
   * Get words by part of speech for grammar lessons
   */
  async getWordsByPartOfSpeech(partOfSpeech: string, limit = 30): Promise<IgboWord[]> {
    console.log(`Requesting ${limit} words with part of speech: ${partOfSpeech}`);
    
    try {
      const response = await this.makeRequest('/words', {
        page: 0,
        size: limit,
        examples: true,
        pronunciation: true
      });
      
      // Filter by part of speech if we got real data
      if (Array.isArray(response) && response.length > 0) {
        const filtered = response.filter(word => 
          word.definitions?.some((def: any) => 
            def.wordClass?.toLowerCase() === partOfSpeech.toLowerCase()
          )
        );
        return filtered.slice(0, limit);
      }
      
      return response || [];
    } catch (error) {
      console.log(`Falling back to demo data for part of speech: ${partOfSpeech}`);
      return this.getFallbackWordsByPartOfSpeech(partOfSpeech, limit);
    }
  }

  private getFallbackWordsByPartOfSpeech(partOfSpeech: string, limit: number): IgboWord[] {
    const allWords = this.getFallbackWords({ range: `[0,50]` });
    
    // Filter by part of speech
    const filtered = allWords.filter(word => 
      word.definitions?.some(def => 
        def.wordClass?.toLowerCase() === partOfSpeech.toLowerCase()
      )
    );
    
    return filtered.slice(0, limit);
  }

  /**
   * Get random words for vocabulary practice
   */
  async getRandomWords(limit = 10): Promise<IgboWord[]> {
    const response = await this.makeRequest('/words', {
      range: `[0,${limit * 5}]`, // Get more to randomize
      examples: true,
      pronunciation: true
    });
    
    // Shuffle and return requested amount
    const shuffled = response.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  }

  /**
   * Get words for specific difficulty levels
   */
  async getWordsByDifficulty(level: 'beginner' | 'intermediate' | 'advanced'): Promise<IgboWord[]> {
    let limit: number;

    switch (level) {
      case 'beginner':
        limit = 20; // Start even smaller to test
        break;
      case 'intermediate':
        limit = 50;
        break;
      case 'advanced':
        limit = 100;
        break;
      default:
        limit = 20;
    }

    console.log(`Requesting ${limit} words for ${level} level`);

    // Try the simplest API call possible first
    const response = await this.makeRequest('/words', {
      size: limit
    });

    return response;
  }
}

// Create singleton instance with API key from environment
import { env } from '$env/dynamic/private';
export const igboApi = new IgboApiService(env.IGBO_API_KEY);
