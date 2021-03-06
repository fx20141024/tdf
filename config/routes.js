module.exports = function(app, passport, auth) {

    //=========================================================================
    //  Users
    //=========================================================================

    // User Routes
    var users = require('../app/controllers/users');
    app.get('/signin', users.signin);
    app.get('/signup', users.signup);
    app.get('/signout', users.signout);

    var authenticate = function(req, res, next) {
        passport.authenticate('local', function(err, user, info) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.send(500, {
                    flash: info.message
                });
            }
            req.logIn(user, function(err) {
                if (err) {
                    return next(err);
                }
                return res.send(200, {
                    flash: 'Successful login'
                });
            });
        })(req, res, next);
    };

    //Setting up the users api
    app.post('/users', users.create, authenticate);
    app.post('/users/session', authenticate);

    // Public User Routes
    app.get('/users', users.all);
    app.get('/users/me', users.me);
    app.get('/users/profile', users.profile, auth.requiresLogin);
    app.get('/users/:userId', users.show);
    app.put('/users/:userId', users.update, auth.requiresLogin,
            auth.user.hasAuthorization);

    //=========================================================================
    //  Auth
    //=========================================================================

    //Setting the facebook oauth routes
    app.get('/auth/facebook', passport.authenticate('facebook', {
        scope: ['email', 'user_about_me'],
        failureRedirect: '/signin'
    }), users.signin);

    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        failureRedirect: '/signin'
    }), users.authCallback);

    //Setting the github oauth routes
    app.get('/auth/github', passport.authenticate('github', {
        failureRedirect: '/signin'
    }), users.signin);

    app.get('/auth/github/callback', passport.authenticate('github', {
        failureRedirect: '/signin'
    }), users.authCallback);

    //Setting the twitter oauth routes
    app.get('/auth/twitter', passport.authenticate('twitter', {
        failureRedirect: '/signin'
    }), users.signin);

    app.get('/auth/twitter/callback', passport.authenticate('twitter', {
        failureRedirect: '/signin'
    }), users.authCallback);

    //Setting the google oauth routes
    app.get('/auth/google', passport.authenticate('google', {
        failureRedirect: '/signin',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    }), users.signin);

    app.get('/auth/google/callback', passport.authenticate('google', {
        failureRedirect: '/signin'
    }), users.authCallback);

    //Finish with setting up the userId param
    app.param('userId', users.user);

    //=========================================================================
    //  Leagues
    //=========================================================================

    // League Routes
    var leagues = require('../app/controllers/leagues');
    app.get('/leagues', leagues.all);
    app.post('/leagues', auth.requiresLogin, auth.requiresAdmin,
             leagues.create);
    app.get('/leagues/:leagueId', leagues.show);
    app.put('/leagues/:leagueId', auth.requiresLogin, auth.requiresAdmin,
            leagues.update);
    app.delete('/leagues/:leagueId', auth.requiresLogin, auth.requiresAdmin,
               leagues.destroy);

    // Finish with setting up the leagueId param
    app.param('leagueId', leagues.league);

    //=========================================================================
    //  Agents
    //=========================================================================

    // Agent Routes
    var agents = require('../app/controllers/agents');
    app.get('/agents', agents.all);
    app.post('/agents', auth.requiresLogin, agents.create);
    app.get('/agents/:agentId', agents.show);
    app.put('/agents/:agentId', auth.requiresLogin,
            auth.agent.hasAuthorization, agents.update);
    app.delete('/agents/:agentId', auth.requiresLogin,
               auth.agent.hasAuthorization, agents.destroy);
    app.put('/agents/trade/:agentId', auth.agent.hasAuthorization,
            agents.trade);
    app.post('/agents/trade/:agentId', auth.agent.hasAuthorization,
             agents.trade);
    app.get('/agents/trade/:agentId', auth.agent.hasAuthorization,
            agents.trade);
    app.delete('/agents/trade/:agentId', auth.agent.hasAuthorization,
               agents.reset);
    app.get('/agents/resettrades/:agentId', auth.agent.hasAuthorization,
            agents.reset);
    app.delete('/agents/apikey/:agentId', auth.requiresLogin,
               auth.agent.hasAuthorization, agents.resetapikey);

    app.get('/agents/:agentId/composition', auth.agent.hasAuthorization,
            agents.current_composition);

    // Finish with setting up the leagueId param
    app.param('agentId', agents.agent);

    //=========================================================================
    //  Tick
    //=========================================================================

    var ticks = require('../app/controllers/ticks');
    app.get('/maketick', ticks.maketick);
    app.get('/ticks/:n', ticks.historical);

    app.param('n', function(req, res, next, value) {
        req.n = parseInt(value, 10);
        next();
    });

    //=========================================================================
    //  Historical Values
    //=========================================================================

    app.get('/history/:securityId', ticks.historical);
    app.get('/history', ticks.symbols);
    app.get('/currentstatus', ticks.currentstatus);
    app.get('/allhistories', ticks.allhistories);

    app.param('securityId', function(req, res, next, id) {
        req.symbol = id;
        next();
    });

    //=========================================================================
    //  Home
    //=========================================================================

    //Home route
    var index = require('../app/controllers/index');
    app.get('/', index.render);

};
