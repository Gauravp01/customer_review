const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const db = require('./models');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const storeRoutes = require('./routes/store');
const storeOwnerRoutes = require('./routes/storeOwner');
const ratingRoutes = require('./routes/rating');
const userRoutes = require('./routes/user');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stores', storeRoutes); // Changed from store to stores to match frontend
app.use('/api/store-owner', storeOwnerRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/user', userRoutes);

// Default route
app.get('/', (req, res) => {
    res.send('API is running successfully');
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Sync Database & Start Server
const PORT = process.env.PORT || 5000;
db.sequelize.sync().then(() => {
    console.log('Database connected and models synced');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => console.error('Database error:', err));