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
  	$scope.map.tiles = {};
  	$scope.map.height = $(window).height()*0.82 + 'px';

  	var auth_token = 'pk.eyJ1IjoiYWxpOTI1IiwiYSI6ImNpcHZobHIxMzAwNTZpMWtzcmFrdmk2OXcifQ.7AB_LOCsVI6kUn_vPDUXkg';

  	$scope.map.tiles.url = 'https://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=' + auth_token;

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

    $scope.map.startCouriers = function(){

      $http({
          method: 'GET',
          url: $rootScope.apiurl + '/get/list/courier',
          params: {api_token: api}
        }).then(function successCallback(response){
            console.log(response);
				
					if(response.data == "You haven't permission!")
							$rootScope.logout();
				else{
					$http({
						method: 'GET',
						url: $rootScope.apiurl + '/get/list/sectors',
						params: {api_token: api}
					}).then(function successCallback(sectors){
							console.log(sectors);
						$scope.map.sectors = sectors.data;
						$scope.map.couriersList = response.data;

            for(var i in $scope.map.couriersList){

              $scope.map.couriersList[i].fullName = $scope.map.couriersList[i].username + ' (' + $scope.map.couriersList[i].last_name + ' ' + $scope.map.couriersList[i].first_name + ' ' + $scope.map.couriersList[i].middle_name + ')';
              }
						
					}, function errorCallback(error){
							console.log(error);
					});
            
				}
        });
    };
	
		$scope.map.updateSector = function(){
			var paths = JSON.parse($scope.map.selectedSector.coords);
			
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

  		$http({
  			method: 'GET',
  			url: $rootScope.apiurl + '/get/list/coordinates',
  			params: {api_token: api, user_id: $scope.map.selectedCourier.id}
  		}).then(function(response){
				if(response.data == "You haven't permission!")
							$rootScope.logout();
				else{
					leafletData.getMap().then(function(map) {
					 console.log(response.data);
					var coords = response.data;
					allCoords = coords;
					$scope.map.coordinates = [];
					var latitudes = [], longitudes = [], date, time, oldDate, oldLat, oldLng, coordNum = 0, latlngs = [];

				for(var coord in coords){

							date = coords[coord].date.substring(0, 10);
							time = coords[coord].date.substring(11);

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

					console.log($scope.map.coordinates);
						deffered.resolve();
						});
				}
  		});
      
      return deffered.promise;
  	};

    $scope.map.updateDates = function(){
      var selectedId = $scope.map.selectedDate;
      var myPromise = $scope.map.updateCoords();
      
      myPromise.then(function(resolve){
        leafletData.getMap().then(function(map) {
          $scope.map.selectedDate = selectedId;
      var dateNum = $scope.map.selectedDate.id, diffTime = 0;

      $scope.map.center.lat = (Math.min.apply(null, $scope.map.coordinates[dateNum].lat)+Math.max.apply(null, $scope.map.coordinates[dateNum].lat))/2;
        $scope.map.center.lng = (Math.min.apply(null, $scope.map.coordinates[dateNum].lng)+Math.max.apply(null, $scope.map.coordinates[dateNum].lng))/2;
        $scope.map.center.zoom = 16;
            
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
              
              $scope.map.markers['marker' + coord].lat = latMarker+0.0005;
              $scope.map.markers['marker' + coord].lng = lngMarker-0.0005;
            
                $scope.map.markers['marker' + coord].message = $scope.map.coordinates[dateNum].latlngs[coord].comment + "<br>" + $scope.map.coordinates[dateNum].latlngs[coord].time;
          
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
          
//          geocoder.reverse({lat: $scope.map.coordinates[dateNum].latlngs[0].lat, lng: $scope.map.coordinates[dateNum].latlngs[0].lng}, map.options.crs.scale(map.getZoom()), function(results) {
//                console.log(results);
//
//                    var bboxCoords = {
//                      nE: results[2].bbox._northEast,
//                      sW: results[2].bbox._southWest
//                    };
//
//                    var minLat = bboxCoords.sW.lat, minLng = bboxCoords.sW.lng, maxLat = bboxCoords.nE.lat, maxLng = bboxCoords.nE.lng;
//                    var minY = minLat, minX = minLng, maxY = maxLat, maxX = maxLng, o = 1, minXt, maxXt, minYt, maxYt, t=0;
//                    console.log(maxY, minLat, '/', minX, maxLng);
//              
//                    while(minX<maxLng){
//                    if(minX-0.01>=pathMinLng && minX-0.01<=pathMaxLng){    
//                        if(!t)
//                            minXt=minX-0.02;
//                        t++;
//                        maxXt = minX;
//                    }
//                      
//                      minX += 0.01;
//                    }
//                    
//                    t=0;
//                    while(maxY>minLat){
//                        if(maxY+0.005<=pathMaxLat && maxY+0.005>=pathMinLat){ 
//                            if(!t)
//                                maxYt = maxY+0.01;
//                            t++;
//                            minYt = maxY;
//                        }
//                      
//                      maxY -= 0.005;
//                    }
//              
//                    
//              
//                    minY = minLat; minX = minLng; maxY = maxLat; maxX = maxLng;
//            
//                    while(minX<maxLng){
//                      var points = [[minY, minX], [maxY, minX]];
//                      
//                      L.polyline(points, {color: "red", weight: 1.5}).setStyle({'className': 'rectangle'}).addTo(map);
//                      
//                      minX += 0.01;
//                    }
//            
//                    minY = minLat; minX = minLng; maxY = maxLat; maxX = maxLng;
//            
//                    while(maxY>minLat){
//                      var points = [[maxY, minX], [maxY, maxX]];
//                      
//                      L.polyline(points, {color: "red", weight: 1.5}).setStyle({'className': 'rectangle'}).addTo(map);
//                      
//                      maxY -= 0.005;
//                      
//                    }
//            
//                    minY = minLat; minX = minLng; maxY = maxLat; maxX = maxLng;
//            
//                    while(maxY>minLat){
//                      minX = minLng;
//                      while(minX<maxLng){
//                        if(minX+0.01>=pathMinLng && minX<=pathMaxLng && maxY-0.005<=pathMaxLat && maxY>=pathMinLat){ 
//                        $scope.map.markers['sectorMarker'+o] = {lat: maxY-0.0025, lng: minX+0.005};
//                        $scope.map.markers['sectorMarker'+o].icon = {
//                                                              type: 'div',
//                                                              iconSize: [230, 0],
//                                                              html: '<b>'+o+'</b>',
//                                                              iconAnchor:  [0, 0]
//                                                          };
//                            o++;
//                        }
//
//                        minX += 0.01;
//                        
//                      }
//                      maxY -= 0.005;
//                    }
//              $('i.fa-comment').parent().addClass('comment-icon');
//          $('i.fa-clock-o').parent().addClass('clock-icon'); 
//
//              });
         
    });
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