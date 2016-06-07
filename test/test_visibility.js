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
    var visibilityStorage = new DataStorage("visibility");
    var cl = ".mobile-content";
    var fieldGenerator;
    var triggeredId = "checkbox-3";

    before((done) => {
        $("#content").append('<div class="'+cl.substring(1)+'"></div>');
        dataStorage.setData(testJSON);
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
        });
        assert.equal($("#"+visibility.visibilityId+ " option").length,
                     fields.length,
                     "The number of questions is right");
        done();
    });

    it('select a visibility rule', (done) => {
        var id = "radio-2";
        var answerValue =
            dataStorage.searchForFieldId(id).properties.options[2].value;
        $("#"+visibility.visibilityId).val(id).trigger('change');
        assert.equal($("#"+visibility.selectAnswers+ " option").length - 1,
                     dataStorage.searchForFieldId(id).properties.options.length,
                     "The number of answers is right");
        // Select an operator and answer
        //$('#' + visibility.visibilityId).val(questionId).trigger('change');
        $('#' + visibility.selectOperators).val('equal').trigger('change');
        $('#' + visibility.selectAnswers).val(answerValue).trigger('change');

        done();
    });

    it('check save visibility', (done) => {
        $("#save-rule").trigger('click');
        var visObject = visibility.getVisibility();
        assert.deepEqual(visibilityStorage.getField(triggeredId), visObject);
        done();
    });

    it('update visibility', (done) => {
        var id = "radio-2";
        $("#"+visibility.visibilityId).val(id).trigger('change');
        $("#"+visibility.selectAnswers).val(dataStorage.searchForFieldId(id).properties.options[2].value);
        assert.equal($("#"+visibility.selectAnswers).val(),
                     dataStorage.searchForFieldId(id).properties.options[2].value,
                     "The change behavior of questions is working");
        $("#save-rule").trigger('click');
        var visObject = visibility.getVisibility();
        assert.deepEqual(visibilityStorage.getField(triggeredId),
                         visObject);
        done();
    });

    it('test remove visibility', (done) => {
        // Assert that some visibility rule has been set
        assert.isDefined(visibilityStorage.getField(triggeredId));

        $("#reset-visibility").trigger('click');
        $("#save-rule").trigger('click');
        assert.isUndefined(visibilityStorage.getField(triggeredId),
            'visibility was removed');

        done();
    });

    after((done) => {
        $(cl).remove();
        done();
    });
});
