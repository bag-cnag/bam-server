"use strict";


let _security_Lib = {
        
    '_middleware_jwt': function(_options) {

        let _router = _options.router;

        // route middleware to verify a token
        _router.use(function(_req, _res, _next) {

            // check header or url parameters or post parameters for token
            let _token = _req.body.token || _req.query.token || _req.headers['x-access-token'];

            if (_token) {

                if (_security_Lib._verifyToken({
                    'token': _token
                }) === true) {
                    // if everything is good, save to request for use in other routes
                    _req._tokenDecoded = _token;
                    _next();
                } else {
                    return _res.json({
                        'success': false,
                        'message': 'Failed to authenticate token.'
                    });
                }
                

            } else {

                // if there is no token
                // return an error
                return _res.status(403).send({
                    'success': false,
                    'message': 'No token provided.'
                });

            }
        });


    },
    
    
    '_verifyToken': function(_options) {
        
        _options = (_options !== undefined) ? _options : {};
        
        let _token = _options.token;
        let _verified = false;
        
        if (_token !== undefined &&
                _token === "securetoken") {
            _verified = true;
        }
        
        return _verified;
        
    },
    
    
    'secure_ExpressRouter': function(_options) {

        let _router = _options.router;

        _security_Lib._middleware_jwt({
            'router': _router
        });

    }
    

};





module.exports = _security_Lib;
