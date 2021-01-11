// Displays full page map

mapboxgl.accessToken = mapToken

const map = new mapboxgl.Map({
    container: 'full-map',
    style: 'mapbox://styles/m2chan/ckj90jk636l0v19phv82giseq',
    center: [-96.789803, 46.877186],
    zoom: 3
})

map.addControl(new mapboxgl.NavigationControl())

let geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl
})
     
document.getElementById('geocoder').appendChild(geocoder.onAdd(map))

for (let park of parks.features) {
    const popUpText = park.properties.popUpText
    let pinColor = '#05668d'
    if (park.rating === 'Top Rated') {
        pinColor = '#ffc107'
    }
    new mapboxgl.Marker({
        color: pinColor
    })
        .setLngLat(park.geometry.coordinates)
        .setPopup(
            new mapboxgl.Popup({offset: 25})
            .setHTML(
                popUpText
            )
        )
        .addTo(map)
}