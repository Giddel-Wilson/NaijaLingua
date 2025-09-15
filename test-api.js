// Test API call to debug quiz attempts issue
async function testQuizAPI() {
  try {
    // Test the specific lesson from session 5
    const lessonId = 'cmf25ct3j000hkn3bfvhw7l8a'; // Lesson 5 ID (you can change this)
    const url = `http://localhost:5174/api/lessons/${lessonId}/quiz-submit`;
    
    console.log('Testing API call to:', url);
    
    const response = await fetch(url);
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('API Response:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testQuizAPI();
