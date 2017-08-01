var Hotel = function(data) {
    this.id = data.place_id;
    this.name = data.name;
    this.address = data.vicinity;
    this.rating = data.rating;
    this.icon = data.icon;
    this.geometry = data.geometry;
    // this.photo = data.photo;
    // this.url = data.website;
    // this.contact = data.formatted_phone_number;
};

var FoursquareClientSecrets = {
    "client_id": "45A1ZCY2LJZE2PCX13IZLOCZ5IOZVLVVHXKQMNMMY35EQVKK",
    "client_secret": "QFORSFOG0JFUOYCHYIEA41EHBBCJR440KD2KOANCKNI4QNHE"
};

var ViewModel = {
    hotelList: ko.observableArray([]),
    add: function(placesArray){
        for (var i=0; i < placesArray.length; i++){
            // console.log(placesArray[i]);
            this.hotelList.push(new Hotel(placesArray[i]));
        }
        console.log(this.hotelList());
    },
    init: function(){
        this.hotelList([]);
        var self = this;
        // this.hotelList = ko.observableArray([]);

        // var url = "https://api.foursquare.com/v2/venues/explore?v=201710715&near=Times%20Square&query=&intent=browse&radius=500&categoryId=4bf58dd8d48988d1fa931735&client_id=45A1ZCY2LJZE2PCX13IZLOCZ5IOZVLVVHXKQMNMMY35EQVKK&client_secret=QFORSFOG0JFUOYCHYIEA41EHBBCJR440KD2KOANCKNI4QNHE";
        var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8670522,151.1957362&radius=500&type=lodging&key=AIzaSyBdA9c4g3FXJAdYsx6UD6SbZRXCfLGcgwc"
        // $.get(url, function(data){
        //     var hotelsInfo = data["results"];
        //     hotelsInfo.forEach(function(hotelData){
        //         hotelList.push(new Hotel(hotelData));
        //     });
        // });

    },
    getHotels: function(){
        // console.log(this.hotelList);
        return this.hotelList();
    }
};
