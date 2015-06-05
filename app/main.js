import Backbone from 'backbone';
import {SurveyRouter} from './router';

$(() => {
    // *Finally, we kick things off by creating the **App**.*
    new SurveyRouter();
    Backbone.history.start();
});
