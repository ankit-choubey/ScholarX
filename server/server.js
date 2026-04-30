require('dotenv').config();

const REQUIRED = ['MONGO_URI', 'JWT_SECRET'];
const missing  = REQUIRED.filter((k) => !process.env[k]);
if (missing.length) { console.error(`Missing env vars: ${missing.join(', ')}`); process.exit(1); }

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const connectDB     = require('./config/db');
const rateLimiter   = require('./middleware/rateLimiter');
const notFound      = require('./middleware/notFound');
const errorHandler  = require('./middleware/errorHandler');

const app = express();

connectDB().catch((e) => { console.error('DB failed:', e.message); process.exit(1); });

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
app.use('/api', rateLimiter);

app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

app.use('/api/auth',         require('./routes/auth'));
app.use('/api/papers',       require('./routes/papers'));
app.use('/api/reviews',      require('./routes/reviews'));
app.use('/api/editor',       require('./routes/editor'));
app.use('/api/publications', require('./routes/publications'));
app.use('/api/search',       require('./routes/search'));
app.use('/api/analytics',    require('./routes/analytics'));
app.use('/api/advanced',     require('./routes/advanced'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`Server on port ${PORT} [${process.env.NODE_ENV}]`));
