/* eslint-disable */
console.log('hello from the client side');
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoieWFmZXR0IiwiYSI6ImNrMnA1ZHZreTAwcXAzaXJ1bHUwb3AwZ2wifQ.YtAIrMMgT2UQFohwbNkKBw';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/yafett/ck2p69fsu13if1cllzv9jw1y7',
  scrollZoom: false
  /*   center: [-118.113491, 34.111745],
  zoom: 10,
  interactive: false */
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {
  // create marker
  const el = document.createElement('div');
  el.className = 'marker';

  //add marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom'
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  //add popup
  new mapboxgl.Popup({
    offset: 30
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

  //extends the map bounds to include current location
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100
  }
});
