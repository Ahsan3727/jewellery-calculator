require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const ratesRoute = require('./routes/rates');
const calcRoute = require('./routes/calculations');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/api/rates', ratesRoute);
app.use('/api/calc', calcRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));