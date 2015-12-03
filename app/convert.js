import $ from 'jquery';
import FieldGenerator from './field_generate';
import * as utils from './utils';

class Convertor {
    constructor (){
        this.form = {};
    }

    /**
     * go through the dom and find all the fieldcontains to get the equivalent
     * html and convert it to a json file
     */
    getForm (html) {
        var $html = $(html);
        var c = this;
        this.form = {};
        this.form.title = $html.filter(".fieldcontain-general").find('input[name="label"]').val();
        var geoms = [];
        $html.find('input[name="geometryType"]:checked').each(function(){
            geoms.push($(this).val());
        });
        this.form.geoms = geoms;
        $html.filter(".fieldcontain").each(function(){
            var id = $(this).attr("id");
            if(id !== undefined){
                c.fieldToJSON(id);
            }
        });
        return this.form;
    }

    /**
     * convert one field to a json element
     * @param id {String} the id of the fieldcontain
     */
    fieldToJSON (id){
        var type = id.split("-")[1];
        var $fieldId = $("#"+id);
        this.form[id] = {};
        switch (type) {
            case 'text':
                this.form[id]["label"] = $fieldId.find('input[name="label"]').val();
                this.form[id]["prefix"] = $fieldId.find('input[name="prefix"]').val();
                this.form[id]["placeholder"] = $fieldId.find('input[name="placeholder"]').val();
                this.form[id]["required"] = $fieldId.find('input[name="required"]').is(':checked');
                this.form[id]["persistent"] = $fieldId.find('input[name="persistent"]').is(':checked');
                this.form[id]["max-chars"] = $fieldId.find('input[name="max-chars"]').val();
                break;
            case 'textarea':
                this.form[id]["label"] = $fieldId.find('input[name="label"]').val();
                this.form[id]["placeholder"] = $fieldId.find('input[name="placeholder"]').val();
                this.form[id]["required"] = $fieldId.find('input[name="required"]').is(':checked');
                this.form[id]["persistent"] = $fieldId.find('input[name="persistent"]').is(':checked');
                break;
            case 'range':
                this.form[id]["label"] = $fieldId.find('input[name="label"]').val();
                this.form[id]["placeholder"] = $fieldId.find('input[name="placeholder"]').val();
                this.form[id]["required"] = $fieldId.find('input[name="required"]').is(':checked');
                this.form[id]["persistent"] = $fieldId.find('input[name="persistent"]').is(':checked');
                this.form[id]["step"] = $fieldId.find('input[name="step"]').val();
                this.form[id]["min"] = $fieldId.find('input[name="min"]').val();
                this.form[id]["max"] = $fieldId.find('input[name="max"]').val();
                break;
            case 'checkbox':
                this.form[id]["label"] = $fieldId.find('input[name="label"]').val();
                this.form[id]["required"] = $fieldId.find('input[name="required"]').is(':checked');
                this.form[id]["persistent"] = $fieldId.find('input[name="persistent"]').is(':checked');
                this.form[id]["other"] = $fieldId.find('input[name="other"]').is(':checked');
                var checkboxes = [];

                $fieldId.find('input[name="'+id+'"]').each(function(event){
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
                this.form[id]["checkboxes"] = checkboxes;
                break;
            case 'radio':
                this.form[id]["label"] = $fieldId.find('input[name="label"]').val();
                this.form[id]["required"] = $fieldId.find('input[name="required"]').is(':checked');
                this.form[id]["persistent"] = $fieldId.find('input[name="persistent"]').is(':checked');
                this.form[id]["other"] = $fieldId.find('input[name="other"]').is(':checked');
                var radios = [];

                //go through each radio element
                $fieldId.find('input[name="'+id+'"]').each(function(event){
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
                this.form[id]["radios"] = radios;
                break;
            case 'select':
                this.form[id]["label"] = $fieldId.find('input[name="label"]').val();
                this.form[id]["required"] = $fieldId.find('input[name="required"]').is(':checked');
                this.form[id]["persistent"] = $fieldId.find('input[name="persistent"]').is(':checked');
                var options = [];
                $fieldId.find('input[name="'+id+'"]').each(function(event){
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
                this.form[id]["options"] = options;
                break;
            case 'dtree':
                var $a =  $fieldId.find('a');
                this.form[id]["label"] = $fieldId.find('input[name="label"]').val();
                this.form[id]["filename"] = $a.text();
                break;
            case 'image':
                this.form[id]["label"] = $fieldId.find('input[name="label"]').val();
                this.form[id]["required"] = $fieldId.find('input[name="required"]').is(':checked');
                this.form[id]["multi-image"] = $fieldId.find('input[name="multi-image"]').is(':checked');
                this.form[id]["los"] = $fieldId.find('input[name="los"]').is(':checked');
                this.form[id]["blur"] = $fieldId.find('input[name="blur"]').val();
                break;
            case 'audio':
                this.form[id]["label"] = $fieldId.find('input[name="label"]').val();
                this.form[id]["required"] = $fieldId.find('input[name="required"]').is(':checked');
                break;
            case 'gps':
                this.form[id]["label"] = $fieldId.find('input[name="label"]').val();
                this.form[id]["required"] = $fieldId.find('input[name="required"]').is(':checked');
                this.form[id]["gps-background"] = $fieldId.find('input[name="gps-background"]').is(':checked');
                break;
            case 'warning':
                this.form[id]["label"] = $fieldId.find('input[name="label"]').val();
                this.form[id]["placeholder"] = $fieldId.find('textarea').val();
                break;
            case 'section':
                this.form[id]["label"] = $fieldId.find('input[name="label"]').val();
                break;
            case undefined:
                break;
        }
        return '';
    }

    /**
     * convert JSON to html
     * @param form the html content of the form
     */
    JSONtoHTML (form) {
        if(form){
            this.form = form;
        }
        var html = [];
        //add title
        this.form.title = this.form.title.replace('"', '&quot;')
        html.push('<form data-title=\"'+this.form.title+'\" data-ajax=\"false\" novalidate>\n')

        //add geometry
        html.push('<div class="fieldcontain fieldcontain-geometryType" id="fieldcontain-geometryType" data-cobweb-type="geometryType">\n');
        html.push('<input type="hidden" data-record-geometry="'+this.form.geoms.join(",")+'" value="'+this.form.geoms.join(",")+'">\n');
        html.push('</div>\n');

        $.each(this.form, function(key, value){
            var splits = key.split("-");
            var type = splits[1];
            var n = splits[2];

            var required = "";
            if(value.required) {
                required = 'required="required"';
            }
            var persistent = "";
            if(value.persistent) {
                persistent = 'data-persistent="on"';
            }
            var visibility = "";
            if(value.visibility) {
                visibility = 'data-visibility="'+value.visibility.id.replace("fieldcontain-", "")+' '+value.visibility.rule+' \''+value.visibility.answer+'\'"';
            }
            switch (type) {
                case 'text':
                    html.push('<div class="fieldcontain" id="'+key+'" data-fieldtrip-type="'+type+'" '+persistent+' '+visibility+'>\n');
                    html.push('<label for="form-'+type+'-'+n+'">'+value.label+'</label>\n');
                    html.push('<input name="form-'+type+'-'+n+'" id="form-'+type+'-'+n+
                              '" type="text" '+required+' placeholder="'+value.placeholder+
                              '" maxlength="'+value["max-chars"]+'" value="'+value.prefix+'">\n');
                    html.push('</div>\n');
                    break;
                case 'textarea':
                    html.push('<div class="fieldcontain" id="'+key+'" data-fieldtrip-type="'+type+'" '+persistent+' '+visibility+'>\n');
                    html.push('<label for="form-'+type+'-'+n+'">'+value.label+'</label>\n');
                    html.push('<textarea name="form-'+type+'-'+n+'" id="form-'+type+'-'+n+
                              '" '+required+' placeholder="'+value.placeholder+
                              '"></textarea>\n');
                    html.push('</div>\n');
                    break;
                case 'range':
                    html.push('<div class="fieldcontain" id="'+key+'" data-fieldtrip-type="'+type+'" '+persistent+' '+visibility+'>\n');
                    html.push('<label for="form-'+type+'-'+n+'">'+value.label+'</label>\n');
                    html.push('<input name="form-'+type+'-'+n+'" id="form-'+type+'-'+n+
                              '" type="range" '+required+' placeholder="'+value.placeholder+
                              '" step="'+value.step+'" min="'+value.min+'" max="'+value.max+'">\n');
                    html.push('</div>\n');
                    break;
                case 'checkbox':
                    html.push('<div class="fieldcontain" id="'+key+'" data-fieldtrip-type="'+type+'" '+persistent+' '+visibility+'>\n');
                    html.push('<fieldset>\n<legend>'+value.label+'</legend>\n');
                    $.each(value.checkboxes, function(k, v){
                        if(typeof(v) === "object"){
                            html.push('<label for="'+key+'-'+k+'">\n');
                            html.push('<div class="ui-grid-a grids">\n');
                            html.push('<div class="ui-block-a"><p>'+v[0]+'</p></div>\n');
                            html.push('<div class="ui-block-b"><img src="'+utils.getFilenameFromURL(v[1])+'"></div>\n');
                            html.push('</label>');
                            html.push('<input name="'+key+'-'+k+'" id="'+key+'-'+k+'" value="'+v[0]+'" type="'+type+'" '+required+'>\n');
                        }
                        else {
                            html.push('<label for="'+key+'-'+k+'">'+v+'</label>\n');
                            html.push('<input name="'+key+'-'+k+'" id="'+key+'-'+k+'" value="'+v+'" type="'+type+'" '+required+'>\n');
                        }
                    });
                    if (value.other === true) {
                        html.push('<label for="'+key+'-'+value.checkboxes.length+'" class="other">' + i18n.t('checkbox.other')  + '</label>\n');
                        html.push('<input name="'+key+'" id="'+key+'-'+value.checkboxes.length+'" value="other" class="other" type="'+type+'" '+required+'>\n');
                    }
                    html.push('</fieldset>\n</div>\n');
                    break;
                case 'radio':
                    html.push('<div class="fieldcontain" id="'+key+'" data-fieldtrip-type="'+type+'" '+persistent+' '+visibility+'>\n');
                    html.push('<fieldset>\n<legend>'+value.label+'</legend>\n');
                    $.each(value.radios, function(k, v){
                        if(typeof(v) === "object"){
                            html.push('<label for="'+key+'-'+k+'">\n');
                            html.push('<div class="ui-grid-a grids">\n');
                            html.push('<div class="ui-block-a"><p>'+v[0]+'</p></div>\n');
                            html.push('<div class="ui-block-b"><img src="'+utils.getFilenameFromURL(v[1])+'"></div>\n');
                            html.push('</label>');
                            html.push('<input name="'+key+'" id="'+key+'-'+k+'" value="'+v[0]+'" type="'+type+'" '+required+'>\n');
                        }
                        else {
                            html.push('<label for="'+key+'-'+k+'">'+v+'</label>\n');
                            html.push('<input name="'+key+'" id="'+key+'-'+k+'" value="'+v+'" type="'+type+'" '+required+'>\n');
                        }
                    });
                    if (value.other === true) {
                        html.push('<label for="'+key+'-'+value.radios.length+'" class="other">' + i18n.t('radio.other')  + '</label>\n');
                        html.push('<input name="'+key+'" id="'+key+'-'+value.radios.length+'" value="other" class="other" type="'+type+'" '+required+'>\n');
                    }
                    html.push('</fieldset>\n</div>\n');
                    break;
                case 'select':
                    html.push('<div class="fieldcontain" id="'+key+'" data-fieldtrip-type="'+type+'" '+persistent+' '+visibility+'>\n');
                    html.push('<fieldset>\n<legend>'+value.label+'</legend>\n');
                    if(required !== ""){
                        html.push('<select name="'+key+'" required="required">\n');
                        html.push('<option value=""></option>\n');
                    }
                    else{
                        html.push('<select id="'+key+'">\n');
                    }
                    $.each(value.options, function(k, v){
                        html.push('<option value="'+v+'">'+v+'</option>\n');
                    });
                    html.push('</select>\n</fieldset>\n</div>\n');
                    break;
                case 'dtree':
                    html.push('<div class="fieldcontain" id="'+key+'" data-fieldtrip-type="'+type+'" '+visibility+'>\n');
                    html.push('<fieldset>\n<label for="form-'+type+'-'+n+'">'+value.label+'</label>\n');
                    html.push('<div class="button-wrapper button-dtree"></div>\n');
                    html.push('</fieldset>\n');
                    html.push('<input type="hidden" data-dtree="'+value.filename+'" value="'+value.filename+'">\n');
                    html.push('</div>\n');
                    break;
                case 'image':
                    var cl = "camera";
                    if(value["multi-image"] === true){
                        type = 'multiimage';
                    }
                    if(value.los === true){
                        cl = "camera-va";
                    }
                    html.push('<div class="fieldcontain" id="fieldcontain-'+type+'-1" data-fieldtrip-type="'+cl+'" '+visibility+'>\n');
                    html.push('<div class="button-wrapper button-'+cl+'">\n');
                    html.push('<input name="form-image-1" id="form-image-1" type="file" accept="image/png" capture="'+cl+'" '+required+' class="'+cl+'">\n')
                    html.push('<label for="form-image-1">'+value.label+'</label>\n');
                    html.push('<div style="display:none;" id="blur-threshold" value="' + value.blur + '"></div>');
                    html.push('</div>\n</div>\n');
                    break;
                case 'audio':
                    html.push('<div class="fieldcontain" id="fieldcontain-audio-1" data-fieldtrip-type="microphone" '+visibility+'>\n');
                    html.push('<div class="button-wrapper button-microphone">\n');
                    html.push('<input name="form-audio-1" id="form-audio-1" type="file" accept="audio/*" capture="microphone" '+required+' class="microphone">\n');
                    html.push('<label for="form-audio-1">'+value.label+'</label>\n');
                    html.push('</div>\n</div>\n');
                    break;
                case 'gps':

                    break;
                case 'warning':
                    html.push('<div class="fieldcontain" id="'+key+'" data-fieldtrip-type="'+type+'">\n');
                    html.push('<label for="form-'+type+'-'+n+'">'+value.label+'</label>\n');
                    html.push('<textarea name="form-'+type+'-'+n+'" id="form-'+type+'-'+n+
                              '" '+required+' placeholder="'+value.placeholder+
                              '"></textarea>\n');
                    html.push('</div>\n');
                    break;
                case 'section':
                    html.push('<div class="fieldcontain" id="'+key+'" data-fieldtrip-type="'+type+'">\n');
                    html.push('<h3>'+value.label+'</h3>\n');
                    html.push('</div>\n');
                    break;
            }
        });
        html.push('<div id="save-cancel-editor-buttons" class="fieldcontain ui-grid-a">\n');
        html.push('<div class="ui-block-a">\n');
        html.push('<input type="submit" name="record" value="Save">\n');
        html.push('</div>\n');
        html.push('<div class="ui-block-b">\n');
        html.push('<input type="button" name="cancel" value="Cancel">\n');
        html.push('</div>\n');
        html.push('</div>\n');
        html.push('</form>');
        return html;
    }

    /**
     * convert fetched html to JSON
     * @param html the html code of the form
     * @param title the title of the form that comes from the url
     */
    HTMLtoJSON (html, title) {
        var $form = $(html);
        var form = {};
        form.title = title;
        form.geoms = ["point"];
        var geomValues = $form.data("record-geometry");
        if(geomValues){
            form.geoms = $form.data("record-geometry").split(",");
        }
        $form.find(".fieldcontain").each(function(){
            var $this = $(this);
            var id = $this.attr("id");
            var type = $this.attr("id").split("-")[1];
            form[id] = {};
            switch (type) {
                case 'text':
                    form[id]["label"] = $this.find('label').text();
                    var $input = $this.find('input');
                    form[id]["prefix"] = $input.val();
                    form[id]["placeholder"] = $input.prop("placeholder");
                    form[id]["required"] = $input.prop("required");
                    form[id]["persistent"] = $this.data("persistent");
                    form[id]["max-chars"] = $input.prop("maxlength");
                    break;
                case 'textarea':
                    form[id]["label"] = $this.find('label').text();
                    var $input = $this.find('textarea');
                    form[id]["placeholder"] = $input.prop("placeholder");
                    form[id]["required"] = $input.prop("required");
                    form[id]["persistent"] = $this.data("persistent");
                    break;
                case 'range':
                    form[id]["label"] = $this.find('label').text();
                    var $input = $this.find('input');
                    form[id]["placeholder"] = $input.prop("placeholder");
                    form[id]["required"] = $input.prop("required");
                    form[id]["persistent"] = $this.data("persistent");
                    form[id]["step"] = $input.prop("step");
                    form[id]["min"] = $input.prop("min");
                    form[id]["max"] = $input.prop("max");
                    break;
                case 'checkbox':
                    form[id]["label"] = $this.find('legend').text();
                    form[id]["persistent"] = $this.data("persistent");
                    var checkboxes = [];
                    var required;
                    $this.find('input[type="checkbox"]').each(function(){
                        var ch;
                        var $img = $(this).prev().find('img');
                        if($img.is('img')) {
                            ch = [];
                            ch.push($(this).val());
                            ch.push(pcapi.buildFSUrl('editors', $img.attr("src")));
                        }
                        else {
                            ch = $(this).val();
                        }
                        checkboxes.push(ch);
                        required = $(this).attr("required");
                    });
                    form[id]["required"] = required;
                    form[id]["checkboxes"] = checkboxes;
                    break;
                case 'radio':
                    form[id]["label"] = $this.find('legend').text();
                    form[id]["persistent"] = $this.data("persistent");
                    var radios = [];
                    var required;
                    $this.find('input[name="'+id+'"]').each(function(event){
                        var rd;
                        var $img = $(this).prev().find('img');
                        if($img.is('img')) {
                            rd = [];
                            rd.push($(this).val());
                            rd.push(pcapi.buildFSUrl('editors', $img.attr("src")));
                        }
                        else {
                            rd = $(this).val();
                        }
                        radios.push(rd);
                        required = $(this).attr("required");
                    });
                    form[id]["required"] = required;
                    form[id]["radios"] = radios;
                    break;
                case 'select':
                    form[id]["label"] = $this.find('legend').text();
                    form[id]["required"] = $this.find('select').prop("required");
                    var options = [];
                    $this.find('option').each(function(event){
                        options.push($(this).val());
                    });
                    form[id]["options"] = options;
                    break;
                case 'dtree':
                    form[id]["label"] = $this.find('label').text();
                    form[id]["filename"] = $this.find('input[type="hidden"]').data('dtree');
                    break;
                case 'image':
                    form[id]["label"] = $this.find('label').text();
                    var $input = $this.find('input');
                    form[id]["required"] = $input.prop("required");
                    form[id]["multi-image"] = false;
                    form[id]["los"] = ($input.attr('class') === 'camera-va');
                    break;
                case 'multiimage':
                    form[id]["label"] = $this.find('label').text();
                    var $input = $this.find('input');
                    form[id]["required"] = $input.prop("required");
                    form[id]["multi-image"] = true;
                    form[id]["los"] = ($input.attr('class') === 'camera-va');
                    break;
                case 'audio':
                    form[id]["label"] = $this.find('label').text();
                    var $input = $this.find('input');
                    form[id]["required"] = $input.prop("required");
                    break;
                case 'gps':
                    form[id]["label"] = $this.find('label').text();
                    var $input = $this.find('input');
                    form[id]["required"] = $input.prop("required");
                    form[id]["gps-background"] = $fieldId.find('input[name="gps-background"]').is(':checked');
                    break;
                case 'warning':
                    form[id]["label"] = $this.find('label').text();
                    var $input = $this.find('textarea');
                    form[id]["placeholder"] = $input.prop("placeholder");
                    break;
                case 'section':
                    form[id]["label"] = $this.find('h3').text();
                    break;
                case undefined:
                    break;
            }
        });
        return form;
    }
}

export default Convertor;
