import Backbone from 'backbone';
import _ from 'underscore';
import DragDropper from 'js/dragdropes6';

export class MenuView extends Backbone.View {

    initialize () {
        this.$el = $("#wrapper");
        this.render();
    }

    render () {
        //this.$el.html(template);
        var optionsData = {"options": [
            "text",
            "range",
            "textarea",
            "checkbox",
            "radio",
            "select",
            "photo",
            "audio",
            "warning",
            "los",
            "gps",
            "dtree"
        ]
        };
        $.ajax({
            url: '/templates/menu.html'
        }).done($.proxy(function(data){
            this.$el.html(_.template(data)(optionsData));
            var dragdropper = new DragDropper();
            dragdropper.enableDrag();
        }, this));
        
        return this;
    }

}