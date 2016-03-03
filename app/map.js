import L from 'leaflet';
import modal from 'bootstrap';
import draw from 'leaflet-draw';
import * as utils from './utils';
import DataStorage from './data';


class Mapper {
    constructor () {
        this.geometry;
        this.map;
    }

    initialize () {
        this.createModalMap();
        this.initMap();
    }

    createModalMap () {
        let dataStorage = new DataStorage();
        let modalId = "map-modal";
        let modalButton = '<button type="button" class="btn btn-primary"'+
            ' data-toggle="modal" data-target="#'+modalId+'">'+
            'Define bbox</button>';

        if(document.getElementById(modalId) === null) {
            let options = {
                'id': modalId,
                'title': 'Map',
                'body': '<div id="map-parent"><div id="map"></div></div>',
                'footer': '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button><button type="button" class="btn btn-primary" id="save-bbox">Save changes</button>',
                "size": "modal-lg"
            };
            document.body.insertAdjacentHTML('afterbegin',
                utils.makeModalWindow(options));
            let d1 = document.getElementsByClassName('fieldcontain-general');
            d1[0].insertAdjacentHTML('beforeEnd', modalButton);
        }

        $('#'+modalId).on('shown.bs.modal', $.proxy(function (e) {
            this.map.invalidateSize(false);
        }, this));

        $(document).off('click', '#save-bbox');
        $(document).on('click', '#save-bbox', $.proxy(function(){
            dataStorage.addField("geometry", this.geometry);
            $('#'+modalId).modal('hide');
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
            draw: {
                position: 'topleft',
                polygon: false,
                polyline: false,
                circle: false,
                marker: false
            },
            edit: {
                featureGroup: drawnItems,
                edit: true
            }
        });
        map.addControl(drawControl);
        map.on('draw:created', $.proxy(function (e) {
            if(Object.keys(drawnItems._layers).length === 0) {
                var layer = e.layer;
                this.geometry = layer.toGeoJSON().geometry;
                drawnItems.addLayer(layer);
            }
        }, this));
        this.map = map;
    }
}

export default Mapper;
