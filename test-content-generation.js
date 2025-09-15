// Test content generation via API call
import fetch from 'node-fetch';

console.log('🧪 Testing AI content generation via API...');

async function testContentGeneration() {
    try {
        console.log('Starting content generation test...');
        
        const response = await fetch('http://localhost:5174/api/content-generation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                language: 'igbo',
                level: 'beginner',
                topic: 'food_and_eating',
                courseId: 'test-course-id'
            })
        });
        
        if (!response.ok) {
            console.error('❌ API request failed:', response.status, response.statusText);
            return;
        }
        
        const result = await response.json();
        
        console.log('📊 Content generation result:');
        console.log('Success:', result.success);
        console.log('Lessons count:', result.lessons?.length || 0);
        
        if (result.lessons && result.lessons.length > 0) {
            console.log('\n📚 First lesson:');
            const firstLesson = result.lessons[0];
            console.log('Title:', firstLesson.title);
            console.log('Lesson Number:', firstLesson.lessonNumber);
            console.log('Content length:', firstLesson.content?.length || 0);
            console.log('Vocabulary count:', firstLesson.vocabulary?.length || 0);
            
            if (firstLesson.vocabulary && firstLesson.vocabulary.length > 0) {
                console.log('\n🔤 Sample vocabulary:');
                firstLesson.vocabulary.slice(0, 3).forEach((vocab, idx) => {
                    console.log(`${idx + 1}. ${vocab.word} - ${vocab.translation}`);
                });
            }
        }
        
        if (result.error) {
            console.error('❌ Error:', result.error);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testContentGeneration();
