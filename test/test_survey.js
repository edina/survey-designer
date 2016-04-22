//import {assert} from 'chai';
import chai from 'chai';
var assert = chai.assert;
var expect = chai.expect;
import $ from 'jquery';
import Survey from '../app/survey';
import Convertor from '../app/convert';
import DataStorage from '../app/data';

describe('Survey', function() {
    var survey;
    var options = {
        "element": "content",
        "subElement": "mobile-content",
        "title": "dummyTitle"
    };
    var convertor, dataStorage;

    beforeEach(function(done) {
        convertor = new Convertor();
        dataStorage = new DataStorage();

        i18n.init({// jshint ignore:line
            ns: { namespaces: ['survey'], defaultNs: 'survey'},
            detectLngQS: 'lang'
        }, function(){
            survey = new Survey(options);
            done();
        });
    });

    it('checkforInitialize', function(done) {
        assert.notEqual(document.getElementById(options.element), null);
        assert.notEqual(document.getElementById("loader"), null);
        assert.notEqual(document.getElementsByClassName('mobile'), null);
        done();
    });

    it('checkforRenderSurvey', function(done) {
        var formJSON = {
          "title":"dummyTitle",
          "geoms":["point"],
          "recordLayout": {
              "headers": []
          },
          "fields":[],
          "extra":[]
        };
        survey.render();
        var formInJSON = convertor.getForm($("."+options.subElement));
        assert.deepEqual(formJSON, formInJSON);
        done();
    });

    it('checkforRenderExistingSurvey', function(done){
        var formJSON = {
            "title":"dummyTitle",
            "geoms":["point"],
            "fields":[
              {
                "id":"text-1",
                "type":"text",
                "required":false,
                "persistent":false,
                "properties":{
                    "prefix":"",
                    "placeholder":"",
                    "max-chars":"10"
                },
                "label":"This is a label"
              }
            ]
        };
        survey.renderExistingSurvey(formJSON.title, formJSON);
        formJSON.fields.forEach(function(element, index){
            assert.notEqual(document.getElementById(element.id), null);
        });
        done();
    });

    it('checkAutoSave', function(done){
        var formJSON = {
            "title":"dummyTitle",
            "geoms":["point"],
            "fields":[
              {
                "id":"text-1",
                "type":"text",
                "required":false,
                "persistent":false,
                "properties":{
                    "prefix":"",
                    "placeholder":"",
                    "max-chars":"10"
                },
                "label":"This is a label"
              }
            ]
        };
        survey.renderExistingSurvey(formJSON.title, formJSON);
        survey.enableAutoSave(1000);
        assert.deepEqual(dataStorage.getData(), formJSON);
        done();
    });

    after((done) => {
        $("."+options.subElement).remove();
        $("#map-modal").remove();
        done();
    });
});
