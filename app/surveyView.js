'use strict';
import Backbone from 'backbone';
import * as utils from './utils';
import pcapi from 'pcapi';
import Survey from './survey';

export class SurveyView extends Backbone.View {

    initialize () {
        this.cfg = cfg;
        this.render();
    }

    formSave() {
      $(document).off('click', '#form-save');
      $(document).on('click', '#form-save', $.proxy(function(){
          var formInJSON = this.survey.saveData();

          var title = formInJSON.title;
          if ("sid" in utils.getParams() && utils.getParams().sid !== undefined) {
              title = utils.getParams().sid;
          }
          var options = {
              remoteDir: "editors",
              path: encodeURIComponent(title)+".json",
              data: JSON.stringify(formInJSON)
          };

          if(utils.getParams().public === 'true'){
              options.urlParams = {
                  'public': 'true'
              };
          }

          pcapi.updateItem(options).then(function(result){
              utils.giveFeedback("Your form has been uploaded");
          });
      }, this));
    }

    getEditor (title, options) {
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
        var user = utils.getParams().group || this.cfg.userid;
        pcapi.setCloudLogin(user);
        var locale = utils.getParams().lang || 'en';
        console.log(locale)
        localStorage.setItem('locale', locale);
        i18n.init({// jshint ignore:line
            ns: { namespaces: ['survey'], defaultNs: 'survey'},
            detectLngQS: 'lang'
        }, $.proxy(function(){
              console.log(i18n.t("menu.save"))
              this.survey = new Survey({
                  "element": "content"
              });
              this.renderSurvey();
              this.formSave();
        }, this));
    }

    renderSurvey () {
        if ("sid" in utils.getParams() && utils.getParams().sid !== undefined) {
            var title = decodeURIComponent(utils.getParams().survey);
            var options = {
                "remoteDir": "editors",
                "item": utils.getParams().sid+".edtr"
            };
            this.getEditor(title, options);
        }
        else {
            this.survey.render();
        }
        return this;
    }

}
