import $ from 'jquery';
import generalTemplate from '../templates/general-fieldset.hbs!';
import textTemplate from '../templates/text-fieldset.hbs!';
import textareaTemplate from '../templates/textarea-fieldset.hbs!';
import rangeTemplate from '../templates/range-fieldset.hbs!';
import checkboxTemplate from '../templates/checkbox-fieldset.hbs!';
import radioTemplate from '../templates/radio-fieldset.hbs!';
import selectTemplate from '../templates/select-fieldset.hbs!';
import imageTemplate from '../templates/image-fieldset.hbs!';
import audioTemplate from '../templates/audio-fieldset.hbs!';
import gpsTemplate from '../templates/gps-fieldset.hbs!';
import warningTemplate from '../templates/warning-fieldset.hbs!';
import dtreeTemplate from '../templates/dtree-fieldset.hbs!';
import * as utils from './utils';

class FieldGenerator {
    constructor (el){
        //super();
        this.$el = $(el);
        Handlebars.registerHelper('t', function(i18n_key) {
            var result = i18n.t(i18n_key);
            return new Handlebars.SafeString(result);
        });
    }

    render(type) {
        this.$el.append(this.createField(type));
        this.addFieldButtons(type);
        this.enableActions();
    }

    createField(type) {
        var result;
        switch (type) {
            case 'general':
                return generalTemplate();
                return '';
                break;
            case 'text':
                return textTemplate();
                break;
            case 'textarea':
                return textareaTemplate();
                break;
            case 'range':
                return rangeTemplate();
                break;
            case 'checkbox':
                return checkboxTemplate();
                break;
            case 'radio':
                return radioTemplate();
                break;
            case 'select':
                return selectTemplate();
                break;
            case 'dtree':
                if(this.$el.find('.fieldcontain-dtree').length === 0){
                    return dtreeTemplate();
                }
                return '';
                break;
            case 'image':
                if(this.$el.find('.fieldcontain-image').length === 0){
                    return imageTemplate();
                }
                return '';
                break;
            case 'audio':
                if(this.$el.find('.fieldcontain-audio').length === 0){
                    return audioTemplate();
                }
                return '';
                break;
            case 'gps':
                if(this.$el.find('.fieldcontain-gps').length === 0){
                    return gpsTemplate();
                }
                return '';
                break;
            case 'warning':
                if(this.$el.find('.fieldcontain-warning').length === 0){
                    return warningTemplate();
                }
                return '';
                break;
        }
        return result;
    };

    addFieldButtons(type) {
        if(type !== "general"){
            var fields = this.$el.find('.fieldcontain-'+type);
            var id = "fieldcontain-"+type+"-"+(fields.length);
            $(fields[fields.length - 1]).attr("id", id);
            var buttons = '<div class="fieldButtons">' +
                      '<button type="button" class="btn btn-default remove-field" aria-label="Remove field"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>'+
                      '<div class="btn btn-default sortit" aria-label="Sort field"><span class="glyphicon glyphicon-sort" aria-hidden="true"></span></div>'+
                      '</div>';
            $("#"+id).append(buttons);
        }
    };

    enableActions() {
        this.enableCheckboxEvents();
        this.enableRadioEvents();
        this.enableSelectEvents();
        this.enabledTreeEvents();
        this.enableRemoveField();
    };

    enableCheckboxEvents() {
        this.enableMultipleOptionsEvents('checkbox');
    };

    enableRadioEvents() {
        this.enableMultipleOptionsEvents('radio');
    };

    enableSelectEvents() {
        this.enableMultipleOptionsEvents('select');
    };

    enableMultipleOptionsEvents(type) {
        $('.add-'+type).click(function(){
            var fieldcontainId = utils.numberFromId($(this).closest('.fieldcontain-'+type).prop("id"));
            var finds = $("#fieldcontain-"+type+"-"+fieldcontainId).find('.'+type);

            var value = i18n.t(type+".text");
            var nextElement = '<div class="form-inline">'+
                               '<input type="text" value="'+value+'" name="'+type+'-'+fieldcontainId+'" id="checkbox-'+fieldcontainId+'" class="'+type+'">'+
                               '<button type="button" class="btn btn-default btn-sm remove-'+type+'" aria-label="Remove '+type+'"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>'+
                               '<button type="file" class="btn btn-default btn-sm upload-'+type+'" aria-label="Remove '+type+'"><span class="glyphicon glyphicon-arrow-up" aria-hidden="true"></span></button>'+
                               '</div>';
            $(this).prev().append(nextElement);
            var i = 1;
            $("#fieldcontain-"+type+"-"+fieldcontainId).find('.'+type).each(function(){
                $(this).prop("id", 'fieldcontain-'+type+'-'+fieldcontainId+'-'+i);
                $(this).prop("name", 'fieldcontain-'+type+'-'+fieldcontainId+'-'+i);
                i++;
            })
        });
        this.$el.off("click", ".remove-"+type);
        this.$el.on("click", ".remove-"+type, function(){
            $(this).closest('.form-inline').remove();
        });
    };

    enabledTreeEvents() {
        $('.add-dtree').click(function(){
            $('.btn-file :file').on('fileselect', $.proxy(function(event, numFiles, label) {
                console.log(numFiles);
                console.log(label);
                var nextElement = '<div class="form-inline">'+
                            '<input type="text" value="'+label+'" name="dtree" class="dtree">'+
                            '<button type="button" class="btn btn-default btn-sm remove-dtree" aria-label="'+i18n.t("dtree.remove")+'"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>'+
                        '</div>';
                $(this).prev().append(nextElement);
            }, this));
        });
        this.$el.off("click", ".remove-dtree");
        this.$el.on("click", ".remove-dtree", function(){
            $(this).closest('.form-inline').remove();
        });
    };

    enableRemoveField() {
        this.$el.off("click", ".remove-field");
        this.$el.on("click", ".remove-field", function(){
            $(this).closest('.fieldcontain').remove();
        });
    };

}

export default FieldGenerator;