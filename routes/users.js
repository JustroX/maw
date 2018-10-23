const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const mongoose=require('mongoose');
module.exports = router;

//Load user Model
require('../models/User');
const User = mongoose.model('users');


//User Login Route
router.get('/login', (req,res) => {
    res.render('users/login',{login:true});
});

//login form POST
router.post('/login', (req,res,next) => {
    passport.authenticate('local', {
        successRedirect:'/maws',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req,res,next);
})


//user register route
router.get('/register', (req,res) => {
    res.render('users/register',{login:true});
});

//Register form POST
router.post('/register', (req,res) =>{
    let errors = [];

    if(req.body.password != req.body.password2){
        errors.push({text:'Passwords do not match'});
    }
    if(req.body.password.length < 6){
        errors.push({text:'Password must be at least 6 characters '});
    }
    if(errors.length > 0){
        res.render('users/register',{
        errors: errors,
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        password2: req.body.password2
        });
    } else{
        User.findOne({email: req.body.email})
        .then(user => {
            if(user){
                req.flash('error_msg', 'Email already registered');
                res.redirect('/users/Register');
            } 
            else{
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                });
        
                bcrypt.genSalt(10, (errors,salt) => {
                    bcrypt.hash(newUser.password ,salt, (err,hash) => {
                        if(err) throw err;
                        newUser.password =hash;
                        newUser.save()
                            .then(user =>{
                                req.flash('success_msg', 'you are now registered and can log in');
                                res.redirect('/users/login');
                            })
                            .catch( err => {
                                console.log(err);
                                return;
                            });
                    });
        
                });
            }
        });
    }
});

// Logout User
router.get('/logout', (req,res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});
