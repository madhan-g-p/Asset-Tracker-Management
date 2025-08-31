const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticateApi, authenticateView } = require('../middleware/auth');

// --- API ROUTES (AJAX) ---
router.use('/api', authenticateApi);

router.get('/api', employeeController.list);
router.post('/api', employeeController.create);
router.get('/api/:id', employeeController.getOne);
router.put('/api/:id', employeeController.update);
router.delete('/api/:id', employeeController.remove);

// --- VIEW ROUTES (SSR) ---
router.use(authenticateView);

router.get('/', (req, res) => {
  res.render('employees/list', { user: req.user });
});

router.get('/new', (req, res) => {
  res.render('employees/form', { user: req.user, isEdit: false });
});

router.get('/:id/edit', (req, res) => {
  res.render('employees/form', { user: req.user, isEdit: true, id: req.params.id });
});

module.exports = router;