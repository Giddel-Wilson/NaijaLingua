// Test script to verify our enhanced content generation logic
import { enhancedContentGenerator } from './src/lib/content-generation.ts';

console.log('🔍 Testing Enhanced Content Generation Logic...\n');

async function testFoodAndEating() {
    console.log('=== Testing food_and_eating topic ===');
    
    try {
        const result = await enhancedContentGenerator.generateCourseContent(
            'igbo',
            'BEGINNER', 
            'food_and_eating'
        );
        
        if (result.success && result.lessons && result.lessons.length > 0) {
            const firstLesson = result.lessons[0];
            console.log(`✅ Course generated successfully!`);
            console.log(`📚 Course Title: ${result.title}`);
            console.log(`📖 First Lesson: ${firstLesson.title}`);
            console.log(`🔤 Vocabulary Count: ${firstLesson.vocabulary?.length || 0}`);
            
            // Check if we have cooking-related vocabulary
            if (firstLesson.vocabulary) {
                console.log('\n🍳 First 5 vocabulary items:');
                firstLesson.vocabulary.slice(0, 5).forEach((item, index) => {
                    console.log(`${index + 1}. ${item.igbo} - ${item.english} (${item.explanation || 'No explanation'})`);
                });
                
                // Look for cooking tools
                const cookingTools = firstLesson.vocabulary.filter(item => 
                    ['ite', 'mma', 'efere', 'ngwa nri'].some(tool => 
                        item.igbo?.toLowerCase().includes(tool) || 
                        item.english?.toLowerCase().includes('pot') ||
                        item.english?.toLowerCase().includes('knife') ||
                        item.english?.toLowerCase().includes('plate') ||
                        item.english?.toLowerCase().includes('kitchen')
                    )
                );
                
                if (cookingTools.length > 0) {
                    console.log('\n🔪 Found cooking tools:');
                    cookingTools.forEach(tool => {
                        console.log(`- ${tool.igbo} - ${tool.english}`);
                    });
                } else {
                    console.log('\n⚠️ No cooking tools found in vocabulary');
                }
            }
            
            // Check exercises
            if (firstLesson.exercises) {
                console.log(`\n📝 Exercises Count: ${firstLesson.exercises.length}`);
                if (firstLesson.exercises.length > 0) {
                    console.log(`First Exercise: ${firstLesson.exercises[0].question || 'No question'}`);
                }
            }
            
        } else {
            console.log('❌ Content generation failed:', result.error);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run the test
testFoodAndEating().then(() => {
    console.log('\n🏁 Test completed!');
}).catch(error => {
    console.error('💥 Test script error:', error);
});
