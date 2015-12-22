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
        this.divOperator = "relate-operator";
        this.divAnswer = "relate-answer";
        this.visibilityId = "visibility-question";
        this.selectOperators = "visibility-operators";
        this.selectAnswers = "visibility-values";
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
    getRulesAndAnswers(questionId) {
        var visibility = this.checkForExistingRules(questionId);
        var visibilityId = $('#'+this.visibilityId).val();
        var divAnswers = [];
        var selectOperators = [];
        var selected = "";
        var data = this.dataStorage.getData().fields;
        selectOperators.push('<select id="'+this.selectOperators+'">');
        if(visibility) {
            visibilityId = visibility.id;
        }
        data.forEach($.proxy(function(element){
            if(visibilityId === element.id) {
                var obj = this.getOperatorsAndAnswersFromJSON(element);
                if(obj.answers.length > 0) {
                    divAnswers.push('<select id="'+this.selectAnswers+'">');
                    obj.answers.forEach(function(element){
                        if(visibility && visibility.answer) {
                            selected = 'selected="selected"';
                        }
                        divAnswers.push('<option value="'+element+'" '+
                          selected+'>'+element+'</option>');
                    });
                    divAnswers.push('</select>');
                }
                else {
                    var answer = "";
                    if(visibility) {
                        answer = visibility.answer;
                    }
                    divAnswers.push('<input type="text" value="'+
                      answer+'" id="'+this.selectAnswers+'">');
                }
                if(obj.operators.length > 0) {
                    obj.operators.forEach(function(element, index) {
                        selected = "";
                        if(visibility && visibility.operator === element) {
                            selected = 'selected="selected"';
                        }
                        selectOperators.push('<option value="'+element+'" '+
                          selected+'>'+element+'</option>');
                    });
                }
            }
        }, this));
        selectOperators.push('</select>');
        return {
            "answers": divAnswers,
            "operators": selectOperators,
            "visibility": visibility
        };
    }

    /**
     * check for existing rules
     * @param id {String} the id of the field
     * @returns visibility of the found field
     */
    checkForExistingRules(id) {
        var dataStorage = new DataStorage();
        return dataStorage.searchForFieldId(id).visibility;
    }

    enableEvents(el) {
        //event for saving rule
        $(document).off('click', '#save-rule');
        $(document).on('click', '#save-rule', $.proxy(function() {
            var dataStorage = new DataStorage();
            dataStorage.updateField(el, "visibility", this.getVisibility());
        }, this));

        //event for updating rules and answers when the user selects
        //different question
        $(document).off('change', '#'+this.visibilityId);
        $(document).on('change', '#'+this.visibilityId, $.proxy(function(e) {
            var questionId = $(e.target).val();
            this.getRulesAndAnswers(questionId);
            this.updateHTMLForAnswers(questionId);
        }, this));
    }

    /**
     * get visibility object of the selected question, operator, answer
     * "returns {Object} visibility with id, operator, answer
     */
    getVisibility() {
        return {
            "id": $("#"+this.visibilityId).val(),
            "operator": $("#"+this.selectOperators).val(),
            "answer": $("#"+this.selectAnswers).val()
        };
    }

    /**
     * get object with operators and answers
     * @param {Object} field
     * @returns {Object} with array of answers and operators
     */
    getOperatorsAndAnswersFromJSON(field) {
        var obj = {};
        obj.type = field.type;
        obj.operators = [];
        obj.answers = [];

        switch (field.type) {
            case 'text':
                break;
            case 'textarea':
                break;
            case 'range':
                obj.operators = ['equal', 'notEqual', 'greaterThan', 'smallerThan'];
                break;
            case 'checkbox':
                obj.operators = ['equal', 'notEqual', 'greaterThan', 'smallerThan'];
                field.properties.options.forEach(function(v) {
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
                field.properties.options.forEach(function(v) {
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

    /**
     * create a modal window with all the questions apart from the one that
     * is selected
     * @param {String} el is the id of the selected question
     */
    showVisibilityWindow(el) {
        var body = [];
        var footer = [];
        var id = "relate-modal";
        if($("#"+id).length ===0) {
            body.push('<div class="row">');
            body.push('<div class="col-lg-4" id="'+this.divQuestion+'">');
            body.push('</div>');
            body.push('<div class="col-lg-4" id="'+this.divOperator+'">');
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
        this.updateHTMLForAnswers(el);
        this.enableEvents(el);
    }

    /**
     * update html content of operators and answers
     * @param {String} questionId is the id of the selected question
     */
    updateHTMLForAnswers(questionId) {
        //append operators and answers
        var operatorsAndAnswers = this.getRulesAndAnswers(questionId);
        $("#"+this.divAnswer).html(operatorsAndAnswers.answers.join(""));
        $("#"+this.divOperator).html(operatorsAndAnswers.operators.join(""));
        //if there is visibility dynamically change the value on dom
        if(operatorsAndAnswers.visibility && operatorsAndAnswers.visibility !== "") {
            $("#"+this.visibilityId).val(operatorsAndAnswers.visibility.id);
        }
    }
}

export default Visibility;