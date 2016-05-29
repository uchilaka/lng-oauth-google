angular.module('app.example', [
    'lng-oauth-google',
    // @IMPORTANT - after you write your google-config.js file, be SURE 
    // to inject it AFTER injecting the lng-oauth-google library
    'cfg.google'
]).controller('HelloAppCtrl', [
    '$scope', '$googleOauthService', 
    function ($scope, $gauth) {
        console.log('[module.HelloAppCtrl]');
        
        $gauth.init(function() {
            console.log('Google library is ready!');
            $gauth.setAuthResponseHandler(function (authResponse) {
                console.log('Google auth response -> ', authResponse);
            });
            $gauth.setErrorHandler(function(errorMessage) {
                console.log('Google auth error -> ', errorMessage);
            });
        });
        
        $scope.login = function() {
            $gauth.login();
        };
        
    }]);