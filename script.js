function getCoordintes() {
  var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };

  function success(pos) {
    var crd = pos.coords;
    var lat = crd.latitude.toString();
    var lng = crd.longitude.toString();
    var coordinates = [lat, lng];
    getCity(coordinates);
    return;
  }

  function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }

  navigator.geolocation.getCurrentPosition(success, error, options);
}

function getCity(coordinates) {
  var xhr = new XMLHttpRequest();
  var lat = coordinates[0];
  var lng = coordinates[1];

  xhr.open(
    "GET",
    "https://us1.locationiq.com/v1/reverse.php?key=pk.e87a2cda53fae1cd1bea780cbaa3ca5c&lat=" +
      lat +
      "&lon=" +
      lng +
      "&format=json",
    true
  );
  xhr.send();
  xhr.onreadystatechange = processRequest;
  xhr.addEventListener("readystatechange", processRequest, false);

  function processRequest(e) {
    if (xhr.readyState == 4 && xhr.status == 200) {
      var response = JSON.parse(xhr.responseText);
      city = response.address.city;
      setcity(city);
      return;
    }
  }
}

getCoordintes();
populateButton();

function populateButton(){
  
  var newBtn = $("<button>");
  var savedCity = localStorage.getItem("lastCity")
  if (savedCity != null) {
    newBtn.attr("id", savedCity.replace(/\s+/g, ''));
  newBtn.attr("class", "cityBtn btn btn-block btn-dark");
  newBtn.text(savedCity);
  $("#searchedCity").append(newBtn);
  }
  
}

function setcity(city){
var cityFull = "q=" + city + "&units=imperial&appid=";
var APIKey = "166a433c57516f51dfab1f7edaed8413";
var queryForecast =
  "https://api.openweathermap.org/data/2.5/forecast?" + cityFull + APIKey;
var queryWeather =
  "https://api.openweathermap.org/data/2.5/weather?" + cityFull + APIKey;
  $.ajax({
    url: queryWeather,
    method: "GET",
    statusCode: {
        404: function() {
            
            
            cityChop = city.replace(/\s+/g, '');
            $("#" + cityChop).remove()
            alert("City not found!")
        }
            
        }

    }).then(function (response) {
      
    var currentIcon = ("http://openweathermap.org/img/w/" + response.weather[0].icon + ".png")
    $("#nameOfCity").text(response.name);
    $("#todaysWindSpeed").text("Wind Speed: " + response.wind.speed);
    $("#todaysHumidity").text("Humidity: " + response.main.humidity);
    $("#todaysTemp").text("Today's Temperature: " + response.main.temp);
    $("#todaysIcon").attr("src", currentIcon);
    var lat = response.coord.lat;
    var lon = response.coord.lon;
    var queryUVI = ("http://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon + "&appid=166a433c57516f51dfab1f7edaed8413");
    $.ajax({
      url: queryUVI,
      method: "GET",
    }).then(function (response) {
      var UVIndex = parseInt(response.value)
      console.log(UVIndex)
      if (UVIndex < 3) {
        $("#todaysUVI").css("color", "green")
        $("#todaysUVI").text(UVIndex + " LOW")
        }
      if ((UVIndex >=3) && (UVIndex < 6)) {
       console.log("yellow!")
        $("#todaysUVI").css("color", "yellow")
        $("#todaysUVI").text(UVIndex + " MODERATE")
        }
        if ((UVIndex >=6) && (UVIndex < 9)) {
          console.log("orange")
           $("#todaysUVI").css("color", "orange")
           $("#todaysUVI").text(UVIndex + " HIGH")
           }
           if (UVIndex >= 9) {
            $("#todaysUVI").css("color", "red")
            $("#todaysUVI").text(UVIndex + " VERY HIGH")
            }
      })
    });
  $.ajax({
        url: queryForecast,
        method: "GET",
      }).then(function (response) {
          $("#fiveDayHolder").empty()
        for (let i = 0; i < response.list.length; i++) {
            if (response.list[i].dt_txt.split(" ")[1] == "15:00:00"){
            var temp = response.list[i].main.temp
            var humidity = response.list[i].main.humidity
            var windSpeed = response.list[i].wind.speed
            var day = (response.list[i].dt_txt.split("-")[2].split(" ")[0])
            var month = (response.list[i].dt_txt.split("-")[1]);
            var date = month + "/" + day 
            var dayIcon = ("http://openweathermap.org/img/w/" + response.list[i].weather[0].icon + ".png")
            var daysAppended = 0
                    if (daysAppended >= 5){
                        return
                    }
            var eachDayDiv = $("<div>")
            var dateH5 = $("<h5>")
            var windSpeedP = $("<p>")
            var tempP = $("<p>")
            var humidityP = $("<p>")
            var iconP = $("<img>")
            eachDayDiv.addClass("card-body text-center border m-1 bg-light border-dark rounded")
            dateH5.text(date)  
            windSpeedP.text("Wind Speed: " + windSpeed + " MPH")   
            tempP.text("Temperature: " + temp)   
            humidityP.text("Humidity: " + humidity)
            iconP.attr("src", dayIcon)
            $("#fiveDayHolder").append(eachDayDiv)
            eachDayDiv.prepend(dateH5, tempP, humidityP, windSpeedP, iconP)
            ++daysAppended
            }
        }
        
    
      });
}


$("#searchBtn").click(function(){
    var newCity = $("#searchBar").val().trim()
    $("#searchBar").val("")
    setcity(newCity)
    var newBtn = $("<button>");
    newBtn.attr("id", newCity.replace(/\s+/g, ''));
    newBtn.attr("class", "cityBtn btn btn-block btn-dark");
    newBtn.text(newCity);
    $("#searchedCity").append(newBtn);
    localStorage.setItem("lastCity", newCity);
    });

$(document).on('click','.cityBtn', function(event){
    var clickedCity = (event.target.innerText);
    setcity(clickedCity)
})
