#!/usr/bin/env node

// Test script to verify lesson content and quiz functionality
async function testLessonContent() {
  console.log('🧪 Testing lesson content and quiz functionality...\n');
  
  try {
    // Test Session 5 content
    const session5Response = await fetch('http://localhost:5173/dashboard/courses/cmf25csrc000dkn3baxb9a7da?session=5');
    const session5Html = await session5Response.text();
    
    // Check if Session 5 shows correct content
    const hasCorrectTitle = session5Html.includes('Ego na Ụgwọ') || session5Html.includes('Money and Payments');
    const hasWrongTitle = session5Html.includes('Mmekọrịta Azụmahịa') || session5Html.includes('Business Relationships');
    
    console.log('📍 Session 5 Content Check:');
    console.log(`  ✅ Contains correct title (Ego na Ụgwọ/Money and Payments): ${hasCorrectTitle}`);
    console.log(`  ❌ Contains wrong title (Mmekọrịta Azụmahịa/Business Relationships): ${hasWrongTitle}`);
    
    // Check for JSON parsing errors
    const hasJsonError = session5Html.includes('JSON.parse') || session5Html.includes('SyntaxError') || session5Html.includes('Unexpected token');
    console.log(`  🔧 Has JSON parsing errors: ${hasJsonError}`);
    
    // Test Session 1 for comparison
    const session1Response = await fetch('http://localhost:5173/dashboard/courses/cmf25csrc000dkn3baxb9a7da?session=1');
    const session1Html = await session1Response.text();
    
    const session1CorrectTitle = session1Html.includes('Azụmahịa na Ego') || session1Html.includes('Business and Money');
    
    console.log('\n📍 Session 1 Content Check (for comparison):');
    console.log(`  ✅ Contains correct title (Azụmahịa na Ego/Business and Money): ${session1CorrectTitle}`);
    
    console.log('\n🎯 Summary:');
    if (hasCorrectTitle && !hasWrongTitle && !hasJsonError) {
      console.log('✅ Session 5 is now displaying the correct content!');
    } else {
      console.log('❌ Session 5 still has issues:');
      if (!hasCorrectTitle) console.log('  - Missing correct title');
      if (hasWrongTitle) console.log('  - Still showing wrong title');
      if (hasJsonError) console.log('  - JSON parsing errors present');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLessonContent();
