const { getSupabaseClient } = require('../config/supabase');

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // Create temporary client to verify token
  const tempClient = getSupabaseClient(token);
  const { data: { user }, error } = await tempClient.auth.getUser();

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = user;
  req.token = token;
  next();
};

module.exports = { verifyToken };
