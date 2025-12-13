// Debug script to check auth context state
// Run this in browser console on the profile page

console.log('=== AUTH CONTEXT DEBUG ===');
console.log('User:', window.authContext?.user);
console.log('Profile:', window.authContext?.profile);
console.log('Is Loading:', window.authContext?.isLoading);

// Force refresh profile
if (window.authContext?.refreshProfile) {
  console.log('Refreshing profile...');
  window.authContext.refreshProfile();
}

// Check if profile data exists in auth context
setTimeout(() => {
  console.log('=== AFTER REFRESH ===');
  console.log('
('User:',.
email:',ikan
:', window .authContext .context?..
user?.email); 
  console.log('Profile role:', window.authContext?.profile?.role);
  console.log('Profile name:', window.authContext?.profile?.full_name);
}, 2000);
