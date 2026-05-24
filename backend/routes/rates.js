const express = require('express');
const router = express.Router();
const Rate = require('../models/Rate');

// Save today's rate
router.post('/', async (req, res) => {
  try {
    const { ratePerTola, makingChargePerTola, wastagePercent } = req.body;
    const rate = new Rate({ ratePerTola, makingChargePerTola, wastagePercent });
    await rate.save();
    res.json(rate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get latest rate
router.get('/latest', async (req, res) => {
  const rate = await Rate.findOne().sort({ date: -1 });
  res.json(rate);
});

module.exports = router;