const express = require('express');
const router = express.Router();
const mongoose=require('mongoose');
const {ensureAuthenticated} = require('../helpers/auth');
module.exports = router;

//Load Maw Model
require('../models/Maw');
const Maw = mongoose.model('maws');

//Maw Index Page
router.get('/',ensureAuthenticated, (req,res) =>{
    Maw.find({user: req.user.id})
    .sort({title:'desc'})
    .then(maws =>{
        res.render('maws/index', {
            maws:maws
        });
    });
});

//add Maw form
router.get('/add',ensureAuthenticated, (req,res) =>{
    res.render('maws/add');
    req.flash('success_msg', 'Maw creature added');
});

//edit Maw form
router.get('/edit/:id', ensureAuthenticated, (req,res) =>{
    Maw.findOne({
        _id: req.params.id
    })
    .then(maw => {
        if(maw.user != req.user.id){
            req.flash('error_msg', 'Not Authorized');
            res.redirect('/maws');
        } else{
        res.render('maws/edit',{
            maw:maw
        });
    }
    });
});
//profile
router.get('/profile', (req,res) => {
    res.render('maws/profile');
})

//process form
router.post('/', ensureAuthenticated, (req,res) => {
    let errors = [];
    if(!req.body.title){
        errors.push({text:'Please add a title'});
    }
    if(!req.body.details)
    {
        errors.push({text: 'come on, add some details'});
    }
    if(errors.length > 0){
        res.render('maws/add',{
            errors: errors,
            title: req.body.title,
            details: req.body.details
        });
    } else{
        const newUser ={
            title: req.body.title,
            details: req.body.details,
            user: req.user.id
        }
        new Maw(newUser)
            .save()
            .then(maw =>{
                res.redirect('/maws');
            })
    }
});

//edit form process
router.put('/:id',ensureAuthenticated, (req,res) => {
    Maw.findOne({
        _id: req.params.id
    })
    .then(maw => {
        maw.title = req.body.title;
        maw.details = req.body.details;

        maw.save()
            .then(maw => {
                req.flash('success_msg', 'Maws updated');
                res.redirect('/maws');
            })
    });
});

//delete Maw
router.delete('/:id',ensureAuthenticated, (req,res) => {
    Maw.remove({_id: req.params.id})
        .then(() => {
            req.flash('success_msg', 'Maws removed');
            res.redirect('/maws');
        });
});
