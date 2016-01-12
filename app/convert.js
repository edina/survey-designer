import $ from 'jquery';
import * as utils from './utils';
import _ from 'underscore';

class Convertor {
    constructor (){
        this.form = {};
    }

    /**
     * go through the dom and find all the fieldcontains to get the equivalent
     * html and convert it to a json file
     */
    getForm ($html) {
        var c = this;
        var form = {};
        form.title = $html.find(".fieldcontain-general").find('input[name="label"]').val();
        form.geoms = [];
        form.fields = [];
        $html.find('input[name="geometryType"]:checked').each(function(){
            form.geoms.push($(this).val());
        });
        $html.find(".fieldcontain").each(function(){
            var $this = $(this);
            var field = {
                "id": $this.attr("id"),
                "type": $this.data("type"),
                "required": false,
                "persistent": false,
                "properties": {}
            };
            form.fields.push(c.fieldToJSON(field, $this));
        });
        return form;
    }

    /**
     * convert one field to a json element
     * @param {Object} field the object of the field
     * @param {Object} the html object of the fieldcontain-general
     * @returns {Object} the json object of html field
     */
    fieldToJSON (field, html) {
        field.label = html.find('input[name="label"]').val();
        switch (field.type) {
            case 'text':
                field.required = html.find('input[name="required"]').is(':checked');
                field.persistent = html.find('input[name="persistent"]').is(':checked');
                field.properties.prefix = html.find('input[name="prefix"]').val();
                field.properties.placeholder = html.find('input[name="placeholder"]').val();
                field.properties["max-chars"] = html.find('input[name="max-chars"]').val();
                break;
            case 'textarea':
                field.required = html.find('input[name="required"]').is(':checked');
                field.persistent = html.find('input[name="persistent"]').is(':checked');
                field.properties.placeholder = html.find('input[name="placeholder"]').val();
                break;
            case 'range':
                field.required = html.find('input[name="required"]').is(':checked');
                field.persistent = html.find('input[name="persistent"]').is(':checked');
                field.properties.step = html.find('input[name="step"]').val();
                field.properties.min = html.find('input[name="min"]').val();
                field.properties.max = html.find('input[name="max"]').val();
                break;
            case 'checkbox':
                field.required = html.find('input[name="required"]').is(':checked');
                field.persistent = html.find('input[name="persistent"]').is(':checked');
                field.properties.other = html.find('input[name="other"]').is(':checked');
                var checkboxes = [];

                html.find('input[name="'+field.id+'"]').each(function(event){
                    var $img = $(this).closest(".form-inline").find("img");
                    if($img.length > 0){
                        checkboxes.push([]);
                        var n = checkboxes.length-1;
                        checkboxes[n].push($(this).val());
                        checkboxes[n].push(utils.getFilenameFromURL($img.attr("src")));
                    }
                    else {
                        checkboxes.push($(this).val());
                    }
                });
                field.properties.options = checkboxes;
                break;
            case 'radio':
                field.required = html.find('input[name="required"]').is(':checked');
                field.persistent = html.find('input[name="persistent"]').is(':checked');
                field.properties.other = html.find('input[name="other"]').is(':checked');
                var radios = [];

                //go through each radio element
                html.find('input[name="'+field.id+'"]').each(function(event){
                    var $img = $(this).closest(".form-inline").find("img");
                    //if it has images next to them then save the image src as well
                    if($img.length > 0){
                        radios.push([]);
                        var n = radios.length-1;
                        radios[n].push($(this).val());
                        radios[n].push(utils.getFilenameFromURL($img.attr("src")));
                    }
                    else {
                        radios.push($(this).val());
                    }
                });
                field.properties.options = radios;
                break;
            case 'select':
                field.required = html.find('input[name="required"]').is(':checked');
                field.persistent = html.find('input[name="persistent"]').is(':checked');
                var options = [];
                html.find('input[name="'+field.id+'"]').each(function(event){
                    var $img = $(this).closest(".form-inline").find("img");
                    //if it has images next to them then save the image src as well
                    if($img.length > 0) {
                        options.push([]);
                        var n = options.length-1;
                        options[n].push($(this).val());
                        options[n].push(utils.getFilenameFromURL($img.attr("src")));
                    } else{
                        options.push($(this).val());
                    }
                });
                field.properties.options = options;
                break;
            case 'dtree':
                var $a =  html.find('.dtree-url');
                field.properties.filename = $a.text();
                break;
            case 'image':
                field.required = html.find('input[name="required"]').is(':checked');
                field.properties["multi-image"] = html.find('input[name="multi-image"]').is(':checked');
                field.properties.los = html.find('input[name="los"]').is(':checked');
                field.properties.blur = html.find('input[name="blur"]').val();
                break;
            case 'audio':
                field.required = html.find('input[name="required"]').is(':checked');
                break;
            case 'gps':
                field.required = html.find('input[name="required"]').is(':checked');
                field.properties["gps-background"] = html.find('input[name="gps-background"]').is(':checked');
                break;
            case 'warning':
                field.properties.placeholder = html.find('textarea').val();
                break;
            case 'section':
                break;
            case undefined:
                break;
        }
        return field;
    }

    /**
     * convert fetched html to JSON
     * @param html the html code of the form
     * @param title the title of the form that comes from the url
     */
    HTMLtoJSON (html, title) {
        var $form = $(html);
        var form = {};
        var layout = null;
        var section = null;
        var fieldsSelector;
        var ignoreFields;
        var self = this;

        if (title) {
            form.title = title;
        }
        else {
            form.title = $form.data('title') || '';
        }

        // Add Geometry
        form.geoms = ["point"];
        var geomValues = $form.data("record-geometry");
        if(geomValues){
            form.geoms = $form.data("record-geometry").split(",");
        }

        // Add fields
        form.fields = [];
        ignoreFields = [
            '.fieldcontain-geometryType',
            '#save-cancel-editor-buttons'
        ];
        fieldsSelector =
            '.fieldcontain' + ignoreFields
                .map(function(v){ return ':not(' + v + ')'; })
                .join('');

        $form.find(fieldsSelector).each(function(i, element){
            var $field = $(element);
            var $input;
            var required;
            var options;
            var fieldId;
            var type;
            var visibility;

            var field = null;
            var matched = /fieldcontain-(.*?)-[0-9]+$/.exec($field.attr("id"));

            if (matched === null) {
                console.log('warning: ' + $field.attr('id') + ' not supported');
                return;
            }
            var visibilityRule = $field.data("visibility");
            if (visibilityRule) {
                visibility = self.parseRule(visibilityRule);
            }

            fieldId = matched[0];
            type = matched[1];
            switch (type) {
                case 'text':
                    $input = $field.find('input');

                    field = {
                        label:      $field.find('label').text(),
                        type:       type,
                        required:   $input.attr('required') !== undefined,
                        persistent: $field.data('persistent') === 'on',
                        properties: {
                            prefix:      $input.val(),
                            placeholder: $input.attr("placeholder"),
                            'max-chars': $input.attr("maxlength")
                        }
                    };
                    break;
                case 'textarea':
                    $input = $field.find('textarea');

                    field = {
                        label:      $field.find('label').text(),
                        type:       type,
                        required:   $input.attr('required') !== undefined,
                        persistent: $field.data('persistent') === 'on',
                        properties: {
                            placeholder: $input.attr("placeholder"),
                        }
                    };
                    break;
                case 'range':
                    $input = $field.find('input');

                    field = {
                        label:      $field.find('label').text(),
                        type:       type,
                        required:   $input.attr('required') !== undefined,
                        persistent: $field.data('persistent') === 'on',
                        properties: {
                            step: $input.attr('step'),
                            min:  $input.attr('min'),
                            max:  $input.attr('max')
                        }
                    };
                    break;
                case 'checkbox':
                    $input = $field.find('input[type="checkbox"]');

                    options = $input.map(function(i, element) {
                        var $checkbox = $(element);
                        var checkbox;
                        var $img = $checkbox.prev().find('img');
                        if ($img.is('img')) {
                            checkbox = [];
                            checkbox.push($checkbox.val());
                            checkbox.push(
                                pcapi.buildFSUrl('editors', $img.attr("src"))
                            );
                        }
                        else {
                            checkbox = $checkbox.val();
                        }

                        return checkbox;
                    });

                    required = $input.is(function() {
                        return $(this).attr('required') !== undefined;
                    });

                    field = {
                        label:      $field.find('legend').text(),
                        type:       type,
                        required:   required,
                        persistent: $field.data('persistent') === 'on',
                        properties: {
                            options: Array.prototype.slice.apply(options)
                        }
                    };
                    break;
                case 'radio':
                    $input = $field.find('input[name="' + fieldId + '"]');

                    options = $input.map(function(i, element) {
                        var $radio = $(element);
                        var radio;

                        var $img = $radio.prev().find('img');
                        if ($img.is('img')) {
                            radio = [];
                            radio.push($radio.val());
                            radio.push(
                                pcapi.buildFSUrl('editors', $img.attr('src'))
                            );
                        }
                        else {
                            radio = $radio.val();
                        }

                        return radio;
                    });

                    required = $input.is(function() {
                        return $(this).attr('required') !== undefined;
                    });

                    field = {
                        label:      $field.find('legend').text(),
                        type:       type,
                        required:   required,
                        persistent: $field.data('persistent') === 'on',
                        properties: {
                            options: Array.prototype.slice.apply(options)
                        }
                    };
                    break;
                case 'select':
                    $input = $field.find('select');

                    options = $input.find('option').map(function(i, element) {
                        return $(element).val();
                    });

                    field = {
                        label:      $field.find('legend').text(),
                        type:       type,
                        required:   $input.attr('required') !== undefined,
                        persistent: $field.data('persistent') === 'on',
                        properties: {
                            options: Array.prototype.slice.apply(options)
                        }
                    };
                    break;
                case 'dtree':
                    $input = $field.find('input[type="hidden"]');

                    field = {
                        label:      $field.find('label').text(),
                        type:       type,
                        required:   false,
                        persistent: $field.data('persistent') === 'on',
                        properties: {
                            filename: $input.data('dtree')
                        }
                    };
                    break;
                case 'image':
                    $input = $field.find('input');

                    field = {
                        label:      $field.find('label').text(),
                        type:       type,
                        required:   $input.attr("required") !== undefined,
                        persistent: false,
                        properties: {
                            los: $input.attr('class') === 'camera-va',
                            'multi-image': false

                        }
                    };
                    break;
                case 'multiimage':
                    $input = $field.find('input');

                    field = {
                        label:      $field.find('label').text(),
                        type:       "image",
                        required:   $input.attr('required') !== undefined,
                        persistent: false,
                        properties: {
                            los: $input.attr('class') === 'camera-va',
                            'multi-image': true
                        }
                    };
                    break;
                case 'audio':
                    $input = $field.find('input');

                    field = {
                        label:      $field.find('label').text(),
                        type:       type,
                        required:   $input.attr('required') !== undefined,
                        persistent: false,
                        properties: {
                        }
                    };
                    break;
                case 'gps':
                    $input = $field.find('input');

                    field = {
                        label:      $field.find('label').text(),
                        type:       type,
                        required:   $input.attr('required') !== undefined,
                        persistent: false,
                        properties: {
                            'gps-background':
                                    $input.find('input[name="gps-background"]')
                                        .is(':checked')
                        }
                    };
                    break;
                case 'warning':
                    $input = $field.find('textarea');

                    field = {
                        label:      $field.find('label').text(),
                        type:       type,
                        required:   $input.attr('required') !== undefined,
                        persistent: false,
                        properties: {
                            placeholder: $input.attr("placeholder")
                        }
                    };
                    break;
                case 'section':
                    // Not a field but included here for capturing the layout
                    layout = layout || { elements: [] };
                    if (section !== null) {
                        layout.elements.push(section);
                    }

                    section = {
                        id: fieldId,
                        type: type,
                        title: $field.find('h3').text(),
                        fields: []
                    };
                    break;
            }
            if (visibility) {
                field.properties.visibility = visibility;
            }

            if (field !== null) {
                field.id = fieldId;
                form.fields.push(field);

                if(section !== null) {
                    section.fields.push(fieldId);
                }
            }
        });

        // Just add the layout if we found some sections
        if (layout !== null) {
            form.layout = layout;
        }

        return form;
    }

    /**
     * Parse a rule and returne its three components
     *
     * @params {String} rule A triplet with this structure 'fieldname operation value'
     * @returns {Object} the parsed rule as or null if is not valid
     *     - field {String} the name of the field
     *     - comparator {function} a function that represents the operation
     *     - value {String} the parsed value
     */
    parseRule(rule) {
        var field, operations, operation, value, comparator, matches;
        var fieldRegExp, opsRegExp, valueRegExp, ruleRegExp;

        operations = {
            equal: function(a, b) { return a === b; },
            notEqual: function(a, b) { return a !== b; },
            greaterThan: function(a, b) { return Number(a) > Number(b); },
            smallerThan: function(a, b) { return Number(a) < Number(b); }
        };

        // Define the parts of the rule
        fieldRegExp = '(.*)';
        opsRegExp = '((?:' + _(operations).keys().join(')|(?:') + '))';
        valueRegExp = '(?:\'(.*)\')';

        // Match the three parts of the rule separated by one or more spaces
        ruleRegExp = fieldRegExp + '\\s+' + opsRegExp + '\\s+' + valueRegExp;
        matches = (new RegExp(ruleRegExp)).exec(rule);

        if (matches && matches.length === 4) {
            field = matches[1];
            operation = matches[2];
            value = matches[3];
        }
        else {
            console.warn('Malformed rule: ' + rule);
            return null;
        }

        if (operations.hasOwnProperty(operation)) {
            comparator = operations[operation];
        }
        else {
            console.warn('Invalid operation: ' + operation);
            return null;
        }

        return {
            id: "fieldcontain-"+field,
            operator: comparator,
            answer: value
        };
    }
}

export default Convertor;
