import $ from 'jquery';
import textTemplate from '../templates/text-fieldset.hbs!';
import textareaTemplate from '../templates/textarea-fieldset.hbs!';

class FieldGenerator {
    constructor (el){
        //super();
        this.$el = $(el);
    }

    render(type) {
        this.$el.append(this.createField(type));
        this.addFieldButtons(type);
    }

    createField(type) {
        var result;
        switch (type) {
            case 'text':
                return textTemplate();
                break;
            case 'textarea':
                return textareaTemplate();
                break;
        }
        return result;
    }

    addFieldButtons(type) {
        var fields = this.$el.find('.fieldcontain-'+type);
        var id = "fieldcontain-"+type+"-"+(fields.length);
        $(fields[fields.length - 1]).attr("id", id);
        var buttons = '<div class="fieldButtons">' +
                      '<button type="button" class="btn btn-default" aria-label="Justify"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>'+
                      '<div class="btn btn-default sortit" aria-label="Justify"><span class="glyphicon glyphicon-sort" aria-hidden="true"></span></div>'+
                      '</div>';
        $("#"+id).append(buttons);
    }

}

export default FieldGenerator;