'use strict';
import DataStorage from './data';
import * as utils from './utils';

class Visibility {
    constructor() {
        this.ELEMENTS_TO_EXCLUDE = ["dtree", "image", "audio", "general", "geoms", "section", "text", "textarea"];
        this.dataStorage = new DataStorage();
        this.divQuestion = "relate-question";
        this.divRule = "relate-rule";
        this.divAnswer = "relate-answer";
        this.visibilityId = "visibility-question";
    }

    showVisibilityWindow () {
        var body = [];
        var id = "relate-modal";
        if($("#"+id).length ===0) {
            body.push('<div class="row">');
            body.push('<div class="col-lg-4" id="'+this.divQuestion+'">');
            body.push('</div>');
            body.push('<div class="col-lg-4" id="'+this.divRule+'">');
            body.push('</div>');
            body.push('<div class="col-lg-4" id="'+this.divAnswer+'">');
            body.push('</div>');
            body.push('</div>');
            $("body").append(utils.makeModalWindow(id, "", body).join(""));
        }
        $("#"+id).modal("show");
        this.addQuestions();
        this.addRulesAndAnswers();
        this.chageQuestionEvent();
    }

    addQuestions () {
        var data = this.dataStorage.getForm();
        var body = [];
        body.push('<select id="'+this.visibilityId+'">');
        for (var key in data) {
            var type = key.split("-")[1];
            if (key.indexOf("fieldcontain") > -1 && $.inArray(type, this.ELEMENTS_TO_EXCLUDE) === -1) {
                body.push('<option value="'+key+'">'+data[key].label+'</option>');
            }
        }
        body.push('</select>');
        $("#"+this.divQuestion).html(body.join(""));
    }

    addRulesAndAnswers (question) {
        var value = question || $('#'+this.visibilityId).val();
        var data = this.dataStorage.getForm();
        var selectAnswers = [];
        var selectRules = [];
        selectAnswers.push('<select id="visibility-values">');
        selectRules.push('<select id="visibility-rules">');
        for (var key in data){
            if(key === value) {
                var obj = this.getRulesAndAnswersFromJSON(key, data[key]);
                if(obj.answers.length > 0) {
                    for(var i=0; i<obj.answers.length;i++){
                        selectAnswers.push('<option value="'+obj.answers[i]+'">'+obj.answers[i]+'</option>');
                    }
                }
                if(obj.rules.length > 0) {
                    for(var i=0; i<obj.rules.length;i++){
                        selectRules.push('<option value="'+obj.rules[i]+'">'+obj.rules[i]+'</option>');
                    }
                }
            }
        }
        selectAnswers.push('</select>');
        selectRules.push('</select>');
        $("#"+this.divAnswer).html(selectAnswers.join(""));
        $("#"+this.divRule).html(selectRules.join(""));
    }

    chageQuestionEvent () {
        $('#'+this.visibilityId).change($.proxy(function(e) {
            this.addRulesAndAnswers($(e.target).val());
        }, this));
    }

    getRulesAndAnswersFromJSON (id, field) {
        var type = id.split("-")[1];
        var obj = {};
        obj.type = type;
        obj.rules = [];
        obj.answers = [];

        switch (type) {
            case 'text':
                break;
            case 'textarea':
                break;
            case 'range':
                obj.rules = ['equal', 'notEqual', 'greaterThan', 'smallerThan'];
                obj.answers = [value.min, value.max];
                break;
            case 'checkbox':
                obj.rules = ['equal', 'notEqual', 'greaterThan', 'smallerThan'];
                $.each(field.checkboxes, function(k, v){
                    if(typeof(v) === "object"){
                        obj.answers.push(v[0]);
                    }
                    else {
                        obj.answers.push(v);
                    }
                });
                break;
            case 'radio':
                obj.rules = ['equal', 'notEqual', 'greaterThan', 'smallerThan'];
                $.each(field.radios, function(k, v){
                    if(typeof(v) === "object"){
                        obj.answers.push(v[0]);
                    }
                    else {
                        obj.answers.push(v);
                    }
                });
                break;
            case 'select':
                obj.rules = ['equal', 'notEqual', 'greaterThan', 'smallerThan'];
                obj.answers = field.options;
                break;
            case 'dtree':
                break;
            case 'image':
                break;
            case 'audio':
                break;
            case 'gps':
                break;
            case 'warning':
                break;
            case 'section':
                break;
        }
        return obj;
    }
}

export default Visibility;