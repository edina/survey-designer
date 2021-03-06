import FieldGenerator from './field_generate';
import Convertor from './convert';
import * as utils from './utils';
import * as save from './save';
import DataStorage from './data';
import i18next from 'i18next-client';
import './styles/app.css!';
import _ from "underscore";
import saveTemplate from './templates/save-menu.jst!';
import BBox from './bbox';

/* global i18n */

class Survey {
    /**
     * A class for fetching an existing editor or initializing a new one
     * @constructor
     * @param options.element {Object} the dom element where everything will be
     * rendered
     * @param options.title {String} the title of the Survey
     */
    constructor(options) {
        this.options = options;
        this.title = options.title;
        this.renderEl = "."+options.subElement;
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
          let options = {
              id: 'map'
          };
          this.bbox = new BBox(options);
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
        var fieldGenerator = new FieldGenerator(this.renderEl, this.options);
        //generate general settings
        var generalObj = {
          type: "general",
          title: this.title
        };
        var dataStorage = new DataStorage();
        dataStorage.setData({});

        fieldGenerator.render(generalObj);
        this.bbox.initialize();
    }

    //TO-DO: investigate if title is needed or should be picked up by the HTMLtoJSON function
    /*
    * render existing form
    * @param data {Object} existing form data
    * @param title {String} title of the form
    */
    renderExistingSurvey(title, data) {
        //if data is html then convert it to json
        let convertor = new Convertor();
        if (typeof data === 'string') {
            if(utils.isJsonString(data)) {
                data = JSON.parse(data);
            }
            else{
                data = convertor.HTMLtoJSON (data, this.title);
            }
        }
        //store existing data in localstorage
        var dataStorage = new DataStorage();
        dataStorage.setData(data);

        //the layout is defining which fields will be used on the displayed list
        //of records on the device
        this.options.layout = data.recordLayout;
        var fieldGenerator = new FieldGenerator(this.renderEl, this.options);

        //render general settings
        fieldGenerator.render({
            "title": this.title,
            "geoms": data.geoms,
            "type": "general"
        });
        //render each field
        data.fields.forEach(function(field, index){
            fieldGenerator.render(field);
        });
        this.bbox.initialize();
    }

}

export default Survey;
