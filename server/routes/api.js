const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto'); // Added for password hashing
const router = express.Router();

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

// Helper to load JSON safely
function loadJSON(file) {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading ${file}:`, err.message);
    return [];
  }
}

// Helper to hash password
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// ==========================================
// GET ROUTES
// ==========================================

// GET /api/destinations
router.get('/destinations', (req, res) => {
  try {
    let destinations = loadJSON('destinations.json');
    const { search, category } = req.query;

    if (search) {
      const q = search.toLowerCase();
      destinations = destinations.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.state.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q)
      );
    }
    if (category && category !== 'All') {
      destinations = destinations.filter(d =>
        d.category.toLowerCase() === category.toLowerCase()
      );
    }
    res.json({ success: true, count: destinations.length, data: destinations });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to load destinations' });
  }
});

// GET /api/attractions
router.get('/attractions', (req, res) => {
  try {
    let attractions = loadJSON('attractions.json');
    const { city, state } = req.query;
    if (city) {
      attractions = attractions.filter(a => a.city.toLowerCase() === city.toLowerCase());
    }
    if (state) {
      attractions = attractions.filter(a => a.state.toLowerCase() === state.toLowerCase());
    }
    res.json({ success: true, count: attractions.length, data: attractions });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to load attractions' });
  }
});

// GET /api/restaurants
router.get('/restaurants', (req, res) => {
  try {
    let restaurants = loadJSON('restaurants.json');
    const { cuisine, city } = req.query;
    if (cuisine && cuisine !== 'All') {
      restaurants = restaurants.filter(r => r.cuisine.toLowerCase() === cuisine.toLowerCase());
    }
    if (city) {
      restaurants = restaurants.filter(r => r.city.toLowerCase() === city.toLowerCase());
    }
    res.json({ success: true, count: restaurants.length, data: restaurants });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to load restaurants' });
  }
});

// GET /api/recommendations (Rule-based AI Assistant)
router.get('/recommendations', (req, res) => {
  const { query } = req.query;
  let reply = "I'm your WanderWise Travel Assistant! I can help you with destinations, attractions, and budgets.";
  
  if (query) {
    const q = query.toLowerCase();
    if (q.includes('beach')) reply = "I recommend Goa for beaches, and Chennai for Marina Beach.";
    else if (q.includes('mountain') || q.includes('hill')) reply = "You should visit Manali or Darjeeling for great mountain views.";
    else if (q.includes('history') || q.includes('heritage')) reply = "Jaipur, Agra, and Hyderabad are perfect for history lovers.";
    else if (q.includes('food')) reply = "Try Paradise Biryani in Hyderabad or Karim's in Delhi!";
    else if (q.includes('budget') || q.includes('cheap')) reply = "Use our Budget Planner! Choose 'Budget' category and travel in groups to save.";
  }

  res.json({ success: true, reply });
});

// ==========================================
// POST ROUTES (Data Processing & Auth)
// ==========================================

// POST /api/budget
router.post('/budget', (req, res) => {
  try {
    const { startingCity, destination, travellers = 1, days = 1, category = 'Standard' } = req.body;

    if (!destination || !startingCity) {
      return res.status(400).json({ success: false, error: 'Starting city and destination are required' });
    }
    
    const numTravellers = parseInt(travellers);
    const numDays = parseInt(days);
    
    if (isNaN(numTravellers) || numTravellers < 1 || numTravellers > 20) {
      return res.status(400).json({ success: false, error: 'Travellers must be between 1 and 20' });
    }
    if (isNaN(numDays) || numDays < 1 || numDays > 60) {
      return res.status(400).json({ success: false, error: 'Days must be between 1 and 60' });
    }

    const multipliers = {
      Budget: { transport: 2000, hotel: 800, food: 500, extra: 400 },
      Standard: { transport: 5000, hotel: 2500, food: 1000, extra: 800 },
      Premium: { transport: 12000, hotel: 7000, food: 2500, extra: 2000 }
    };
    
    const m = multipliers[category] || multipliers.Standard;

    const transportCost = m.transport * numTravellers;
    const hotelCost = m.hotel * numDays * Math.ceil(numTravellers / 2);
    const foodCost = m.food * numDays * numTravellers;
    const attractionFees = 500 * numDays * numTravellers;
    const localTransport = 400 * numDays;
    const additional = m.extra * numDays;
    const total = transportCost + hotelCost + foodCost + attractionFees + localTransport + additional;

    res.json({
      success: true,
      disclaimer: 'Sample estimate only. Actual costs may vary.',
      breakdown: {
        transportation: transportCost,
        hotel: hotelCost,
        food: foodCost,
        attractionFees,
        localTransport,
        additional,
        total
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Budget calculation failed' });
  }
});

// POST /api/itinerary
router.post('/itinerary', (req, res) => {
  try {
    const { destination, days = 3, travellers = 2, category = 'Standard', interests = [] } = req.body;

    if (!destination) {
      return res.status(400).json({ success: false, error: 'Destination is required' });
    }

    const numDays = parseInt(days);
    if (![2, 3, 5, 7].includes(numDays)) {
      return res.status(400).json({ success: false, error: 'Days must be 2, 3, 5, or 7' });
    }

    const attractions = loadJSON('attractions.json').filter(a => a.city.toLowerCase() === destination.toLowerCase());
    const restaurants = loadJSON('restaurants.json').filter(r => r.city.toLowerCase() === destination.toLowerCase());

    const itinerary = [];
    const dailyActivities = [
      { morning: 'Visit main attractions', afternoon: 'Local sightseeing', evening: 'Try local cuisine' },
      { morning: 'Explore heritage sites', afternoon: 'Shopping at local markets', evening: 'Cultural show' },
      { morning: 'Nature walk', afternoon: 'Museum visit', evening: 'Relax at hotel' },
      { morning: 'Adventure activity', afternoon: 'Photography tour', evening: 'Sunset point' },
      { morning: 'Temple visit', afternoon: 'Local craft exploration', evening: 'Street food tour' },
      { morning: 'Day trip nearby', afternoon: 'Return and rest', evening: 'Fine dining' },
      { morning: 'Leisure morning', afternoon: 'Last-minute shopping', evening: 'Departure prep' }
    ];

    for (let i = 0; i < numDays; i++) {
      const act = dailyActivities[i % dailyActivities.length];
      itinerary.push({
        day: i + 1,
        morning: act.morning,
        afternoon: act.afternoon,
        evening: act.evening,
        attractions: attractions.length > 0 ? [attractions[i % attractions.length].name] : ['Local Sightseeing'],
        restaurants: restaurants.length > 0 ? [restaurants[i % restaurants.length].name] : ['Local Food Joint'],
        estimatedCost: category === 'Premium' ? 5000 : (category === 'Standard' ? 2500 : 1200),
        tips: 'Stay hydrated and carry local maps.'
      });
    }

    res.json({ success: true, destination, days: numDays, itinerary });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Itinerary generation failed' });
  }
});

// ==========================================
// AUTHENTICATION ROUTES (Login/Register)
// ==========================================

// POST /api/register
router.post('/register', (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const users = loadJSON('users.json');
    
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashPassword(password)
    };

    users.push(newUser);
    fs.writeFileSync(path.join(DATA_DIR, 'users.json'), JSON.stringify(users, null, 2));
    
    const token = newUser.id;
    res.json({ success: true, token, user: { name: newUser.name, email: newUser.email } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// POST /api/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const users = loadJSON('users.json');
    const user = users.find(u => u.email === email && u.password === hashPassword(password));

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = user.id;
    res.json({ success: true, token, user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

module.exports = router;