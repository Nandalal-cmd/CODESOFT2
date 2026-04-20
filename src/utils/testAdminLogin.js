/**
 * Debug helper: Test admin login directly in browser console
 * Usage: In browser console, run: 
 *   import('./utils/testAdminLogin.js').then(m => m.testAdminLogin())
 */

export async function testAdminLogin() {
  console.log('🔍 Testing admin login flow...');
  
  const email = 'admin@fashionwear.in';
  const password = 'admin123';
  
  try {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    console.log('📡 API URL:', baseUrl);
    
    console.log('🔐 Sending login request...');
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    console.log('📦 Response status:', response.status);
    console.log('📦 Response data:', data);
    
    if (response.ok && data.user) {
      console.log('✅ Login successful!');
      console.log('👤 User:', data.user);
      console.log('🎯 User role:', data.user.role);
      console.log('🔑 Token:', data.token?.slice(0, 20) + '...');
      
      if (data.user.role === 'admin') {
        console.log('✅ User is ADMIN - should be able to access dashboard');
      } else {
        console.log('❌ User is NOT admin - role is:', data.user.role);
      }
    } else {
      console.log('❌ Login failed:', data.error);
    }
  } catch (err) {
    console.error('❌ Error during login test:', err);
  }
}

// Auto-run when imported
testAdminLogin();
