import Backbone from 'backbone';
import * as utils from './utils';
import * as save from './save';
import pcapi from 'pcapi';
import Survey from './survey';
import Convertor from 'survey-convertor';

/* global cfg, i18n */

export class SurveyView extends Backbone.View {

    initialize () {
        this.cfg = cfg;
        this.options = {
            "element": "content",
            "subElement": "mobile-content"
        };
        this.params = utils.getParams();
        if(this.params) {
            this.options.formsFolder = this.params.sid;
            this.options.copyToPublic = (this.params.public === 'true');
        }
        this.render();
    }

    formSave() {
        $(document).off('click', '#form-save');
        $(document).on('click', '#form-save', $.proxy(function(){
            var formInJSON = save.saveData("."+this.options.subElement);
            var htmlConvertor = new Convertor();

            var title = formInJSON.title;
            if ("sid" in this.params && this.params.sid !== undefined) {
                title = this.params.sid;
            }
            var options = {
                remoteDir: "editors",
                path: encodeURIComponent(title)+".json",
                data: JSON.stringify(formInJSON)
            };

            if(this.params.public === 'true'){
                options.urlParams = {
                    'public': 'true'
                };
            }

            var optionsForHTML = {
                remoteDir: "editors",
                path: encodeURIComponent(title)+".edtr",
                data: htmlConvertor.JSONtoHTML(formInJSON).join("")
            };

            if(this.params.public === 'true'){
                optionsForHTML.urlParams = {
                    'public': 'true'
                };
            }

            pcapi.updateItem(options).then(function(result){
                utils.giveFeedback("Your form has been uploaded");
            });

            pcapi.updateItem(optionsForHTML).then(function(result){
                utils.giveFeedback("Your form has been uploaded");
            });
        }, this));
    }

    getEditor (options, title) {
        utils.loading(true);
        var survey;
        pcapi.getEditor(options).then($.proxy(function(data){
            utils.loading(false);

            if(data.error === 1){
                this.survey.render();
            }
            else {
                this.survey.renderExistingSurvey(title, data);
            }
        }, this));
    }

    render () {
        pcapi.init({
            "url": this.cfg.baseurl,
            "version": this.cfg.version
        });
        var user = this.cfg.userid;
        pcapi.setCloudLogin(user);
        var locale = utils.getParams().lang || 'en';
        localStorage.setItem('locale', locale);
        i18n.init({// jshint ignore:line
            ns: { namespaces: ['survey'], defaultNs: 'survey'},
            detectLngQS: 'lang'
        }, $.proxy(function(){
            if(this.params && this.params.survey) {
                this.options.title = decodeURIComponent(this.params.survey);
            }
            this.survey = new Survey(this.options);
            this.renderSurvey();
            this.formSave();
        }, this));
    }

    renderSurvey () {
        if ("sid" in this.params && this.params.sid !== undefined) {
            var title = decodeURIComponent(this.params.survey);
            var options = {
                "remoteDir": "editors",
                "item": utils.getParams().sid+".json"
            };
            this.getEditor(options, title);
        }
        else {
            this.survey.render();
        }
        return this;
    }

}
