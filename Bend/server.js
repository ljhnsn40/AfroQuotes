const express = require('express');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(cors());

// Auth0 Configuration
const authConfig = {
  domain: 'dev-3habzovbwcztqu3v.us.auth0.com',
  clientId: 'drsO0x1Vf6p97yTa6IMpaGC1O3Wi6uoE',
  clientSecret: 'FqUVnYYkoFFkVbv1u-WEqlX02wgGYYAtSsN9nXtbcgmlG_lQi75K5C1zD5BoYbBB',
};

mongoose.connect('mongodb://localhost:27017/AfroQuotes', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  auth0Id: { type: String, required: true, unique: true },
  favoriteQuotes: [{ type: String }],
});

const User = mongoose.model('User', userSchema);


// JWT Middleware to protect routes
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`,
  }),
  audience: 'https://api.afroquotes.com',
  issuerBaseURL: 'https://dev-3habzovbwcztqu3v.us.auth0.com/',
  tokenSigningAlg: 'RS256'
});

app.use(jwtCheck);

app.get('/authorized', function (req, res) {
  res.send('Secured Resource');
});

app.post('/api/auth/saveUser', checkJwt, async (req, res) => {
  const { sub } = req.user;

  try {
    let user = await User.findOne({ auth0Id: sub });

    if (!user) {
      user = new User({ auth0Id: sub });
      await user.save();
    }

    res.status(201).json({ message: 'User saved', user });
  } catch (error) {
    res.status(500).json({ error: 'Error saving user: ' + error.message });
  }
});

app.post('/api/favorites', checkJwt, async (req, res) => {
  const { sub } = req.user;
  const { quoteId } = req.body;

  try {
    const user = await User.findOne({ auth0Id: sub });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.favoriteQuotes.includes(quoteId)) {
      user.favoriteQuotes.push(quoteId);
      await user.save();
    }

    res.status(200).json({ message: 'Favorite saved', favoriteQuotes: user.favoriteQuotes });
  } catch (error) {
    res.status(500).json({ error: 'Error saving favorite: ' + error.message });
  }
});



// Public Route for Authentication Status
app.get('/api/auth/status', (req, res) => {
  res.json({ isAuthenticated: !!req.user });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
