//import {assert} from 'chai';
import chai from 'chai';
var assert = chai.assert;
var expect = chai.expect;
import $ from 'jquery';
import Convertor from '../app/convert';
import testJSON  from './test.json!';
import editor from './test.edtr!text';
import FieldGenerator from '../app/field_generate';

describe('surveyConvertor#fieldToJSON', function() {
    var convertor, fieldGenerator;
    beforeEach(function(done) {
        convertor = new Convertor();
        fieldGenerator = new FieldGenerator();

        i18n.init({// jshint ignore:line
            ns: { namespaces: ['survey'], defaultNs: 'survey'},
            detectLngQS: 'lang'
        }, function(){
            done();
        });
    });

    it('checkforTextConversion', function(done) {
        var field = {
          "id":"text-1",
          "label":"This is a label",
          "type":"text",
          "required":true,
          "persistent":false,
          "properties":{
            "prefix":"",
            "placeholder":"",
            "max-chars":"10"
          }
        };
        var html = fieldGenerator.createField(field);
        var $html = $(html);

        var f = {};
        $html.filter('.fieldcontain').each(function(index, element){
            f = {
              "id": $(element).attr("id"),
              "label": "",
              "type": $(element).data("type"),
              "required": false,
              "persistent": false,
              "properties": {}
            };
        });
        assert.deepEqual(convertor.fieldToJSON(f, $html), field);
        done();
    });

    it('checkforTextareaConversion', function(done){
        var field = {
          "id":"fieldcontain-textarea-1",
          "label":"This is a label",
          "type":"textarea",
          "required":false,
          "persistent":false,
          "properties":{
            "placeholder":"",
            "readOnly": true,
            "numrows" : 3

          }
        };

        var html = fieldGenerator.createField(field);
        var $html = $(html) ;

        var f = {};
        $html.filter('.fieldcontain').each(function(index, element){

          
          var readOnly = $(element).find('input[name="readOnly"]').is(':checked') ;

            f = {
              "id": $(element).attr("id"),
              "label": "",
              "type": $(element).data("type"),
              "required": false,
              "persistent": false,
              "properties": {
                "readOnly": $(element).find('input[name="readOnly"]').is(':checked'),
                "numrows": $(element).find('input[name="numrows"]').val()

              }
            };

        });
        assert.deepEqual(convertor.fieldToJSON(f, $html), field);
        done();
    });

    it('checkforRangeConversion', function(done){
        var field = {
            "id": "fieldcontain-range-1",
            "label": "This is a label",
            "type": "range",
            "required":false,
            "persistent":false,
            "properties":{
                "step": "1",
                "min": "5",
                "max": "36"
            }
        };

        var html = fieldGenerator.createField(field);
        var $html = $(html);

        var f = {};
        $html.filter('.fieldcontain').each(function(index, element){
            f = {
                "id": $(element).attr("id"),
                "label": "",
                "type": $(element).data("type"),
                "required": false,
                "persistent": false,
                "properties": {}
            };
        });
        assert.deepEqual(convertor.fieldToJSON(f, $html), field);
        done();
    });

    it('checkforCheckboxConversion', function(done){
        var field = {
            "id": "fieldcontain-checkbox-1",
            "label": "This is a label",
            "type": "checkbox",
            "required":false,
            "persistent":false,
            "properties":{
                "other": false,
                "options": [
                    {
                        "value": "option 1"
                    },
                    {
                        "value": "option 2"
                    },
                    {
                        "value": "option 3"
                    }
                ]
            }
        };

        var html = fieldGenerator.createField(field);
        var $html = $(html);

        var f = {};
        $html.filter('.fieldcontain').each(function(index, element){
            f = {
                "id": $(element).attr("id"),
                "label": "",
                "type": $(element).data("type"),
                "required": false,
                "persistent": false,
                "properties": {}
            };
        });
        assert.deepEqual(convertor.fieldToJSON(f, $html), field);
        done();
    });

    it('checkforRadioConversion', function(done){
        var field = {
            "id": "fieldcontain-radio-1",
            "label": "This is a label",
            "type": "radio",
            "required":false,
            "persistent":false,
            "properties":{
                "other": false,
                "options": [
                    {
                        "value": "option 1"
                    },
                    {
                        "value": "option 2"
                    },
                    {
                        "value": "option 3"
                    }
                ]
            }
        };

        var html = fieldGenerator.createField(field);
        var $html = $(html);

        var f = {};
        $html.filter('.fieldcontain').each(function(index, element){
            f = {
                "id": $(element).attr("id"),
                "label": "",
                "type": $(element).data("type"),
                "required": false,
                "persistent": false,
                "properties": {}
            };
        });
        assert.deepEqual(convertor.fieldToJSON(f, $html), field);
        done();
    });

    it('checkforSelectConversion', function(done){
        var field = {
            "id": "fieldcontain-select-1",
            "label": "This is a label",
            "type": "select",
            "required":false,
            "persistent":false,
            "properties":{
                "options": [
                    {
                      "value": "option 1"
                    },
                    {
                      "value": "option 2"
                    },
                    {
                      "value": "option 3"
                    }
                ]
            }
        };

        var html = fieldGenerator.createField(field);
        var $html = $(html);

        var f = {};
        $html.filter('.fieldcontain').each(function(index, element){
            f = {
                "id": $(element).attr("id"),
                "label": "",
                "type": $(element).data("type"),
                "required": false,
                "persistent": false,
                "properties": {}
            };
        });
        assert.deepEqual(convertor.fieldToJSON(f, $html), field);
        done();
    });

    it('checkforImageConversion', function(done){
        var field = {
            "id": "fieldcontain-image-1",
            "label": "This is a label",
            "type": "image",
            "required":false,
            "persistent":false,
            "properties":{
                "los": false,
                "multi-image": true,
                "blur": "13"
            }
        };

        var html = fieldGenerator.createField(field);
        var $html = $(html);

        var f = {};
        $html.filter('.fieldcontain').each(function(index, element){
            f = {
                "id": $(element).attr("id"),
                "label": "",
                "type": $(element).data("type"),
                "required": false,
                "persistent": false,
                "properties": {}
            };
        });
        assert.deepEqual(convertor.fieldToJSON(f, $html), field);
        done();
    });

    it('checkforAudioConversion', function(done){
        var field = {
            "id": "fieldcontain-audio-1",
            "label": "This is a label",
            "type": "audio",
            "required":false,
            "persistent":false,
            "properties": {}
        };

        var html = fieldGenerator.createField(field);
        var $html = $(html);

        var f = {};
        $html.filter('.fieldcontain').each(function(index, element){
            f = {
                "id": $(element).attr("id"),
                "label": "",
                "type": $(element).data("type"),
                "required": false,
                "persistent": false,
                "properties": {}
            };
        });
        assert.deepEqual(convertor.fieldToJSON(f, $html), field);
        done();
    });

    it('checkforWarningConversion', function(done){
        var field = {
            "id": "fieldcontain-warning-1",
	          "label": "This is a label",
	          "type": "warning",
	          "required": false,
	          "persistent": false,
	          "properties": {
		            "placeholder": "skata"
	          }
        };

        var html = fieldGenerator.createField(field);
        var $html = $(html);

        var f = {};
        $html.filter('.fieldcontain').each(function(index, element){
            f = {
                "id": $(element).attr("id"),
                "label": "",
                "type": $(element).data("type"),
                "required": false,
                "persistent": false,
                "properties": {}
            };
        });
        assert.deepEqual(convertor.fieldToJSON(f, $html), field);
        done();
    });
});

/*describe('surveyConvertor#HTMLtoJSON', function() {
    var convertor;
    beforeEach(function() {
        convertor = new Convertor();
    });

    it('check .edtr to JSON conversion', function(){
        var ed = convertor.HTMLtoJSON(editor);
        assert.deepEqual(testJSON, ed);
    });


});*/
