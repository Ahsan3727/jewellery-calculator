const mongoose = require('mongoose');
const itemSchema = new mongoose.Schema({
  name: String,
  weight: Number,
  unit: { type: String, enum: ['Tola', 'Masha', 'Ratti', 'Grams'] },
  ratePerTola: Number,
  makingCharge: Number,
  wastagePercent: Number,
  totalPrice: Number,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Item', itemSchema);