module.exports = {
    ensureAuthenticated: function(req,res, next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash('error_msg', 'Gotta Login first though');
        res.redirect('/users/login')
    }
}