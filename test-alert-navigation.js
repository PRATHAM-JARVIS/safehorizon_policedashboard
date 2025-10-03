// Quick Test Script for Alert Detail Navigation
// Open browser console and paste this to test the navigation

console.log('🧪 Testing Alert Detail Navigation...');

// Test 1: Check if navigate function exists
console.log('\n✅ Test 1: Check React Router');
const hasReactRouter = !!window.location;
console.log('React Router available:', hasReactRouter);

// Test 2: Check current URL
console.log('\n✅ Test 2: Current URL');
console.log('Current URL:', window.location.href);
console.log('Current Path:', window.location.pathname);

// Test 3: Test navigation
console.log('\n✅ Test 3: Test Navigation to Alert Detail');
console.log('Attempting to navigate to /alerts/1...');
// Uncomment below to test:
// window.location.href = '/alerts/1';

// Test 4: Check if AlertDetail component is loaded
console.log('\n✅ Test 4: Check Components');
const checkComponent = () => {
  const currentPath = window.location.pathname;
  if (currentPath.includes('/alerts/')) {
    console.log('✅ On Alert Detail page');
    console.log('Alert ID from URL:', currentPath.split('/alerts/')[1]);
  } else if (currentPath === '/alerts') {
    console.log('✅ On Alerts List page');
    console.log('👉 Click any alert row to navigate to detail page');
  } else {
    console.log('ℹ️ On different page:', currentPath);
  }
};
checkComponent();

// Test 5: Check for alerts in the page
console.log('\n✅ Test 5: Check Alerts Data');
setTimeout(() => {
  const alertRows = document.querySelectorAll('[role="row"]');
  console.log('Found alert rows:', alertRows.length);
  
  if (alertRows.length > 0) {
    console.log('✅ Alerts are rendering');
    console.log('👆 Try clicking on an alert row');
    
    // Check if rows have cursor pointer
    const firstRow = alertRows[1]; // Skip header row
    if (firstRow) {
      const style = window.getComputedStyle(firstRow);
      console.log('Row cursor style:', style.cursor);
      if (style.cursor === 'pointer') {
        console.log('✅ Rows are clickable (cursor: pointer)');
      } else {
        console.log('⚠️ Rows might not be clickable (cursor not pointer)');
      }
    }
  } else {
    console.log('⚠️ No alerts found - might still be loading');
  }
}, 2000);

console.log('\n📝 Instructions:');
console.log('1. Make sure you are on http://localhost:5173/alerts');
console.log('2. Click any alert row (not the buttons)');
console.log('3. You should navigate to /alerts/{id}');
console.log('4. The detail page should show alert information');

console.log('\n🔍 To manually test navigation:');
console.log('Run: window.location.href = "/alerts/1"');
