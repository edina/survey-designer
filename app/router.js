import Backbone from 'backbone';
import { SurveyView } from './views/Survey';
import { MenuView } from './views/Menu';
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
    new SurveyView();
    new MenuView();
  }
}