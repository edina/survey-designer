import L from 'leaflet';
import modal from 'bootstrap';
import draw from 'leaflet-draw';
import * as utils from './utils';


class Mapper {
    constructor () {

    }

    initialize () {
        this.createModalMap();
        this.initMap();
    }

    createModalMap () {
        let modalId = "map-modal";
        let modalButton = '<button type="button" class="btn btn-primary"'+
            ' data-toggle="modal" data-target="#'+modalId+'">'+
            'Define bbox</button>';

        if(document.getElementById(modalId) === null) {
            let options = {
                "id": modalId,
                "title": "Map",
                "body": "<div id='map-parent'><div id='map'></div></div>",
                "footer": "",
                "size": "modal-lg"
            };
            document.body.insertAdjacentHTML('afterbegin',
                utils.makeModalWindow(options));
            let d1 = document.getElementsByClassName('fieldcontain-general');
            d1[0].insertAdjacentHTML('beforeEnd', modalButton);
        }

        $('#'+modalId).on('shown.bs.modal', $.proxy(function (e) {
            this.map.invalidateSize(true);
        }, this));
    }

    initMap () {
        let map = L.map('map').setView([51.505, -0.09], 13);

        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Initialise the FeatureGroup to store editable layers
        var drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);

        // Initialise the draw control and pass it the FeatureGroup of editable layers
        var drawControl = new L.Control.Draw({
            edit: {
                featureGroup: drawnItems
            }
        });
        map.addControl(drawControl);
        this.map = map;
    }
}

export default Mapper;
