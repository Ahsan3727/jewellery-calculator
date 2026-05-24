const express = require('express');
const router = express.Router();

// Calculation helper
function calculatePrice(weight, unit, ratePerTola, makingPerTola = 0, wastagePercent = 0) {
  let weightInTola;
  switch(unit) {
    case 'Tola': weightInTola = weight; break;
    case 'Masha': weightInTola = weight / 12; break;
    case 'Ratti': weightInTola = weight / 96; break;
    case 'Grams': weightInTola = weight / 11.664; break;
    default: weightInTola = 0;
  }
  const goldValue = weightInTola * ratePerTola;
  const making = weightInTola * makingPerTola;
  const wastage = goldValue * (wastagePercent / 100);
  return {
    weightInTola: weightInTola.toFixed(4),
    goldValue: goldValue.toFixed(2),
    making: making.toFixed(2),
    wastage: wastage.toFixed(2),
    total: (goldValue + making + wastage).toFixed(2)
  };
}

router.post('/price', (req, res) => {
  const { weight, unit, ratePerTola, makingPerTola, wastagePercent } = req.body;
  const result = calculatePrice(weight, unit, ratePerTola, makingPerTola, wastagePercent);
  res.json(result);
});

module.exports = router;