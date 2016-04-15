import Mapper from './map';
import * as utils from './utils';

class BBox {

    constructor (options) {
        this.bbox;
        this.mapper = new Mapper(options);
        this.mapId = options.id;
    }

    initialize () {
        let modalId = "map-modal";
        let modalButton = '<button type="button" class="btn btn-primary"'+
            ' data-toggle="modal" id="define-bbox" data-target="#'+modalId+'">'+
            'Define bbox</button>';

        //initialize only once
        if(document.getElementById(modalId) === null) {
            let options = {
                'id': modalId,
                'title': 'Map',
                'body': '<div id="map-parent"><div id="'+this.mapId+'"></div></div>',
                'footer': '',
                "size": "modal-lg"
            };
            document.body.insertAdjacentHTML('afterbegin',
                utils.makeModalWindow(options));

            let map = this.mapper.initMap();
            this.mapper.addDrawControl();
            $('#'+modalId).on('shown.bs.modal', $.proxy(function (e) {
                map.invalidateSize(false);
            }, this));
        }

        let d1 = document.getElementsByClassName('fieldcontain-general')[0];
        d1.insertAdjacentHTML('beforeend', modalButton);

    }

}

export default BBox;
