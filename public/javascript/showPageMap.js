// Displays map and directions to park

mapboxgl.accessToken = mapToken

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/m2chan/ckj90jk636l0v19phv82giseq',
    center: park.geometry.coordinates,
    zoom: 9 
})

map.addControl(new mapboxgl.NavigationControl())
map.addControl(new mapboxgl.FullscreenControl());

const directions =  new MapboxDirections({
    accessToken: mapboxgl.accessToken,
    profile: 'mapbox/driving',
    controls: {
        profileSwitcher: false
    }
})

map.addControl(directions, 'top-left')

directions.setDestination(park.geometry.coordinates)

new mapboxgl.Marker()
    .setLngLat(park.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset: 25})
        .setHTML(
            `<p>${park.title}</p>`
        )
    )
    .addTo(map)




    
