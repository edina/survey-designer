var $ = require('jquery');

require('jquery-ui/draggable');
require('jquery-ui/droppable');
require('jquery-ui/sortable');

module.exports = function DragDropper() {
    var draggable = "#dragme li",
        droppable = ".mobile-content";

    this.enableDrag = function() {
        $(draggable).draggable({
            appendTo: "body",
            helper: "clone",
            iframeFix: true,
            start: function(event, ui){
                console.log('start dragging')
            }
        });
    }

    this.enableDrop = function() {
        $(droppable).droppable({
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

    this.enableSorting = function() {
        $(droppable).sortable({items: "div.fieldcontain", handle: '.handle', change: function(event, ui){
            console.log('enable sorting')
            //bformer.updateSyncStatus(false);
        }});
    }
}