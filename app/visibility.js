import DataStorage from './data';
import * as utils from './utils';
import modal from 'bootstrap';

class Visibility {
    constructor() {
        this.ELEMENTS_TO_EXCLUDE = [
          "dtree",
          "image",
          "audio",
          "general",
          "geoms",
          "section",
          "text",
          "textarea",
          "warning"
        ];
        this.dataStorage = new DataStorage();
        this.divQuestion = "relate-question";
        this.divRule = "relate-rule";
        this.divAnswer = "relate-answer";
        this.visibilityId = "visibility-question";
    }

    /**
     * create an array of dropdown menu with all the potential questions
     * @param questionId {String} id of fiedlcontain
     * @returns array with all the question as select element
     */
    addQuestions(questionId) {
        var data = this.dataStorage.getData().fields;
        var body = [];
        body.push('<select id="'+this.visibilityId+'">');
        for (var i=0; i<data.length; i++) {
            if ($.inArray(data[i].type, this.ELEMENTS_TO_EXCLUDE) === -1 &&
                data[i].id !== questionId) {
                body.push('<option value="'+data[i].id+'">'+
                  data[i].label+'</option>');
            }
        }
        body.push('</select>');
        return body;
    }

    /**
     * create an array of dropdown menu with all the potential questions
     * @param questionId {String} id of element
     * @returns object with all the answers, rules and selected rule
     */
    addRulesAndAnswers(questionId) {
        var visibility = this.checkForExistingRules(questionId);
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
                        if(visibility.answer &&
                            visibility.answer === obj.answers[i]) {
                            selected = 'selected="selected"';
                        }
                        divAnswers.push('<option value="'+obj.answers[i]+'" '+
                          selected+'>'+obj.answers[i]+'</option>');
                    }
                    divAnswers.push('</select>');
                }
                else {
                    var answer = visibility.answer || "";
                    divAnswers.push('<input typeaddRulesAndAnswers="text" value="'+
                      answer+'" id="visibility-values">');
                }
                if(obj.operators.length > 0) {
                    obj.operators.forEach(element, index) {
                        selected = "";
                        if(visibility.operator && visibility.operator === element) {
                          selected = 'selected="selected"';
                      }
                      selectRules.push('<option value="'+element+'" '+
                        selected+'>'+element+'</option>');
                    });
                }
            }
        }
        selectRules.push('</select>');
        return {
            "answers": divAnswers,
            "rules": selectRules,
            "visibility": visibility
        };
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
        $(document).on('click', '#save-rule', $.proxy(function() {
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
        obj.operators = [];
        obj.answers = [];

        switch (type) {
            case 'text':
                break;
            case 'textarea':
                break;
            case 'range':
                obj.operators = ['equal', 'notEqual', 'greaterThan', 'smallerThan'];
                break;
            case 'checkbox':
                obj.operators = ['equal', 'notEqual', 'greaterThan', 'smallerThan'];
                $.each(field.properties.options, function(k, v){
                    if(typeof(v) === "object"){
                        obj.answers.push(v[0]);
                    }
                    else {
                        obj.answers.push(v);
                    }
                });
                break;
            case 'radio':
                obj.operators = ['equal', 'notEqual', 'greaterThan', 'smallerThan'];
                $.each(field.properties.options, function(k, v){
                    if(typeof(v) === "object"){
                        obj.answers.push(v[0]);
                    }
                    else {
                        obj.answers.push(v);
                    }
                });
                break;
            case 'select':
                obj.operators = ['equal', 'notEqual', 'greaterThan', 'smallerThan'];
                obj.answers = field.properties.options;
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
            footer.push('<button type="button" class="btn btn-default"'+
              ' data-dismiss="modal">'+i18n.t("cancel")+'</button>');
            footer.push('<button type="button" class="btn btn-primary"'+
              ' id="save-rule" data-dismiss="modal">'+i18n.t("save")+'</button>');
            footer.push('</div');
            $("body").append(utils.makeModalWindow(id, "Visibility Rules", body, footer).join(""));
        }
        $("#"+id).modal("show");
        //append questions
        var questions = this.addQuestions(el);
        $("#"+this.divQuestion).html(questions.join(""));
        //append rules and answers
        var rulesAndAnswers = this.addRulesAndAnswers(el);
        $("#"+this.divAnswer).html(rulesAndAnswers.answers.join(""));
        $("#"+this.divRule).html(rulesAndAnswers.operators.join(""));
        //if there is visibility dynamically change the value on dom
        if(rulesAndAnswers.visibility !== "") {
            $("#"+this.visibilityId).val(rulesAndAnswers.visibility.id);
        }
        this.enableEvents(el);
    }
}

export default Visibility;
