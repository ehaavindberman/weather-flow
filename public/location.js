// todo: add google maps api for search
// todo: update api call based on location

function initialize() {
  var input = document.getElementById('searchInput');
  var options = {
    types: ['geocode'] //this should work !
  };
  var autocomplete = new google.maps.places.Autocomplete(input, options);
  autocomplete.addListener('place_changed',function() {
    var place = autocomplete.getPlace();
    if (!place.geometry) {
      console.log('no place geometry...')
      return;
    }

    let lat = place.geometry.location.lat();
    let lon = place.geometry.location.lng();
    let name = place.name;
    setNewPlace(lat,lon,name);
  });

  // initially in Tunis :)
  let name = 'Tunis';
  let lat = 36.806389;
  let lon = 10.181667;
  setNewPlace(lat,lon,name);
}


function setNewPlace(lat,lon,name) {
  let locationText = document.getElementById('locationText');
  locationText.innerHTML = name;

  getWeather(lat + ',' + lon);
  
  document.getElementById('searchInput').value = '';
}

google.maps.event.addDomListener(window, 'load', initialize);