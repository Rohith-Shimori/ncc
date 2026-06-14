const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Simple in-memory cache
let cachedStats = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

router.get('/stats', async (req, res) => {
  const now = Date.now();
  if (cachedStats && (now - lastCacheTime < CACHE_DURATION)) {
    return res.json({ data: cachedStats, error: null });
  }

  try {
    const [cadetsRes, coursesRes] = await Promise.all([
      supabase.from('cadet_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('courses').select('*', { count: 'exact', head: true })
    ]);

    if (cadetsRes.error) throw cadetsRes.error;
    if (coursesRes.error) throw coursesRes.error;

    cachedStats = {
      cadets: cadetsRes.count || 0,
      courses: coursesRes.count || 0,
      wings: 3
    };
    lastCacheTime = now;

    res.json({ data: cachedStats, error: null });
  } catch (error) {
    console.error('[Public Routes] Stats query error:', error);
    if (cachedStats) {
      return res.json({ data: cachedStats, error: null });
    }
    res.json({ data: { cadets: 33, courses: 93, wings: 3 }, error: null });
  }
});

module.exports = router;
