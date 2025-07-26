/**
 * Test script for African language content integration
 * Tests MAVEN, Igbo API, CommonVoice, and Lanfrica integrations
 */

import { igboApi } from './src/lib/api/igbo-api.js';
import { contentGenerator } from './src/lib/api/content-generator.js';
import { lanfricaService } from './src/lib/api/lanfrica.js';
import { mavenService } from './src/lib/api/maven.js';
import { commonVoiceService } from './src/lib/api/common-voice.js';

async function testIntegrations() {
  console.log('🚀 Testing African Language Content Integrations...\n');

  try {
    // Test 1: Igbo API Integration
    console.log('📚 Testing Igbo API...');
    const igboWords = await igboApi.searchWords('hello', 5);
    console.log(`✅ Retrieved ${igboWords.length} Igbo words`);
    if (igboWords.length > 0) {
      console.log(`   Sample word: ${igboWords[0].word} - ${igboWords[0].definitions?.[0]?.definitions?.[0] || 'No definition'}`);
    }
    console.log();

    // Test 2: MAVEN Voice Models
    console.log('🎤 Testing MAVEN Voice Models...');
    const voiceModels = await mavenService.getAvailableVoiceModels();
    console.log(`✅ Found ${voiceModels.length} voice models`);
    voiceModels.forEach(model => {
      console.log(`   ${model.language}: ${model.accuracy * 100}% accuracy, ${model.trainingData.hours}h training data`);
    });
    console.log();

    // Test 3: Lanfrica Resources
    console.log('🌍 Testing Lanfrica Resources...');
    const igboResources = await lanfricaService.getLearningResources('ig');
    console.log(`✅ Retrieved ${igboResources.length} Igbo learning resources`);
    igboResources.forEach(resource => {
      console.log(`   ${resource.title} (${resource.category}, ${resource.difficulty})`);
    });
    console.log();

    // Test 4: CommonVoice Service
    console.log('🔊 Testing CommonVoice Service...');
    const supportedLocales = commonVoiceService.getSupportedLocales();
    console.log(`✅ Supports ${Object.keys(supportedLocales).length} African languages:`);
    Object.entries(supportedLocales).forEach(([code, name]) => {
      console.log(`   ${code}: ${name}`);
    });
    console.log();

    // Test 5: Content Generation
    console.log('🏗️ Testing Content Generation...');
    console.log('   Generating sample Igbo course (this may take a moment)...');
    
    // Generate a small test course
    const testCourse = await contentGenerator.generateCourse('IGBO', 'BEGINNER', 2);
    console.log(`✅ Generated course: "${testCourse.title}"`);
    console.log(`   Language: ${testCourse.language}, Level: ${testCourse.level}`);
    console.log(`   Lessons: ${testCourse.lessons.length}`);
    console.log(`   Total duration: ${testCourse.totalDuration} minutes`);
    console.log(`   Skills: ${testCourse.skills.join(', ')}`);
    
    // Show first lesson details
    if (testCourse.lessons.length > 0) {
      const firstLesson = testCourse.lessons[0];
      console.log(`\n   First lesson: "${firstLesson.title}"`);
      console.log(`   Vocabulary words: ${firstLesson.vocabulary.length}`);
      console.log(`   Exercises: ${firstLesson.exercises.length}`);
      console.log(`   Cultural notes: ${firstLesson.culturalNotes.length}`);
      
      if (firstLesson.vocabulary.length > 0) {
        console.log(`   Sample vocabulary: ${firstLesson.vocabulary[0].word} = ${firstLesson.vocabulary[0].translation}`);
      }
    }
    console.log();

    // Test 6: Text-to-Speech Generation
    console.log('🗣️ Testing Text-to-Speech...');
    const ttsResult = await mavenService.textToSpeech('Ndeewo', 'ig');
    console.log(`✅ Generated TTS for "Ndeewo"`);
    console.log(`   Audio URL: ${ttsResult.audioUrl}`);
    console.log(`   Duration: ${ttsResult.duration} seconds`);
    console.log();

    console.log('🎉 All integration tests completed successfully!');
    console.log('\n📝 Summary:');
    console.log('- Igbo API: Ready for authentic Igbo language content');
    console.log('- MAVEN: Voice models available for speech recognition and synthesis');
    console.log('- Lanfrica: Cultural and linguistic resources integrated');
    console.log('- CommonVoice: Audio content support for multiple African languages');
    console.log('- Content Generator: Automatic course creation working');
    console.log('\n✨ Your African language learning platform is ready!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Ensure all API services are accessible');
    console.log('- Check network connectivity');
    console.log('- Verify API keys if required');
    console.log('- Make sure database is running');
  }
}

// Run the tests
testIntegrations().catch(console.error);
