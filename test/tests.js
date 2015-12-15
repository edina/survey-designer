//import chai, { expect } from 'chai';
//import sinon from 'sinon';
//import sinonChai from 'sinon-chai';


import chai from 'chai';
import $ from 'jquery';
import pcapi from 'pcapi';
import DataStorage from '../app/data';

import Visibility from '../app/visibility';
import testForm  from './survey.json!';
import language from '../locales/dev/survey.json!';
import Convertor from 'survey-convertor';
import FieldGenerator from '../app/field_generate';

var assert = chai.assert;

pcapi.init({
    "url": cfg.baseurl,
    "version": cfg.version
});
pcapi.setCloudLogin(cfg.userid);

describe('#DataStorage', () => {
    var dataStorage = new DataStorage();
    var data = {"test": "test"};

    it('checkSaveData', () => {
        dataStorage.setData(data);
        assert.deepEqual(data, dataStorage.getData());
    });

    it('checkGetData', () => {
        assert.deepEqual(JSON.parse(localStorage.getItem('current-form')), dataStorage.getData());
    })
});


describe('#FieldGenerator', () => {
    var fieldGenerator = new FieldGenerator();
    var cl = "mobile-content";

    before(function(done){
        $("#content").append('<div class="'+cl+'"></div>');

        i18n.init({// jshint ignore:line
            ns: { namespaces: ['survey'], defaultNs: 'survey'},
            detectLngQS: 'lang'
        }, function(){
            done();
        });
    });

    it('checkTextField', (done) => {
        var field = testForm.fields[0];
        var result = fieldGenerator.createField(field);
        var $result = $(result);

        //check legend
        assert.equal($result.find('legend').text(),
          language.text["field-title"]);
        //check label from locales
        assert.equal($result.find('label[for="label"]').text(),
          language.text["label-title"]);
        //check value from survey.json for label
        assert.equal($result.find('input[name="label"]').val(), field.label);
        //check value of required
        assert.equal($result.find('input[name="required"]').is(':checked'),
          field.required);
        //check label for required
        assert.equal($result.find('label[for="required"]').text(),
          language.text.required);
        //check value of placeholder
        assert.equal($result.find('input[name="placeholder"]').attr("placeholder"),
          field.properties.placeholder);
        //check label for placeholder
        assert.equal($result.find('label[for="placeholder"]').text(),
          language.text["default-text-title"]);
        //check value for persistent
        assert.equal($result.find('input[name="persistent"]').is(':checked'),
          field.persistent);
        //check label for persistent
        assert.equal($result.find('label[for="persistent"]').text(),
          language.text.persistent);
        //check max chars value
        assert.equal($result.find('input[name="max-chars"]').val(),
          field.properties["max-chars"]);
        //check label for max-chars
        assert.equal($result.find('label[for="max-chars"]').text(),
          language.text["max-chars-title"]);

        done();
      });

    it('checkTextareaField', (done) => {
        var field = testForm.fields[1];
        var result = fieldGenerator.createField(field);
        var $result = $(result);

        //check legend
        assert.equal($result.find('legend').text(),
          language.textarea["field-title"]);
        //check label from locales
        assert.equal($result.find('label[for="label"]').text(),
          language.textarea["label-title"]);
        //check value from survey.json for label
        assert.equal($result.find('input[name="label"]').val(), field.label);
        //check value of required
        assert.equal($result.find('input[name="required"]').is(':checked'),
          field.required);
        //check label for required
        assert.equal($result.find('label[for="required"]').text(),
          language.textarea.required);
        //check value of placeholder
        assert.equal($result.find('input[name="placeholder"]').attr("placeholder"),
          field.properties.placeholder);
        //check label for placeholder
        assert.equal($result.find('label[for="placeholder"]').text(),
          language.textarea["default-text-title"]);
        //check value for persistent
        assert.equal($result.find('input[name="persistent"]').is(':checked'),
          field.persistent);
        //check label for persistent
        assert.equal($result.find('label[for="persistent"]').text(),
          language.textarea.persistent);

        done();
    });

    it('checkRangeField', (done) => {
        var field = testForm.fields[7];
        var result = fieldGenerator.createField(field);
        var $result = $(result);

        //check legend
        assert.equal($result.find('legend').text(),
          language.range["field-title"]);
        //check label from locales
        assert.equal($result.find('label[for="label"]').text(),
          language.range["label-title"]);
        //check value from survey.json for label
        assert.equal($result.find('input[name="label"]').val(), field.label);
        //check value of required
        assert.equal($result.find('input[name="required"]').is(':checked'),
          field.required);
        //check label for required
        assert.equal($result.find('label[for="required"]').text(),
          language.radio.required);
        //check value for persistent
        assert.equal($result.find('input[name="persistent"]').is(':checked'),
          field.persistent);
        //check label for persistent
        assert.equal($result.find('label[for="persistent"]').text(),
          language.radio.persistent);
        //check step value
        assert.equal($result.find('input[name="step"]').val(),
          field.properties.step);
        //check label for step
        assert.equal($result.find('label[for="step"]').text(),
          language.range["step-label"]);
        //check min value
        assert.equal($result.find('input[name="min"]').val(),
          field.properties.min);
        //check label for min
        assert.equal($result.find('label[for="min"]').text(),
          language.range["min-label"]);
        //check max value
        assert.equal($result.find('input[name="max"]').val(),
          field.properties.max);
        //check label for max
        assert.equal($result.find('label[for="max"]').text(),
          language.range["max-label"]);
        done();
    });

    it('checkRadioFieldWithImages', (done) => {
        var field = testForm.fields[3];
        var result = fieldGenerator.createField(field);
        var $result = $(result);

        //check legend
        assert.equal($result.find('legend').text(),
          language.radio["field-title"]);
        //check label from locales
        assert.equal($result.find('label[for="label"]').text(),
          language.radio["label-title"]);
        //check value from survey.json for label
        assert.equal($result.find('input[name="label"]').val(), field.label);
        //check value of required
        assert.equal($result.find('input[name="required"]').is(':checked'),
          field.required);
        //check label for required
        assert.equal($result.find('label[for="required"]').text(),
          language.radio.required);
        //check value for persistent
        assert.equal($result.find('input[name="persistent"]').is(':checked'),
          field.persistent);
        //check label for persistent
        assert.equal($result.find('label[for="persistent"]').text(),
          language.radio.persistent);
        //check if allow other is checked
        assert.equal($result.find('input[name="other"]').is(':checked'),
          field.properties.other);
        //check label for persistent
        assert.equal($result.find('label[for="other"]').text(),
          language.radio["allow-other"]);
        //check length of input values for options
        assert.equal($result.find('input[name="'+field.id+'"]').length,
          field.properties.options.length);
        //check length of upload images
        assert.equal($result.find('.image-upload').length,
          field.properties.options.length);
        //check length of remove checkbox buttons
        assert.equal($result.find('.remove-radio').length,
          field.properties.options.length);
        //check if the values of the options have been printed right
        $result.find('input[name="'+field.id+'"]').each(function(i){
            if (field.properties.options[i] instanceof Array){
                assert.equal($(this).val(), field.properties.options[i][0]);
            }
        });
        //check if the images haven been printed right
        $result.find('img').each(function(i){
            assert.equal($(this).attr("src"), field.properties.options[i][1]);
        });
        //check if add checkbox button exists
        assert.equal($result.find('.add-radio').length, 1);
        //check if relate radio button exists
        assert.equal($result.find('.relate').length, 1);
        //check relate label
        assert.equal($result.find('.relate').text().trim(),
          language.radio.relate);
        done();
    });

    it('checkRadioFieldWithoutImages', (done) => {
        var field = testForm.fields[2];
        var result = fieldGenerator.createField(field);
        var $result = $(result);

        //check legend
        assert.equal($result.find('legend').text(),
          language.radio["field-title"]);
        //check label from locales
        assert.equal($result.find('label[for="label"]').text(),
          language.radio["label-title"]);
        //check value from survey.json for label
        assert.equal($result.find('input[name="label"]').val(), field.label);
        //check value of required
        assert.equal($result.find('input[name="required"]').is(':checked'),
          field.required);
        //check label for required
        assert.equal($result.find('label[for="required"]').text(),
          language.radio.required);
        //check value for persistent
        assert.equal($result.find('input[name="persistent"]').is(':checked'),
          field.persistent);
        //check label for persistent
        assert.equal($result.find('label[for="persistent"]').text(),
          language.radio.persistent);
        //check if allow other is checked
        assert.equal($result.find('input[name="other"]').is(':checked'),
          field.properties.other);
        //check label for persistent
        assert.equal($result.find('label[for="other"]').text(),
          language.radio["allow-other"]);
        //check length of input values for options
        assert.equal($result.find('input[name="'+field.id+'"]').length,
          field.properties.options.length);
        //check length of upload images
        assert.equal($result.find('.image-upload').length,
          field.properties.options.length);
        //check length of remove checkbox buttons
        assert.equal($result.find('.remove-radio').length,
          field.properties.options.length);
        //check if the values of the options have been printed right
        $result.find('input[name="'+field.id+'"]').each(function(i){
            assert.equal($(this).val(), field.properties.options[i]);
        });
        //check if add radio button exists
        assert.equal($result.find('.add-radio').length, 1);
        //check if relate radio button exists
        assert.equal($result.find('.relate').length, 1);
        //check relate label
        assert.equal($result.find('.relate').text().trim(),
          language.radio.relate);
        done();
    });

    it('checkSelectField', (done) => {
        var field = testForm.fields[4];
        var result = fieldGenerator.createField(field);
        var $result = $(result);

        //check legend
        assert.equal($result.find('legend').text(),
          language.select["field-title"]);
        //check label from locales
        assert.equal($result.find('label[for="label"]').text(),
          language.select["label-title"]);
        //check value from survey.json for label
        assert.equal($result.find('input[name="label"]').val(), field.label);
        //check value of required
        assert.equal($result.find('input[name="required"]').is(':checked'),
          field.required);
        //check label for required
        assert.equal($result.find('label[for="required"]').text(),
          language.select.required);
        //check value for persistent
        assert.equal($result.find('input[name="persistent"]').is(':checked'),
          field.persistent);
        //check label for persistent
        assert.equal($result.find('label[for="persistent"]').text(),
          language.select.persistent);
        //check length of input values for options
        assert.equal($result.find('input[name="'+field.id+'"]').length,
          field.properties.options.length);
        //check length of remove checkbox buttons
        assert.equal($result.find('.remove-select').length,
          field.properties.options.length);
        //check if the values of the options have been printed right
        $result.find('input[name="'+field.id+'"]').each(function(i){
            assert.equal($(this).val(), field.properties.options[i]);
        });
        //check if add checkbox button exists
        assert.equal($result.find('.add-select').length, 1);
        done();
    });

    it('checkCheckboxWithImagesField', (done) => {
        var field = testForm.fields[8];
        var result = fieldGenerator.createField(field);
        var $result = $(result);

        //check legend
        assert.equal($result.find('legend').text(),
          language.checkbox["field-title"]);
        //check label from locales
        assert.equal($result.find('label[for="label"]').text(),
          language.checkbox["label-title"]);
        //check value from survey.json for label
        assert.equal($result.find('input[name="label"]').val(), field.label);
        //check value of required
        assert.equal($result.find('input[name="required"]').is(':checked'),
          field.required);
        //check label for required
        assert.equal($result.find('label[for="required"]').text(),
          language.checkbox.required);
        //check value for persistent
        assert.equal($result.find('input[name="persistent"]').is(':checked'),
          field.persistent);
        //check label for persistent
        assert.equal($result.find('label[for="persistent"]').text(),
          language.checkbox.persistent);
        //check if allow other is checked
        assert.equal($result.find('input[name="other"]').is(':checked'),
          field.properties.other);
        //check label for persistent
        assert.equal($result.find('label[for="other"]').text(),
          language.checkbox["allow-other"]);
        //check length of input values for options
        assert.equal($result.find('input[name="'+field.id+'"]').length,
          field.properties.options.length);
        //check length of upload images
        assert.equal($result.find('.image-upload').length,
          field.properties.options.length);
        //check length of remove checkbox buttons
        assert.equal($result.find('.remove-checkbox').length,
          field.properties.options.length);
        //check if the values of the options have been printed right
        $result.find('input[name="'+field.id+'"]').each(function(i){
            assert.equal($(this).val(), field.properties.options[i][0]);
        });
        //check if the images haven been printed right
        $result.find('img').each(function(i){
            assert.equal($(this).attr("src"), field.properties.options[i][1]);
        });
        //check if add checkbox button exists
        assert.equal($result.find('.add-checkbox').length, 1);
        //check if relate radio button exists
        assert.equal($result.find('.relate').length, 1);
        //check relate label
        assert.equal($result.find('.relate').text().trim(),
          language.checkbox.relate);
        done();
    });

    it('checkCheckboxWithoutImagesField', (done) => {
        var field = testForm.fields[9];
        var result = fieldGenerator.createField(field);
        var $result = $(result);
        //check legend
        assert.equal($result.find('legend').text(),
          language.checkbox["field-title"]);
        //check label from locales
        assert.equal($result.find('label[for="label"]').text(),
          language.checkbox["label-title"]);
        //check value from survey.json for label
        assert.equal($result.find('input[name="label"]').val(), field.label);
        //check value of required
        assert.equal($result.find('input[name="required"]').is(':checked'),
          field.required);
        //check label for required
        assert.equal($result.find('label[for="required"]').text(),
          language.checkbox.required);
        //check value for persistent
        assert.equal($result.find('input[name="persistent"]').is(':checked'),
          field.persistent);
        //check label for persistent
        assert.equal($result.find('label[for="persistent"]').text(),
          language.checkbox.persistent);
        //check if allow other is checked
        assert.equal($result.find('input[name="other"]').is(':checked'),
          field.properties.other);
        //check label for persistent
        assert.equal($result.find('label[for="other"]').text(),
          language.checkbox["allow-other"]);
        //check length of input values for options
        assert.equal($result.find('input[name="'+field.id+'"]').length,
          field.properties.options.length);
        //check length of upload images
        assert.equal($result.find('.image-upload').length,
          field.properties.options.length);
        //check length of remove checkbox buttons
        assert.equal($result.find('.remove-checkbox').length,
          field.properties.options.length);
        //check if the values of the options have been printed right
        $result.find('input[name="'+field.id+'"]').each(function(i){
            assert.equal($(this).val(), field.properties.options[i]);
        });
        //check if add checkbox button exists
        assert.equal($result.find('.add-checkbox').length, 1);
        //check if relate radio button exists
        assert.equal($result.find('.relate').length, 1);
        //check relate label
        assert.equal($result.find('.relate').text().trim(),
          language.checkbox.relate);
        done();
    });

    it('checkWarningField', (done) => {
        var field = testForm.fields[6];
        var result = fieldGenerator.createField(field);
        var $result = $(result);
        assert.equal($result.find("legend").text(),
          language.warning["field-title"]);
        assert.equal($result.find("label[for='label']").text(),
          language.warning["label-title"]);
        assert.equal($result.find("input[name='label']").val(),
          field.label);
        assert.equal($result.find("label[for='message']").text(),
          language.warning.label);
        assert.equal($result.find("textarea").text(),
          field.properties.placeholder);
        assert.equal($result.find("textarea").attr("placeholder"),
          language.warning.message);
        done();
    });

    it('checkDtreeField', (done) => {
        var field = testForm.fields[5];
        var result = fieldGenerator.createField(field);
        var $result = $(result);
        assert.equal($result.find("legend").text(),
          language.dtree["field-title"]);
        assert.equal($result.find("label[for='label']").text(),
          language.dtree["label-title"]);
        assert.equal($result.find("input[name='label']").val(),
          field.label);
        assert.equal($result.find("a").attr("href"),
          pcapi.buildFSUrl('editors', field.properties.filename));
        done();
    });

    it('checkDtreeFieldNotExists', (done) => {
        var field = {
            "id": "form-dtree-1",
            "type": "dtree"
        }
        var result = fieldGenerator.createField(field);
        var $result = $(result);
        assert.equal($result.find("legend").text(),
          language.dtree["field-title"]);
        assert.equal($result.find("label[for='label']").text(),
          language.dtree["label-title"]);
        //check if aria-label is right
        assert.equal($result.find('.add-dtree').attr("aria-label"),
          language.dtree["add-dtree"]);
        //check aria label for upload dtree
        assert.equal($result.find('.upload-dtree').attr("aria-label"),
          language.dtree.upload);
        done();
    });

});



/*console.log(testForm)
describe('#Visibility', () => {
    var visibility = new Visibility();
    var convertor = new Convertor();
    var cl = "mobile-content";

    before(function(){
        $("body").append('<div class="'+cl+'"></div>')
    });

    console.log(visibility);
    console.log(convertor.getForm(testForm));
    visibility.showVisibilityWindow($(this).closest('.fieldcontain').attr("id"));

});*/


//console.log(testForm)
//chai.should();

/*console.log(__dirname)

let Convertor = require(path.join(__dirname, '..', 'convert'));

describe('Converter', ()=> {
    describe('#getForm', () => {
        let converter;

        beforeEach(() => {
            fs.readFile('./test.edtr', function(err, html){
                if (err){
                    throw err;
                }
                console.log(html);
                $('body').append(html);
                converter = new Convertor();
            })
        })

        it('returns form', () => {
            console.log(converter.getForm())
        })
    })
});*/
