

var Station = function(data) {
	var self = this;
	this.station = data.station;
	this.location = data.location;

};

var StationViewModel = function() {
	var self = this;
	self.filter = ko.observable('');
	var map;
	var pins = [];

	// Create our Station List array
	this.stationList = ko.observableArray([]);

	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 40.7345293, lng: -74.16419050000002},
		zoom: 11,
		mapTypeControl: false
	});


	// Attach the marker object to each of the place objects
	var largeInfowindow = new google.maps.InfoWindow();

	// Style the pin
	var defaultIcon = makePinIcon('0091ff');

	// Create a "highlighted location" pin color for when the user
    // mouses over the pin.
    var highlightedIcon = makePinIcon('FFFF24');
	
	// Setup the google markers into an array
	for (var i=0; i < initialStations.length; i++) {
		var position = initialStations[i].location;
		var title = initialStations[i].station;
		//Create a marker for each station
		var pin = new google.maps.Marker({
			position: position,
			title: title,
			icon: defaultIcon,
			animation: google.maps.Animation.DROP
			
		});


    	pin.addListener('click', function() {
 			var pin = this;
    		var wikiRequestTimeout = setTimeout(function() {
        		alert("failed to get wikipedia resources");
    		}, 8000);

			// Wikipedia AJAX request for url to display in infowindow

			var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + pin.title + '&format=json&callback=wikiCallback';

			$.ajax({
    			url: wikiUrl,
				dataType: "jsonp",

 				success: function( response ) {
 					clearTimeout(wikiRequestTimeout);
            		var articleList = response[1];

            		// Only want first URLs from returned list of URLs
            		if (articleList.length > 0) {
						var firstUrl;
            			firstUrl = 'http://en.wikipedia.org/wiki/' + articleList[0];

            		};

 					largeInfowindow.setContent('<h3>' + pin.title +'</h3>' + '<a href="' + firstUrl + '">'+  firstUrl + '</a');
					largeInfowindow.open(map, pin);

				},
				error: function (err) {
					alert("AJAX request error request");
				}
			});  //ajax
		}); // add listener

		pin.addListener('mouseover', function() {
			this.setIcon(highlightedIcon);
		});
		pin.addListener('mouseout', function() {
			this.setIcon(defaultIcon);
		});
		pin.addListener('click', function() {
			if (this.getAnimation() !== null) {
				this.setAnimation(null);
			} else {
				this.setAnimation(google.maps.Animation.DROP);
			}
		});

    	pins.push(pin);
    	pins[i].setMap(map);
    }; // for


	initialStations.forEach(function(stationItem) {
			self.stationList.push(new Station(stationItem) );
	});

	// Link markers to the observable array
	for (i=0; i < initialStations.length; i++) {
			self.stationList()[i].pin = pins[i];
	};


	this.filteredStations = ko.computed(function() {
		var filter = this.filter().toLowerCase();
		if (!filter) {
			// re-draw the pins, in some cases this needs to be done
			for (i=0; i < this.stationList().length; i++){
				this.stationList()[i].pin.setVisible(true);
			};
			return this.stationList();
		}
		else {
			return ko.utils.arrayFilter(this.stationList(), function(item) {
				var tmpStr = item.station.toLowerCase();
				var pin = item.pin;
				// Make a pin visible depending on if it's on the list
				if (tmpStr.indexOf(filter) >= 0) {
					pin.setVisible(true);
					return true;
				}
				else {
					pin.setVisible(false);
					return false;
				}
			});
		}
	}, self);

    // This function takes in a COLOR, and then creates a new marker
    // icon of that color. The icon will be 21 px wide by 34 high, have an origin
    // of 0, 0 and be anchored at 10, 34).
    function makePinIcon(markerColor) {
    	var markerImage = new google.maps.MarkerImage(
          'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
          '|40|_|%E2%80%A2',
          new google.maps.Size(21, 34),
          new google.maps.Point(0, 0),
          new google.maps.Point(10, 34),
          new google.maps.Size(21,34));
        return markerImage;
    };

    // Highlight station when click from list
    this.openInfo = function(station) {
    	google.maps.event.trigger(station.pin, 'click');
    }

};

function googleError() {
	console.log('Google map error encountered');
};

function startStationViewModel () {
	ko.applyBindings(new StationViewModel);
};
