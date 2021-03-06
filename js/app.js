// The Model storing place data
var places = [
  {
    lat:  39.75377,
    lng:  -105.24013,
    title: 'Clear Creek Canyon',
    id: 0
  },

  {
    lat: 38.813946,
    lng: -104.839968,
    title: 'Pure Bouldering Gym',
    id: 1
  },

  {
    lat: 38.266605,
    lng: -105.187888,
    title: "Newlin Creek Trailhead",
    id: 2
  },

  {
    lat: 38.728570,
    lng: -104.882980,
    title: '369',
    id: 3
  },

  {
    lat: 40.3753,
    lng: -105.616,
    title: "Rocky Mountain National Park",
    id: 4
  }
];

var map;
var markers = [];

function listClick(data) {
  google.maps.event.trigger(markers[data], 'click');
};

//The ViewModel for the map and markers
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 39.5, lng: -104.992474},
      zoom: 7
  });

  var infowindow = new google.maps.InfoWindow({
    content: null
  });
// Create marker function to be called by for loop
  var addMarker = function(lat, lng, title) {
    var marker = new google.maps.Marker({
      position: {lat: lat, lng: lng},
      map: map,
      title: title,
      animation: google.maps.Animation.DROP
    });

    var url = "http://api.wunderground.com/api/8fd73a2ecd844c74/geolookup/conditions/forecaset/q/" + lat + "," + lng + ".json";

    marker.addListener('click', toggleMarker);

    // Allow infowindow and marker bounce to be toggled by marker click
    var infoState = "Closed";
    function toggleMarker () {
      // toggle info window on marker click
      if (infoState !== "Closed") {
        infowindow.close();
        infoState = "Closed";
      } else {
        // Get up to the minute weather from Weather Underground. Calling this onclick instead of onload is less performant, but I like that it gives the benefit of more current weather info if the page has been open for awhile.
        $.ajax({
          url: url,
          dataType : "json",
          success : function( parsed_json ) {
           weatherInfo = 'The weather at ' + title + ' is ' +parsed_json['current_observation']['weather'] + '.';
           infowindow.setContent(weatherInfo);
           infowindow.open(map, marker);
          }
        })
        .fail(function() {
          alert( "Weather Underground failed to return weather info!");
        });

        infoState = "Open";
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
          marker.setAnimation(null);
        }, 2500);
      }
    }
    markers.push(marker);
  };



//Try another for loop using bracket notation. It works! Iterates through places and adds a marker for each!
  for (each in places) {
    addMarker(places[each]['lat'], places[each]['lng'], places[each]['title']);
  }

ko.applyBindings(ListViewModel);
}


// The ViewModel for the list and filter
var ListViewModel = {

  // Create observable array to hold places
  viewPlaces: ko.observableArray([
    ]),

  // Populate viewPlaces observable array with names of places from The Model
  populate: function() {
    for (each in places) {
    ListViewModel.viewPlaces.push({name: places[each]['title'], idNum: places[each]['id']});
    }
  },

  query: ko.observable(''),

  search: function(value) {
    var count = 0;
    ListViewModel.viewPlaces.removeAll();

    //the next two functions hide the markers from the map
    function setMapOnAll(map) {
      for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
      }
    }
    function clearMarkers() {
      setMapOnAll(null);
    }
    clearMarkers();

    for (var place in places) {
      if (places[place].title.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
        ListViewModel.viewPlaces.push({name: places[place]['title'], idNum: places[place]['id']});

        // The next two functions reveal the appropriate markers based on search results
        function setMapOnOne(map) {
          markers[count].setMap(map);
        }
        function addMarker() {
          setMapOnOne(map);
        }
        addMarker();
      }
      count = count + 1;
    }
  }
};

ListViewModel.populate();
ListViewModel.query.subscribe(ListViewModel.search);

var googleError = function () {
  alert("Google maps failed to load");
};

