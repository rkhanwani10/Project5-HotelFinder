function initMap(){
    var initialLocation = {lat: 40.758896, lng: -73.985130}; //Times Square
    map = new google.maps.Map(document.getElementById('map'), {
        center: initialLocation,
        zoom: 16
    });
    populateMap();
}

function populateMap(){
    google.maps.event.addListener(map,'idle',function(){
        var bounds = map.getBounds();
        ViewModel.init();
        var placesService = new google.maps.places.PlacesService(map);
        placesService.nearbySearch({
            bounds: bounds,
            type: "lodging"
            // location: {lat: 40.758896, lng: -73.985130},
            // radius: 500
        }, function(results, status, pagination){
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                // console.log(results);
                ViewModel.add(results);
                if (pagination.hasNextPage && ViewModel.getHotels().length < 20){
                    pagination.nextPage();
                }
                else{
                    placeMarkers();
                }
            }
        });
    });
}

function placeMarkers(){
    var bounds = map.getBounds();
    // console.log(bounds);
    var places = ViewModel.getHotels();
    for (var i = 0; i < places.length; i++){
        var place = places[i];
        // var icon = {
        //     url: place.icon,
        //     size: new google.maps.Size(35, 35),
        //     origin: new google.maps.Point(0, 0),
        //     anchor: new google.maps.Point(15, 34),
        //     scaledSize: new google.maps.Size(25, 25)
        // };
        var marker = new google.maps.Marker({
            map: map,
            // icon: icon,
            title: place.name,
            position: place.geometry.location,
            animation: google.maps.Animation.DROP
            // id: place.id
        });
        // if (place.geometry.viewport) {
        //     // Only geocodes have viewport.
        //     bounds.union(place.geometry.viewport);
        // }
        // else {
        //     bounds.extend(place.geometry.location);
        // }
    }
    // console.log(bounds);
    // map.fitBounds(bounds);
}

