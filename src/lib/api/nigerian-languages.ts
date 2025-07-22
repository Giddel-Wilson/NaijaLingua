// Nigerian Language Course Data
export interface CourseContent {
  id: string;
  title: string;
  description: string;
  language: string;
  level: string;
  duration: number; // in minutes
  lessons: Lesson[];
  culture: string;
  region: string;
  speakers: number;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  audioUrl?: string;
  vocabulary: VocabularyItem[];
  grammar?: GrammarPoint[];
  exercises: Exercise[];
  culturalNotes?: string;
}

export interface VocabularyItem {
  word: string;
  translation: string;
  pronunciation: string;
  example: string;
  audioUrl?: string;
}

export interface GrammarPoint {
  topic: string;
  explanation: string;
  examples: string[];
}

export interface Exercise {
  type: 'multiple_choice' | 'fill_blank' | 'translation' | 'pronunciation';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

// Nigerian Language Course Database
export const NIGERIAN_LANGUAGE_COURSES: CourseContent[] = [
  {
    id: 'yoruba-beginner',
    title: 'Yoruba for Beginners',
    description: 'Learn the fundamentals of Yoruba language, spoken by over 20 million people in Nigeria, Benin, and Togo.',
    language: 'YORUBA',
    level: 'BEGINNER',
    duration: 480, // 8 hours
    culture: 'Yoruba culture is rich in traditions, including music, dance, and oral literature.',
    region: 'Southwestern Nigeria',
    speakers: 20000000,
    lessons: [
      {
        id: 'yoruba-lesson-1',
        title: 'Greetings and Basic Expressions',
        content: `
          <h2>Welcome to Yoruba Language Learning</h2>
          <p>Yoruba is a tonal language with three basic tones: high, mid, and low.</p>
          
          <h3>Basic Greetings</h3>
          <ul>
            <li><strong>E kaaro</strong> - Good morning</li>
            <li><strong>E kaasan</strong> - Good afternoon</li>
            <li><strong>E kaale</strong> - Good evening</li>
            <li><strong>O daaro</strong> - Good night</li>
          </ul>
          
          <h3>Common Expressions</h3>
          <ul>
            <li><strong>Bawo ni</strong> - How are you?</li>
            <li><strong>Mo wa daadaa</strong> - I am fine</li>
            <li><strong>E se</strong> - Thank you</li>
            <li><strong>Pele</strong> - Sorry/Sympathy</li>
          </ul>
        `,
        vocabulary: [
          {
            word: 'E kaaro',
            translation: 'Good morning',
            pronunciation: 'eh KAH-ah-roh',
            example: 'E kaaro, bawo ni? (Good morning, how are you?)'
          },
          {
            word: 'Mo wa daadaa',
            translation: 'I am fine',
            pronunciation: 'moh wah DAH-ah-dah',
            example: 'Mo wa daadaa, e se (I am fine, thank you)'
          }
        ],
        exercises: [
          {
            type: 'multiple_choice',
            question: 'How do you say "Good morning" in Yoruba?',
            options: ['E kaaro', 'E kaasan', 'E kaale', 'O daaro'],
            correctAnswer: 'E kaaro',
            explanation: 'E kaaro is the correct greeting for morning time.'
          }
        ]
      },
      {
        id: 'yoruba-lesson-2',
        title: 'Numbers and Counting',
        content: `
          <h2>Yoruba Numbers</h2>
          <p>Learn to count in Yoruba from 1 to 20 and beyond.</p>
          
          <h3>Numbers 1-10</h3>
          <ul>
            <li>1 - Eni/Okan</li>
            <li>2 - Eji/Meji</li>
            <li>3 - Eta/Meta</li>
            <li>4 - Erin/Merin</li>
            <li>5 - Arun/Marun</li>
            <li>6 - Efa/Mefa</li>
            <li>7 - Eje/Meje</li>
            <li>8 - Ejo/Mejo</li>
            <li>9 - Esan/Mesan</li>
            <li>10 - Ewa/Mewa</li>
          </ul>
        `,
        vocabulary: [
          {
            word: 'Okan',
            translation: 'One',
            pronunciation: 'OH-kahn',
            example: 'Mo ni okan (I have one)'
          },
          {
            word: 'Meji',
            translation: 'Two',
            pronunciation: 'MEH-jee',
            example: 'Omo meji (Two children)'
          }
        ],
        exercises: [
          {
            type: 'multiple_choice',
            question: 'What is the number 5 in Yoruba?',
            options: ['Erin', 'Marun', 'Mefa', 'Meje'],
            correctAnswer: 'Marun',
            explanation: 'Marun (or Arun) means five in Yoruba.'
          }
        ]
      }
    ]
  },
  {
    id: 'igbo-beginner',
    title: 'Igbo Language Fundamentals',
    description: 'Discover the Igbo language, spoken by over 24 million people primarily in southeastern Nigeria.',
    language: 'IGBO',
    level: 'BEGINNER',
    duration: 420, // 7 hours
    culture: 'Igbo culture emphasizes community, respect for elders, and rich traditional festivals.',
    region: 'Southeastern Nigeria',
    speakers: 24000000,
    lessons: [
      {
        id: 'igbo-lesson-1',
        title: 'Basic Igbo Greetings',
        content: `
          <h2>Ndewo! Welcome to Igbo Language</h2>
          <p>Igbo is a tonal language with complex verbal system and rich cultural expressions.</p>
          
          <h3>Essential Greetings</h3>
          <ul>
            <li><strong>Ndewo</strong> - Hello</li>
            <li><strong>Ututu oma</strong> - Good morning</li>
            <li><strong>Ehihie oma</strong> - Good afternoon</li>
            <li><strong>Mgbede oma</strong> - Good evening</li>
          </ul>
          
          <h3>Basic Questions</h3>
          <ul>
            <li><strong>Kedu?</strong> - How are you?</li>
            <li><strong>Aha gi ole?</strong> - What is your name?</li>
            <li><strong>I si ebee bia?</strong> - Where are you from?</li>
          </ul>
        `,
        vocabulary: [
          {
            word: 'Ndewo',
            translation: 'Hello',
            pronunciation: 'nn-DEH-woh',
            example: 'Ndewo, kedu? (Hello, how are you?)'
          },
          {
            word: 'Kedu',
            translation: 'How/What',
            pronunciation: 'KEH-doo',
            example: 'Kedu aha gi? (What is your name?)'
          }
        ],
        exercises: [
          {
            type: 'multiple_choice',
            question: 'How do you say "Hello" in Igbo?',
            options: ['Kedu', 'Ndewo', 'Ututu oma', 'Dalu'],
            correctAnswer: 'Ndewo',
            explanation: 'Ndewo is the most common way to say hello in Igbo.'
          }
        ]
      }
    ]
  },
  {
    id: 'hausa-beginner',
    title: 'Hausa Language Basics',
    description: 'Learn Hausa, the most widely spoken language in Nigeria with over 70 million speakers across West Africa.',
    language: 'HAUSA',
    level: 'BEGINNER',
    duration: 540, // 9 hours
    culture: 'Hausa culture is deeply rooted in Islamic traditions and trade.',
    region: 'Northern Nigeria and West Africa',
    speakers: 70000000,
    lessons: [
      {
        id: 'hausa-lesson-1',
        title: 'Hausa Greetings and Courtesy',
        content: `
          <h2>Sannu! Welcome to Hausa Language</h2>
          <p>Hausa is written in both Arabic and Latin scripts and is a lingua franca in West Africa.</p>
          
          <h3>Common Greetings</h3>
          <ul>
            <li><strong>Sannu</strong> - Hello</li>
            <li><strong>Ina kwana?</strong> - Good morning (How did you sleep?)</li>
            <li><strong>Ina yini?</strong> - Good afternoon (How is the day?)</li>
            <li><strong>Ina yamma?</strong> - Good evening</li>
          </ul>
          
          <h3>Responses and Courtesy</h3>
          <ul>
            <li><strong>Lafiya lau</strong> - I'm fine</li>
            <li><strong>Na gode</strong> - Thank you</li>
            <li><strong>Ba komai</strong> - You're welcome</li>
          </ul>
        `,
        vocabulary: [
          {
            word: 'Sannu',
            translation: 'Hello',
            pronunciation: 'SAHN-noo',
            example: 'Sannu da zuwa (Hello and welcome)'
          },
          {
            word: 'Na gode',
            translation: 'Thank you',
            pronunciation: 'nah GOH-deh',
            example: 'Na gode sosai (Thank you very much)'
          }
        ],
        exercises: [
          {
            type: 'multiple_choice',
            question: 'How do you say "Thank you" in Hausa?',
            options: ['Sannu', 'Na gode', 'Lafiya lau', 'Ba komai'],
            correctAnswer: 'Na gode',
            explanation: 'Na gode is the way to say thank you in Hausa.'
          }
        ]
      }
    ]
  },
  {
    id: 'edo-beginner',
    title: 'Edo Language Introduction',
    description: 'Explore the Edo language, native to Edo State in south-south Nigeria, with rich royal heritage.',
    language: 'EDO',
    level: 'BEGINNER',
    duration: 360, // 6 hours
    culture: 'Edo culture is centered around the ancient Benin Kingdom with elaborate bronze works.',
    region: 'Edo State, Nigeria',
    speakers: 1500000,
    lessons: [
      {
        id: 'edo-lesson-1',
        title: 'Basic Edo Expressions',
        content: `
          <h2>Welcome to Edo Language</h2>
          <p>Edo (Bini) is the language of the historic Benin Kingdom.</p>
          
          <h3>Basic Greetings</h3>
          <ul>
            <li><strong>Koyo</strong> - Hello</li>
            <li><strong>Vbo oto?</strong> - How are you?</li>
            <li><strong>I ma se</strong> - I am fine</li>
          </ul>
        `,
        vocabulary: [
          {
            word: 'Koyo',
            translation: 'Hello',
            pronunciation: 'KOH-yoh',
            example: 'Koyo, vbo oto? (Hello, how are you?)'
          }
        ],
        exercises: [
          {
            type: 'multiple_choice',
            question: 'How do you say "Hello" in Edo?',
            options: ['Koyo', 'Vbo oto', 'I ma se', 'Oba'],
            correctAnswer: 'Koyo',
            explanation: 'Koyo is the greeting in Edo language.'
          }
        ]
      }
    ]
  }
];

// API Service Functions
export class NigerianLanguageAPI {
  static getAllCourses(): CourseContent[] {
    return NIGERIAN_LANGUAGE_COURSES;
  }

  static getCourseByLanguage(language: string): CourseContent[] {
    return NIGERIAN_LANGUAGE_COURSES.filter(course => 
      course.language.toLowerCase() === language.toLowerCase()
    );
  }

  static getCourseById(id: string): CourseContent | undefined {
    return NIGERIAN_LANGUAGE_COURSES.find(course => course.id === id);
  }

  static getCoursesByLevel(level: string): CourseContent[] {
    return NIGERIAN_LANGUAGE_COURSES.filter(course => 
      course.level.toLowerCase() === level.toLowerCase()
    );
  }

  static searchCourses(query: string): CourseContent[] {
    const searchTerm = query.toLowerCase();
    return NIGERIAN_LANGUAGE_COURSES.filter(course =>
      course.title.toLowerCase().includes(searchTerm) ||
      course.description.toLowerCase().includes(searchTerm) ||
      course.language.toLowerCase().includes(searchTerm) ||
      course.culture.toLowerCase().includes(searchTerm)
    );
  }

  static getLanguageStats() {
    const stats = NIGERIAN_LANGUAGE_COURSES.reduce((acc, course) => {
      if (!acc[course.language]) {
        acc[course.language] = {
          totalCourses: 0,
          totalSpeakers: course.speakers,
          region: course.region,
          levels: new Set()
        };
      }
      acc[course.language].totalCourses++;
      acc[course.language].levels.add(course.level);
      return acc;
    }, {} as any);

    // Convert Set to Array for serialization
    Object.keys(stats).forEach(lang => {
      stats[lang].levels = Array.from(stats[lang].levels);
    });

    return stats;
  }

  // Method to integrate course data into database
  static async seedCoursesToDatabase(db: any, adminUserId: string) {
    const createdCourses = [];
    
    for (const courseData of NIGERIAN_LANGUAGE_COURSES) {
      try {
        const course = await db.course.create({
          data: {
            title: courseData.title,
            description: courseData.description,
            language: courseData.language,
            level: courseData.level,
            isPublished: true,
            createdById: adminUserId
          }
        });

        // Add lessons for each course
        for (const lessonData of courseData.lessons) {
          await db.lesson.create({
            data: {
              courseId: course.id,
              title: lessonData.title,
              contentHtml: lessonData.content,
              order: courseData.lessons.indexOf(lessonData) + 1,
              isPublished: true
            }
          });
        }

        createdCourses.push(course);
      } catch (error) {
        console.error(`Error creating course ${courseData.title}:`, error);
      }
    }

    return createdCourses;
  }
}
