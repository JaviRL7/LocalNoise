const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.register = async (req, res) => {
  try {
    const { username, email, password, city, country } = req.body;

    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'El email o nombre de usuario ya está en uso'
      });
    }

    const user = await User.create({
      username,
      email,
      password,
      city,
      country
    });

    const token = generateToken(user.id);

    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        city: user.city,
        country: user.country
      },
      token
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        error: 'Credenciales incorrectas'
      });
    }

    const token = generateToken(user.id);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        city: user.city,
        country: user.country
      },
      token
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        city: req.user.city,
        country: req.user.country,
        profilePhoto: req.user.profilePhoto
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.googleCallback = async (req, res) => {
  try {
    const user = req.user;
    const token = generateToken(user.id);

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user.id,
      username: user.username,
      email: user.email,
      city: user.city,
      country: user.country,
      profilePhoto: user.profilePhoto
    }))}`);
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}?error=google_auth_failed`);
  }
};
