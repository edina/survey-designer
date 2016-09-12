import Backbone from 'backbone';
import * as utils from './utils';
import * as save from './save';
import pcapi from 'pcapi';
import Survey from './survey';
import * as config from './configuration';

/* global cfg, i18n */

export class SurveyView extends Backbone.View {

    /**
     * A class that extends Backbone View and is used for initialing the app
     * @constructor
     */
    initialize () {
        this.cfg = config.getConfig().PCAPI;
        //
        this.options = {
            "element": "content",
            "subElement": "mobile-content"
        };
        //get the params from the url, info like if the survey is public and the
        //sid of the user are needed
        this.params = utils.getParams();
        
        if(this.params) {
            this.options.formsFolder = this.params.sid;
            this.options.copyToPublic = (this.params.public === 'true');
        }
        //manual way of making header menu active
        $('#header-menu li').removeClass('active');
        $('#header-menu li a[href="#/survey-designer"]').parent().addClass('active');
        this.render();
    }

    /**
     * save the form to the pcapi
     */
    formSave() {
        $(document).off('click', '#form-save');
        $(document).on('click', '#form-save', $.proxy(function(){
            //convert form to json object
            var formInJSON = save.saveData("."+this.options.subElement);

            var title = formInJSON.title;
            //if sid on the url params then it will become the filename of the editor
            if ("sid" in this.params && this.params.sid !== undefined) {
                title = this.params.sid;
            }
            //options for the pcapi
            var options = {
                remoteDir: "editors",
                path: encodeURIComponent(title)+".json",
                data: JSON.stringify(formInJSON)
            };

            //check if the survey is public
            if(this.params.public === 'true'){
                options.urlParams = {
                    'public': 'true'
                };
            }

            //store the form to pcapi
            pcapi.updateItem(options).then(function(result){
                utils.giveFeedback("Your form has been saved successfully");
            });

        }, this));
    }

    /**
     * get editor if exists already
     * @param {string} options.remoteDir - remote dir for pcapi (editor|records)
     * @param {string} options.item - filename of the file
     * @param {string} title - title of the survey
     */
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

    /**
     * initialize i18n and then render a new or existing survey
     */
    render () {
        //initialize pcapi
        pcapi.init({
            "url": this.cfg.baseurl,
            "version": this.cfg.version
        });
        //define the userid
        var user = this.cfg.userid;
        pcapi.setCloudLogin(user);
        //define locale
        var locale = utils.getParams().lang || 'en';
        localStorage.setItem('locale', locale);
        //initialize i18n
        i18n.init({// jshint ignore:line
            ns: { namespaces: ['survey'], defaultNs: 'survey'},
            detectLngQS: 'lang'
        }, $.proxy(function(){
            //if survey in params, define it as survey title
            if(this.params && this.params.survey) {
                this.options.title = decodeURIComponent(this.params.survey);
            }
            //intialize survey class
            this.survey = new Survey(this.options);
            this.renderSurvey();
            //enable form save event
            this.formSave();
        }, this));
    }

    renderSurvey () {
        //if sid in params then check if exists editor and render it
        if ("sid" in this.params && this.params.sid !== undefined) {
            var title = decodeURIComponent(this.params.survey);
            var options = {
                "remoteDir": "editors",
                "item": utils.getParams().sid+".json"
            };
            this.getEditor(options, title);
        }//otherwise intialize the survey class
        else {
            this.survey.render();
        }
    }

}
