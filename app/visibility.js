'use strict';
import DataStorage from './data';
import * as utils from './utils';
import modal from 'bootstrap';

class Visibility {
    constructor() {
        this.ELEMENTS_TO_EXCLUDE = ["dtree", "image", "audio", "general", "geoms", "section", "text", "textarea", "warning"];
        this.dataStorage = new DataStorage();
        this.divQuestion = "relate-question";
        this.divRule = "relate-rule";
        this.divAnswer = "relate-answer";
        this.visibilityId = "visibility-question";
    }

    addQuestions(question) {
        var data = this.dataStorage.getData();
        var body = [];
        body.push('<select id="'+this.visibilityId+'">');
        for (var key in data) {
            var type = key.split("-")[1];
            if (key.indexOf("fieldcontain") > -1 && $.inArray(type, this.ELEMENTS_TO_EXCLUDE) === -1 && key !== question) {
                body.push('<option value="'+key+'">'+data[key].label+'</option>');
            }
        }
        body.push('</select>');
        $("#"+this.divQuestion).html(body.join(""));
    }

    addRulesAndAnswers(question) {
        var visibility = this.checkForExistingRules(question);
        var value = visibility.id || $('#'+this.visibilityId).val();
        var data = this.dataStorage.getData();
        var divAnswers = [];
        var selectRules = [];
        var selected = "";
        selectRules.push('<select id="visibility-rules">');
        for (var key in data){
            if(key === value) {
                var obj = this.getRulesAndAnswersFromJSON(key, data[key]);
                if(obj.answers.length > 0) {
                    divAnswers.push('<select id="visibility-values">');
                    for(var i=0; i<obj.answers.length;i++){
                        selected = "";
                        if(visibility.answer && visibility.answer === obj.answers[i]) {
                            selected = 'selected="selected"';
                        }
                        divAnswers.push('<option value="'+obj.answers[i]+'" '+selected+'>'+obj.answers[i]+'</option>');
                    }
                    divAnswers.push('</select>');
                }
                else {
                    var answer = visibility.answer || "";
                    divAnswers.push('<input type="text" value="'+answer+'" id="visibility-values">');
                }
                if(obj.rules.length > 0) {
                    for(var i=0; i<obj.rules.length;i++){
                        selected = "";
                        if(visibility.rule && visibility.rule === obj.rules[i]) {
                            selected = 'selected="selected"';
                        }
                        selectRules.push('<option value="'+obj.rules[i]+'" '+selected+'>'+obj.rules[i]+'</option>');
                    }
                }
            }
        }
        selectRules.push('</select>');
        $("#"+this.divAnswer).html(divAnswers.join(""));
        $("#"+this.divRule).html(selectRules.join(""));

        if(visibility !== "") {
            $("#"+this.visibilityId).val(visibility.id);
        }
    }

    checkForExistingRules(id) {
        var dataStorage = new DataStorage('visibility');
        var data = dataStorage.getData();
        for (var key in data) {
            if (key === id) {
                return data[key];
            }
        }
        return '';
    }

    enableEvents(el) {
        $(document).off('click', '#save-rule');
        $(document).on('click', '#save-rule', $.proxy(function(){
            var dataStorage = new DataStorage("visibility");
            var data = dataStorage.getData() || {};
            data[el] = {
                "id": $("#visibility-question").val(),
                "rule": $("#visibility-rules").val(),
                "answer": $("#visibility-values").val()
            };
            dataStorage.setData(data);
        }, this));

        $(document).off('change', '#'+this.visibilityId);
        $(document).on('change', '#'+this.visibilityId, $.proxy(function(e) {
            this.addRulesAndAnswers($(e.target).val());
        }, this));
    }

    getRulesAndAnswersFromJSON(id, field) {
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

    showVisibilityWindow(el) {
        var body = [];
        var footer = [];
        var id = "relate-modal";
        if($("#"+id).length ===0) {
            body.push('<div class="row">');
            body.push('<div class="col-lg-4" id="'+this.divQuestion+'">');
            body.push('</div>');
            body.push('<div class="col-lg-4" id="'+this.divRule+'">');
            body.push('</div>');
            body.push('<div class="col-lg-3" id="'+this.divAnswer+'">');
            body.push('</div>');
            body.push('<div class="col-lg-1" id="remove-button-div">');
            body.push('</div>');
            body.push('</div><br>');
            //body.push('<button type="button" class="btn btn-primary" id="add-rule">'+i18n.t("add-rule")+'</button>');
            footer.push('<div class="modal-footer">');
            footer.push('<button type="button" class="btn btn-default" data-dismiss="modal">'+i18n.t("cancel")+'</button>');
            footer.push('<button type="button" class="btn btn-primary" id="save-rule" data-dismiss="modal">'+i18n.t("save")+'</button>');
            footer.push('</div');
            $("body").append(utils.makeModalWindow(id, "Visibility Rules", body, footer).join(""));
        }
        $("#"+id).modal("show");
        this.addQuestions(el);
        this.addRulesAndAnswers(el);
        this.enableEvents(el);
    }
}

export default Visibility;
