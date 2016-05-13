import Mapper from './map';
import * as utils from './utils';

class BBox {

    /**
     * A class for making a map for defining the BBOX of a survey
     * @constructor
     * @param {object} options.mapper - The base map object
     * @param {mapId} options.id - The id of the map
     */
    constructor (options) {
        this.bbox;
        this.mapper = new Mapper(options);
        this.mapId = options.id;
    }

    /**
     * initialize the button and map modal
     */
    initialize () {
        let modalId = "map-modal";
        //html code of button that will fire up the map modal
        let modalButton = '<button type="button" class="btn btn-primary"'+
            ' data-toggle="modal" id="define-bbox" data-target="#'+modalId+'">'+
            'Define bbox</button>';

        //initialize only once, check if modal exists
        if(document.getElementById(modalId) === null) {
            let options = {
                'id': modalId,
                'title': 'Map',
                'body': '<div id="map-parent"><div id="'+this.mapId+'"></div></div>',
                'footer': '',
                "size": "modal-lg"
            };
            //append html to body
            document.body.insertAdjacentHTML('afterbegin',
                utils.makeModalWindow(options));

            //initialize map
            let map = this.mapper.initMap();
            //add draw control
            this.mapper.addDrawControl();
            //resize map when modal window opens
            $('#'+modalId).on('shown.bs.modal', $.proxy(function (e) {
                map.invalidateSize(false);
            }, this));
        }

        let d1 = document.getElementsByClassName('fieldcontain-general')[0];
        d1.insertAdjacentHTML('beforeend', modalButton);

    }

}

export default BBox;
