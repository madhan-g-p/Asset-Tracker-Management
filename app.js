require('dotenv').config();
const express = require('express');
const path = require('path');
const { sequelize } = require('./models');
const employeeRoutes = require('./routes/employeeRoutes');
const assetRoutes = require('./routes/assetRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const stockRoutes = require('./routes/stockRoutes');
const assetTransactionRoutes = require('./routes/assetTransactionRoutes');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.json({ limit: "50MB" }));
app.use(express.urlencoded({ extended: true, limit: "50MB" }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authRoutes);
app.get('/', (req, res) => res.render('index', { title: 'Home' })); // no middleware here
// JWT middleware for all private routes
// app.use(authMiddleware);
app.use('/employees', employeeRoutes);
app.use('/assets', assetRoutes);
app.use('/categories', categoryRoutes);
app.use('/stock', stockRoutes);
app.use('/assettransactions', assetTransactionRoutes);

app.get('/', (req, res) => res.render('index', { title: 'Asset Management Home' }));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

module.exports = app;