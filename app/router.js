import Backbone from 'backbone';
import { SurveyView } from './views/Survey';
import { MenuView } from './views/Menu';
import './styles/app.css!';


export class SurveyDesigner extends Backbone.Router {

  constructor () {
    super();
    this.routes = {
      'surveys': 'survey'
    };
    this._bindRoutes();
  }

  survey () {
    console.log('Route#survey');
    new SurveyView();
    new MenuView();
  }
}