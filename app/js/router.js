import Backbone from 'backbone';
import { HomeView } from './views/Home';
import { MenuView } from './views/Menu';


export class Router extends Backbone.Router {

  constructor () {
    super();
    this.routes = {
      '': 'home'
    };
    this._bindRoutes();
  }

  home () {
    console.log('Route#home');
    new HomeView();
    new MenuView();
  }
}