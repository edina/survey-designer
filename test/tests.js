//import chai, { expect } from 'chai';
//import sinon from 'sinon';
//import sinonChai from 'sinon-chai';


import {assert} from 'chai';
import $ from 'jquery';
import DataStorage from '../app/data';

import Visibility from '../app/visibility';
import testForm  from './survey.json!';
import Convertor from 'survey-convertor';
import FieldGenerator from '../app/field_generate';

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
        var html = `
          <fieldset class="fieldcontain fieldcontain-text" id="form-text-1" data-type="text">
            <legend>Text field</legend>
            <label for="label">Field label</label>
            <input type="text" name="label" value="1. Date of survey">
            <input type="checkbox" name="required" checked="checked">Required
            <label for="prefix">Prefix</label>
            <input type="text" name="prefix" placeholder="Set a prefix" value="">
            <input type="checkbox" name="persistent" checked="checked">Persistent
            <label for="placeholder">Default text</label>
            <input type="text" name="placeholder" placeholder="Place default text here (if any)" value="">
            <label for="max-chars">Max characters</label>
            <input type="number" name="max-chars" value="">
          </fieldset>`;

        var result = fieldGenerator.createField(field);
        var $html = $(html);
        var $result = $(result);
        assert.equal($html.find("label[for='label']").text(),
          $result.find("label[for='label']").text());
        assert.equal($html.find("label[for='prefix']").text(),
          $result.find("label[for='prefix']").text());
        assert.equal($html.find('input[name="persistent"]').is(':checked'),
          $result.find('input[name="persistent"]').is(':checked'));
        done();
      });

      it('checkTextareaField', (done) => {
          var field = testForm.fields[1];
          var html = `
            <fieldset class="fieldcontain fieldcontain-textarea" id="fieldcontain-textarea-1" data-type="textarea">
              <legend>Textarea field</legend>
              <label for="label">Field label</label>
              <input type="text" name="label" value="2. Write your thoughts">
              <input type="checkbox" name="required" checked="checked">Required
              <label for="placeholder">Default text</label>
              <input type="text" name="placeholder" placeholder="Place default textarea here (if any)" value="">
              <input type="checkbox" name="persistent" checked="checked">Persistent
            </fieldset>`;
          var result = fieldGenerator.createField(field);
          var $html = $(html);
          var $result = $(result);
          assert.equal($html.find("label[for='label']").text(),
            $result.find("label[for='label']").text());
          assert.equal($html.find('input[name="persistent"]').is(':checked'),
            $result.find('input[name="persistent"]').is(':checked'));
          assert.equal($html.find('input[name="required"]').is(':checked'),
            $result.find('input[name="required"]').is(':checked'));
          done();
      });

      it('checkRangeField', (done) => {
          var field = testForm.fields[10];
          var html = `
            <fieldset class="fieldcontain fieldcontain-range" id="form-range-1" data-type="range">
              <legend>Range field</legend>
              <label for="label">Field label</label>
              <input type="text" name="label" value="9. Measure the girth (circumference) of the trunk at 1.3 metres (130cm) above the ground.">
              <input type="checkbox" name="required" checked="checked">Required <br>
              <input type="checkbox" name="persistent" checked="checked">Persistent
              <label for="step">Step</label>
              <input type="number" name="step" value="0.1">
              <label for="min">Min value</label>
              <input type="number" name="min" value="0">
              <label for="max">Max value</label>
              <input type="number" name="max" value="10">
            </fieldset>`;
          var result = fieldGenerator.createField(field);
          var $html = $(html);
          var $result = $(result);
          assert.equal($html.find("label[for='label']").text(),
            $result.find("label[for='label']").text());
          assert.equal($html.find('input[name="persistent"]').is(':checked'),
            $result.find('input[name="persistent"]').is(':checked'));
          assert.equal($html.find('input[name="required"]').is(':checked'),
            $result.find('input[name="required"]').is(':checked'));
          assert.equal($html.find('input[name="step"]').val(),
            $result.find('input[name="step"]').val());
          assert.equal($html.find('input[name="min"]').val(),
            $result.find('input[name="min"]').val());
          assert.equal($html.find('input[name="max"]').val(),
            $result.find('input[name="max"]').val());
          done();
      });

      it('checkRadioFieldWithImages', (done) => {
          var field = testForm.fields[4];
          var html = `
            <fieldset class="fieldcontain fieldcontain-radio" id="form-radio-3" data-type="radio">
              <legend>Radio field</legend>
              <label for="label">Field label</label>
              <input type="text" name="label" value='5. Which of these best describes your survey area?'> <br>
              <input type="checkbox" name="required" checked="checked">Required <br>
              <input type="checkbox" name="persistent" checked="checked">Persistent <br>
              <input type="checkbox" name="other" >Allow Other
              <div class="radios">
                <div class="form-inline">
                  <img src="5a.jpg" style="width: 50px;">
                  <input type="text" value="Street" name="form-radio-3" id="form-radio-3-1" class="radio">
                  <button type="button" class="btn btn-default btn-sm remove-radio" aria-label="Remove"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>
                  <input type="file" class="image-upload" id="upload-form-radio-3" style="display: none;">
                </div>
                <div class="form-inline">
                  <img src="5b.jpg" style="width: 50px;">
                  <input type="text" value="Garden" name="form-radio-3" id="form-radio-3-2" class="radio">
                  <button type="button" class="btn btn-default btn-sm remove-radio" aria-label="Remove"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>
                  <input type="file" class="image-upload" id="upload-form-radio-3" style="display: none;">
                </div>
                <div class="form-inline">
                  <img src="5c.jpg" style="width: 50px;">
                  <input type="text" value="School" name="form-radio-3" id="form-radio-3-3" class="radio">
                  <button type="button" class="btn btn-default btn-sm remove-radio" aria-label="Remove"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>
                  <input type="file" class="image-upload" id="upload-form-radio-3" style="display: none;">
                </div>
                <div class="form-inline">
                  <img src="5d.jpg" style="width: 50px;">
                  <input type="text" value="Park" name="form-radio-3" id="form-radio-3-4" class="radio">
                  <button type="button" class="btn btn-default btn-sm remove-radio" aria-label="Remove"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>
                  <input type="file" class="image-upload" id="upload-form-radio-3" style="display: none;">
                </div>
                <div class="form-inline">
                  <img src="5e.jpg" style="width: 50px;">
                  <input type="text" value="Open field" name="form-radio-3" id="form-radio-3-5" class="radio">
                  <button type="button" class="btn btn-default btn-sm remove-radio" aria-label="Remove"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>
                  <input type="file" class="image-upload" id="upload-form-radio-3" style="display: none;">
                </div>
                <div class="form-inline">
                  <img src="5f.jpg" style="width: 50px;">
                  <input type="text" value="Hedge" name="form-radio-3" id="form-radio-3-6" class="radio">
                  <button type="button" class="btn btn-default btn-sm remove-radio" aria-label="Remove"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>
                  <input type="file" class="image-upload" id="upload-form-radio-3" style="display: none;">
                </div>
                <div class="form-inline">
                  <img src="5g.jpg" style="width: 50px;">
                  <input type="text" value="Woodland edge" name="form-radio-3" id="form-radio-3-7" class="radio">
                  <button type="button" class="btn btn-default btn-sm remove-radio" aria-label="Remove"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>
                  <input type="file" class="image-upload" id="upload-form-radio-3" style="display: none;">
                </div>
                <div class="form-inline">
                  <img src="5h.jpg" style="width: 50px;">
                  <input type="text" value="Inside woodland" name="form-radio-3" id="form-radio-3-8" class="radio">
                  <button type="button" class="btn btn-default btn-sm remove-radio" aria-label="Remove"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>
                  <input type="file" class="image-upload" id="upload-form-radio-3" style="display: none;">
                </div>
                <div class="form-inline">
                  <input type="text" value="other" name="form-radio-3" id="form-radio-3-9" class="radio">
                  <button type="file" class="btn btn-default btn-sm upload-image" aria-label="Upload image"><span class="glyphicon glyphicon-arrow-up" aria-hidden="true"></span></button>
                  <button type="button" class="btn btn-default btn-sm remove-radio" aria-label="Remove"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>
                  <input type="file" class="image-upload" id="upload-form-radio-3" style="display: none;">
                </div>
              </div>
              <button type="button" class="btn btn-default btn-sm add-radio" aria-label="radio.add-radio"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></button>
              <button type="button" class="btn btn-default btn-sm relate" aria-label="Visibility">Visibility</button>
            </fieldset>`;
          var result = fieldGenerator.createField(field);
          var $html = $(html);
          var $result = $(result);
          assert.equal($html.find("label[for='label']").text(),
            $result.find("label[for='label']").text());
          assert.equal($html.find('input[name="persistent"]').is(':checked'),
            $result.find('input[name="persistent"]').is(':checked'));
          assert.equal($html.find('input[name="required"]').is(':checked'),
            $result.find('input[name="required"]').is(':checked'));
          assert.equal($html.find('input[name="'+field.id+'"]').length, field.properties.options.length);
          $html.find('img').each(function(i){
              assert.equal($(this).attr("src"), field.properties.options[i][1]);
          });
          done();
      });

      it('checkRadioFieldWithoutImages', (done) => {
          var field = testForm.fields[3];
          var html = `
            <fieldset class="fieldcontain fieldcontain-radio" id="form-radio-2" data-type="radio">
              <legend>Radio field</legend>
              <label for="label">Field label</label>
              <input type="text" name="label" value='3. Are you involved in working with trees or forestry?'> <br>
              <input type="checkbox" name="required" checked="checked">Required <br>
              <input type="checkbox" name="persistent" checked="checked">Persistent <br>
              <input type="checkbox" name="other" >Allow Other
              <div class="radios">
                <div class="form-inline">
                  <input type="text" value="No" name="form-radio-2" id="form-radio-2-1" class="radio">
                  <button type="file" class="btn btn-default btn-sm upload-image" aria-label="Upload image"><span class="glyphicon glyphicon-arrow-up" aria-hidden="true"></span></button>
                  <button type="button" class="btn btn-default btn-sm remove-radio" aria-label="Remove"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>
                  <input type="file" class="image-upload" id="upload-form-radio-2" style="display: none;">
                </div>
                <div class="form-inline">
                  <input type="text" value="Yes, as part of volunteer group or society" name="form-radio-2" id="form-radio-2-2" class="radio">
                  <button type="file" class="btn btn-default btn-sm upload-image" aria-label="Upload image"><span class="glyphicon glyphicon-arrow-up" aria-hidden="true"></span></button>
                  <button type="button" class="btn btn-default btn-sm remove-radio" aria-label="Remove"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>
                  <input type="file" class="image-upload" id="upload-form-radio-2" style="display: none;">
                </div>
                <div class="form-inline">
                  <input type="text" value="Yes, I work in the industry" name="form-radio-2" id="form-radio-2-3" class="radio">
                  <button type="file" class="btn btn-default btn-sm upload-image" aria-label="Upload image"><span class="glyphicon glyphicon-arrow-up" aria-hidden="true"></span></button>
                  <button type="button" class="btn btn-default btn-sm remove-radio" aria-label="Remove"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>
                  <input type="file" class="image-upload" id="upload-form-radio-2" style="display: none;">
                </div>
              </div>
              <button type="button" class="btn btn-default btn-sm add-radio" aria-label="radio.add-radio"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></button>
              <button type="button" class="btn btn-default btn-sm relate" aria-label="Visibility">Visibility</button>
            </fieldset>`;
          var result = fieldGenerator.createField(field);
          var $html = $(html);
          var $result = $(result);
          assert.equal($html.find("label[for='label']").text(),
            $result.find("label[for='label']").text());
          assert.equal($html.find('input[name="persistent"]').is(':checked'),
            $result.find('input[name="persistent"]').is(':checked'));
          assert.equal($html.find('input[name="required"]').is(':checked'),
            $result.find('input[name="required"]').is(':checked'));
          assert.equal($html.find('input[name="'+field.id+'"]').length, field.properties.options.length);
          $html.find('input[name="'+field.id+'"]').each(function(i){
              assert.equal($(this).val(), field.properties.options[i]);
          });
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
