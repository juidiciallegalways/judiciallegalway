// Simple test script to verify case files API endpoints
// Run with: node scripts/test-case-files-api.js

const BASE_URL = 'http://localhost:3000'

async function testCaseFilesAPI() {
  console.log('Testing Case Files API...\n')

  try {
    // Test 1: Fetch all case files
    console.log('1. Testing GET /api/case-files')
    const response1 = await fetch(`${BASE_URL}/api/case-files`)
    const data1 = await response1.json()
    console.log(`Status: ${response1.status}`)
    console.log(`Case files count: ${data1.caseFiles?.length || 0}`)
    console.log(`Total: ${data1.pagination?.total || 0}\n`)

    // Test 2: Fetch with search filter
    console.log('2. Testing GET /api/case-files with search')
    const response2 = await fetch(`${BASE_URL}/api/case-files?search=test`)
    const data2 = await response2.json()
    console.log(`Status: ${response2.status}`)
    console.log(`Filtered case files count: ${data2.caseFiles?.length || 0}\n`)

    // Test 3: Fetch with category filter
    console.log('3. Testing GET /api/case-files with category filter')
    const response3 = await fetch(`${BASE_URL}/api/case-files?category=criminal`)
    const data3 = await response3.json()
    console.log(`Status: ${response3.status}`)
    console.log(`Criminal case files count: ${data3.caseFiles?.length || 0}\n`)

    // Test 4: Fetch individual case file (if any exist)
    if (data1.caseFiles && data1.caseFiles.length > 0) {
      const firstCaseId = data1.caseFiles[0].id
      console.log(`4. Testing GET /api/case-files/${firstCaseId}`)
      const response4 = await fetch(`${BASE_URL}/api/case-files/${firstCaseId}`)
      const data4 = await response4.json()
      console.log(`Status: ${response4.status}`)
      console.log(`Case file title: ${data4.caseFile?.title || 'N/A'}\n`)
    }

    console.log('✅ All tests completed successfully!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  testCaseFilesAPI()
}

module.exports = { testCaseFilesAPI }