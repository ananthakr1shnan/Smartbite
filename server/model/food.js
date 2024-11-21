const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  expiry: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Fruit', 'Vegetable', 'Meat', 'Dairy', 'Grain', 'Other']
  },
  userEmail: {  // Changed from userId to userEmail for simplicity
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

FoodSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Food = mongoose.model('Food', FoodSchema);

module.exports = Food;