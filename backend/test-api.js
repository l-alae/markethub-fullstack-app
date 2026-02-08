const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:5000/api';
let adminToken = '';
let userToken = '';
let createdProductId = '';
let newUserId = '';

// Helper: make HTTP request
function request(method, urlPath, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE + urlPath);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({ status: res.statusCode, data: parsed });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function log(label, status, pass, detail = '') {
  const icon = pass ? '✅' : '❌';
  console.log(`${icon} [${status}] ${label}${detail ? ' — ' + detail : ''}`);
}

async function runTests() {
  console.log('\n════════════════════════════════════════════');
  console.log('   MarketHub API Test Suite');
  console.log('════════════════════════════════════════════\n');

  let passed = 0, failed = 0;
  const check = (label, status, expected, detail) => {
    const ok = status === expected;
    log(label, status, ok, detail);
    ok ? passed++ : failed++;
  };

  // ─── HEALTH ───
  console.log('── Health Check ──');
  const health = await request('GET', '/health');
  check('GET /health', health.status, 200, health.data.message);

  // ─── AUTH: REGISTER ───
  console.log('\n── Auth: Register ──');
  const reg1 = await request('POST', '/auth/register', {
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'Test123',
  });
  check('Register new user', reg1.status, 201, reg1.data.user?.username);
  userToken = reg1.data.token || '';
  newUserId = reg1.data.user?.id || '';

  const regDup = await request('POST', '/auth/register', {
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'Test123',
  });
  check('Register duplicate (should 409)', regDup.status, 409, regDup.data.error);

  const regBad = await request('POST', '/auth/register', {
    username: 'x',
    email: 'bad',
    password: '1',
  });
  check('Register invalid data (should 400)', regBad.status, 400, 'validation errors');

  // ─── AUTH: LOGIN ───
  console.log('\n── Auth: Login ──');
  const loginAdmin = await request('POST', '/auth/login', {
    email: 'admin@markethub.com',
    password: 'Admin123!',
  });
  check('Login as admin', loginAdmin.status, 200, loginAdmin.data.user?.role);
  adminToken = loginAdmin.data.token || '';

  const loginUser = await request('POST', '/auth/login', {
    email: 'testuser@example.com',
    password: 'Test123',
  });
  check('Login as user', loginUser.status, 200, loginUser.data.user?.username);

  const loginBad = await request('POST', '/auth/login', {
    email: 'wrong@example.com',
    password: 'wrong',
  });
  check('Login bad credentials (should 401)', loginBad.status, 401, loginBad.data.error);

  // ─── AUTH: ME ───
  console.log('\n── Auth: Get Current User ──');
  const me = await request('GET', '/auth/me', null, adminToken);
  check('GET /auth/me (admin)', me.status, 200, me.data.user?.email);

  const meNoAuth = await request('GET', '/auth/me');
  check('GET /auth/me no token (should 401)', meNoAuth.status, 401, meNoAuth.data.error);

  // ─── PRODUCTS: READ ───
  console.log('\n── Products: List ──');
  const list = await request('GET', '/products');
  check('GET /products', list.status, 200, `${list.data.pagination?.total} products, page ${list.data.pagination?.page}`);

  const listPage = await request('GET', '/products?page=2&limit=5');
  check('GET /products?page=2&limit=5', listPage.status, 200, `page ${listPage.data.pagination?.page}, ${listPage.data.products?.length} items`);

  const listSearch = await request('GET', '/products?search=laptop');
  check('GET /products?search=laptop', listSearch.status, 200, `${listSearch.data.pagination?.total} results`);

  const listFilter = await request('GET', '/products?category=Electronics');
  check('GET /products?category=Electronics', listFilter.status, 200, `${listFilter.data.pagination?.total} electronics`);

  const listSort = await request('GET', '/products?sort=price&order=ASC');
  check('GET /products?sort=price&order=ASC', listSort.status, 200, `first: $${listSort.data.products?.[0]?.price}`);

  const listPrice = await request('GET', '/products?minPrice=100&maxPrice=500');
  check('GET /products?minPrice=100&maxPrice=500', listPrice.status, 200, `${listPrice.data.pagination?.total} in range`);

  // ─── PRODUCTS: CATEGORIES ───
  console.log('\n── Products: Categories ──');
  const cats = await request('GET', '/products/categories');
  check('GET /products/categories', cats.status, 200, cats.data.categories?.join(', '));

  // ─── PRODUCTS: SINGLE ───
  console.log('\n── Products: Get By ID ──');
  const firstId = list.data.products?.[0]?.id || list.data.products?.[0]?._id;
  const single = await request('GET', `/products/${firstId}`);
  check('GET /products/:id', single.status, 200, single.data.product?.name);

  const notFound = await request('GET', '/products/000000000000000000000000');
  check('GET /products/:id not found (should 404)', notFound.status, 404, notFound.data.error);

  // ─── PRODUCTS: CREATE ───
  console.log('\n── Products: Create ──');
  const createProd = await request('POST', '/products', {
    name: 'Test Product API',
    description: 'Created via test script',
    price: 99.99,
    quantity: 10,
    category: 'Test',
  }, adminToken);
  check('POST /products (admin)', createProd.status, 201, createProd.data.product?.name);
  createdProductId = createProd.data.product?.id || createProd.data.product?._id || '';

  const createNoAuth = await request('POST', '/products', {
    name: 'No Auth Product',
    description: 'Should fail',
    price: 10,
    quantity: 1,
    category: 'Test',
  });
  check('POST /products no auth (should 401)', createNoAuth.status, 401);

  const createBad = await request('POST', '/products', {
    name: '',
    price: -5,
    quantity: -1,
    category: '',
  }, adminToken);
  check('POST /products invalid data (should 400)', createBad.status, 400, 'validation');

  // ─── PRODUCTS: UPDATE ───
  console.log('\n── Products: Update ──');
  if (createdProductId) {
    const updateProd = await request('PUT', `/products/${createdProductId}`, {
      name: 'Updated Test Product',
      description: 'Updated via test script',
      price: 149.99,
      quantity: 20,
      category: 'Test Updated',
    }, adminToken);
    check('PUT /products/:id (admin)', updateProd.status, 200, updateProd.data.product?.name);

    const updateNoAuth = await request('PUT', `/products/${createdProductId}`, {
      name: 'Hacked',
      description: 'x',
      price: 1,
      quantity: 1,
      category: 'x',
    });
    check('PUT /products/:id no auth (should 401)', updateNoAuth.status, 401);
  }

  // ─── PRODUCTS: DELETE ───
  console.log('\n── Products: Delete ──');
  if (createdProductId) {
    const delNoAuth = await request('DELETE', `/products/${createdProductId}`);
    check('DELETE /products/:id no auth (should 401)', delNoAuth.status, 401);

    const delProd = await request('DELETE', `/products/${createdProductId}`, null, adminToken);
    check('DELETE /products/:id (admin)', delProd.status, 200, delProd.data.message);

    const delAgain = await request('DELETE', `/products/${createdProductId}`, null, adminToken);
    check('DELETE /products/:id already deleted (should 404)', delAgain.status, 404);
  }

  // ─── USERS: ADMIN ROUTES ───
  console.log('\n── Users: Admin Management ──');
  const users = await request('GET', '/users', null, adminToken);
  check('GET /users (admin)', users.status, 200, `${users.data.users?.length} users`);

  const usersNoAdmin = await request('GET', '/users', null, userToken);
  check('GET /users (user, should 403)', usersNoAdmin.status, 403, usersNoAdmin.data.error);

  const usersNoAuth = await request('GET', '/users');
  check('GET /users no auth (should 401)', usersNoAuth.status, 401);

  if (newUserId) {
    const roleUpdate = await request('PUT', `/users/${newUserId}/role`, { role: 'admin' }, adminToken);
    check('PUT /users/:id/role → admin', roleUpdate.status, 200, roleUpdate.data.user?.role);

    const roleBack = await request('PUT', `/users/${newUserId}/role`, { role: 'user' }, adminToken);
    check('PUT /users/:id/role → user', roleBack.status, 200, roleBack.data.user?.role);

    const roleBad = await request('PUT', `/users/${newUserId}/role`, { role: 'superadmin' }, adminToken);
    check('PUT /users/:id/role invalid (should 400)', roleBad.status, 400);
  }

  // ─── DASHBOARD ───
  console.log('\n── Dashboard: Stats ──');
  const stats = await request('GET', '/dashboard/stats', null, adminToken);
  check('GET /dashboard/stats', stats.status, 200,
    `${stats.data.totalProducts} products, ${stats.data.totalUsers} users, $${stats.data.inventoryValue?.toFixed(2)} value`);

  const statsNoAuth = await request('GET', '/dashboard/stats');
  check('GET /dashboard/stats no auth (should 401)', statsNoAuth.status, 401);

  // ─── USERS: DELETE (cleanup) ───
  console.log('\n── Cleanup ──');
  if (newUserId) {
    const delUser = await request('DELETE', `/users/${newUserId}`, null, adminToken);
    check('DELETE /users/:id (admin cleanup)', delUser.status, 200, delUser.data.message);
  }

  // ─── SUMMARY ───
  console.log('\n════════════════════════════════════════════');
  console.log(`   Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log('════════════════════════════════════════════\n');
}

runTests().catch((err) => console.error('Test suite error:', err.message));
