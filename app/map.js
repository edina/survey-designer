import L from 'leaflet';
import modal from 'bootstrap';
import draw from 'leaflet-draw';
//import omnivore from 'leaflet-omnivore';
import * as utils from './utils';
import DataStorage from './data';


class Mapper {
    constructor (options) {
        this.mapId = options.id;
        this.lat = options.lat || 51.505;
        this.lng = options.lng || -0.09;
        this.zoom = options.zoom || 12;
        this.layers = {};
    }

    initMap () {
        let map = L.map(this.mapId, {
            center: new L.LatLng(this.lat, this.lng),
            zoom: this.zoom,
            zoomControl: false
        });

        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        var zoomControl = L.control.zoom({
            position: 'topright'
        });
        map.addControl(zoomControl);
        this.map = map;

        return map;
    }

    addDrawControl () {
        // Initialise the FeatureGroup to store editable layers
        let drawnItems = new L.FeatureGroup();
        let dataStorage = new DataStorage();
        this.map.addLayer(drawnItems);

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
        this.map.addControl(drawControl);
        this.map.on('draw:created', $.proxy(function (e) {
            if(Object.keys(drawnItems._layers).length === 0) {
                var layer = e.layer;
                dataStorage.addField("bbox", layer.toGeoJSON());
                drawnItems.addLayer(layer);
            }
        }, this));
        //if layer already exists, delete is not working by clicking on it
        //so a solution was to to clear the layer after clicking save on delete
        this.map.on('draw:deleted', $.proxy(function(e){
            dataStorage.removeField("bbox");
            drawnItems.clearLayers();
        }, this));

        let bbox = dataStorage.getField("bbox");
        if(bbox) {
            var layer = L.geoJson(bbox);
            drawnItems.addLayer(layer);
        }
    }

    addKMLLayer (layerName, layerUrl) {
        let layer = omnivore.kml(layerUrl).addTo(this.map);
        this.layers[layerName] = layer;
    }

    getLayer(layerName) {
        return this.layers[layerName];
    }

    removeLayer (layerName) {
        this.map.removeLayer(this.layers[layerName]);
    }
}

export default Mapper;
