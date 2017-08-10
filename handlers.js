/*
    This function retrieves nearby recommended places for a hotel from
    the Foursquare API using an AJAX request, and then retrieves additional
    hotel data from the Google Places API
*/
function retrieveHotelData(hotel){
    if (ViewModel.getRecommendedNearbyPlaces(hotel).length == 0){
        var jqxhr = $.get(hotel.foursquareDataUrl, function(data){
            if (data["meta"]["code"] == 200){
                var recommendedPlaces = data["response"]["groups"][0]["items"];
                recommendedPlaces.forEach(function(place){
                    ViewModel.addRecommendedPlace(hotel, place["venue"]);
                });
                var newNearbyPlaces = ViewModel.getRecommendedNearbyPlaces(hotel);
                ViewModel.currentRecommendedNearbyPlaces(newNearbyPlaces);
            }
            else{
                console.log("status: " + data["meta"]["code"]);
                alert('There was a problem with Foursquare data retieval');
            }
        });
        jqxhr.fail(function(){
            console.log("There may be a problem with the URL");
            alert('There was a problem with Foursquare data retieval');
        })
    }
    else {
        var newNearbyPlaces = ViewModel.getRecommendedNearbyPlaces(hotel);
        ViewModel.currentRecommendedNearbyPlaces(newNearbyPlaces);
    }
    var placesService = new google.maps.places.PlacesService(map);
    placesService.getDetails({placeId: hotel.id}, function(result, status){
        if (status === google.maps.places.PlacesServiceStatus.OK){
            hotel.allPhotos = result.photos;
            hotel.website = result.website;
            hotel.phone = result.formatted_phone_number;
            ViewModel.currentHotel(hotel);
        }
        else{
            console.log("status: " + status);
            alert('There was a problem with Google data retieval');
        }
    });
    $('#recommended-nearby h4').show();
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
    retrieveHotelData(this);
}

function markerClickHandler(marker){
    ViewModel.getHotels().forEach(function(hotel){
        if (marker.title == hotel.name){
            retrieveHotelData(hotel);
        }
    });
}

function nearbyRecommendedHandler(){
    window.open(this.url,'_blank');
}

function errorHandler(e){
    console.log("There was an error with the Google Maps API. Please check the request");
    alert("There was an error with the Google Maps API");
}