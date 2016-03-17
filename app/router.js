import Backbone from 'backbone';
import { SurveyView } from './surveyView';
import { UploadLayerView } from './uploadLayerView';


export class SurveyRouter extends Backbone.Router {

  constructor () {
    super();
    this.routes = {
      'survey-designer': 'survey',
      'upload-layer': 'uploadLayers'
    };
    this._bindRoutes();
  }

  survey () {
    console.log('Route#survey');
    new SurveyView();
  }

  uploadLayers () {
    new UploadLayerView();
  }
}
