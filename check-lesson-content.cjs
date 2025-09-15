const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLesson() {
  try {
    const lesson = await prisma.lesson.findFirst({
      where: { id: 'cmf25ctgz000fkn3bsy2kq9nb' },
      select: { 
        id: true, 
        title: true, 
        contentHtml: true 
      }
    });
    
    console.log('=== LESSON CHECK ===');
    console.log('Lesson found:', !!lesson);
    
    if (lesson) {
      console.log('Title:', lesson.title);
      console.log('Has contentHtml:', !!lesson.contentHtml);
      console.log('Content length:', lesson.contentHtml?.length || 0);
      console.log('Content type:', typeof lesson.contentHtml);
      
      if (lesson.contentHtml) {
        console.log('\n=== CONTENT PREVIEW ===');
        console.log('First 200 chars:', lesson.contentHtml.substring(0, 200));
        
        try {
          const parsed = JSON.parse(lesson.contentHtml);
          console.log('\n=== PARSED CONTENT ===');
          console.log('Parsed successfully: true');
          console.log('Has introduction:', !!parsed.introduction);
          console.log('Introduction length:', parsed.introduction?.length || 0);
          console.log('Vocabulary count:', parsed.vocabulary?.length || 0);
          console.log('Examples count:', parsed.examples?.length || 0);
          console.log('Practical phrases count:', parsed.practicalPhrases?.length || 0);
          console.log('Has culturalNote:', !!parsed.culturalNote);
          console.log('Cultural note length:', parsed.culturalNote?.length || 0);
          
          console.log('\n=== STRUCTURE ===');
          console.log('Object keys:', Object.keys(parsed));
          
          if (parsed.introduction) {
            console.log('\nIntroduction preview:', parsed.introduction.substring(0, 100));
          }
          if (parsed.vocabulary && parsed.vocabulary.length > 0) {
            console.log('\nFirst vocabulary item:', JSON.stringify(parsed.vocabulary[0], null, 2));
          }
          if (parsed.examples && parsed.examples.length > 0) {
            console.log('\nFirst example:', JSON.stringify(parsed.examples[0], null, 2));
          }
          if (parsed.practicalPhrases && parsed.practicalPhrases.length > 0) {
            console.log('\nFirst practical phrase:', JSON.stringify(parsed.practicalPhrases[0], null, 2));
          }
          
        } catch (e) {
          console.log('\n=== PARSE ERROR ===');
          console.log('Parse error:', e.message);
          console.log('Trying to detect if it\'s HTML...');
          if (lesson.contentHtml.includes('<') && lesson.contentHtml.includes('>')) {
            console.log('Content appears to be HTML');
          }
        }
      }
    } else {
      console.log('No lesson found with that ID');
    }
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLesson();
