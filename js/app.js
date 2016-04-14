/* ======= Model ======= */

'use strict';

var initialLocations = [
	{
		name: 'Dhaba',
		lat: 40.742407,
		lng: -73.982908
	},
	{
		name: 'Anjappar',
		lat: 40.742598,
		lng: -73.982768
	},
	{
		name: 'Bhatti Indian Grill',
		lat: 40.738219,
		lng: -73.985680
	},
	{
		name: 'Tamba',
		lat: 40.742143,
		lng: -73.982501
	},
	{
		name: 'Kokum',
		lat: 40.742357,
		lng: -73.982954
	},
	{
		name: 'Haldi',
		lat: 40.742263,
		lng: -73.983007
	},
	{
		name: 'Chote Nawab',
		lat: 40.742456,
		lng: -73.982328
	},
	{
		name: 'Curry Leaf',
		lat: 40.742080,
		lng: -73.982692
	},
	{
		name: 'Pippali',
		lat: 40.742384,
		lng: -73.983269
	},
	{
		name: 'Haandi',
		lat: 40.742406,
		lng: -73.982400
	},
	{
		name: 'Saravana Bhavan',
		lat: 40.741420,
		lng: -73.983071
	},
	{
		name: 'Desi Gali',
		lat: 40.742082,
		lng: -73.982543
	},
	{
		name: 'Chennai Garden by Tiffin Wallah',
		lat: 40.742966,
		lng: -73.982748
	}
];

// Declaring global variables now to satisfy strict mode
var map;
var clientID;
var clientSecret;

// Format phone numbers
// http://snipplr.com/view/65672/10-digit-string-to-phone-format/
function formatPhone(phonenum) {
    var regexObj = /^(?:\+?1[-. ]?)?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (regexObj.test(phonenum)) {
        var parts = phonenum.match(regexObj);
        var phone = "";
        if (parts[1]) { phone += "(" + parts[1] + ") "; }
        phone += parts[2] + "-" + parts[3];
        return phone;
    }
    else {
        //invalid phone number
        return phonenum;
    }
}

// Object representing a restaurant
var Location = function(data) {
	var self = this;
	this.name = data.name;
	this.lat = data.lat;
	this.lng = data.lng;
	this.URL = "";
	this.street = "";
	this.city = "";
	this.phone = "";
	this.rating = "";

	this.visible = ko.observable(true);

	// Initialize the array of restaurant objects asynchronously
	
	var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll='+ this.lat + ',' + this.lng + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118' + '&query=' + this.name;
	$.getJSON(foursquareURL).done(function(data) {
		var results = data.response.venues[0];
		self.URL = results.url;
		if (typeof self.URL === 'undefined'){
			self.URL = "";
		}
		self.rating = results.rating;
			console.log(results.rating);
		self.street = results.location.formattedAddress[0];
			console.log(results.location.formattedAddress[0]);
     	self.city = results.location.formattedAddress[1];
      	self.phone = results.contact.phone;
			console.log(self.phone);
      	if (typeof self.phone === 'undefined'){
			self.phone = "";
		} else {
			self.phone = formatPhone(self.phone);
		}
		
	}).fail(function() {
		alert("There was an error with the API call. Please refresh the page and try again.");
	});


    // Build the basic info window content, if not yet built
    this.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
        '<div class="content"><a href="' + self.URL +'">' + self.URL + "</a></div>" +
        '<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div>" +
        '<div class="content">' + self.rating + "</div>" +
        '<div class="content">' + self.phone + "</div></div>";

	// Create the info window for this restaurant object 
	this.infoWindow = new google.maps.InfoWindow({content: self.contentString});

	// Create the map marker for this restaurant object 
	this.marker = new google.maps.Marker({
			position: new google.maps.LatLng(data.lat, data.lng),
			map: map,
			title: data.name
	});

	// Show the map marker for this restaurant object 
	this.showMarker = ko.computed(function() {
		if(this.visible() === true) {
			this.marker.setMap(map);
		} else {
			this.marker.setMap(null);
		}
		return true;
	}, this);

	// Sets the click callback for the map marker 
	this.marker.addListener('click', function(){
		self.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
        '<div class="content"><a href="' + self.URL +'">' + self.URL + "</a></div>" +
        '<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div>" +
		'<div class="content">' + self.rating + "</div>" +
        '<div class="content"><a href="tel:' + self.phone +'">' + self.phone +"</a></div></div>";

        // Initialize basic info window content and display it 
		self.infoWindow.setContent(self.contentString);

		// Show info window
		self.infoWindow.open(map, this);

		// Enable marker bounce animation and show info window 
		self.marker.setAnimation(google.maps.Animation.BOUNCE);
      	setTimeout(function() {
      		self.marker.setAnimation(null);
     	}, 2100);
	});

	this.bounce = function(place) {
		google.maps.event.trigger(self.marker, 'click');
	};
};

/* ======= View Model ======= */
function AppViewModel() {
	var self = this;

	this.searchTerm = ko.observable("");

	this.locationList = ko.observableArray([]);

	// Callback that initializes the Google Map object 
	map = new google.maps.Map(document.getElementById('map'), {
			zoom: 19,
			center: {lat: 40.742080, lng: -73.982692}
	});

	// Foursquare API settings
	clientID = "UDFNGF23RQ3A0HJGTUUHGP03D3TLXRWH05SBAJ4VIW1UHSPG";
	clientSecret = "IPJ45SDFPD2WQZWH51VBFS04MTOGTIV30I0DCR2CROYI5BCB";

	initialLocations.forEach(function(locationItem){
		self.locationList.push( new Location(locationItem));
	});

	this.filteredList = ko.computed( function() {
		var filter = self.searchTerm().toLowerCase();
		if (!filter) {
			self.locationList().forEach(function(locationItem){
				locationItem.visible(true);
			});
			return self.locationList();
		} else {
			return ko.utils.arrayFilter(self.locationList(), function(locationItem) {
				var string = locationItem.name.toLowerCase();
				var result = (string.search(filter) >= 0);
				locationItem.visible(result);
				return result;
			});
		}
	}, self);

	this.mapElem = document.getElementById('map');
	this.mapElem.style.height = window.innerHeight - 50;
}

// Activate Knockout once the map is initialized
function startApp() {
	ko.applyBindings(new AppViewModel());
}

// Error alert if there's an issue loading the Google Maps API script
function errorHandling() {
	alert("Google Maps has failed to load. Please check your internet connection and try again.");
}