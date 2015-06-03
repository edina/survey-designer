import Backbone from 'backbone';
import {SurveyDesigner} from './router';

$(() => {
    // *Finally, we kick things off by creating the **App**.*
    new SurveyDesigner();
    Backbone.history.start();
});