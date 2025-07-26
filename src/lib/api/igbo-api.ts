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

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    const response = await fetch(url.toString(), { headers });

    if (!response.ok) {
      throw new Error(`Igbo API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Search for Igbo words
   */
  async searchWords(query: string, limit = 20): Promise<IgboWord[]> {
    const response = await this.makeRequest('/words', {
      keyword: query,
      range: `[0,${limit}]`,
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
      range: `[0,${limit}]`,
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
      range: `[0,${limit}]`,
      pronunciation: true
    });
    return response;
  }

  /**
   * Get words by part of speech for grammar lessons
   */
  async getWordsByPartOfSpeech(partOfSpeech: string, limit = 30): Promise<IgboWord[]> {
    const response = await this.makeRequest('/words', {
      filter: JSON.stringify({ definitions: { $elemMatch: { wordClass: partOfSpeech } } }),
      range: `[0,${limit}]`,
      examples: true,
      pronunciation: true
    });
    return response;
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
    let commonWordsOnly = false;

    switch (level) {
      case 'beginner':
        limit = 200;
        commonWordsOnly = true;
        break;
      case 'intermediate':
        limit = 500;
        break;
      case 'advanced':
        limit = 1000;
        break;
    }

    const response = await this.makeRequest('/words', {
      range: `[0,${limit}]`,
      examples: true,
      pronunciation: true,
      ...(commonWordsOnly && { filter: JSON.stringify({ frequency: { $gte: 3 } }) })
    });

    return response;
  }
}

// Create singleton instance
export const igboApi = new IgboApiService();
