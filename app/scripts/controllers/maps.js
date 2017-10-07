'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
  .controller('MapsCtrl', function($scope, $rootScope, $state, $timeout, $http, AuthService, leafletData, $q) {

  	var api = AuthService.getApi();
  	$scope.userType = AuthService.getUserType();
  	
  	$scope.map = {};

    var allCoords = [], geocoder, geocontrol;

    $scope.map.selectedCourier = {};
    $scope.map.selectedDate = {};

    $scope.map.center = {
      lat: 25,
      lng: 50,
      zoom: 2
    };
//  	$scope.map.tiles = {};
		$scope.map.layers = {};
  	$scope.map.height = $(window).height()*0.82 + 'px';

//  	var auth_token = 'pk.eyJ1IjoiYWxpOTI1IiwiYSI6ImNpcHZobHIxMzAwNTZpMWtzcmFrdmk2OXcifQ.7AB_LOCsVI6kUn_vPDUXkg';
//
//  	$scope.map.tiles.url = 'https://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=' + auth_token;
	
		$scope.map.layers.overlays = {};
	
		$scope.map.layers.baselayers = {
				mapboxGlLayer: {
					name: 'Sample',
					type: 'mapboxGL',
					layerOptions: {
						accessToken: 'pk.eyJ1IjoiZ3JlZW5jaDRhbGV4IiwiYSI6ImNpa242d2dtMzAwOGh3YW02dDd6eGIwb28ifQ.V8B9D1mUvD21JCkPRxpKxA',
						style: 'mapbox://styles/greench4alex/cita9atqv000e2hr7v4htiycv'
					}
				}
			};

  	$scope.map.initMap = function(){

      $('.closed-sidebar + .main').addClass('no-scroll');

                  leafletData.getMap().then(function(map) {

                   geocoder = L.Control.Geocoder.google(); 
                   geocontrol = L.Control.geocoder({
                                          geocoder: geocoder
                                        }).addTo(map);


            // $scope.map.markers['sectorMarker'+o] = {lat: parseFloat(cord.southWest[0].substring(5))-0.0025, lng: parseFloat(cord.southWest[1].substring(5))+0.0045};
            // $scope.map.markers['sectorMarker'+o].icon = {
            //                                                   type: 'div',
            //                                                   iconSize: [230, 0],
            //                                                   html: '<b>'+sectorNum+'</b>',
            //                                                   iconAnchor:  [0, 0]
            //                                               };


        }); 
     
    };

    $scope.map.paths = {
          trace: {
                color: '#73b6e6',
                weight: 4,
                latlngs: [],
            }
        };

    $scope.map.markers = {};
		$scope.map.sectors = [];
		$scope.map.products = {};

    $scope.map.startCouriers = function(){

      $http({
          method: 'GET',
          url: $rootScope.apiurl + '/get/list/courier',
          params: {api_token: api}
        }).then(function successCallback(response){
            console.log(response);
				
					if(response.data.message == "You haven't permission!")
							$rootScope.logout();
				else{
					$http({
						method: 'GET',
						url: $rootScope.apiurl + '/get/list/sectors',
						params: {api_token: api}
					}).then(function successCallback(sectors){
							console.log(sectors);
						if(response.data.message == "You haven't permission!")
							$rootScope.logout();
						else{
							$scope.map.sectors = sectors.data;
							
							$scope.map.couriersList = response.data;

							for(var i in $scope.map.couriersList){

								$scope.map.couriersList[i].fullName = $scope.map.couriersList[i].username + ' (' + $scope.map.couriersList[i].last_name + ' ' + $scope.map.couriersList[i].first_name + ' ' + $scope.map.couriersList[i].middle_name + ')';
								}
							
							
						}
					}, function errorCallback(error){
							console.log(error);
					});
            
				}
        });
    };
	
		$scope.map.updateSector = function(updateType){
			var paths = $scope.map.selectedSector.coords,
					allSectorCoords = [];
			console.log('products: ', $scope.map.products);
			for(var m in $scope.map.markers){
				if(m.indexOf('sector') != -1)
					delete $scope.map.markers[m];
			}
			
			for(var p in $scope.map.paths){
				if(p.indexOf('p') == 0)
					delete $scope.map.paths[p];
			}
			
			for(var i in paths){
				$scope.map.paths[i] = paths[i];
				
				var centroid = getCentroid($scope.map.paths[i].latlngs);
				allSectorCoords.push({
					lat: centroid[0],
					lng: centroid[1]
				});
				var res = i.substring(1);

				$scope.map.markers['sector'+parseInt(res)] = {
																												lat: centroid[0],
																												lng: centroid[1],
																												icon: {
																																	 type: 'div',
																																	 iconSize: [0, 0],
																																	 html: '<b>'+res+'</b>',
																																	 iconAnchor:  [0, 0]
																															},
																												focus: false,
																												draggable: false
																											};
				
				if($scope.map.selectedDate.date && $scope.map.products[$scope.map.selectedCourier.id] && $scope.map.products[$scope.map.selectedCourier.id][$scope.map.selectedDate.date] && $scope.map.products[$scope.map.selectedCourier.id][$scope.map.selectedDate.date][$scope.map.selectedSector.id] && $scope.map.products[$scope.map.selectedCourier.id][$scope.map.selectedDate.date][$scope.map.selectedSector.id][res]){
					$scope.map.markers['sector'+parseInt(res)].message = 'Количество газет в секторе ' + res + ': ' + $scope.map.products[$scope.map.selectedCourier.id][$scope.map.selectedDate.date][$scope.map.selectedSector.id][res] + '<br>' + 'Общее количество газет в ' + $scope.map.selectedSector.title + ': ' + $scope.map.products[$scope.map.selectedCourier.id][$scope.map.selectedDate.date][$scope.map.selectedSector.id].allCount;
				} else if($scope.map.selectedDate.date && $scope.map.products[$scope.map.selectedCourier.id] && $scope.map.products[$scope.map.selectedCourier.id][$scope.map.selectedDate.date] && $scope.map.products[$scope.map.selectedCourier.id][$scope.map.selectedDate.date][$scope.map.selectedSector.id] && $scope.map.products[$scope.map.selectedCourier.id][$scope.map.selectedDate.date][$scope.map.selectedSector.id]){
					$scope.map.markers['sector'+parseInt(res)].message = 'Количество газет в секторе ' + res + ': ' + '0' + '<br>' + 'Общее количество газет в ' + $scope.map.selectedSector.title + ': ' + $scope.map.products[$scope.map.selectedCourier.id][$scope.map.selectedDate.date][$scope.map.selectedSector.id].allCount;
				}
			}
			if(updateType != 'refresh'){
				var centerCoord = getCentroid(allSectorCoords);
				//console.log(centerCoord, allCoords);
				if(allSectorCoords.length < 3)
					centerCoord = [allSectorCoords[0].lat, allSectorCoords[0].lng];
				$scope.map.center = {
					lat: centerCoord[0],
					lng: centerCoord[1],
					zoom: 14
				};
			}
		};

  	$scope.map.updateCoords = function(){
      var deffered = $q.defer();
       $('.rectangle').remove();
      
      $scope.map.paths['trace'] = {
                color: '#73b6e6',
                weight: 4,
                latlngs: []
        };

    	for(var m in $scope.map.markers){
				if(m.indexOf('marker') != -1)
					delete $scope.map.markers[m];
			}

      $scope.map.selectedDate = {};
			$scope.map.products = {};

  		$http({
  			method: 'GET',
  			url: $rootScope.apiurl + '/get/list/coordinates',
  			params: {api_token: api, user_id: $scope.map.selectedCourier.id}
  		}).then(function(response){
				console.log('coords: ', response);
				if(response.data.message == "You haven't permission!")
							$rootScope.logout();
				else{
					//leafletData.getMap().then(function(map) {
					 console.log(response.data);
					var coords = response.data.coordResults;
					allCoords = coords;
					$scope.map.coordinates = [];
					var latitudes = [], longitudes = [], date, time, oldDate, oldLat, oldLng, coordNum = 0, latlngs = [];

				for(var coord in coords){
							var coordTime = new Date(coords[coord].date); 
							var formatTime = coordTime.getFullYear() + '-';
					
							if(parseInt(coordTime.getMonth()+1) < 10)
								formatTime = formatTime + '0' + parseInt(coordTime.getMonth()+1) + '-';
							else
								formatTime = formatTime + parseInt(coordTime.getMonth()+1) + '-';
							if(parseInt(coordTime.getDate()) < 10)
								formatTime = formatTime + '0' + parseInt(coordTime.getDate()) + 'T';
							else
								formatTime = formatTime + parseInt(coordTime.getDate()) + 'T';
					
							if(parseInt(coordTime.getHours()) < 10)
								formatTime = formatTime + '0' + parseInt(coordTime.getHours()) + ':';
							else
								formatTime = formatTime + parseInt(coordTime.getHours()) + ':';
							if(parseInt(coordTime.getMinutes()) < 10)
								formatTime = formatTime + '0' + parseInt(coordTime.getMinutes()) + ':';
							else
								formatTime = formatTime + parseInt(coordTime.getMinutes()) + ':';
							if(parseInt(coordTime.getSeconds()) < 10)
								formatTime = formatTime + '0' + parseInt(coordTime.getSeconds());
							else
								formatTime = formatTime + parseInt(coordTime.getSeconds());
					
							date = formatTime.substring(0, 10);
							time = formatTime.substring(11);

							if(date!==oldDate && coord!=0 && latlngs.length){
								latitudes = [];
								longitudes = [];
								latlngs = [];
								coordNum++;
							}


							if(parseFloat(coords[coord].latitude))
								latitudes.push(parseFloat(coords[coord].latitude));
							if(parseFloat(coords[coord].longitude))
								longitudes.push(parseFloat(coords[coord].longitude));
							if(parseFloat(coords[coord].latitude) && parseFloat(coords[coord].longitude)){
								latlngs.push({
									lat: parseFloat(coords[coord].latitude),
									lng: parseFloat(coords[coord].longitude),
									time: time,
									comment: coords[coord].comment,
									newsNum: coords[coord].news_num,
									isManual: coords[coord].isManual,
									isSuccess: coords[coord].isSuccess
								});

							$scope.map.coordinates[coordNum] = {
								date: date,
								lat: latitudes,
								lng: longitudes,
								latlngs: latlngs,
								id: coordNum
							};

							}

							oldDate = date;
					}
					
					var productsResults = response.data.prodResults;
							
							for(var p in productsResults){
								var coordTime = new Date(productsResults[p].date); 
								var formatTime = coordTime.getFullYear() + '-';

								if(parseInt(coordTime.getMonth()+1) < 10)
									formatTime = formatTime + '0' + parseInt(coordTime.getMonth()+1) + '-';
								else
									formatTime = formatTime + parseInt(coordTime.getMonth()+1) + '-';
								if(parseInt(coordTime.getDate()) < 10)
									formatTime = formatTime + '0' + parseInt(coordTime.getDate()) + 'T';
								else
									formatTime = formatTime + parseInt(coordTime.getDate()) + 'T';

								if(parseInt(coordTime.getHours()) < 10)
									formatTime = formatTime + '0' + parseInt(coordTime.getHours()) + ':';
								else
									formatTime = formatTime + parseInt(coordTime.getHours()) + ':';
								if(parseInt(coordTime.getMinutes()) < 10)
									formatTime = formatTime + '0' + parseInt(coordTime.getMinutes()) + ':';
								else
									formatTime = formatTime + parseInt(coordTime.getMinutes()) + ':';
								if(parseInt(coordTime.getSeconds()) < 10)
									formatTime = formatTime + '0' + parseInt(coordTime.getSeconds());
								else
									formatTime = formatTime + parseInt(coordTime.getSeconds());

								productsResults[p].date = formatTime.substring(0, 10);

								if($scope.map.products[productsResults[p].courier_id]){
									if($scope.map.products[productsResults[p].courier_id][productsResults[p].date]){
										if($scope.map.products[productsResults[p].courier_id][productsResults[p].date][productsResults[p].sector_id]){
											$scope.map.products[productsResults[p].courier_id][productsResults[p].date][productsResults[p].sector_id].allCount += parseInt(productsResults[p].count);
											
											if($scope.map.products[productsResults[p].courier_id][productsResults[p].date][productsResults[p].sector_id][productsResults[p].sector_num]){
												$scope.map.products[productsResults[p].courier_id][productsResults[p].date][productsResults[p].sector_id][productsResults[p].sector_num] += parseInt(productsResults[p].count);
											} else {
												$scope.map.products[productsResults[p].courier_id][productsResults[p].date][productsResults[p].sector_id][productsResults[p].sector_num] = parseInt(productsResults[p].count);
											}
										} else {
											$scope.map.products[productsResults[p].courier_id][productsResults[p].date][productsResults[p].sector_id] = {};

											$scope.map.products[productsResults[p].courier_id][productsResults[p].date][productsResults[p].sector_id].allCount = parseInt(productsResults[p].count);
											$scope.map.products[productsResults[p].courier_id][productsResults[p].date][productsResults[p].sector_id][productsResults[p].sector_num] = parseInt(productsResults[p].count);
										}
									} else {
											$scope.map.products[productsResults[p].courier_id][productsResults[p].date] = {};
											$scope.map.products[productsResults[p].courier_id][productsResults[p].date][productsResults[p].sector_id] = {};

											$scope.map.products[productsResults[p].courier_id][productsResults[p].date][productsResults[p].sector_id].allCount = parseInt(productsResults[p].count);
											$scope.map.products[productsResults[p].courier_id][productsResults[p].date][productsResults[p].sector_id][productsResults[p].sector_num] = parseInt(productsResults[p].count);
									}
								} else {
									$scope.map.products[productsResults[p].courier_id] = {};
									
									$scope.map.products[productsResults[p].courier_id][productsResults[p].date] = {};
									
									$scope.map.products[productsResults[p].courier_id][productsResults[p].date][productsResults[p].sector_id] = {};
									
									$scope.map.products[productsResults[p].courier_id][productsResults[p].date][productsResults[p].sector_id].allCount = parseInt(productsResults[p].count);
									
									$scope.map.products[productsResults[p].courier_id][productsResults[p].date][productsResults[p].sector_id][productsResults[p].sector_num] = parseInt(productsResults[p].count);
								}
								
								console.log('coords products: ', $scope.map.products);
							}

					console.log('new coords: ', $scope.map.coordinates);
						deffered.resolve();
						//});
				}
  		});
      
      return deffered.promise;
  	};

    $scope.map.updateDates = function(){
      var selectedId = $scope.map.selectedDate;
			//console.log('selected date: ', $scope.map.selectedDate);
      var myPromise = $scope.map.updateCoords();
      
      myPromise.then(function(resolve){
        //leafletData.getMap().then(function(map) {
          $scope.map.selectedDate = selectedId;
      var dateNum = $scope.map.selectedDate.id, diffTime = 0;

      $scope.map.center.lat = (Math.min.apply(null, $scope.map.coordinates[dateNum].lat)+Math.max.apply(null, $scope.map.coordinates[dateNum].lat))/2;
        $scope.map.center.lng = (Math.min.apply(null, $scope.map.coordinates[dateNum].lng)+Math.max.apply(null, $scope.map.coordinates[dateNum].lng))/2;
        $scope.map.center.zoom = 14;
            
        var pathMinLat = Math.min.apply(null, $scope.map.coordinates[dateNum].lat),
            pathMaxLat = Math.max.apply(null, $scope.map.coordinates[dateNum].lat),
            pathMinLng = Math.min.apply(null, $scope.map.coordinates[dateNum].lng),
            pathMaxLng = Math.max.apply(null, $scope.map.coordinates[dateNum].lng),
            pathStarted = false,
            pathEnded = false;
          
          for(var latlng in $scope.map.coordinates[dateNum].latlngs){
            if($scope.map.coordinates[dateNum].latlngs[latlng].isManual!=1){
              $scope.map.paths.trace.latlngs.push($scope.map.coordinates[dateNum].latlngs[latlng]);
            }
          }

        for(var coord in $scope.map.coordinates[dateNum].latlngs){

          if($scope.map.coordinates[dateNum].latlngs[coord].isManual==1){
            var icon = {};
            icon.iconSize = [40, 40];
            icon.iconAnchor = [10, 10];
            icon.type = 'div';
            $scope.map.markers['marker' + coord] = {};
            
              var latMarker = $scope.map.coordinates[dateNum].latlngs[coord].lat;
              var lngMarker = $scope.map.coordinates[dateNum].latlngs[coord].lng;
              
              $scope.map.markers['marker' + coord].lat = latMarker;
              $scope.map.markers['marker' + coord].lng = lngMarker;
						
							$scope.map.markers['marker' + coord].message = '';
						
							if($scope.map.coordinates[dateNum].latlngs[coord].comment !== null && $scope.map.coordinates[dateNum].latlngs[coord].comment !== undefined && $scope.map.coordinates[dateNum].latlngs[coord].comment !== ''){
								$scope.map.markers['marker' + coord].message += 'Комментарий: ' + $scope.map.coordinates[dateNum].latlngs[coord].comment + "<br>";
							}
						
							if($scope.map.coordinates[dateNum].latlngs[coord].newsNum !== null && $scope.map.coordinates[dateNum].latlngs[coord].newsNum !== undefined && $scope.map.coordinates[dateNum].latlngs[coord].newsNum !== 0){
								$scope.map.markers['marker' + coord].message += 'Количество газет: ' + $scope.map.coordinates[dateNum].latlngs[coord].newsNum + "<br>";
							}
									
							$scope.map.markers['marker' + coord].message += $scope.map.coordinates[dateNum].latlngs[coord].time;
						 
          
              if($scope.map.coordinates[dateNum].latlngs[coord].isSuccess==1){
                $scope.map.markers['marker' + coord].message += "<br>Дом закончен";
                icon.html = "<i class='fa fa-comment' aria-hidden='true' style = 'color:#7eff7e;font-size: 22px;'></i>";
              }
              else{
                $scope.map.markers['marker' + coord].message += "<br>Дом не закончен";
                icon.html = "<i class='fa fa-comment' aria-hidden='true' style = 'color:#ff4747;font-size: 22px;'></i>";
              }

              $scope.map.markers['marker' + coord].icon = icon;
          }

          else if (coord==0) {
            $scope.map.markers['marker' + coord] = $scope.map.coordinates[dateNum].latlngs[coord];
            $scope.map.markers['marker' + coord].message = "Начало<br>" + $scope.map.coordinates[dateNum].latlngs[coord].time;
            pathStarted = true;
          }
          else if(!pathStarted){
            $scope.map.markers['marker' + coord] = $scope.map.coordinates[dateNum].latlngs[coord];
            $scope.map.markers['marker' + coord].message = "Начало<br>" + $scope.map.coordinates[dateNum].latlngs[coord].time;
            pathStarted = true;
          }
          else if(coord == $scope.map.coordinates[dateNum].latlngs.length-1){
            $scope.map.markers['marker' + coord] = $scope.map.coordinates[dateNum].latlngs[coord];
            $scope.map.markers['marker' + coord].message = "Конец<br>" + $scope.map.coordinates[dateNum].latlngs[coord].time;
            pathEnded = true;
          }
          else{
            var icon = {};
            icon.iconSize = [40, 40];
            icon.iconAnchor = [10, 10];
            icon.type = 'div';
            

            if($scope.map.coordinates[dateNum].latlngs[coord].lat === $scope.map.coordinates[dateNum].latlngs[parseInt(coord)+1].lat && $scope.map.coordinates[dateNum].latlngs[coord].lng === $scope.map.coordinates[dateNum].latlngs[parseInt(coord)+1].lng){
                diffTime += (timeToSeconds($scope.map.coordinates[dateNum].latlngs[coord].time) - timeToSeconds($scope.map.coordinates[dateNum].latlngs[parseInt(coord)-1].time));  
            }
            else if($scope.map.coordinates[dateNum].latlngs[coord].lat === $scope.map.coordinates[dateNum].latlngs[parseInt(coord)-1].lat && $scope.map.coordinates[dateNum].latlngs[coord].lng === $scope.map.coordinates[dateNum].latlngs[parseInt(coord)-1].lng){
              
              diffTime += (timeToSeconds($scope.map.coordinates[dateNum].latlngs[coord].time) - timeToSeconds($scope.map.coordinates[dateNum].latlngs[parseInt(coord)-1].time));
              icon.html = "<i class='fa fa-clock-o' aria-hidden='true' style = 'color:white;font-size: 25px; -webkit-transform: rotate("+ 0 +"deg)'></i>";
              
              var delay = secondsToTime(diffTime);

              $scope.map.markers['marker' + coord] = $scope.map.coordinates[dateNum].latlngs[coord];
              $scope.map.markers['marker' + coord].icon = icon;
              $scope.map.markers['marker' + coord].message = 'Приостановка: ' + delay + "<br>" + $scope.map.coordinates[dateNum].latlngs[coord].time;

              diffTime = 0;

            }
            else{

              var diffLat = $scope.map.coordinates[dateNum].latlngs[parseInt(coord)+1].lat - $scope.map.coordinates[dateNum].latlngs[coord].lat;
              var diffLng = $scope.map.coordinates[dateNum].latlngs[parseInt(coord)+1].lng - $scope.map.coordinates[dateNum].latlngs[coord].lng;
              var angle = 360 - (Math.atan2(diffLat, diffLng)*57.295779513082);

              icon.html = "<i class='fa fa-arrow-right' aria-hidden='true' style = 'color:#545454;font-size: 20px; -webkit-transform: rotate("+ angle +"deg)'></i>";
              
              $scope.map.markers['marker' + coord] = $scope.map.coordinates[dateNum].latlngs[coord];
              $scope.map.markers['marker' + coord].icon = icon;
              $scope.map.markers['marker' + coord].message = $scope.map.coordinates[dateNum].latlngs[coord].time;

            }
     
          }
        }
          
          if(!pathEnded){
            if($scope.map.paths.trace.latlngs.length>1){
                if($scope.map.markers['marker' + coord].message.indexOf('Дом')==-1){
                  $scope.map.markers['marker' + coord] = $scope.map.paths.trace.latlngs[$scope.map.paths.trace.latlngs.length-1];
                  $scope.map.markers['marker' + coord].message = "Конец<br>" + $scope.map.paths.trace.latlngs[$scope.map.paths.trace.latlngs.length-1].time;
                }
                else {
                    $scope.map.markers['marker' + coord].message = "Конец<br>" + $scope.map.markers['marker' + coord].message;
                }
                pathEnded = true;
            }
          }
      
      console.log(dateNum, $scope.map.markers);
          if($scope.map.selectedSector && $scope.map.selectedSector.id)
      			$scope.map.updateSector('refresh');
    });
			
    };

    function timeToSeconds(time){
      var hours = parseInt(time.substring(0, 2));
      var mins = parseInt(time.substring(3, 5));
      var secs = parseInt(time.substring(6));

      return secs+(mins*60)+(hours*3600);
    }

    function secondsToTime(seconds){
      var hours = parseInt(seconds/3600);
      var mins = parseInt((seconds-hours*3600)/60);
      var secs = parseInt(seconds-hours*3600-mins*60);

      if(hours<10)
        hours = '0' + hours;
      if(mins<10)
        mins = '0' + mins;
      if(secs<10)
        secs = '0' + secs;

      return hours + ':' + mins + ':' + secs;
    }
	
		function getCentroid(array) {
		
			var arr = [];
			for(var a in array){
				arr.push([array[a].lat, array[a].lng]);
			}

				var twoTimesSignedArea = 0;
				var cxTimes6SignedArea = 0;
				var cyTimes6SignedArea = 0;

				var length = arr.length

				var x = function (i) { return arr[i % length][0] };
				var y = function (i) { return arr[i % length][1] };

				for ( var i = 0; i < arr.length; i++) {
						var twoSA = x(i)*y(i+1) - x(i+1)*y(i);
						twoTimesSignedArea += twoSA;
						cxTimes6SignedArea += (x(i) + x(i+1)) * twoSA;
						cyTimes6SignedArea += (y(i) + y(i+1)) * twoSA;
				}
				var sixSignedArea = 3 * twoTimesSignedArea;
				return [ cxTimes6SignedArea / sixSignedArea, cyTimes6SignedArea / sixSignedArea];        
	}

  });