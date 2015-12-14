import $ from 'jquery';
import i18next from 'i18next-client';
//import * from 'handlebars';
import generalTemplate from './templates/general-fieldset.hbs!';
import textTemplate from './templates/text-fieldset.hbs!';
import textareaTemplate from './templates/textarea-fieldset.hbs!';
import rangeTemplate from './templates/range-fieldset.hbs!';
import checkboxTemplate from './templates/checkbox-fieldset.hbs!';
import radioTemplate from './templates/radio-fieldset.hbs!';
import selectTemplate from './templates/select-fieldset.hbs!';
import imageTemplate from './templates/image-fieldset.hbs!';
import audioTemplate from './templates/audio-fieldset.hbs!';
import gpsTemplate from './templates/gps-fieldset.hbs!';
import warningTemplate from './templates/warning-fieldset.hbs!';
import dtreeTemplate from './templates/dtree-fieldset.hbs!';
import sectionTemplate from './templates/section-fieldset.hbs!';
import addfieldTemplate from './templates/add-button.hbs!';
import * as utils from './utils';
import Visibility from './visibility';

/* global i18n */

class FieldGenerator {
    constructor (el){
        this.$el = $(el);
        this.registerHelpers();
    }

    render(data, element) {
        if(element) {
            $(element).after(this.createField(data));
        }
        else{
            this.$el.append(this.createField(data));
        }
        this.addFieldButtons(data.type);
        this.enableActions();
    }

    /**
     * create field by using templates and data
     * @param {Object} data of each field
     * @returns {String} html of each field that is generated on the SD
     */
    createField(data) {
        var type = data.type;
        data.id = data.id || "fieldcontain-"+type+"-"+this.findHighestElement(type);
        data.label = data.label || i18n.t(type+".label");
        switch (type) {
            case 'general':
                data.title = data.title || i18n.t("general.label");
                data.geoms = data.geoms || ["point"];
                return generalTemplate(data);
            case 'text':
                if(data.properties) {
                    data.properties["max-chars"] = data.properties["max-chars"] ||
                      i18n.t(type+".max-chars");
                }
                return textTemplate(data);
            case 'textarea':
                return textareaTemplate(data);
            case 'range':
                if(data.properties) {
                    data.properties.min = data.properties.min || 0;
                    data.properties.max = data.properties.max || 10;
                    data.properties.step = data.properties.step || 1;
                }
                return rangeTemplate(data);
            case 'checkbox':
                return checkboxTemplate(data);
            case 'radio':
              console.log(radioTemplate(data))
                return radioTemplate(data);
            case 'select':
                if(data.options && data.options[0] === ""){
                    data.options.shift();
                }
                return selectTemplate(data);
            case 'dtree':
                data.url = pcapi.buildFSUrl('editors', data.filename);
                return dtreeTemplate(data);
            case 'image':
                if(this.$el.find('.fieldcontain-image').length === 0){
                    data["multi-image"] = data["multi-image"] || false;
                    data.los = data.los || false;
                    data.blur = data.blur || 0;
                    return imageTemplate(data);
                }
                return '';
            case 'multiimage':
                if(this.$el.find('.fieldcontain-image').length === 0){
                    data.fieldId = "fieldcontain-image-"+this.findHighestElement(type);
                    data.required = data.required || true;
                    data["multi-image"] = data["multi-image"] || true;
                    data.los = data.los || false;
                    data.blur = data.blur || 0;
                    return imageTemplate(data);
                }
                return '';
            case 'audio':
                if(this.$el.find('.fieldcontain-audio').length === 0){
                    return audioTemplate(data);
                }
                return '';
            case 'gps':
                if(this.$el.find('.fieldcontain-gps').length === 0){
                    return gpsTemplate(data);
                }
                return '';
            case 'warning':
                if(this.$el.find('.fieldcontain-warning').length === 0){
                    data.textarea = data.placeholder || "";
                    return warningTemplate(data);
                }
                return '';
            case 'section':
                return sectionTemplate(data);
        }
        return result;
    }

    /**
     * add move and remove buttons for each field that is render on the SD
     * @param {String} type such as text, textarea etc
     */
    addFieldButtons(type) {
        if(type !== "general"){
            var fields = this.$el.find('.fieldcontain-'+type);
            var id = "fieldcontain-"+type+"-"+(fields.length);
            $(fields[fields.length - 1]).attr("id", id);
            var $id = $("#"+id);
            if(fields.length > 1 || type !== "text"){
                var buttons = '<div class="fieldButtons">' +
                      '<button type="button" class="btn btn-default remove-field" aria-label="Remove field"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>'+
                      '<div class="btn btn-default sortit" aria-label="Sort field"><span class="glyphicon glyphicon-sort" aria-hidden="true"></span></div>'+
                      '</div>';
                $id.append(buttons);
            }
            $id.append(addfieldTemplate(cfg.options));
        }
    }

    /**
     * enable all events
     */
    enableActions() {
        this.enableCheckboxEvents();
        this.enableRadioEvents();
        this.enableSelectEvents();
        this.enabledTreeEvents();
        this.enableRemoveField();
        this.enableAddField();
    }

    /**
    * add field event for adding an element after clicking
    */
    enableAddField() {
        this.$el.off("click", ".add-field");
        this.$el.on("click", ".add-field", $.proxy(function(event){
            var $this = $(event.target);
            var $fieldcontain = $this.closest('.fieldcontain');
            this.render({type: $this.text().trim()}, $fieldcontain);
        }, this));
    }

    /**
     * enable events for checkboxes
     */
    enableCheckboxEvents() {
        this.enableMultipleOptionsEvents('checkbox');
    }

    /**
     * enable events for radio
     */
    enableRadioEvents() {
        this.enableMultipleOptionsEvents('radio');
    }

    /**
     * enable events select
     */
    enableSelectEvents() {
        this.enableMultipleOptionsEvents('select');
    }

    /**
     * enable events such as add, remove element button e.g. radio checkbox
     * upload image and add rules to fields
     * @param {String} type (text, textarea etc)
     */
    enableMultipleOptionsEvents(type) {
        //add element button
        this.$el.off("click", ".add-"+type);
        this.$el.on("click", ".add-"+type, function(){
            var fieldcontainId = utils.numberFromId($(this).closest('.fieldcontain-'+type).prop("id"));
            var finds = $("#fieldcontain-"+type+"-"+fieldcontainId).find('.'+type);

            var value = i18n.t(type+".text");
            var nextElement = '<div class="form-inline">'+
                               '<input type="text" value="'+value+'" name="fieldcontain-'+type+'-'+fieldcontainId+'" id="checkbox-'+fieldcontainId+'" class="'+type+'">';
            if(type !== "select") {
                nextElement += '<button type="file" class="btn btn-default btn-sm upload-image" aria-label="Upload '+type+'"><span class="glyphicon glyphicon-arrow-up" aria-hidden="true"></span></button>';
            }
            nextElement += '<button type="button" class="btn btn-default btn-sm remove-'+type+'" aria-label="Remove '+type+'"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>'+
                           '<input type="file" class="image-upload" id="upload-'+type+'-'+fieldcontainId+'" style="display: none;">'+
                           '</div>';
            $(this).prev().append(nextElement);
            var i = 1;
            $("#fieldcontain-"+type+"-"+fieldcontainId).find('.'+type).each(function(){
                $(this).prop("id", 'fieldcontain-'+type+'-'+fieldcontainId+'-'+i);
                i++;
            });
        });

        //remove element button
        this.$el.off("click", ".remove-"+type);
        this.$el.on("click", ".remove-"+type, function(){
            $(this).closest('.form-inline').remove();
        });

        //upload image/file button
        this.$el.off("click", ".upload-image");
        this.$el.on("click", ".upload-image", function(){
            $(this).closest('.form-inline').find('input[type="file"]').trigger('click');
        });

        //when image-uplaod changes upload the actual file to the server
        this.$el.off("change", ".image-upload");
        this.$el.on("change", ".image-upload", $.proxy(function(e){
            var files = e.target.files || e.dataTransfer.files;
            // Our file var now holds the selected file
            var file = files[0];
            type = $(e.target).closest('.fieldcontain').attr("id").split("-")[1];
            ///let convertor = new Convertor();
            //var title = convertor.getTitle();

            var publicEditor = utils.getParams().public === 'true';
            var options = {
                "remoteDir": "editors",
                "path": file.name,
                "file": file,
                "contentType": false
            };

            if(publicEditor){
                options.urlParams = {
                    'public': 'true'
                };
            }

            utils.loading(true);
            pcapi.uploadFile(options).then($.proxy(function(data){
                utils.loading(false);
                utils.giveFeedback(data.msg);
                var name = utils.getFilenameFromURL(data.path);
                var $formLine = $(e.target).closest('.form-inline');
                var $inputText = $formLine.find('input[type="text"]');
                $inputText.before('<img src="'+pcapi.buildFSUrl('editors', name)+'" style="width: 50px;">');
                $formLine.find('button.upload-image').remove();
            }, this));
        }, this));

        //add visibility button
        var visibility = new Visibility();
        this.$el.off("click", ".relate");
        this.$el.on("click", ".relate", function(){
            visibility.showVisibilityWindow($(this).closest('.fieldcontain').attr("id"));
        });
    }

    enabledTreeEvents() {
        this.uploadFile('.add-dtree', '.upload-dtree');
    }

    enableRemoveField() {
        this.$el.off("click", ".remove-field");
        this.$el.on("click", ".remove-field", function(){
            $(this).closest('.fieldcontain').remove();
        });
    }

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
    }

    /**
     * functions that added on the handlebars templates
     */
    registerHelpers () {
        var helpers = {
            't': function(i18nKey) {
                var result = i18n.t(i18nKey);
                return new Handlebars.SafeString(result);
            },
            'checkGeometries': function(v, geoms, options) {
                if($.inArray(v, geoms) > -1){
                    return new Handlebars.SafeString('checked="checked"');
                }
                else{
                    return '';
                }
            },
            'check': function(v, word, options) {
                if(v) {
                    return new Handlebars.SafeString(word+'="'+word+'"');
                }
                else {
                    return '';
                }
            },
            'increase': function(v, options) {
                return v+1;
            },
            'exists': function(variable, options) {
                if (typeof variable !== 'undefined') {
                    return options.fn(this);
                }
                else {
                    return options.inverse(this);
                }
            },
            'ifObject': function(item, options) {
                if(typeof item === "object") {
                    return options.fn(this);
                }
                else {
                    return options.inverse(this);
                }
            }
        };

        //var myHandlebars = Handlebars.noConflict();
        if (Handlebars && typeof Handlebars.registerHelper === "function") {
            // register helpers
            for (var prop in helpers) {
                Handlebars.registerHelper(prop, helpers[prop]);
            }
        }
    }

    /**
     * upload file on the server
     * @param {String} browserElement
     * @param {String} uploadElement
     */
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
            var index = this.findHighestElement('dtree') - 1;
            var id = "fieldcontain-dtree-"+index;
            var dtreeFname = file.name;
            var ext = utils.getExtension(dtreeFname);
            if("sid" in utils.getParams()){
                dtreeFname = utils.getParams().sid + '-' + index + '.' + ext;
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

            utils.loading(true);
            pcapi.uploadFile(options).then($.proxy(function(result, data){
                utils.loading(false);
                utils.giveFeedback("File was uploaded");
                $("#"+id+" .btn-file").remove();
                $("#"+id+" button").remove();
                $("#"+id+" .btn-filename").html('<a href="'+pcapi.buildFSUrl('editors', dtreeFname)+'">'+dtreeFname+'</a>');
            }, this));
        }, this));
    }

}

export default FieldGenerator;
