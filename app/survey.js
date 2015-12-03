'use strict';
import FieldGenerator from './field_generate';
import Convertor from './convert';
import * as utils from './utils';
import DataStorage from './data';
import i18next from 'i18next-client';
import './styles/app.css!';

class Survey {
    /**
    * @param options.element {Object} the dom element where everything will be
    * rendered
    * @param options.title {String} the title of the Survey
    */
    constructor(options) {
        this.$mainBodyEl = $("#"+options.element);
        this.title = options.title;
        this.renderEl = "mobile-content";
        this.dataStorage = new DataStorage();
        this.convertor = new Convertor();
        this.initialize();
        this.enableAutoSave();
    }

    /**
    * initialize the survey rendering
    */
    initialize() {
        var locale = utils.getParams().lang || 'en';
        localStorage.setItem('locale', locale);
        i18n.init({// jshint ignore:line
            ns: { namespaces: ['survey'], defaultNs: 'survey'},
            detectLngQS: 'lang'
        }, $.proxy(function(){
              $("html").i18n();
              this.$mainBodyEl.html('<div class="mobile">'+
                '<button type="button" class="btn btn-default" id="form-save">'+
                i18n.t("menu.save")+'</button>'+
                '<div class="'+this.renderEl+'"></div></div>'+
                '<div id="loader"><img src="styles/images/ajax-loader.gif"></div>');
        }, this));
    }

    /**
    * auto save the form on localstorage
    */
    enableAutoSave() {
        var iFrequency = 60000; // expressed in miliseconds
        var myInterval = 0;

        // STARTS and Resets the loop if any{
        if(myInterval > 0) clearInterval(myInterval);  // stop
        myInterval = setInterval( $.proxy(function(){
            this.saveData();
        }, this), iFrequency );  // run
    }

    /**
    * save data event on localstorage
    */
    enableSave() {
        $(document).off('click', '#form-save');
        $(document).on('click', '#form-save', $.proxy(function(){
            this.survey.saveData();
        }, this));
    }

    /**
    * render default form
    */
    render() {
        //initialize fieldGenerator
        var fieldGenerator = new FieldGenerator("."+this.renderEl);
        //generate general settings
        var titleObj = {};
        if(this.title) {
            titleObj = {"title": title};
        }
        this.fieldGenerator.render("general", titleObj);
        //generate first text field
        this.fieldGenerator.render('text');
    }

    //TO-DO: investigate if title is needed or should be picked up by the HTMLtoJSON function
    /*
    * render existing form
    * @param data {Object} existing form data
    * @param title {String} title of the form
    */
    renderExistingSurvey(title, data) {
        //if data is html then convert it to json
        if (!utils.isJsonString(data)) {
            data = this.convertor.HTMLtoJSON (data, title);
        }
        var fieldGenerator = new FieldGenerator("."+this.renderEl);
        //render general settings
        fieldGenerator.render("general",
              {"title": title, "geoms": data.geoms}
        );
        //render each field
        $.each(data, function(k, v){
            var type = k.split("-")[1];
            if(type !== undefined){
                fieldGenerator.render(type, v);
            }
        });
    }

    /**
    * save data on localstorage by getting them from dom and converting to JSON
    * @returns {Object} form data in JSON format
    */
    saveData() {
        var formData = $("."+this.renderEl).html();
        var formInJSON = this.convertor.getForm(formData);
        this.dataStorage.setData(formInJSON);
        var visData = new DataStorage('visibility');
        var visibilities = visData.getData();
        for (var key in formInJSON) {
            for (var key2 in visibilities) {
                if (key === key2) {
                    formInJSON[key]['visibility'] = visibilities[key2];
                }
            }
        }
        return formInJSON;
    }
}

export default Survey;
