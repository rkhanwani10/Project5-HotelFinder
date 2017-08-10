var infoWindow;
var markers = [];
var previousMapBounds;
var zoomAutoComplete;
var clickedMarkerImage;
var filters = {};

/*
    This function creates a Google Map on an initial location and sets some
    of the global variables to be used in other functions. At the end it calls
    populateMap to initiate data retrieval
*/
function initMap(){
    var initialLocation = {lat: 40.758896, lng: -73.985130}; //Times Square

    map = new google.maps.Map(document.getElementById('map'), {
        center: initialLocation,
        zoom: 15,
        scrollwheel: false
    });

    infoWindow = new google.maps.InfoWindow({
        maxWidth: 200
    });

    zoomAutoComplete = new google.maps.places.Autocomplete(document.getElementById('search-bar'));
    zoomAutoComplete.bindTo('bounds', map);

    clickedMarkerImage = {
        url: 'http://maps.google.com/mapfiles/kml/paddle/blu-circle.png',
        size: new google.maps.Size(37, 40),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(19, 39),
        scaledSize: new google.maps.Size(37, 40)
    };

    populateMap();
}

function populateMap(){
    google.maps.event.addListener(map,'idle',function(){
        fetchHotels();
    });
}

/*
    This function executes a Nearby Search from the Google Places API on the
    area contained within the current map bounds. The type of places is
    restricted to "lodging" to find hotels. placeMarkers is called after each
    page of data is processed to place appropriate markers on the map.
*/
function fetchHotels(){
    var bounds = map.getBounds();
    ViewModel.init();
    deleteMarkers();
    var placesService = new google.maps.places.PlacesService(map);
    placesService.nearbySearch({
        bounds: bounds,
        type: "lodging",
        minPriceLevel: 0
    }, function(results, status, pagination){
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            var filteredResults = [];
            if (filters.rating){
                for (var i = 0; i < results.length; i++){
                    if (results[i].rating >= filters.rating){
                        filteredResults.push(results[i]);
                    }
                }
            }
            else {
                filteredResults = results;
            }
            ViewModel.add(results);
            if (pagination.hasNextPage){
                placeMarkers();
                //Two second delay enforced by Google's API
                pagination.nextPage();
            }
            else{
                placeMarkers();
                previousMapBounds = bounds;
            }
        }
        else{
            alert('There was a problem with Google data retrieval');
        }
    });
}

/*
    This function creates a marker for each place in a list of places and places
    them at the place's location on the map. Then, listeners are added to
    invoke InfoWindow functionality on hovers and clicks, and to start
    populating sidebar data on a click
*/
function placeMarkers(){
    var places = ViewModel.getHotels();
    for (var i = 0; i < places.length; i++){
        var place = places[i];
        var marker = new google.maps.Marker({
        map: map,
        title: place.name,
        position: place.geometry.location
        });

        markers.push(marker);

        marker.addListener('mouseover', (function(marker, place) {
            return function(){
                var content = '<h5>' + place.name + '<br> <small>';
                content += place.vicinity + '</small></h5>';
                infoWindow.setContent(content);
                infoWindow.open(map,marker);
            }
        })(marker, place));

        marker.addListener('mouseout', function(){
            infoWindow.close();
        });

        marker.addListener('click', (function(marker, place){
            return function(){
                var content = '<h5>' + place.name + '<br> <small>';
                content += place.vicinity + '</small></h5>';
                infoWindow.setContent(content);
                infoWindow.open(map,marker);
                marker.setIcon(clickedMarkerImage);
                marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout((function(marker){
                    return function(){
                        marker.setAnimation(null);
                    }
                })(marker), 1400);
                markerClickHandler(marker);
            }
        })(marker, place));
    }
}

function deleteMarkers(){
    for (var i = markers.length - 1; i >= 0; i--){
        markers[i].setMap(null);
        markers.pop();
    }
}

function zoomToArea(){
    ViewModel.currentArea(zoomAutoComplete.getPlace().formatted_address);
    var geocoder = new google.maps.Geocoder();
    var address = ViewModel.currentArea();
    console.log(address);
    if (address == '') {
        window.alert('You must enter an area, or address.');
    }
    else {
      // Geocode the address/area entered to get the center. Then, center the map
      // on it and zoom in
        geocoder.geocode({address: address}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                map.setCenter(results[0].geometry.location);
                map.setZoom(15);
            }
            else {
                window.alert('We could not find that location - ' +
                    'try entering a more specific place.');
            }
        });
    }
}
