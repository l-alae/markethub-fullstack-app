const router = require('express').Router();
const productController = require('../controllers/productController');
const { productValidator } = require('../validators/productValidator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /api/products — Public: list products with filters
router.get('/', productController.getAll);

// GET /api/products/categories — Public: get distinct categories
router.get('/categories', productController.getCategories);

// GET /api/products/:id — Public: single product
router.get('/:id', productController.getById);

// POST /api/products — Authenticated: create product
router.post('/', authenticate, upload.single('image'), productValidator, validate, productController.create);

// PUT /api/products/:id — Authenticated: update product (owner or admin)
router.put('/:id', authenticate, upload.single('image'), productValidator, validate, productController.update);

// DELETE /api/products/:id — Authenticated: delete product (owner or admin)
router.delete('/:id', authenticate, productController.remove);

module.exports = router;
