const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateApi, authenticateView } = require('../middleware/auth');

// API
router.use('/api', authenticateApi);
router.get('/api', categoryController.list);
router.post('/api', categoryController.create);
router.get('/api/:id', categoryController.getOne);
router.put('/api/:id', categoryController.update);
router.delete('/api/:id', categoryController.remove);

// Views
router.use(authenticateView);
router.get('/', (req, res) => {
  res.render('category/list');
});
router.get('/new', (req, res) => {
  res.render('category/form', { isEdit: false });
});
router.get('/:id/edit', (req, res) => {
  res.render('category/form', { isEdit: true, id: req.params.id });
});

module.exports = router;