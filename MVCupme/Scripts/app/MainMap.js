function getFilterHomer() {
    var Homer = '', filterSitio = glo.jsonHomer;
    if (glo.codMunFil != '') {
        filterSitio = turf.filter(glo.jsonHomer, 'DPTOMUN', glo.codMunFil);
    }
    return filterSitio;
}

function addMapHm() {

    waitingDialog.show();
    var homer=getFilterHomer();
    glo.lyrHomer = L.geoJson(homer, {
        //onEachFeature: onEachHomer,
        pointToLayer: function (feature, latlng) {
            var textlabel = '<h6>' +feature.properties.NOMBRE_SITIO + '</h6>' +
            '<small class="text-muted">'+feature.properties.NOMBREMUN+'</small> ';
            
            var SitioHm = L.marker(latlng, glo.MarkerHm).bindLabel(textlabel, { noHide: false, offset: [20, -40] });
            htmlpopup =
                '<div class="panel panel-primary">' +
                    '<div class="panel-heading">ALTERNATIVAS DE ENERGIZACIÓN</div>' +
                        '<div class="popupstyle">' +
                            '<button class="btn btn-primary pull-right btn-xs " data-toggle="tooltip" data-placement="left" title="Acercar" type="button" type="button" onclick="zoomHm(\'' + latlng.lng + '\',\'' + latlng.lat + '\')">' +
                                '<span class="glyphicon glyphicon-zoom-in" aria-hidden="true"></span>' +
                            '</button>' +
                            '<h5><strong  class="primary-font">' + feature.properties.NOMBRE_SITIO + '</strong><br>' +
                            '<small class="text-muted">'+feature.properties.NOMBREMUN+'</small> '+
                            '<hr><a href="http://www.upme.gov.co" target="_blank"><small>Curva:</small></a> ' + feature.properties.CUR_ID + '<br>' +
                            '<a href="http://www.upme.gov.co" target="_blank"><small>Localidad:</small></a> ' + feature.properties.LOC_ID + '<br>' +                            
                            '<small>Radiacion Solar:</small> ' + feature.properties.ID_RS + ' <br>' +
                            '<small>RD</small> ' + feature.properties.ID_RD + ' <br>' +
                            '<small>RV:</small> ' + feature.properties.ID_RV + '<br>'                             
                        '</div>' +
                    '</div>' +
                '</div>';
            SitioHm.bindPopup(htmlpopup);
            SitioHm.on('click', function (e) {
                $("#menu-holder").show();
                var filterHm = turf.filter(glo.jsonHomerData, 'ID_CENTRO_POBLADO', feature.properties.ID_CENTRO_POBLADO);
                var i=0;
                for (i = 1; i < filterHm.features.length+1; i++) {
                    var soluciones = filterHm.features[i-1].properties;
                    $('#NumSol'+i).empty().append(soluciones.ID_REG);
                    $('#iconSol'+i).empty();
                    if (soluciones.PV != 0) {
                        $('#iconSol'+i).append('<span><img src="images/Homer/solar.png" class="img_sol" />' + soluciones.PV + '</span><label class="sol_divi">|</label>');
                    }
                    if (soluciones.G3 != 0) {
                        $('#iconSol'+i).append('<span><img src="images/Homer/eolica.png" class="img_sol" />' + soluciones.G3 + '</span><label class="sol_divi">|</label>');
                    }
                    if (soluciones.GD_KW != 0) {
                        $('#iconSol'+i).append('<span><img src="images/Homer/diesel.png" class="img_sol" />' + soluciones.GD_KW + '</span><label class="sol_divi">|</label>');
                    }
                    if (soluciones.BATERIAS != 0) {
                        $('#iconSol'+i).append('<span><img src="images/Homer/baterias.png" class="img_sol" />' + soluciones.BATERIAS + '</span><label class="sol_divi">|</label>');
                    }
                    $('#solCi'+i).empty().append(numeral(soluciones.CAPITAL_INICIAL).format('0,0'));
                    $('#solCo'+i).empty().append(numeral(soluciones.COSTO_OPERACION).format('0,0'));
                    $('#solCs'+i).empty().append(numeral(soluciones.TOTAL_CPN).format('0,0'));
                    $('#solCn'+i).empty().append(numeral(soluciones.COE).format('0,0'));
                    $('#solRen'+i).empty().append(numeral(soluciones.FRACCION_RENOVABLE).format('0,0'));
                }            

                    

            });
            SitioHm.on('popupclose', function (e) {
                $("#menu-holder").hide();
            });
            SitioHm.on('popupopen', function (e) {
                map.panTo(latlng);
            });
            return SitioHm;
        }        
    });
    if (map.hasLayer(glo.HmCluster)) {
        glo.HmCluster.clearLayers();
        glo.HmCluster.addLayer(glo.lyrHomer);

    } else {
        glo.HmCluster.addLayer(glo.lyrHomer);
        if (!map.hasLayer(glo.HmCluster)) {
            map.addLayer(glo.HmCluster);
        }
    }
    waitingDialog.hide();

}

