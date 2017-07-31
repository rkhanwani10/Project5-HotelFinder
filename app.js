var Hotel = function(data) {
    this.id = data.id;
    this.name = data.name;
    this.address = data.location.formattedAddress.join();
    this.rating = data.rating;
    this.url = data.url;
    this.contact = data.contact.formattedPhone;
};

var FoursquareClientSecrets = {
    "client_id": "45A1ZCY2LJZE2PCX13IZLOCZ5IOZVLVVHXKQMNMMY35EQVKK",
    "client_secret": "QFORSFOG0JFUOYCHYIEA41EHBBCJR440KD2KOANCKNI4QNHE"
};

var ViewModel = function(){
    var self = this;
    this.hotelList = ko.observableArray([]);

    var url = "https://api.foursquare.com/v2/venues/explore?v=201710715&near=Times%20Square&query=&intent=browse&radius=500&categoryId=4bf58dd8d48988d1fa931735&client_id=45A1ZCY2LJZE2PCX13IZLOCZ5IOZVLVVHXKQMNMMY35EQVKK&client_secret=QFORSFOG0JFUOYCHYIEA41EHBBCJR440KD2KOANCKNI4QNHE";
    $.get(url, function(data){
        var hotelsInfo = data["response"]["groups"][0]["items"];
        hotelsInfo.forEach(function(hotelData){
            hotelList.push(new Hotel(hotelData.venue));
        });
    });

};
