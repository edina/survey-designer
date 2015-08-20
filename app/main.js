import Backbone from 'backbone';
import {SurveyRouter} from './router';

$(() => {
    // *Finally, we kick things off by creating the **App**.*
    // Pass in our Router module and call it's initialize function
    //Router.initialize();
    new SurveyRouter();
    Backbone.history.start();
});
