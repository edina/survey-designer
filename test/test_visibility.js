import {assert} from 'chai';
import $ from 'jquery';
import Visibility from '../app/visibility';
import testJSON  from './test.json!';
import FieldGenerator from '../app/field_generate';

describe('#Visibility', () => {
    var visibility = new Visibility();
    var cl = "mobile-content";
    var fieldGenerator;

    before((done) => {
        $("#content").append('<div class="'+cl+'"></div>');
        fieldGenerator = new FieldGenerator("."+cl);
        //console.log(testJSON)
        $.each(testJSON.fields, function(index, field){
            //console.log(field)
            fieldGenerator.render(field);
        });
        done();
    });

    it('checkVisibilityModalWindow', (done) => {
        $("#fieldcontain-checkbox-3").find(".relate").trigger('click');
        //$(".relate").trigger('click');
        done();
    });

    after((done) => {
        $("."+cl).remove();
        done();
    });
});
