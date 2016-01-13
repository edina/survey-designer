import FieldGenerator from './field_generate';
import Convertor from './convert';
import * as utils from './utils';
import * as save from './save';
import DataStorage from './data';
import i18next from 'i18next-client';
import './styles/app.css!';
import _ from "underscore";
import saveTemplate from './templates/save-menu.jst!';

/* global i18n */

class Survey {
    /**
    * @param options.element {Object} the dom element where everything will be
    * rendered
    * @param options.title {String} the title of the Survey
    */
    constructor(options) {
        this.$mainBodyEl = $(options.element);
        this.title = options.title;
        this.renderEl = options.subElement;
        this.convertor = new Convertor();
        this.initialize();
        this.enableAutoSave();
    }

    /**
    * initialize the survey rendering
    */
    initialize() {
        this.$mainBodyEl.html('<div class="mobile">'+
          '<div class="'+this.renderEl.substring(1)+'">'+
          '</div></div>'+
          '<div id="loader"><img src="app/styles/images/ajax-loader.gif"></div>');
          //adjust heights
          var $mobile = $(".mobile");
          $(this.renderEl).before(saveTemplate({"save": i18n.t("menu.save")}));
          var $myNav = $("#myNav");
          $mobile.height($(window).height() - $("#header").height() - 84);
          $(this.renderEl).height($mobile.height() - 100 - $myNav.height());
          $myNav.width($mobile.width());
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
            save.saveData(this.renderEl);
        }, this), iFrequency );  // run
    }

    /**
    * render default form
    */
    render() {
        //initialize fieldGenerator
        var fieldGenerator = new FieldGenerator(this.renderEl);
        //generate general settings
        var titleObj;
        if(this.title) {
            titleObj = {"title": this.title};
        }

        fieldGenerator.render({type: "general"});
        //generate first text field
        fieldGenerator.render({type: 'text'});
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
        else {
            data = JSON.parse(data);
        }
        var dataStorage = new DataStorage();
        dataStorage.setData(data);
        var fieldGenerator = new FieldGenerator(this.renderEl);

        //render general settings
        fieldGenerator.render({
            "title": title,
            "geoms": data.geoms,
            "type": "general"
        });
        //render each field
        $.each(data.fields, function(index, field){
            fieldGenerator.render(field);
        });
    }

}

export default Survey;
