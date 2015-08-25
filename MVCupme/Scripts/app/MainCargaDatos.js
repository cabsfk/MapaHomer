
function getDto(Dpto) {
    var filDpto = turf.filter(glo.jsonDto, 'CODIGO_DEP', Dpto);
    if (filDpto.features.length > 0) {
        return filDpto.features[0].properties.NOMBRE;
    } else {
        return "Revise cod Dept";
    }
    
}

function getMunDto(Dpto, Mun) {
    var filDpto = turf.filter(glo.jsonDto, 'CODIGO_DEP', Dpto);
    var textMun = Dpto + Mun;
    var filMpio = turf.filter(glo.jsonMun, 'MPIO_CCNCT', textMun);
    return filMpio.features[0].properties.MPIO_CNMBR +', '+ filDpto.features[0].properties.NOMBRE;
}

function addHmGeo(){
    $.each(glo.jsonHomer.features, function (index, value) {
        var filterSitio = turf.filter(glo.jsonSitios, 'ID_CENTRO_POBLADO', value.properties.ID_CENTRO_POBLADO);
        var Sitio=JSON.parse(JSON.stringify(filterSitio.features[0]));
        value.geometry = Sitio.geometry;
        value.properties.DPTOMUN = Sitio.properties.COD_DPTO + Sitio.properties.COD_MPIO;
        value.properties.NOMBREMUN = getMunDto(Sitio.properties.COD_DPTO, Sitio.properties.COD_MPIO)
        value.properties.NOMBRE_SITIO = Sitio.properties.NOMBRE_SITIO;
    });
   // console.log(glo.jsonHomer);
    
}
function styleDpto(feature) {
    return {
        weight: 1.5,
        color: '#3B0B0B',
        dashArray: '2',
        fillOpacity: 0.2,
        fillColor: 'white',
    };
};
function getData() {
    var queryDeptSimpli = L.esri.Tasks.query({
        url: config.dominio + config.urlHostSimpl + 'MapServer/' + config.SimplDpto
    });

    queryDeptSimpli
        .fields(['CODIGO_DEP', 'NOMBRE'])
        .orderBy(['CODIGO_DEP']);
    queryDeptSimpli.where("1=1").run(function (error, jsonDto) {
        glo.jsonDto = jsonDto;
        var lyrDto = L.geoJson(glo.jsonDto, {
            style: styleDpto
        });

        lyrDto.addTo(map);

        var queryMunSimpli = L.esri.Tasks.query({
            url: config.dominio + config.urlHostSimpl + 'MapServer/' + config.SimplMpio
        });
        
        queryMunSimpli
          .returnGeometry(false)
          .fields(['DPTO_CCDGO', 'MPIO_CCDGO', 'MPIO_CCNCT', 'MPIO_CNMBR'])
          .orderBy(['MPIO_CCNCT']);
        queryMunSimpli.where("1=1").run(function (error, jsonMun) {
            glo.jsonMun = jsonMun;
            var querySitios = L.esri.Tasks.query({
                url: config.dominio + config.urlHostHomer + 'MapServer/' + config.HmSitios
            }).returnGeometry(true)
            .fields(['ID_CENTRO_POBLADO', 'COD_DPTO', 'COD_MPIO', 'NOMBRE_SITIO'])
            .orderBy(['ID_CENTRO_POBLADO']);
            querySitios.run(function (error, jsonSitios) {
                glo.jsonSitios = jsonSitios;
                var queryHomerSitios = L.esri.Tasks.query({
                    url: config.dominio + config.urlHostHomer + 'MapServer/' + config.HmPIEC
                }).fields(['ID_CENTRO_POBLADO', 'CUR_ID','LOC_ID','ID_RS','ID_RD','ID_RV'])
                .where("1=1")
                .returnGeometry(false);
                queryHomerSitios.params.returnDistinctValues = true;
                //'&returnDistinctValues=true' 
                //console.log(queryHomerSitios);
                queryHomerSitios.where("1='1'").returnGeometry(false).run(function (error, jsonHomer) {
                    glo.jsonHomer = jsonHomer;
                    //console.log(glo.jsonHomer);
                    
                    var queryHomerData = L.esri.Tasks.query({
                        url: config.dominio + config.urlHostHomer + 'MapServer/' + config.HmPIEC
                    }).fields(['ID_CENTRO_POBLADO', 'ID_HOMER','ID_REG','PV','G3','GD_KW','BATERIAS'
                        ,'CONVERTIDOR','CAPITAL_INICIAL','COSTO_OPERACION','TOTAL_CPN','COE','FRACCION_RENOVABLE','DIESEL','GD_HRS'])
                        .where("1=1")
                        .returnGeometry(false)
                        .orderBy('ID_REG', 'DESC');
                    queryHomerData.params.returnDistinctValues = true;
                            //'&returnDistinctValues=true' 
                    //console.log(queryHomerData);
                    queryHomerData.where("1='1'").returnGeometry(false).run(function (error, jsonHomer) {
                        glo.jsonHomerData = jsonHomer;
                        addHmGeo();
                        addMapHm();
                    });
                                
                });
            });
        });
   });
}

getData();

$("#BuscarMapa").click(function () {
    //console.log("Busco");
    legend.removeFrom(map);
    getFondosData();
});