/*
    This function retrieves nearby recommended places for a hotel from
    the Foursquare API using an AJAX request, and then retrieves additional
    hotel data from the Google Places API
*/
function retrieveHotelData(hotel){
    if (ViewModel.getRecommendedNearbyPlaces(hotel).length == 0){
        $.get(hotel.foursquareDataUrl, function(data){
            if (data["meta"]["code"] == 200){
                var recommendedPlaces = data["response"]["groups"][0]["items"];
                recommendedPlaces.forEach(function(place){
                    ViewModel.addRecommendedPlace(hotel, place["venue"]);
                });
                var newNearbyPlaces = ViewModel.getRecommendedNearbyPlaces(hotel);
                ViewModel.currentRecommendedNearbyPlaces(newNearbyPlaces);
            }
            else{
                alert('There was a problem with Foursquare data retieval')
            }
        });
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