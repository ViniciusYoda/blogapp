export default {
    eAdmin: function(req, res, next) {
        // Corrected: Using req.isAuthenticated() and strict equality (===)
        if (req.isAuthenticated() && req.user.eAdmin === 1) {
            return next();
        }
        
        req.flash("error_msg", "Você precisa ser um administrador para acessar esta página."); // More specific message
        res.redirect("/");
    }
};