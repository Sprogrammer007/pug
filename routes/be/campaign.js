var express = require('express')
  , h = require('../../modules/application_helpers') // Helpers
  , router = express.Router();

//Get User
router.get('/u', function(req, res, next) {
  if (req.user) {
    return res.json(req.user.toJson());
  } else {  
    return res.status(401).send('Not Logged In'); 
  }
});

module.exports = router;