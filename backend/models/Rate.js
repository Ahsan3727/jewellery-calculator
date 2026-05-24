const mongoose = require('mongoose');
const rateSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  ratePerTola: { type: Number, required: true },      // 24K pure gold rate
  makingChargePerTola: { type: Number, default: 0 },  // optional
  wastagePercent: { type: Number, default: 0 }        // optional
});
module.exports = mongoose.model('Rate', rateSchema);