// API Routes - Example API implementation

import { login } from '../auth/login';
import { Session } from '../auth/session';
import { Router } from 'express';

const router = Router();

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const result = await login(email, password);
    
    if (result.success) {
      res.json({
        success: true,
        token: result.token,
        user: result.user,
      });
    } else {
      res.status(401).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    await Session.invalidate(token);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const session = await Session.validate(token);
    
    if (!session) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.json({
      user: session.user,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
