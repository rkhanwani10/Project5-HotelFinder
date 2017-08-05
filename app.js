var Hotel = function(data, foursquareDataUrl) {
    this.id = data.place_id;
    this.name = data.name;
    this.address = data.vicinity;
    this.rating = data.rating;
    this.icon = data.icon;
    this.geometry = data.geometry;
    this.foursquareDataUrl = foursquareDataUrl;
    this.recommendedNearbyPlaces = ko.observableArray([]);
    if (data.photos){
        this.photo = data.photos[0].getUrl({
            maxWidth: 640
        });
    }
    var self = this;
    this.listViewInfo = ko.computed(function() {
        var info = '<strong>' + self.name + '</strong><br>' + self.address + '<br> Rating: ' + self.rating +'/5';
        return info;
    });
    // this.url = data.website;
    // this.contact = data.formatted_phone_number;
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
};

var FoursquareClientSecrets = {
    "client_id": "45A1ZCY2LJZE2PCX13IZLOCZ5IOZVLVVHXKQMNMMY35EQVKK",
    "client_secret": "QFORSFOG0JFUOYCHYIEA41EHBBCJR440KD2KOANCKNI4QNHE"
};

var ViewModel = {
    hotelList: ko.observableArray([]),
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
            url = "https://api.foursquare.com/v2/venues/explore?v=201710715&ll=" + lat + "," + lng + "&section=trending&client_id=45A1ZCY2LJZE2PCX13IZLOCZ5IOZVLVVHXKQMNMMY35EQVKK&client_secret=QFORSFOG0JFUOYCHYIEA41EHBBCJR440KD2KOANCKNI4QNHE"
            this.hotelList.push(new Hotel(placesArray[i], url));
        }
        // console.log(this.hotelList());
    },
    init: function(){
        this.hotelList([]);
        var self = this;
        // this.hotelList = ko.observableArray([]);

        // var url = "https://api.foursquare.com/v2/venues/explore?v=201710715&near=Times%20Square&query=&intent=browse&radius=500&categoryId=4bf58dd8d48988d1fa931735&client_id=45A1ZCY2LJZE2PCX13IZLOCZ5IOZVLVVHXKQMNMMY35EQVKK&client_secret=QFORSFOG0JFUOYCHYIEA41EHBBCJR440KD2KOANCKNI4QNHE";
        var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8670522,151.1957362&radius=500&type=lodging&key=AIzaSyBdA9c4g3FXJAdYsx6UD6SbZRXCfLGcgwc"


    },
    getHotels: function(){
        return this.hotelList();
    }
};

ko.applyBindings(ViewModel);
