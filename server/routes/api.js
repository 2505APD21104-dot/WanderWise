const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const router = express.Router();

// --- MongoDB Connection ---
// I have already put your connection string here for you!
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://2505a21104_db_user:KpiyuVE9yHprFoCN@cluster0.gfzsgos.mongodb.net/wanderwise?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// --- Database Models ---
const User = mongoose.model('User', new mongoose.Schema({ 
  name: String, email: String, password: String 
}));

const Review = mongoose.model('Review', new mongoose.Schema({ 
  attractionId: String, name: String, rating: Number, comment: String, date: String 
}));

// Helper for passwords
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// --- STATIC DATA (Destinations, Attractions, Restaurants) ---
const destinations = require('../../data/destinations.json');
const attractions = require('../../data/attractions.json');
const restaurants = require('../../data/restaurants.json');

// ==========================================
// GET ROUTES (Static Data)
// ==========================================
router.get('/destinations', (req, res) => {
  let filtered = destinations;
  const { search, category } = req.query;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(d => d.name.toLowerCase().includes(q) || d.state.toLowerCase().includes(q) || d.description.toLowerCase().includes(q));
  }
  if (category && category !== 'All') {
    filtered = filtered.filter(d => d.category.toLowerCase() === category.toLowerCase());
  }
  res.json({ success: true, count: filtered.length, data: filtered });
});

router.get('/attractions', (req, res) => {
  res.json({ success: true, count: attractions.length, data: attractions });
});

router.get('/restaurants', (req, res) => {
  res.json({ success: true, count: restaurants.length, data: restaurants });
});

router.get('/recommendations', (req, res) => {
  const { query } = req.query;
  let reply = "I'm your WanderWise Travel Assistant! Ask me about beaches, mountains, history, or budget tips.";
  if (query) {
    const q = query.toLowerCase();
    if (q.includes('beach')) reply = "I recommend Goa for beaches, and Chennai for Marina Beach.";
    else if (q.includes('mountain')) reply = "You should visit Manali or Darjeeling for great mountain views.";
    else if (q.includes('history')) reply = "Jaipur, Agra, and Hyderabad are perfect for history lovers.";
  }
  res.json({ success: true, reply });
});

// ==========================================
// POST ROUTES (Budget & Itinerary)
// ==========================================
router.post('/budget', (req, res) => {
  const { startingCity, destination, travellers = 1, days = 1, category = 'Standard' } = req.body;
  if (!destination || !startingCity) return res.status(400).json({ success: false, error: 'Starting city and destination are required' });
  
  const multipliers = {
    Budget: { transport: 2000, hotel: 800, food: 500, extra: 400 },
    Standard: { transport: 5000, hotel: 2500, food: 1000, extra: 800 },
    Premium: { transport: 12000, hotel: 7000, food: 2500, extra: 2000 }
  };
  const m = multipliers[category] || multipliers.Standard;
  const numT = parseInt(travellers);
  const numD = parseInt(days);

  const breakdown = {
    transportation: m.transport * numT,
    hotel: m.hotel * numD * Math.ceil(numT / 2),
    food: m.food * numD * numT,
    attractionFees: 500 * numD * numT,
    localTransport: 400 * numD,
    additional: m.extra * numD
  };
  breakdown.total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  
  res.json({ success: true, breakdown });
});

router.post('/itinerary', (req, res) => {
  const { destination, days = 3, category = 'Standard' } = req.body;
  const numDays = parseInt(days);
  const dailyActivities = [
    { morning: 'Visit main attractions', afternoon: 'Local sightseeing', evening: 'Try local cuisine' },
    { morning: 'Explore heritage sites', afternoon: 'Shopping at local markets', evening: 'Cultural show' },
    { morning: 'Nature walk', afternoon: 'Museum visit', evening: 'Relax at hotel' },
    { morning: 'Adventure activity', afternoon: 'Photography tour', evening: 'Sunset point' }
  ];
  const itinerary = [];
  for (let i = 0; i < numDays; i++) {
    const act = dailyActivities[i % dailyActivities.length];
    itinerary.push({
      day: i + 1, ...act,
      estimatedCost: category === 'Premium' ? 5000 : (category === 'Standard' ? 2500 : 1200)
    });
  }
  res.json({ success: true, destination, days: numDays, itinerary });
});

// ==========================================
// AUTHENTICATION (MongoDB)
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, error: 'All fields are required' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, error: 'Email already exists' });

    const newUser = new User({ name, email, password: hashPassword(password) });
    await newUser.save();

    res.json({ success: true, token: newUser._id, user: { name: newUser.name, email: newUser.email } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password: hashPassword(password) });
    if (!user) return res.status(401).json({ success: false, error: 'Invalid email or password' });

    res.json({ success: true, token: user._id, user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// ==========================================
// RATINGS & REVIEWS (MongoDB)
// ==========================================
router.get('/reviews/:attractionId', async (req, res) => {
  try {
    const reviews = await Review.find({ attractionId: req.params.attractionId });
    let avgRating = 0;
    if (reviews.length > 0) {
      const total = reviews.reduce((sum, r) => sum + r.rating, 0);
      avgRating = (total / reviews.length).toFixed(1);
    }
    res.json({ success: true, average: avgRating, count: reviews.length, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to load reviews' });
  }
});

router.post('/reviews', async (req, res) => {
  try {
    const { attractionId, name, rating, comment } = req.body;
    if (!attractionId || !name || !rating || !comment) return res.status(400).json({ success: false, error: 'All fields are required' });

    const newReview = new Review({
      attractionId, name, rating: parseInt(rating), comment, date: new Date().toLocaleDateString()
    });
    await newReview.save();
    
    res.json({ success: true, review: newReview });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to save review' });
  }
});

module.exports = router;