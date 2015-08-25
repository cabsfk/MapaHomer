﻿
//Servicios Informacion Fondos.\\

var config = {
    dominio: "http://arcgis.simec.gov.co:6080", //Dominio del arcgis server  "http://localhost:6080" //http://arcgis.simec.gov.co:6080
    urlHostHomer: "/arcgis/rest/services/UPME_EN/UPME_EN_PIEC_Homer/",
    urlHostDP: "/arcgis/rest/services/UPME_BC/UPME_BC_Sitios_UPME_Division_Politica/",
    urlHostSimpl: '/arcgis/rest/services/UPME_FO/UPME_FO_Indicadores_Proyecto/',
    HmSitios: "0",
    HmPIEC: "1",
    SimplMpio: "0",
    SimplDpto: "1"
}

var glo = {
    jsonDto: '',
    jsonMun: '',
    jsonSitios: '',
    jsonHomer: '',
    jsonHomerData:'',
    lyrHomer: '',
    codMunFil:'',
    MarkerHm: { icon: L.AwesomeMarkers.icon({ icon: 'header', prefix: 'fa', markerColor: 'orange' }), riseOnHover: true },
    HmCluster: L.markerClusterGroup({
        disableClusteringAtZoom: 13,
        maxClusterRadius: 60,
        iconCreateFunction: function (cluster) {
            var count = cluster.getChildCount();
            var digits = (count + '').length;
            return new L.DivIcon({
            html: count,
            className: 'cluster digits-' + digits,
            iconSize: null
            });
        }
    })

}

/***********************************
 // CONFIGURACION DE MAPA
 ***********************************/
var southWest = L.latLng(-15, -90),
    northEast = L.latLng(30, -60),
    bounds = L.latLngBounds(southWest, northEast);

var map = L.map('map', {
    center: [4.12521648, -74.5020],
    zoom: 5,
    minZoom: 5,
    maxZoom:11,
    maxBounds: bounds,
    zoomControl: false
});

new L.Control.Zoom({ position: 'topright' }).addTo(map);

/*********************************
//CONFIGURACION DE FORMATO
**********************************/
var legend = L.control({ position: 'bottomright' });
var pagina = document.URL.split("/");
var Nombrepagina = pagina[pagina.length - 1];
Nombrepagina = Nombrepagina.replace("#", "");
var prefijo = "";
if (Nombrepagina == "") {
    prefijo = "./";
}else{
    prefijo = "../";
}

function getColor(d) {
    return d >= glo.breaks[5] ? '#FC4E2A' :
            d >= glo.breaks[4] ? '#FD8D3C' :
            d >= glo.breaks[3] ? '#FEB24C' :
            d >= glo.breaks[2] ? '#FED976' :
            d >= glo.breaks[1] ? '#FFEDA0' :
              'rgba(255,255,255,0.8)';
}

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    div.innerHTML += '<i ><img src="/MapaHomer/images/leyend/Homer.png" height="18px"></i> Sitio Homer<br>';
    div.innerHTML += '<i ><img src="/MapaHomer/images/leyend/Cluster.png" height="18px"></i> Agrupaciones<br>';
    div.innerHTML += '<i ><img src="/MapaHomer/images/leyend/municipioSelecionado.png"  height="17px"></i>Municipio <br> Seleccionado<br>';
    return div;
};
legend.addTo(map);
$("#BtnMonstrarConven").click(function () {
    if ($(".legend").is(":visible")) {
        $(".legend").hide("slow", function () {
            $("#textlegend").empty().append("Mostrar");
        });
    } else {
        $(".legend").show("slow", function () {
            $("#textlegend").empty().append("Ocultar");
        });
    }
    
});


Array.prototype.unique = function (a) {
    return function () { return this.filter(a) }
}(function (a, b, c) {
    return c.indexOf(a, b + 1) < 0
});



/*********************************
//CAPAS BASE 
**********************************/

// Activacion de carousel
$('.carousel').carousel({
    interval: 7000
});

var OpenMapSurfer_Roads = L.tileLayer('http://openmapsurfer.uni-hd.de/tiles/roads/x={x}&y={y}&z={z}', {
    minZoom: 0,
    maxZoom: 20,
    attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var LyrBase = L.esri.basemapLayer('Imagery').addTo(map);;
var LyrLabels;

function setBasemap(basemap) {
    if (map.hasLayer(LyrBase)) {
        map.removeLayer(LyrBase);
    }
    if (basemap != "OSM") {
        LyrBase = L.esri.basemapLayer(basemap);
    } else {
        LyrBase = OpenMapSurfer_Roads;
    }
    map.addLayer(LyrBase);
    $(".esri-leaflet-logo").hide();
    $(".leaflet-control-attribution").hide();
}

$("#BaseESRIStreets, #BaseESRISatellite, #BaseESRITopo, #BaseOSM").click(function () {
    setBasemap($(this).attr('value'));
})

$(".esri-leaflet-logo").hide();
$(".leaflet-control-attribution").hide();

var osm2 = L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}', {
    type: 'map',
    ext: 'jpg',
    attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: '1234'
});

var miniMap = new L.Control.MiniMap(osm2, { toggleDisplay: true, width: 190, height: 90, zoomLevelOffset: -6 });

//miniMap.addTo(map);

var promptIcon = ['glyphicon-fullscreen'];
var hoverText = ['Extensión Total'];
var functions = [function () {
    map.setView([4.12521648, -74.5020], 5);
}];


$(function () {
    for (i = 0; i < promptIcon.length ; i++) {
        var funk = 'L.easyButton(\'' + promptIcon[i] + '\', <br/>              ' + functions[i] + ',<br/>             \'' + hoverText[i] + '\'<br/>            )'
        $('#para' + i).append('<pre>' + funk + '</pre>')
        explaination = $('<p>').attr({ 'style': 'text-align:right;' }).append('This created the <i class="' + promptIcon[i] + (promptIcon[i].lastIndexOf('fa', 0) === 0 ? ' fa fa-lg' : ' glyphicon') + '"></i> button.')
        $('#para' + i).append(explaination)
        L.easyButton(promptIcon[i], functions[i], hoverText[i])
    } (i);
});

/*
$('#date_ini').datetimepicker({
    format: 'DD/MM/YYYY',
    locale: 'es',
    defaultDate: '01/01/' + moment().format('YYYY')
});
$('#date_fin').datetimepicker({
    format: 'DD/MM/YYYY',
    locale: 'es',
    defaultDate: moment()
});*/

function zoomHm(x, y) {
    var latLng = L.latLng(y, x);
    map.setView(latLng, 14);
}

$("#panel_superDerecho").hide();
$("#menu-holder").hide();

waitingDialog.show();
/*

var query_Mineral = L.esri.Tasks.query({
    url: config.dominio + config.urlHostDataMA + 'MapServer/'+config.EP_MINERALES
});

query_Mineral.where("1='1'").returnGeometry(false).run(function (error, featureCollection) {
    var data = [];
    $.each(featureCollection.features.reverse(), function (index, value) {
        data[value.properties.ID_MINERAL ] = value.properties.NOMBRE ;
    });
    glo.textMineral = data;
});



var query_Estudio = L.esri.Tasks.query({
    url: config.dominio + config.urlHostDataMA + 'MapServer/' + config.EP_ESTUDIOS
});

query_Estudio.where("1='1'").returnGeometry(false).run(function (error, featureCollection) {
    var data = [];
    $.each(featureCollection.features.reverse(), function (index, value) {
        data[value.properties.ID_ESTUDIO] = value.properties.NOMBRE + ' ( ' + value.properties.ANIO+' ) ';
    });
    glo.listEstudio = data;
});*/





$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    var idnewtab = ($(e.target).attr('href'));
    $(idnewtab + "Color").addClass("text-primary");

    var idoldtab = ($(e.relatedTarget).attr('href'));
    $(idoldtab + "Color").removeClass("text-primary");

});

$(function () {
  /*  $('[data-toggle="tooltip"]').tooltip();
    $("#SelctRestricciones").multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        selectAllText: 'Todos',
        enableCaseInsensitiveFiltering: true,
        dropRight: false,
        buttonWidth: '250px',
        
        filterPlaceholder: 'Buscar...',
        buttonText: function (options, select) {
            
            glo.ArrayRestric = [];
            if (options.length === 0) {
                if (glo.ArrayOfertas != '') {
                    getParametroFilter();
                }
                
                return 'No hay Seleccionados';
            }
            else {
                var labels = [];
                options.each(function () {
                    console.log($(this).attr('value'));
                    glo.ArrayRestric.push($(this).attr('value'));
                    if ($(this).attr('label') !== undefined) {
                        labels.push($(this).attr('label'));
                    }
                    else {
                        labels.push($(this).html());
                    }
                });
                getParametroFilter();
                return labels.join(', ') + '';
            }
        }
    });*/
 });
