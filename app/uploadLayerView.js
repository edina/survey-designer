import Backbone from 'backbone';
import * as utils from './utils';
import pcapi from 'pcapi';
import Mapper from './map';
import sidePanelTemplate from './templates/sidebar.jst!';

/* global cfg, i18n */

export class UploadLayerView extends Backbone.View {

    initialize () {
        let params = utils.getParams();
        this.options = {};
        if(params) {
            this.options.copyToPublic = (params.public === 'true');
        }
        pcapi.init({
            "url": cfg.baseurl,
            "version": cfg.version
        });
        pcapi.setCloudLogin(cfg.userid);
        $('#header-menu li').removeClass('active');
        $('#header-menu li a[href="#/upload-layer"]').parent().addClass('active');
        this.mapper = new Mapper({id:'mapLayer'});
        this.render();
    }

    createLayersList () {
        utils.loading(true);
        let options = {
            "remoteDir": "features"
        };
        pcapi.getItems(options).then($.proxy(function(data){
            utils.loading(false);
            let list = '<ul class="list-group">';
            data.metadata.forEach(function(element, index){
                let layerName = element.replace("/features//", "");
                list += '<li class="list-group-item"> '+
                    '<input type="checkbox" class="map-layer" value="'+layerName+'">'+
                    layerName+
                    '</li>';
            });
            list += '</ul>';
            $("#features").html(list);
        }, this));
    }

    render () {
        let mapId = 'mapLayer';
        $("#content").html('<div id="sidebar"></div>'+
            '<div id="'+mapId+'">'+
            '<button type="button" class="btn-custom btn btn-default popover-hover" '+
            'id="showHidePanel" data-content="Hide/Reveal Search Panel">'+
            '<span class="glyphicon glyphicon-chevron-left"></span>'+
            '</button>'+
            '</div>'
        );
        this.map = this.mapper.initMap();
        this.enableEvents();

        $("#sidebar").html(sidePanelTemplate());

        this.createLayersList();
    }

    displayLayer () {
        $(document).off('change', '.map-layer');
        $(document).on('change', '.map-layer', $.proxy(function(event){
            let $currentTarget = $(event.currentTarget);
            let layerName = $currentTarget.val();

            if ($currentTarget.is(":checked")) {
                this.mapper.addKMLLayer(layerName, pcapi.buildUrl('features', layerName));
            }
            else{
                this.mapper.removeLayer(layerName);
            }
        }, this));
    }

    enableEvents () {
        this.showHidePanel();
        this.uploadLayer();
        this.displayLayer();
    }

    showHidePanel () {
        $(document).off('click', "#showHidePanel");
        $(document).on('click', "#showHidePanel", $.proxy(function() {
            $('#sidebar').toggle();
            $("#showHidePanel span").toggleClass("glyphicon-chevron-left glyphicon-chevron-right");
            this.map.invalidateSize();
            return false;
        }, this));
    }

    uploadLayer () {
        //upload image/file button
        $(document).off("click", ".upload-layer");
        $(document).on("click", ".upload-layer", function(){
            $(this).next().trigger('click');
        });

        //when image-uplaod changes upload the actual file to the server
        $(document).off("change", ".layer-upload");
        $(document).on("change", ".layer-upload", $.proxy(function(e){
            var files = e.target.files || e.dataTransfer.files;
            // Our file var now holds the selected file
            var file = files[0];

            var path = "";

            var options = {
                "remoteDir": "features",
                "path": path+file.name,
                "file": file,
                "contentType": false
            };

            //COBWEB-specific
            if(this.options.copyToPublic){
                options.urlParams = {
                    'public': 'true'
                };
            }

            utils.loading(true);
            pcapi.uploadFile(options, "PUT").then($.proxy(function(data) {
                utils.loading(false);
                utils.giveFeedback(data.msg);
                var name = utils.getFilenameFromURL(data.path);
                console.log(name)
            }, this));
        }, this));
    }

}
