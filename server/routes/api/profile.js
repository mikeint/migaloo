const express = require('express');
const router = express.Router();
const passport = require('passport');

//load input validation
const validateProfileInput = require('../../validation/profile');  
// Load Profile Model
const Profile = require('../../models/Profile'); 

// @route       GET api/profile/test
// @desc        Tests profile route
// @access      Public
router.get('/test', (req, res) => res.json({
    msg: "Profile Works"
}));
 

// @route       POST api/profile/saveType
// @desc        Add type to profile
// @access      Private
router.post('/saveType', passport.authenticate('jwt', { session: false }),  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);
    //check Validation
    if(!isValid) {
        return res.status(400).json(errors);
    }
 
    const newProfile = new Profile({
        user_id: req.body.user._id,
        type: req.body.type
    }); 
    newProfile.save().then(profile => res.json(profile));
  
});



// @route       GET api/profile/:id
// @desc        get profile by ID
// @access      Private
router.get('/:id', /* passport.authenticate('jwt', { session: false }), */ (req, res) => {
    Profile.findOne({ user_id: req.params.id }).then(profile => { 
        return res.json(profile)
    }); 
});




module.exports = router;