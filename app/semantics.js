import * as utils from './utils';

class Semantics {
    constructor(fieldGenerator){
        this.fieldGenerator = fieldGenerator;
    }

    showAssistant(){
        let id = 'smartassist';
        let options = {
            "id": id,
            "title": "Smart Assistant",
            "body": "",
            "footer": "",
            "size": ""
        };
        $("body").append(utils.makeModalWindow(options));
        $('#' + id).modal('show');

        COBWEB.smartAssistant('.modal-body', $.proxy(function(profile){
            this.readProfile(profile);
            $('#' + id).modal('hide');
        }, this));
    }

    readProfile(profile){
        $.each(profile.requirements, $.proxy(function(i, control){
            // create radio button field
            let id = this.fieldGenerator.render({
                'type': 'radio',
                'label': control.label
            });

            // create each option
            $.each(control.entries, function(i, option){
                $('#' + id + ' .add-radio').click();
                $('#add-attribute').click();
            });

            $.each(control.entries, function(i, option){
                let n = i + 1;

                // populate each option
                let oId = id + '-' + n;
                $('#' + oId).val(option.label);

                // create attribute entries
                $("input[name='attribute-key']").eq(i).val(option.id);
                $("input[name='attribute-value']").eq(i).val(option.label);
            });
        }, this))
    }

    readProfileFromUrl(url){
        $.ajax({
            url: url,
            cache: false,
            success: $.proxy(this.readProfile, this),
            error: function(err){
                console.warn("Problem with " + url);
                console.warn(err);
            }
        });
    }
}

export default Semantics;
