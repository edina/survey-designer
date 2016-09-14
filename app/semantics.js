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

            if(control.required){
                $("#" + id + " input[name='required']").attr('checked','checked');
            }

            // create attribute for profile
            $('#add-attribute').click();

            // create each option
            $.each(control.entries, function(i, option){
                $('#' + id + ' .add-radio').click();
                $('#add-attribute').click();
            });

            // pouplate profile attribute
            $("input[name='attribute-key']").eq(0).val(profile.profiles[0].url);
            $("input[name='attribute-value']").eq(0).val("profile")

            $.each(control.entries, function(i, option){
                let n = i + 1;

                // populate each option
                let oId = id + '-' + n;
                $('#' + oId).val(option.label);

                // create attribute entries
                $("input[name='attribute-key']").eq(n).val(option.id);
                $("input[name='attribute-value']").eq(n).val(option.label);
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
