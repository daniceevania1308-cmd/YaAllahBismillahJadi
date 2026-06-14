// ==========================
// MAP
// ==========================

var map = L.map('map').setView([-8.1, 112.6], 10);

// OSM
var osm = L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
{
    attribution:'© OpenStreetMap'
}
).addTo(map);

// Satellite
var satellite = L.tileLayer(
'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
{
    attribution:'Esri'
}
);

var baseMaps = {
    "OpenStreetMap": osm,
    "Satellite": satellite
};

L.control.layers(baseMaps).addTo(map);

// ==========================
// COLOR CTPI
// ==========================

function getColor(value){

    return value > 0.60 ? '#00441b' :
           value > 0.55 ? '#238b45' :
           value > 0.50 ? '#41ab5d' :
           value > 0.45 ? '#74c476' :
           value > 0.40 ? '#a1d99b' :
                          '#edf8e9';
}

// ==========================
// CHART
// ==========================

var chart = new Chart(
document.getElementById("chart"),
{
    type:'bar',
    data:{
        labels:[
            'CTPI',
            'Carbon',
            'CO₂'
        ],
        datasets:[{
            label:'Nilai',
            data:[0,0,0]
        }]
    }
});


// ==========================
// UPDATE INFO
// ==========================

function updateInfo(props){

    document.getElementById("info").innerHTML = `

    <h3>${props.NAMOBJ}</h3>

    <p><b>Kecamatan:</b> ${props.WADMKC}</p>

    <p><b>CTPI:</b> ${props.CTPIMEAN_m.toFixed(3)}</p>

    <p><b>Kelas:</b> ${props.KELAS_CTPI}</p>

    <p><b>Total Carbon:</b>
    ${Number(props.TOTAL_CARB).toLocaleString()}
    </p>

    <p><b>Total CO₂:</b>
    ${Number(props.TOTAL_CO2).toLocaleString()}
    </p>
    `;

    chart.data.datasets[0].data = [
        props.CTPIMEAN_m,
        props.TOTAL_CARB,
        props.TOTAL_CO2
    ];

    chart.update();
}


// ==========================
// STYLE
// ==========================

function style(feature){

    return{
        fillColor:getColor(feature.properties.CTPIMEAN_m),
        weight:1,
        color:'white',
        fillOpacity:0.8
    };
}


// ==========================
// HIGHLIGHT
// ==========================

function highlightFeature(e){

    var layer = e.target;

    layer.setStyle({
        weight:3,
        color:'#000'
    });

    updateInfo(layer.feature.properties);
}

function resetHighlight(e){
    geojson.resetStyle(e.target);
}

function onEachFeature(feature, layer){

    layer.on({
        mouseover:highlightFeature,
        mouseout:resetHighlight,
        click:highlightFeature
    });

    layer.bindPopup(`
        <b>${feature.properties.NAMOBJ}</b><br>
        CTPI :
        ${feature.properties.CTPIMEAN_m.toFixed(3)}
    `);
}


// ==========================
// LOAD GEOJSON
// ==========================

var geojson;

fetch('data/carbon_trade.geojson')
.then(response => response.json())
.then(data => {

    geojson = L.geoJSON(data,{
        style:style,
        onEachFeature:onEachFeature
    }).addTo(map);

    map.fitBounds(geojson.getBounds());

});


// ==========================
// LEGEND
// ==========================

var legend = L.control({position:'bottomright'});

legend.onAdd = function(){

    var div = L.DomUtil.create('div','info legend');

    var grades = [
        0.40,
        0.45,
        0.50,
        0.55,
        0.60
    ];

    for(var i=0; i<grades.length; i++){

        div.innerHTML +=
        '<i style="background:' +
        getColor(grades[i]+0.01) +
        '; width:18px; height:18px; display:inline-block;"></i> ' +
        grades[i] +
        '<br>';
    }

    return div;
};

legend.addTo(map);