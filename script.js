let cities = [];
 

function debounce(func, delay) {
    let timeoutId;
    
    return function() {
        const context = this;
        const args = arguments;
        
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
}



function fetchData(name) {
     $.ajax({
        type: "GET",
        url: `http://dataservice.accuweather.com/locations/v1/cities/search?apikey=BvjEmCY8TsPw4ipA7DX0CicsHTWMGs6u&q=${name}`,
        dataType: "json",  
        crossDomain: true,
        success: function (response) {
           console.log(response)

          

            $('.search-list').empty()
           cities = response || null
            
            if(cities !== null){
                cities.forEach(city => {
                    $('.search-list').append(`<li class="search-list-city" data-citycode="${city.Key}">${city.EnglishName},${city?.AdministrativeArea.EnglishName}, ${city.Country.EnglishName}</li>`)
                   });
            }else{
                $('.search-list').html("<p>city does not exists..</p>")
            }
        
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log("Error:", errorThrown);
        }
     });
}

 
const debouncedFetchData = debounce(fetchData, 500);

 
$(document).ready(function() {
    $('.weather-search').on('keyup', function() {
        $('.search-suggestion').show()
        debouncedFetchData($(this).val());
        if($(this).val().trim() === ""){
            $('.search-suggestion').hide()
        }
    });
});

$(document).on("click",'.search-list-city',function() {
    let data = $(this).data()

     

    let selectedCity = cities.filter(city => city.Key == data.citycode)[0]

    function fahrenheitToCelsius(fahrenheit) {
     
        return Math.floor( (fahrenheit - 32) * 5 / 9);
    }
    
    $('.search-suggestion').hide()
     
      
    $.ajax({
            type: "GET",
            url: `http://dataservice.accuweather.com/forecasts/v1/hourly/1hour/${data?.citycode}?apikey=BvjEmCY8TsPw4ipA7DX0CicsHTWMGs6u&details=true`,
            dataType: "json",
            crossDomain: true,
            success: function (response) {
                console.log(response[0])
                const { Temperature:{Value,Unit}, Wind:{Speed},IconPhrase,PrecipitationProbability,IsDaylight} = response[0]

                let temp = fahrenheitToCelsius(Value)

                if(IsDaylight){
                    $('.weatherbox').addClass('card-morning')
                }else{
                    $('.weatherbox').addClass('card-night')
                }
                 
                $('.weatherbox').html(` <div class="card">

                <h2>${selectedCity?.EnglishName}</h2>
                <p>${selectedCity?.AdministrativeArea.EnglishName}</p>
                <h3>${IconPhrase} </br><span> Wind ${Speed.Value} ${Speed.Unit} </br> <span class="dot">•</span> </br> Precip ${PrecipitationProbability}%</span></h3>
                <h1>${temp}°</h1>
                 
            </div>`)
                
            }
          });
 
})