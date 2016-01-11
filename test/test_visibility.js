//import {assert} from 'chai';
import chai from 'chai';
var assert = chai.assert;
import $ from 'jquery';
import Visibility from '../app/visibility';
import testJSON  from './test.json!';
import FieldGenerator from '../app/field_generate';
import DataStorage from '../app/data';

describe('#Visibility', () => {
    var visibility = new Visibility();
    var dataStorage = new DataStorage();
    var cl = "mobile-content";
    var fieldGenerator;
    var triggeredId = "fieldcontain-checkbox-3";

    before((done) => {
        $("#content").append('<div class="'+cl+'"></div>');
        fieldGenerator = new FieldGenerator(cl);
        $.each(testJSON.fields, function(index, field){
            fieldGenerator.render(field);
        });
        done();
    });

    it('check questions', (done) => {
        $("#"+triggeredId).find(".relate").trigger('click');
        var fields = [];
        testJSON.fields.forEach(function(field){
            if ($.inArray(field.type, visibility.ELEMENTS_TO_EXCLUDE) === -1) {
                fields.push(field);
            }
        })
        assert.equal($("#"+visibility.visibilityId+ " option").length,
                     fields.length-1,
                     "The number of questions is right");
        done();
    });

    it('check change event of questions', (done) => {
        var id = "fieldcontain-radio-2";
        $("#"+visibility.visibilityId).val(id).trigger('change');
        assert.equal($("#"+visibility.selectAnswers).val(),
                     dataStorage.searchForFieldId(id).properties.options[0],
                     "The change behavior of questions is working");
        assert.equal($("#"+visibility.selectAnswers+ " option").length,
                     dataStorage.searchForFieldId(id).properties.options.length,
                     "The number of answers is right");
        done();
    });

    it('check save visibility', (done) => {
        $("#save-rule").trigger('click');
        var visObject = visibility.getVisibility();
        assert.deepEqual(dataStorage.searchForFieldId(triggeredId).properties.visibility,
                         visObject);
        done();
    });

    it('update visibility', (done) => {
        var id = "fieldcontain-radio-2";
        $("#"+visibility.visibilityId).val(id).trigger('change');
        $("#"+visibility.selectAnswers).val(dataStorage.searchForFieldId(id).properties.options[2]);
        assert.equal($("#"+visibility.selectAnswers).val(),
                     dataStorage.searchForFieldId(id).properties.options[2],
                     "The change behavior of questions is working");
        $("#save-rule").trigger('click');
        var visObject = visibility.getVisibility();
        assert.deepEqual(dataStorage.searchForFieldId(triggeredId).properties.visibility,
                         visObject);
        done();
    });

    after((done) => {
        $("."+cl).remove();
        done();
    });
});
