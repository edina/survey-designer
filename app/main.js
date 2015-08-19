import Backbone from 'backbone';
import {SurveyRouter} from './router';
import i18next from 'i18next-client';
import * as utils from './utils';

$(() => {
    // *Finally, we kick things off by creating the **App**.*
    var locale = utils.getParams().lang || 'en';
    localStorage.setItem('locale', locale);
    i18n.init({// jshint ignore:line
        ns: { namespaces: ['survey'], defaultNs: 'survey'},
        detectLngQS: 'lang'
    }, function(){
        $("html").i18n();
    });
    // Pass in our Router module and call it's initialize function
    //Router.initialize();
    new SurveyRouter();
    Backbone.history.start();
});
