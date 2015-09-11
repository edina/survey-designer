import Backbone from 'backbone';
import { SurveyView } from './surveyView';


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
  }
}