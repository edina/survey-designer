import $ from 'jquery';
import i18next from 'i18next-client';
import pcapi from 'pcapi';
import _ from "underscore";
import generalTemplate from './templates/general-fieldset.jst!';
import textTemplate from './templates/text-fieldset.jst!';
import textareaTemplate from './templates/textarea-fieldset.jst!';
import rangeTemplate from './templates/range-fieldset.jst!';
import checkboxTemplate from './templates/checkbox-fieldset.jst!';
import radioTemplate from './templates/radio-fieldset.jst!';
import selectTemplate from './templates/select-fieldset.jst!';
import imageTemplate from './templates/image-fieldset.jst!';
import audioTemplate from './templates/audio-fieldset.jst!';
import gpsTemplate from './templates/gps-fieldset.jst!';
import warningTemplate from './templates/warning-fieldset.jst!';
import dtreeTemplate from './templates/dtree-fieldset.jst!';
import sectionTemplate from './templates/section-fieldset.jst!';
import addfieldTemplate from './templates/add-button.jst!';
import * as utils from './utils';
import * as save from './save';
import DataStorage from './data';
import Visibility from './visibility';

/* global i18n */
class FieldGenerator {
    constructor (el, options){
        this.el = el;
        this.$el = $(el);
        this.options = options;
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
        //in order not to attach all the underscore functions to the data object
        var templateData = Object.assign({}, data);
        templateData.id = templateData.id || type+"-"+this.findHighestElement(type);
        templateData.label = templateData.label || i18n.t(type+".label");
        templateData.required = templateData.required || false;
        templateData.header = false;
        templateData.persistent = templateData.persistent || false;
        templateData.properties = templateData.properties || {};
        _.extend(templateData, this.viewHelpers());
        switch (type) {
            case 'general':
                templateData.title = templateData.title || i18n.t("general.label");
                templateData.geoms = templateData.geoms || ["point"];
                return generalTemplate(templateData);
            case 'text':
                templateData.properties["max-chars"] = templateData.properties["max-chars"] || 10;
                if(this.options && this.options.layout) {
                    templateData.header = this.options.layout.headers.indexOf(templateData.id) > -1;
                }
                return textTemplate(templateData);
            case 'textarea':
                return textareaTemplate(templateData);
            case 'range':
                templateData.properties.min = templateData.properties.min || 0;
                templateData.properties.max = templateData.properties.max || 10;
                templateData.properties.step = templateData.properties.step || 1;
                return rangeTemplate(templateData);
            case 'checkbox':
                if(this.options && this.options.formsFolder) {
                    templateData.properties.extraPath = this.options.formsFolder;
                }
                templateData.properties.options = templateData.properties.options || [];
                return checkboxTemplate(templateData);
            case 'radio':
                if(this.options && this.options.formsFolder) {
                    templateData.properties.extraPath = this.options.formsFolder;
                }
                templateData.properties.options = templateData.properties.options || [];
                return radioTemplate(templateData);
            case 'select':
                templateData.properties.options = templateData.properties.options || [];
                if(templateData.properties.options > 0 && templateData.properties.options[0] === "") {
                    templateData.options.shift();
                }
                return selectTemplate(templateData);
            case 'dtree':
                var fnameURL = templateData.properties.filename;
                if(this.options && this.options.formsFolder && templateData.properties.filename) {
                    fnameURL = this.options.formsFolder +
                        "/"+templateData.properties.filename;
                }
                templateData.url = pcapi.buildUrl('editors', fnameURL);
                return dtreeTemplate(templateData);
            case 'image':
                if(this.$el.find('.fieldcontain-image').length === 0) {
                    templateData.properties["multi-image"] = templateData.properties["multi-image"] || false;
                    templateData.properties.los = templateData.properties.los || false;
                    templateData.properties.blur = templateData.properties.blur || 0;
                    return imageTemplate(templateData);
                }
                return '';
            case 'audio':
                if(this.$el.find('.fieldcontain-audio').length === 0) {
                    return audioTemplate(templateData);
                }
                return '';
            case 'gps':
                if(this.$el.find('.fieldcontain-gps').length === 0) {
                    return gpsTemplate(templateData);
                }
                return '';
            case 'warning':
                if(this.$el.find('.fieldcontain-warning').length === 0) {
                    templateData.properties.placeholder = templateData.properties.placeholder || "";
                    return warningTemplate(templateData);
                }
                return '';
            case 'section':
                return sectionTemplate(templateData);
        }
        return '';
    }

    /**
     * add move and remove buttons for each field that is render on the SD
     * @param {String} type such as text, textarea etc
     */
    addFieldButtons(type) {
        var fields = this.$el.find('.fieldcontain-'+type);
        var id = type+"-"+(fields.length);
        $(fields[fields.length - 1]).attr("id", id);
        var $id = $("#"+id);
        if(fields.length > 1 || type !== "text"){
            var buttons = '<div class="fieldButtons">' +
                  '<button type="button" class="btn btn-default '+
                      'remove-field" aria-label="Remove field">'+
                      '<span class="glyphicon '+
                      'glyphicon-remove" aria-hidden="true"></span></button>'+
                  '</div>';
            $id.append(buttons);
        }
        $id.append(addfieldTemplate({data: cfg.options}));
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
            var finds = $("#"+type+"-"+fieldcontainId).find('.'+type);

            var value = i18n.t(type+".text");
            var nextElement = '<div class="form-inline">'+
                               '<input type="text" value="'+value+'" name="'+type+'-'+fieldcontainId+'" id="checkbox-'+fieldcontainId+'" class="'+type+'">';
            if(type !== "select") {
                nextElement += '<button type="file" class="btn btn-default btn-sm upload-image" aria-label="Upload '+type+'"><span class="glyphicon glyphicon-arrow-up" aria-hidden="true"></span></button>';
            }
            nextElement += '<button type="button" class="btn btn-default btn-sm remove-'+type+'" aria-label="Remove '+type+'"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>'+
                           '<input type="file" class="image-upload" id="upload-'+type+'-'+fieldcontainId+'" style="display: none;">'+
                           '</div>';
            $(this).prev().append(nextElement);
            var i = 1;
            $("#"+type+"-"+fieldcontainId).find('.'+type).each(function(){
                $(this).prop("id", type+'-'+fieldcontainId+'-'+i);
                i++;
            });
        });

        //remove element button
        this.$el.off("click", ".remove-"+type);
        this.$el.on("click", ".remove-"+type, function() {
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
            type = $(e.target).closest('.fieldcontain').attr("id").split("-")[0];
            ///let convertor = new Convertor();
            //var title = convertor.getTitle();
            var path = "";
            if(this.options && this.options.formsFolder) {
                path = this.options.formsFolder+"/";
            }

            var options = {
                "remoteDir": "editors",
                "path": path+file.name,
                "file": file,
                "contentType": false
            };

            //COBWEB-specific
            if(this.options.copyToPublic){
                options.urlParams = {
                    'public': 'true'
                };
            }

            utils.loading(true);
            pcapi.uploadFile(options, "PUT").then($.proxy(function(data) {
                utils.loading(false);
                utils.giveFeedback(data.msg);
                var name = utils.getFilenameFromURL(data.path);
                var $formLine = $(e.target).closest('.form-inline');
                var $inputText = $formLine.find('input[type="text"]');
                $inputText.before('<img src="'+pcapi.buildUrl('editors', path+name)+'" style="width: 50px;">');
                $formLine.find('button.upload-image').remove();
            }, this));
        }, this));

        //add visibility button
        var visibility = new Visibility();
        var element = this.el;
        this.$el.off("click", ".relate");
        this.$el.on("click", ".relate", function() {
            var dataStorage = new DataStorage();
            if (dataStorage.getData() === null) {
                save.saveData(element);
            }
            visibility.showVisibilityWindow($(this).closest('.fieldcontain').attr("id"));
        });
    }

    enabledTreeEvents() {
        let $browseElement = $('.add-dtree');
        let $uploadElement = $('.upload-dtree');
        var file;
        $browseElement.unbind();
        // Set an event listener on the Choose File field.
        $browseElement.bind("change", function(e) {
            var files = e.target.files || e.dataTransfer.files;
            // Our file var now holds the selected file
            file = files[0];
            $(this).parent().next().append(file.name);
        });

        $uploadElement.unbind('click');
        $uploadElement.click($.proxy(function(){
            // TODO: When we migrate to modules get the sid & publicEditor from core
            var index = this.findHighestElement('dtree') - 1;
            var id = "dtree-"+index;
            var dtreeFname, dtreeFnameURL;
            var ext = utils.getExtension(file.name);
            if(this.options && this.options.formsFolder) {
                dtreeFname = this.options.formsFolder +'-' + index + '.' + ext;
                dtreeFnameURL = this.options.formsFolder+"/"+ dtreeFname;
            }
            else {
                dtreeFname = file.name;
                dtreeFnameURL = dtreeFname;
            }

            var options = {
                "remoteDir": "editors",
                "path": dtreeFname,
                "file": file,
                "contentType": false
            };

            //very COBWEB specific for copying over to public users
            if(this.options.copyToPublic){
                options.urlParams = {
                    'public': 'true'
                };
            }

            utils.loading(true);
            pcapi.uploadFile(options, "PUT").then($.proxy(function(result, data){
                utils.loading(false);
                utils.giveFeedback("File was uploaded");
                $("#"+id+" .btn-file").remove();
                $("#"+id+" .upload-dtree").remove();
                $("#"+id+" .btn-filename").html('<a class="dtree-url" '+
                    'href="'+pcapi.buildUrl('editors', dtreeFnameURL)+'">'+
                    dtreeFname+'</a>');
            }, this));
        }, this));
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
            var i = parseInt($(this).attr("id").split("-")[1]);
            if(i >= j) {
                j = i;
            }
        });
        return j+1;
    }

    viewHelpers() {
        return {
            'translate': function(i18nKey) {
                return i18n.t(i18nKey);
            },
            'checkGeometries': function(v, geoms) {
                if($.inArray(v, geoms) > -1){
                    return 'checked="checked"';
                }
                else{
                    return '';
                }
            },
            'check': function(v, word) {
                if(v) {
                    return word+'="'+word+'"';
                }
                else {
                    return '';
                }
            },
            'increase': function(v) {
                return v+1;
            }
        };
    }

    /**
     * upload file on the server
     * @param {String} browserElement
     * @param {String} uploadElement
     */
    uploadFile (browseElement, uploadElement) {

    }

}

export default FieldGenerator;
