import Backbone from 'backbone';
import {Router} from './router';

$(() => {
    // *Finally, we kick things off by creating the **App**.*
    new Router();
    Backbone.history.start();
});