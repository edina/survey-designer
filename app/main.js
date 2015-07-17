import Backbone from 'backbone';
import {SurveyRouter} from './router';
import Polyglot from 'polyglot';

$(() => {
    // *Finally, we kick things off by creating the **App**.*
    var locale = localStorage.getItem('locale') || 'en';
    // Gets the language file.
    $.getJSON('locales/' + locale + '.json', function(data) {
        // Instantiates polyglot with phrases.
        console.log(data)
        var pglot = new Polyglot({phrases: data});
        // Pass in our Router module and call it's initialize function
        //Router.initialize();
        new SurveyRouter();
        Backbone.history.start();
    });
});
