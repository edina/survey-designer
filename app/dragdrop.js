import $ from 'jquery';
import draggable from 'jquery-ui';
import droppable from 'jquery-ui';
import sortable from 'jquery-ui';
import FieldGenerator from './field_generate'

class DragDropper {
    constructor (myClass){
        //super();
        this.draggable = "#dragme li";
        this.droppable = "."+myClass;
    }

    enableDrag() {
        $(this.draggable).draggable({
            appendTo: "body",
            helper: "clone",
            iframeFix: true,
            start: function(event, ui){
                console.log('start dragging')
            }
        });
    }

    enableDrop() {
        $(this.droppable).droppable({
            activeClass: "ui-state-default",
            hoverClass: "ui-state-hover",
            accept: ":not(.ui-sortable-helper)",
            drop: $.proxy(function(event, ui){
                let fieldGenerator = new FieldGenerator(this.droppable);
                fieldGenerator.render(ui.draggable.children().attr("title"));
                $(this.droppable).css("background-image", "none");
            }, this)
        });
    }

    enableSorting() {
        $(this.droppable).sortable({items: ".fieldcontain", handle: '.sortit', change: function(event, ui){
            console.log('enable sorting')
            //bformer.updateSyncStatus(false);
        }});
    }
}

export default DragDropper;