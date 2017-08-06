var infoWindow;
var markers = [];
var previousMapBounds;
var zoomAutoComplete;
var clickedMarkerImage;
var filters = {};

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
            console.log(filteredResults);
            // for (var i = 0; i < results.length; i++){
            //     if (typeof filters.rating == 'undefined' || results[i].rating >= filters.rating){
            //         ViewModel.add(results[i]);
            //     }
            // }
            ViewModel.add(filteredResults);
            if (pagination.hasNextPage){ //&& ViewModel.getHotels().length < 40
                placeMarkers(filteredResults);
                //Two second delay enforced by Google's API
                pagination.nextPage();
            }
            else{
                placeMarkers(filteredResults);
                previousMapBounds = bounds;
            }
        }
    });
}

function populateMap(){
    google.maps.event.addListener(map,'idle',function(){
        fetchHotels();
    });
}

function placeMarkers(places){
    for (var i = 0; i < places.length; i++){
        var place = places[i];
        // if ((typeof previousMapBounds == 'undefined') || (!previousMapBounds.contains(place.geometry.location))){
            var marker = new google.maps.Marker({
            map: map,
            title: place.name,
            // animation: google.maps.Animation.DROP,
            position: place.geometry.location
            });

            markers.push(marker);

            marker.addListener('mouseover', (function(marker, place) {
                return function(){
                    var content = '<h5>' + place.name + '<br> <small>' + place.vicinity + '</small></h5>';
                    infoWindow.setContent(content);
                    infoWindow.open(map,marker);
                }
            })(marker, place));

            marker.addListener('mouseout', function(){
                infoWindow.close();
            });

            marker.addListener('click', (function(marker){
                return function(){
                    this.setIcon(clickedMarkerImage);
                    markerClickHandler(marker);
                }
            })(marker));
        // }
    }
}

function deleteMarkers(){
    for (var i = markers.length - 1; i >= 0; i--){
        markers[i].setMap(null);
        markers.pop();
    }
}

function zoomToArea(){
    var geocoder = new google.maps.Geocoder();
    var address = document.getElementById('search-bar').value;
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
                window.alert('We could not find that location - try entering a more' +
                ' specific place.');
            }
        });
    }
}

function listviewClickHandler(){
    for (var i = 0; i < markers.length; i++){
        if (markers[i].title == this.name){
            markers[i].setAnimation(google.maps.Animation.BOUNCE);
            markers[i].setIcon(clickedMarkerImage);
            setTimeout((function(marker){
                return function(){
                    marker.setAnimation(null);
                }
            })(markers[i]), 1400);
        }
    }
    var self = this;
    if (ViewModel.getRecommendedNearbyPlaces(this).length == 0){
        $.get(this.foursquareDataUrl, function(data){
            var recommendedPlaces = data["response"]["groups"][0]["items"];
            recommendedPlaces.forEach(function(place){
                ViewModel.addRecommendedPlace(self, place["venue"]);
            });
            console.log(ViewModel.getRecommendedNearbyPlaces(self));
            ViewModel.currentRecommendedNearbyPlaces(ViewModel.getRecommendedNearbyPlaces(self));
        });
    }
    else {
        ViewModel.currentRecommendedNearbyPlaces(ViewModel.getRecommendedNearbyPlaces(this));
    }
    var placesService = new google.maps.places.PlacesService(map);
    placesService.getDetails({placeId: this.id}, function(result, status){
        console.log(result);
        self.allPhotos = result.photos;
        self.website = result.website;
        self.phone = result.formatted_phone_number;
        ViewModel.currentHotel(self);
        console.log(ViewModel.currentHotel());
    });
    $('#recommended-nearby h4').show();
}

function markerClickHandler(marker){
    ViewModel.getHotels().forEach(function(hotel){
        if (marker.title == hotel.name){
            if (ViewModel.getRecommendedNearbyPlaces(hotel).length == 0){
                $.get(hotel.foursquareDataUrl, function(data){
                    var recommendedPlaces = data["response"]["groups"][0]["items"];
                    recommendedPlaces.forEach(function(place){
                        ViewModel.addRecommendedPlace(hotel, place["venue"]);
                    });
                    console.log(ViewModel.getRecommendedNearbyPlaces(hotel));
                    ViewModel.currentRecommendedNearbyPlaces(ViewModel.getRecommendedNearbyPlaces(hotel));
                });
            }
            else {
                ViewModel.currentRecommendedNearbyPlaces(ViewModel.getRecommendedNearbyPlaces(hotel));
            }
            var placesService = new google.maps.places.PlacesService(map);
            placesService.getDetails({placeId: hotel.id}, function(result, status){
                console.log(result);
                hotel.allPhotos = result.photos;
                hotel.website = result.website;
                hotel.phone = result.formatted_phone_number;
                ViewModel.currentHotel(hotel);
                console.log(ViewModel.currentHotel());
            });
            $('#recommended-nearby h4').show();
        }
    });
}

function setRatingHandler(self,rating){
    $('.rating').removeClass("active");
    $(self).addClass("active");
    filters.rating = rating;
    $('#clear-rating').prop('disabled',false);
    fetchHotels();
}

function clearRating(){
    $('.rating').removeClass("active");
    filters.rating = null;
    $('#clear-rating').prop('disabled',true);
    fetchHotels();
}

function nearbyRecommendedHandler(){
    window.open(this.url,'_blank');
}
