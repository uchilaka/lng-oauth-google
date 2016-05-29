angular.module('app.example', [
    'lng-oauth-google'
]).config(['$googleOauthServiceProvider', function($goasp) {
    console.log('Config ($gauth) -> ', arguments);
    $goasp.vars = {
        clientId: 'someF3keClientId',
        apiToken: 'someOth3rF3keToken'
    };
}]).controller('HelloAppCtrl', [
    '$scope', '$googleOauthService', 
    function ($scope, $gauth) {
        console.log('[module.HelloAppCtrl]');
        
        $scope.login = function() {
            
        };
        
    }]);