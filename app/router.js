import Backbone from 'backbone';
import { SurveyView } from './views/Survey';
import { MenuView } from './views/Menu';
import i18next from 'i18next-client';
import * as utils from './utils';
import './styles/app.css!';


export class SurveyRouter extends Backbone.Router {

  constructor () {
    super();
    this.routes = {
      'survey-designer': 'survey'
    };
    this._bindRoutes();
  }

  survey () {
    console.log('Route#survey');
    var locale = utils.getParams().lang || 'en';
    localStorage.setItem('locale', locale);
    i18n.init({// jshint ignore:line
        ns: { namespaces: ['survey'], defaultNs: 'survey'},
        detectLngQS: 'lang'
    }, function(){
        $("html").i18n();
        new SurveyView();
        new MenuView();
    });
  }
}