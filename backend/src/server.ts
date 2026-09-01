import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API root route
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'CATFleet360 Enterprise Fleet Operating System',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`⚡ CATFleet360 Backend API running on http://localhost:${PORT}`);
});
