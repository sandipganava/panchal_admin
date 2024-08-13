
const jwt = require('jsonwebtoken')
require('dotenv').config();

const genarateToken = (user) => {
  var genaratedToken = jwt.sign({ email: user.personal_email, id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' }) ;
  return genaratedToken
}

module.exports = genarateToken