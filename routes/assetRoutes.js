const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { authenticateApi, authenticateView } = require('../middleware/auth');

// API
router.use('/api', authenticateApi);
router.get('/api', assetController.list);
router.post('/api', assetController.create);
router.get('/api/:id', assetController.getOne);
router.put('/api/:id', assetController.update);
router.delete('/api/:id', assetController.remove);

// Views
router.use(authenticateView);
router.get('/', (req, res) => {
  res.render('asset/list',{showHistoryAction:false});
});
router.get('/new', (req, res) => {
  res.render('asset/form', { isEdit: false });
});
router.get('/:id/edit', (req, res) => {
  res.render('asset/form', { isEdit: true, id: req.params.id });
});

module.exports = router;