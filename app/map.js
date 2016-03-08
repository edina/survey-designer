import L from 'leaflet';
import modal from 'bootstrap';
import draw from 'leaflet-draw';
import * as utils from './utils';
import DataStorage from './data';


class Mapper {
    constructor () {
        this.dataStorage = new DataStorage();
        this.bbox;
        this.map;
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
                'id': modalId,
                'title': 'Map',
                'body': '<div id="map-parent"><div id="map"></div></div>',
                'footer': '',
                "size": "modal-lg"
            };
            document.body.insertAdjacentHTML('afterbegin',
                utils.makeModalWindow(options));
            let d1 = document.getElementsByClassName('fieldcontain-general')[0]
                .getElementsByClassName('add-button');
            d1[0].insertAdjacentHTML('beforeBegin', modalButton);
        }

        $('#'+modalId).on('shown.bs.modal', $.proxy(function (e) {
            this.map.invalidateSize(false);
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
                this.dataStorage.addField("bbox", layer.toGeoJSON());
                drawnItems.addLayer(layer);
            }
        }, this));
        //if layer already exists, delete is not working by clicking on it
        //so a solution was to to clear the layer after clicking save on delete
        map.on('draw:deleted', $.proxy(function(e){
            this.dataStorage.removeField("bbox");
            drawnItems.clearLayers();
        }, this));

        this.bbox = this.dataStorage.getField("bbox");
        if(this.bbox) {
            var layer = L.geoJson(this.bbox);
            drawnItems.addLayer(layer);
        }
        this.map = map;
    }
}

export default Mapper;
