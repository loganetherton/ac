'use strict';

var app = angular.module('mean.socket');

app.controller('MeanSocketController', ['$scope', '$state', 'Global', 'MeanSocket', '$interval',
	function($scope, $state, Global, MeanSocket, $interval) {
        console.log('mean socket controller');
		$scope.global = Global;
		$scope.package = {
			name: 'socket'
		};

        $scope.messages = [];
	
		$scope.socketAfterSend = function(message) {
			$scope.message = {};
		};

		$scope.socketAfterJoin = function(channel, messages) {
			$scope.activeChannel = channel;
			$scope.messages = messages;
		};

		$scope.socketAfterGet = function(message) {
			$scope.messages.push(message);
		};

		$scope.socketAfterGetChannels = function(channels) {
			$scope.channels = channels;
		};


        MeanSocket.on('test:test', function(data) {
            console.log('test');
            console.log(data);
        });



		$scope.createNewChannel = function(channel) {
			$scope.activeChannel = channel;
			$scope.newChannel = '';
		};

        MeanSocket.on('room:new', function messageReceived(message) {
            console.log('calling on room:new');
            $scope.messages.push(message);
        });

        //MeanSocket.emit('test', {
        //    data: 'hi'
        //});
        //
        //MeanSocket.on('test', function(data) {
        //    console.log('test emit listener data: ' + data.data);
        //});

        MeanSocket.emit('user:joined', {
            name: 'logan'
        });

        MeanSocket.on('user:joined', function(user) {
            console.log('user:joined');
            //$scope.messages.push(user);
        });

        //$interval(function(){
        //    $scope.messages.push('logan')
        //}, 1000);

        $scope.$watchCollection('messages', function(newVal, oldVal){
            //console.log('here');
            angular.forEach(newVal, function(value) {
                console.log(value);
            });
        });
		// $scope.channel = {
		// 	name: ''
		// };

		// // 			// //App info
		// // // $scope.channels = [];
		// $scope.listeningChannels = [];
		// // // $scope.activeChannel = null;
		// // // $scope.userName = $scope.global.user._id;
		// // // $scope.messages = [];

		// // // ///////////////////////////////////////////////////////////////////////
		// // // ///////////////////////////////////////////////////////////////////////
		// // // //Socket.io listeners
		// // // ///////////////////////////////////////////////////////////////////////
		// // // ///////////////////////////////////////////////////////////////////////

		// // // MeanSocket.on('channels', function channels(channels) {
		// // // 	console.log('channels', channels);

		// // // 	console.log(channels);
		// // // 	$scope.channels = channels;
		// // // 	$scope.channels = channels;
		// // // });

		// // // MeanSocket.on('message:received', function messageReceived(message) {
		// // // 	$scope.messages.push(message);
		// // // });

		// $scope.listenChannel = function listenChannel(channel) {
		// 	MeanSocket.on('messages:channel:' + channel, function messages(messages) {
		// 		alert(channel)
		// 		MeanSocket.activeChannel = channel;
		// 		$scope.afterJoin({
		// 			messages: messages,
		// 			channel: channel
		// 		});
		// 	});

		// 	MeanSocket.on('message:channel:' + channel, function message(message) {
		// 		console.log('got message: ', message);
		// 		console.log(channel, MeanSocket.activeChannel)
		// 		if (channel === MeanSocket.activeChannel) {
		// 			$scope.meanSocketAfterGet({
		// 				message: message
		// 			});
		// 		}
		// 	});

		// 	MeanSocket.on('message:remove:channel:' + channel, function(removalInfo) {

		// 	});

		// 	if ($scope.listeningChannels.indexOf(channel) === -1)
		// 		$scope.listeningChannels.push(channel);

		// };

		// // Join

		// $scope.joinChannel = function joinChannel(channel) {
		// 	alert(channel);
		// 	//Listen to channel if we dont have it already.
		// 	if ($scope.listeningChannels.indexOf(channel) === -1) {
		// 		$scope.listenChannel(channel);
		// 	}

		// 	MeanSocket.emit('channel:join', {
		// 		channel: channel,
		// 		name: $scope.global.user._id
		// 	});
		// };

		// //Auto join the defaultChannel
		// console.log(typeof MeanSocket.activeChannel)
		// if (typeof MeanSocket.activeChannel === 'undefined')
		// 	$scope.joinChannel('mean');

		// // $scope.$watch('joinToChannel', function() {
		// // 	if ($scope.joinToChannel)
		// // 		$scope.joinChannel($scope.joinToChannel);
		// // });
	}
]);