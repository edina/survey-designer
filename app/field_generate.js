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

        Handlebars.registerHelper('checkGeometries', function(v, geoms, options) {
            if($.inArray(v, geoms) > -1){
                return 'checked="checked"';
            }
            else{
                return '';
            }
        });

        Handlebars.registerHelper('check', function(v, options) {
            if(v){
                return 'checked="checked"';
            }
            else{
                return '';
            }
        });

        Handlebars.registerHelper('increase', function(v, options) {
            return v+1;
        });
    }

    render(type, data) {
        this.$el.append(this.createField(type, data));
        this.addFieldButtons(type);
        this.enableActions();
    }

    createField(type, data) {
        data = data || {};
        var result;
        switch (type) {
            case 'general':
                data.title = data.title || i18n.t("general.label");
                data.geoms = data.geoms || ["point"];
                return generalTemplate(data);
                break;
            case 'text':
                data.fieldId = "fieldcontain-"+type+"-"+this.findHighestElement(type);
                data.label = data.label || i18n.t(type+".label");
                data["max-chars"] = data["max-chars"] || i18n.t(type+".max-chars");
                data["default-text"] = data["default-text"] || i18n.t(type+".default-text");
                data["prefix"] = data["prefix"] || i18n.t(type+".prefix");
                data.required = data.required || true;
                data.persistentValue = data.persistentValue || false;
                return textTemplate(data);
                break;
            case 'textarea':
                data.fieldId = "fieldcontain-"+type+"-"+this.findHighestElement(type);
                data.label = data.label || i18n.t(type+".label");
                data["default-text"] = data["default-text"] || i18n.t(type+".default-text");
                data.required = data.required || true;
                data.persistentValue = data.persistentValue || false;
                return textareaTemplate(data);
                break;
            case 'range':
                data.fieldId = "fieldcontain-"+type+"-"+this.findHighestElement(type);
                data.label = data.label || i18n.t(type+".label");
                data["max-chars"] = data["max-chars"] || i18n.t(type+".max-chars");
                data["default-text"] = data["default-text"] || i18n.t(type+".default-text");
                data["prefix"] = data["prefix"] || i18n.t(type+".prefix");
                data.required = data.required || true;
                data.persistentValue = data.persistentValue || false;
                return rangeTemplate(data);
                break;
            case 'checkbox':
                data.fieldId = "fieldcontain-"+type+"-"+this.findHighestElement(type);
                data.label = data.label || i18n.t(type+".label");
                data.required = data.required || true;
                data.persistentValue = data.persistentValue || false;
                data.checkboxes= data.checkboxes || [i18n.t(type+".text")];
                return checkboxTemplate(data);
                break;
            case 'radio':
                data.fieldId = "fieldcontain-"+type+"-"+this.findHighestElement(type);
                data.label = data.label || i18n.t(type+".label");
                data.required = data.required || true;
                data.persistentValue = data.persistentValue || false;
                data.radios= data.radios || [i18n.t(type+".text")];
                return radioTemplate(data);
                break;
            case 'select':
                data.fieldId = "fieldcontain-"+type+"-"+this.findHighestElement(type);
                data.label = data.label || i18n.t(type+".label");
                data.required = data.required || true;
                data.persistentValue = data.persistentValue || false;
                data.options = data.options || [i18n.t(type+".text")];
                return selectTemplate(data);
                break;
            case 'dtree':
                    data.fieldId = "fieldcontain-"+type+"-"+this.findHighestElement(type);
                    return dtreeTemplate(data);
                break;
            case 'image':
                if(this.$el.find('.fieldcontain-image').length === 0){
                    data.fieldId = "fieldcontain-"+type+"-"+this.findHighestElement(type);
                    return imageTemplate(data);
                }
                return '';
                break;
            case 'audio':
                if(this.$el.find('.fieldcontain-audio').length === 0){
                    data.fieldId = "fieldcontain-"+type+"-"+this.findHighestElement(type);
                    return audioTemplate(data);
                }
                return '';
                break;
            case 'gps':
                if(this.$el.find('.fieldcontain-gps').length === 0){
                    data.fieldId = "fieldcontain-"+type+"-"+this.findHighestElement(type);
                    return gpsTemplate(data);
                }
                return '';
                break;
            case 'warning':
                if(this.$el.find('.fieldcontain-warning').length === 0){
                    data.fieldId = "fieldcontain-"+type+"-"+this.findHighestElement(type);
                    return warningTemplate(data);
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
                               '<input type="text" value="'+value+'" name="fieldcontain-'+type+'-'+fieldcontainId+'" id="checkbox-'+fieldcontainId+'" class="'+type+'">'+
                               '<button type="button" class="btn btn-default btn-sm remove-'+type+'" aria-label="Remove '+type+'"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>'+
                               '<button type="file" class="btn btn-default btn-sm upload-'+type+'" aria-label="Remove '+type+'"><span class="glyphicon glyphicon-arrow-up" aria-hidden="true"></span></button>'+
                               '</div>';
            $(this).prev().append(nextElement);
            var i = 1;
            $("#fieldcontain-"+type+"-"+fieldcontainId).find('.'+type).each(function(){
                $(this).prop("id", 'fieldcontain-'+type+'-'+fieldcontainId+'-'+i);
                //$(this).prop("name", 'fieldcontain-'+type+'-'+fieldcontainId+'-'+i);
                i++;
            })
        });
        this.$el.off("click", ".remove-"+type);
        this.$el.on("click", ".remove-"+type, function(){
            $(this).closest('.form-inline').remove();
        });
    };

    enabledTreeEvents() {
        this.uploadFile('.add-dtree', '.upload-dtree');
        //$('.add-dtree').click(function(){
        //    $('.btn-file :file').on('fileselect', $.proxy(function(event, numFiles, label) {
        //        console.log(numFiles);
        //        console.log(label);
        //        var nextElement = '<div class="form-inline">'+
        //                    '<input type="text" value="'+label+'" name="dtree" class="dtree">'+
        //                    '<button type="button" class="btn btn-default btn-sm remove-dtree" aria-label="'+i18n.t("dtree.remove")+'"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>'+
        //                '</div>';
        //        $(this).prev().append(nextElement);
        //    }, this));
        //});
    };

    enableRemoveField() {
        this.$el.off("click", ".remove-field");
        this.$el.on("click", ".remove-field", function(){
            $(this).closest('.fieldcontain').remove();
        });
    };

    /**
     * find the highest id of the fieldcontain
     * @param type
     * @returns {Integer} next integer for new fieldcontain of the same type
     */
    findHighestElement (type){
        var j = 0;
        this.$el.find(".fieldcontain-"+type).each(function(){
            var i = parseInt($(this).attr("id").split("-")[2]);
            if(i >= j) {
                j = i;
            }
        });
        return j+1;
    };

    uploadFile (browseElement, uploadElement) {
        var file;
        $(browseElement).unbind();
        // Set an event listener on the Choose File field.
        $(browseElement).bind("change", function(e) {
            var files = e.target.files || e.dataTransfer.files;
            // Our file var now holds the selected file
            file = files[0];
            $(this).parent().next().append(file.name);
        });

        $(uploadElement).unbind('click');
        $(uploadElement).click($.proxy(function(){
            // TODO: When we migrate to modules get the sid & publicEditor from core
            var index = this.$el.find('.fieldcontain-dtree').length;
            var dtreeFname = file.name;
            if("sid" in utils.getParams()){
                dtreeFname = utils.getParams().sid + '-' + index + '.json';
            }
            var publicEditor = utils.getParams().public === 'true';
            var options = {
                "remoteDir": "editors",
                "path": dtreeFname,
                "file": file,
                "contentType": false
            };

            if(publicEditor){
                options.urlParams = {
                    'public': 'true'
                };
            }

            pcapi.uploadFile(options).then($.proxy(function(result, data){
                alert("File was uploaded");
                console.log(pcapi.buildFSUrl('editors', dtreeFname));

                //$.ajax({
                //    url: "templates/dtreeTemplate.html",
                //    dataType: 'html',
                //    success: function(tmpl){
                //        var data = {
                //            "i": index,
                //            "type": "dtree",
                //            "title": file.name,
                //            "dtree": dtreeFname,
                //            "url": pcapi.buildFSUrl('editors', dtreeFname)
                //        };
                //        var template = _.template(tmpl);
                //        $("#"+target).append(template(data));
                //    }
                //});
                //loading(false);
            }, this));
        }, this));
    };

}

export default FieldGenerator;