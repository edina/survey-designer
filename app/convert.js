import $ from 'jquery';
import FieldGenerator from '../field_generate'

class Convertor {
    constructor (myClass){
        //super();
        this.form = {};
    }

    getForm () {
        var c = this;
        this.form.title = $(".fieldcontain-general").find('input[name="label"]').val();
        var geoms = [];
        $('input[name="geometryType"]:checked').each(function(){
            geoms.push($(this).val());
        });
        this.form.geoms = geoms;
        $(".fieldcontain").each(function(){
            var id = $(this).attr("id");
            if(id !== undefined){
                c.fieldToJSON(id);
            }
        });
        return this.form;
    }

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
                this.form[id]["persistentValue"] = $fieldId.find('input[name="persistent"]').is(':checked');
                this.form[id]["max-chars"] = $fieldId.find('input[name="max-chars"]').val();
                break;
            case 'textarea':
                this.form[id]["label"] = $fieldId.find('input[name="label"]').val();
                this.form[id]["placeholder"] = $fieldId.find('input[name="placeholder"]').val();
                this.form[id]["required"] = $fieldId.find('input[name="required"]').is(':checked');
                this.form[id]["persistentValue"] = $fieldId.find('input[name="persistent"]').is(':checked');
                break;
            case 'range':
                this.form[id]["label"] = $fieldId.find('input[name="label"]').val();
                this.form[id]["placeholder"] = $fieldId.find('input[name="placeholder"]').val();
                this.form[id]["required"] = $fieldId.find('input[name="required"]').is(':checked');
                this.form[id]["step"] = $fieldId.find('input[name="step"]').val();
                this.form[id]["min"] = $fieldId.find('input[name="min"]').val();
                this.form[id]["max"] = $fieldId.find('input[name="max"]').val();
                break;
            case 'checkbox':
                this.form[id]["label"] = $fieldId.find('input[name="label"]').val();
                this.form[id]["required"] = $fieldId.find('input[name="required"]').is(':checked');
                var checkboxes = {};
                $fieldId.find('input[name="'+id+'"]').each(function(event){
                    checkboxes[$(this).attr("id")] = $(this).val();
                });
                this.form[id]["checkboxes"] = checkboxes;
                break;
            case 'radio':
                this.form[id]["label"] = $fieldId.find('input[name="label"]').val();
                this.form[id]["required"] = $fieldId.find('input[name="required"]').is(':checked');
                var radios = {};
                $fieldId.find('input[name="'+id+'"]').each(function(event){
                    radios[$(this).attr("id")] = $(this).val();
                });
                this.form[id]["radios"] = radios;
                break;
            case 'select':
                this.form[id]["label"] = $fieldId.find('input[name="label"]').val();
                this.form[id]["required"] = $fieldId.find('input[name="required"]').is(':checked');
                this.form[id]["persistentValue"] = $fieldId.find('input[name="persistent"]').is(':checked');
                var options = [];
                $fieldId.find('option').each(function(event){
                    options.push($(this).val());
                });
                this.form[id]["options"] = options;
                break;
            case 'dtree':
                var $a =  $fieldId.find('a');
                this.form[id]["filename"] = $a.text();
                break;
            case 'image':
                this.form[id]["label"] = $fieldId.find('input[name="label"]').val();
                this.form[id]["required"] = $fieldId.find('input[name="required"]').is(':checked');
                this.form[id]["multi-image"] = $fieldId.find('input[name="multi-image"]').is(':checked');
                this.form[id]["los"] = $fieldId.find('input[name="los"]').is(':checked');
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
            case undefined:
                break;
        }
        return '';
    }

    JSONtoHTML (form) {
        if(form){
            this.form = form;
        }
        console.log(this.form)
        var html = [];
        //add title
        html.push('<form data-title=\"'+this.form.title+'\" data-ajax=\"false\" novalidate>\n')

        //add geometry
        html.push('<div class="fieldcontain fieldcontain-geometryType" id="fieldcontain-geometryType" data-cobweb-type="geometryType">');
        html.push('<input type="hidden" data-record-geometry="'+this.form.geoms.join(",")+'" value="'+this.form.geoms.join(",")+'">');
        html.push('</div>');

        $.each(this.form, function(key, value){
            var splits = key.split("-");
            var type = splits[1];
            var n = splits[0];

            var required = "";
            if(value.required){
                required = "required";
            }
            switch (type) {
                case 'text':
                    html.push('<div class="fieldcontain" id="'+key+'" data-fieldtrip-type="'+type+'">');
                    html.push('<label for="form-'+type+'-'+n+'">'+value.label+'</label>');
                    html.push('<input name="form-'+type+'-'+n+'" id="form-'+type+'-'+n+
                              '" type="text" required="'+required+'" placeholder="'+value.placeholder+
                              '" maxlength="'+value["max-chars"]+'" value="'+value.prefix+'">');
                    html.push('</div>');
                    break;
                case 'textarea':
                    html.push('<div class="fieldcontain" id="'+key+'" data-fieldtrip-type="'+type+'">');
                    html.push('<label for="form-'+type+'-'+n+'">'+value.label+'</label>');
                    html.push('<textarea name="form-'+type+'-'+n+'" id="form-'+type+'-'+n+
                              '" required="'+required+'" placeholder="'+value.placeholder+
                              '"></textarea>');
                    html.push('</div>');
                    break;
                case 'range':
                    html.push('<div class="fieldcontain" id="'+key+'" data-fieldtrip-type="'+type+'">');
                    html.push('<label for="form-'+type+'-'+n+'">'+value.label+'</label>');
                    html.push('<input name="form-'+type+'-'+n+'" id="form-'+type+'-'+n+
                              '" type="range" required="'+required+'" placeholder="'+value.placeholder+
                              '" step="'+value.step+'" min="'+value.min+'" max="'+value.max+'">');
                    html.push('</div>');
                    break;
                case 'checkbox':
                    html.push('<div class="fieldcontain" id="'+key+'" data-fieldtrip-type="'+type+'">');
                    html.push('<fieldset><legend>'+value.label+'</legend>');
                    $.each(value.checkboxes, function(k, v){
                        html.push('<label for="'+k+'">'+v+'</label>');
                        html.push('<input name="form-'+type+'-'+n+'" id="'+k+'" value="'+v+'" type="'+type+'" required="'+required+'">');
                    });
                    html.push('</fieldset></div>');
                    break;
                case 'radio':
                    html.push('<div class="fieldcontain" id="'+key+'" data-fieldtrip-type="'+type+'">');
                    html.push('<fieldset><legend>'+value.label+'</legend>');
                    $.each(value.radios, function(k, v){
                        html.push('<label for="'+k+'">'+v+'</label>');
                        html.push('<input name="form-'+type+'-'+n+'" id="'+k+'" value="'+v+'" type="'+type+'" required="'+required+'">');
                    });
                    html.push('</fieldset></div>');
                    break;
                case 'select':
                    html.push('<div class="fieldcontain" id="'+key+'" data-fieldtrip-type="'+type+'">');
                    html.push('<fieldset><legend>'+value.label+'</legend>');
                    if(required !== ""){
                        html.push('<select id="'+key+'" required="required">');
                        html.push('<option value=""></option>');
                    }
                    else{
                        html.push('<select id="'+key+'">');
                    }
                    $.each(value.options, function(k, v){
                        html.push('<option value="'+v+'">'+v+'</option>');
                    });
                    html.push('</select></fieldset></div>');
                    break;
                case 'dtree':
                    html.push('<div class="fieldcontain" id="'+key+'" data-fieldtrip-type="'+type+'">');
                    html.push('<fieldset><label for="form-'+type+'-'+n+'">'+value.filename+'</label>');
                    html.push('<div class="button-wrapper button-dtree"></div>');
                    html.push('</fieldset>');
                    html.push('<input type="hidden" data-dtree="'+value.filename+'" value="'+value.filename+'">');
                    html.push('</div>');
                    break;
                case 'image':
                    var cl = "camera";
                    if(value["multi-image"] === true){
                        type = 'multiimage';
                    }
                    if(value.los === true){
                        cl = "camera-va";
                    }
                    html.push('<div class="fieldcontain" id="fieldcontain-'+type+'-1" data-fieldtrip-type="'+cl+'">');
                    html.push('<div class="button-wrapper button-'+cl+'">');
                    html.push('<input name="form-image-1" id="form-image-1" type="file" accept="image/png" capture="'+cl+'" required="'+required+'" class="'+cl+'">')
                    html.push('<label for="form-image-1">'+value.label+'</label>');
                    html.push('</div></div>');
                    break;
                case 'audio':
                    html.push('<div class="fieldcontain" id="fieldcontain-audio-1" data-fieldtrip-type="microphone">');
                    html.push('<div class="button-wrapper button-microphone">');
                    html.push('<input name="form-audio-1" id="form-audio-1" type="file" accept="audio/*" capture="microphone" required="" class="microphone">');
                    html.push('<label for="form-audio-1">'+value.label+'</label>');
                    html.push('</div></div>');
                    break;
                case 'gps':
                    
                    break;
                case 'warning':
                    html.push('<div class="fieldcontain" id="'+key+'" data-fieldtrip-type="'+type+'">');
                    html.push('<label for="form-'+type+'-'+n+'">'+value.label+'</label>');
                    html.push('<textarea name="form-'+type+'-'+n+'" id="form-'+type+'-'+n+
                              '" required="'+required+'" placeholder="'+value.placeholder+
                              '"></textarea>');
                    html.push('</div>');
                    break;
            }
        });
        html.push('<div id="save-cancel-editor-buttons" class="fieldcontain ui-grid-a">');
        html.push('<div class="ui-block-a">');
        html.push('<input type="submit" name="record" value="Save">');
        html.push('</div>');
        html.push('<div class="ui-block-b">');
        html.push('<input type="button" name="cancel" value="Cancel">');
        html.push('</div>');
        html.push('</div>');
        html.push('</form>');
        return html;
    }

    HTMLtoEDIT (html, title) {
        var $form = $(html);
        console.log($form)
        $form.find(".fieldcontain").each(function(){
            console.log($(this).attr("id"));
            var type = $(this).attr("id").split("-")[1];
            fieldGenerator.render(type);
        });
    }

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
                    form[id]["persistent"] = $this.data("persistent-on");
                    form[id]["max-chars"] = $input.prop("maxlength");
                    break;
                case 'textarea':
                    form[id]["label"] = $this.find('label').text();
                    var $input = $this.find('textarea');
                    form[id]["placeholder"] = $input.prop("placeholder");
                    form[id]["required"] = $input.prop("required");
                    form[id]["persistent"] = $input.data("persistent-on");
                    break;
                case 'range':
                    form[id]["label"] = $this.find('label').text();
                    var $input = $this.find('input');
                    form[id]["placeholder"] = $input.prop("placeholder");
                    form[id]["required"] = $input.prop("required");
                    form[id]["step"] = $input.prop("step");
                    form[id]["min"] = $input.prop("min");
                    form[id]["max"] = $input.prop("max");
                    break;
                case 'checkbox':
                    form[id]["label"] = $this.find('legend').text();
                    var checkboxes = [];
                    var required;
                    $this.find('input[type="checkbox"]').each(function(){
                        checkboxes.push($(this).val());
                        required = $(this).attr("required");
                    });
                    form[id]["required"] = required;
                    form[id]["checkboxes"] = checkboxes;
                    break;
                case 'radio':
                    form[id]["label"] = $this.find('legend').text();
                    var radios = [];
                    var required;
                    $this.find('input[name="'+id+'"]').each(function(event){
                        radios.push($(this).val());
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
                    form[id]["filename"] = $this.find('input[type="hidden"]').val();
                    break;
                case 'image':
                    form[id]["label"] = $this.find('label').text();
                    var $input = $this.find('input');
                    form[id]["required"] = $input.prop("required");
                    form[id]["multi-image"] = false;
                    form[id]["los"] = ($input.find('.camera-va').length === 1);
                    break;
                case 'multiimage':
                    form[id]["label"] = $this.find('label').text();
                    var $input = $this.find('input');
                    form[id]["required"] = $input.prop("required");
                    form[id]["multi-image"] = true;
                    form[id]["los"] = ($input.find('.camera-va').length === 1);
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
                case undefined:
                    break;
            }
        });
        return form;
    }
}

export default Convertor;