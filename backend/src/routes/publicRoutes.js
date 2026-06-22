const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { getCache, setCache } = require('../config/redis');

router.get('/stats', async (req, res) => {
  const cacheKey = 'public_stats';
  
  try {
    const cachedStatsStr = await getCache(cacheKey);
    if (cachedStatsStr) {
      const cachedData = JSON.parse(cachedStatsStr);
      return res.json({ data: cachedData, error: null });
    }
  } catch (err) {
    console.error('[Public Routes] Cache retrieval failed, falling back:', err);
  }

  try {
    const [cadetsRes, coursesRes] = await Promise.all([
      supabase.from('cadet_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('courses').select('*', { count: 'exact', head: true })
    ]);

    if (cadetsRes.error) throw cadetsRes.error;
    if (coursesRes.error) throw coursesRes.error;

    const stats = {
      cadets: cadetsRes.count || 0,
      courses: coursesRes.count || 0,
      wings: 3
    };

    // Cache for 5 minutes (300 seconds)
    try {
      await setCache(cacheKey, JSON.stringify(stats), 300);
    } catch (err) {
      console.error('[Public Routes] Saving to cache failed:', err);
    }

    res.json({ data: stats, error: null });
  } catch (error) {
    console.error('[Public Routes] Stats query error:', error);
    
    // Fallback: Try to get stale cache if database is down
    try {
      const cachedStatsStr = await getCache(cacheKey);
      if (cachedStatsStr) {
        return res.json({ data: JSON.parse(cachedStatsStr), error: null });
      }
    } catch { /* ignore */ }

    res.json({ data: { cadets: 33, courses: 93, wings: 3 }, error: null });
  }
});

module.exports = router;
