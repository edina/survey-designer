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
        this.options = options;
        this.title = options.title;
        this.renderEl = "."+options.subElement;
        this.convertor = new Convertor();
        this.initialize();
        this.enableAutoSave();
    }

    /**
    * initialize the survey rendering
    */
    initialize() {
        document.getElementById(this.options.element).innerHTML = '<div class="mobile">'+
          '<div class="'+this.options.subElement+'">'+
          '</div></div>'+
          '<div id="loader"><img src="app/styles/images/ajax-loader.gif"></div>';
          //adjust heights
          var $mobile = $(".mobile");
          var $mobileContent = $(this.renderEl);
          $mobileContent.before(saveTemplate({"save": i18n.t("menu.save")}));
          var $myNav = $("#myNav");
          $mobile.height($(window).height() - $("#header").height() - 84);
          $mobileContent.height($mobile.height() - 100 - $myNav.height());
          $myNav.width($mobile.width());
    }

    /**
    * auto save the form on localstorage
    */
    enableAutoSave(time) {
        var iFrequency = time || 60000; // expressed in miliseconds
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
        var generalObj = {
          type: "general",
          title: this.title
        };

        fieldGenerator.render(generalObj);
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
        if (typeof data === 'string') {
            if(utils.isJsonString(data)) {
                data = JSON.parse(data);
            }
            else{
                data = this.convertor.HTMLtoJSON (data, this.title);
            }
        }
        var dataStorage = new DataStorage();
        dataStorage.setData(data);
        var fieldGenerator = new FieldGenerator(this.renderEl);

        //render general settings
        fieldGenerator.render({
            "title": this.title,
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
