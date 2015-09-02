import Backbone from 'backbone';
import DragDropper from '../dragdrop';
import FieldGenerator from '../field_generate';
import { SurveyView } from './Survey';
import { MenuView } from './Menu';
import i18next from 'i18next-client';
import * as utils from '../utils';
import * as paths from '../paths';
import modal from 'bootstrap';
import '../styles/app.css!';
import pcapi from 'pcapi';

export class GeneralView extends Backbone.View {

    initialize () {
        this.render();
    }

    doLogin () {
        $(document).on('click', '.login', function(){
            var id = "login-modal";
            pcapi.getProviders().done(function(data){
                if($("#"+id).length ===0){
                    var body = [];
                    body.push('<div class="btn-group-vertical" role="group" aria-label="...">');
                    for(var key in data){
                        body.push('<div class="btn-group" role="group">');
                        body.push('<button type="button" class="btn btn-default provider" data-provider="'+key+'">'+key+' provider</button>');
                        body.push('</div>');
                    }
                    body.push('</div>');
                    $("body").append(utils.makeModalWindow("login-modal", "", body).join(""));
                }
                $("#"+id).modal("show");
            });
        });
    }

    enableEvents () {
        this.doLogin();
        this.enableLogin();
    }

    enableLogin () {
        $(document).on('click', '.provider', function(){
            let provider = $(this).attr('data-provider');
            pcapi.setProvider(provider);
            if(provider === "dropbox"){
                pcapi.loginCloud();
            }
        });
    }

    render () {
        var p = paths.getPaths();
        pcapi.init({
            "url": p.baseurl,
            "version": p.version
        });
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
        this.enableEvents();
    }

}