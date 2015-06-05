import $ from 'jquery';
import draggable from 'jquery-ui';
import droppable from 'jquery-ui';
import sortable from 'jquery-ui';

class DragDropper {
    constructor (){
        //super();
        this.draggable = "#dragme li";
        this.droppable = ".mobile-content";
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
            drop: function(event, ui){
                console.log("drop me here")
                //var action = new Action(choices, bformer.id, bformer.getElements());
                //action.addElement(ui.draggable.children().text());
                //bformer.updateSyncStatus(false);
                //if($("#iframe").length > 0){
                //    $("#iframe").remove();
                //}
            }
        });
    }

    enableSorting() {
        $(this.droppable).sortable({items: "div.fieldcontain", handle: '.handle', change: function(event, ui){
            console.log('enable sorting')
            //bformer.updateSyncStatus(false);
        }});
    }
}

export default DragDropper;