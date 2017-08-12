var Hotel = function(data, foursquareDataUrl) {
    this.id = data.place_id;
    this.name = data.name;
    this.vicinity = data.vicinity;
    this.rating = data.rating;
    this.icon = data.icon;
    this.geometry = data.geometry;
    this.foursquareDataUrl = foursquareDataUrl;
    this.recommendedNearbyPlaces = ko.observableArray([]);
    this.photoAvailability = false;
    if (data.photos){
        this.photoAvailability = true;
        this.photo = data.photos[0].getUrl({
            maxWidth: 640
        });
    }
    var self = this;
    this.listViewInfo = ko.computed(function() {
        var info = '<strong>' + self.name + '</strong><br>' + self.vicinity;
        info += '<br> Rating: ' + self.rating +'/5';
        return info;
    });
};

var RecommendedPlace = function(data){
    this.id = data.id;
    this.name = data.name;
    this.phone = data.contact.formattedPhone;
    this.location = data.location;
    this.url = data.url;
    this.rating = data.rating;
    this.categories = data.categories;
    if (data.price){
        this.price = data.price.tier;
    }
    var self = this;
    this.sidebarInfo = ko.computed(function() {
        var toReturn = '<strong>' + self.name + '</strong>' + '<br>';
        toReturn += '<small class="text-muted">' + self.categories[0].name;
        toReturn += ' - ' + self.location.distance + 'm';
        if (self.price){
            toReturn += ' - ' + '$'.repeat(self.price);
        }
        if (self.rating){
            toReturn += ' - ' + 'Rating: ' + self.rating + '/10.0';
        }
        toReturn += '</small><br>' + self.location.formattedAddress[0];
        if (self.phone){
            toReturn += '<br>Phone: ' + self.phone;
        }
        return toReturn;
    });
};

var FoursquareClientSecrets = {
    client_id: "45A1ZCY2LJZE2PCX13IZLOCZ5IOZVLVVHXKQMNMMY35EQVKK",
    client_secret: "QFORSFOG0JFUOYCHYIEA41EHBBCJR440KD2KOANCKNI4QNHE"
};

var ViewModel = {
    currentHotel: ko.observable(),
    hotelList: ko.observableArray([]),
    currentRecommendedNearbyPlaces: ko.observableArray([]),
    ratings: ko.observableArray([4,3,2,1,"Clear"]),
    currentRating: ko.observable(),
    currentArea: ko.observable(),
    addRecommendedPlace: function(hotel, place){
        hotel.recommendedNearbyPlaces.push(new RecommendedPlace(place));
    },
    getRecommendedNearbyPlaces: function(hotel){
        return hotel.recommendedNearbyPlaces();
    },
    add: function(placesArray){
        var url;
        var lat;
        var lng;
        for (var i=0; i < placesArray.length; i++){
            lat = placesArray[i].geometry.location.lat();
            lng = placesArray[i].geometry.location.lng();
            url = "https://api.foursquare.com/v2/venues/explore?v=201710715&ll=";
            url += lat + "," + lng + "&section=trending";
            url += "&client_id=" + FoursquareClientSecrets.client_id;
            url += "&client_secret=" + FoursquareClientSecrets.client_secret;
            this.hotelList.push(new Hotel(placesArray[i], url));
        }
    },
    init: function(){
        this.hotelList([]);
        this.currentRating.subscribe(fetchHotels);
    }
};

ViewModel.getHotels = ko.computed(function() {
    if (typeof ViewModel.currentRating() == "number"){
        return ko.utils.arrayFilter(ViewModel.hotelList(), function(hotel) {
            return hotel.rating >= ViewModel.currentRating();
        });
    }
    else{
        return ViewModel.hotelList();
    }
});

ko.applyBindings(ViewModel);
