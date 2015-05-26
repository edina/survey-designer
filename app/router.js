"use strict";

var $ = require('jquery'),
    Backbone = require('backbone');

Backbone.$ = $;

var HomeView = require('./views/Home');

module.exports = Backbone.Router.extend({

    routes: {
        "": "home"
    },

    home: function () {
        var homeView = new HomeView();
        homeView.render();
    }

});