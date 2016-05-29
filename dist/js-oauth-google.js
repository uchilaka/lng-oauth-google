var __googleLibCallback, __googleLibEmbeddedCallback;
angular.module('js-oauth-google', [
    'angular-storage'
]).factory('$googleOauthService', [
    '$rootScope', 'store',
    function $googleOauthServiceProvider($all, store) {
        /**
         * use angular configuration pattern to set vars with client credentials:
         * { apiKey, clientId, scopes }
         */
        this.vars = {};

        var accessToken,
                authCallback,
                errorCallback = function(errorMessage) {
                    throw '$googleOauthService ERROR: ' + errorMessage;
                },
                credentials = {},
                __s = {
                    init: function (callback) {
                        __googleLibEmbeddedCallback = callback;
                        __googleLibCallback = function () {
                            // configure google client library
                            gapi.client.setApiKey(vars.apiKey);
                            $all.$broadcast('$googleAuthService:isReady');
                            // hit callback if function
                            if (angular.isFunction(__googleLibEmbeddedCallback))
                                __googleLibEmbeddedCallback();
                        };
                        (function (d, s, id) {
                            var js, fjs = d.getElementsByTagName(s)[0];
                            if (d.getElementById(id)) {
                                return;
                            }
                            js = d.createElement(s);
                            js.id = id;
                            js.src = "https://apis.google.com/js/client.js?onload=__googleLibCallback";
                            fjs.parentNode.insertBefore(js, fjs);
                        }(document, 'script', 'google-cloud-lib'));
                    },
                    getAccessToken: function () {
                        return __s.getToken();
                    },
                    getToken: function () {
                        return store.get('gapi.access_token');
                    },
                    isValidToken: function (token) {
                        return token.hasOwnProperty('access_token');
                    },
                    checkToken: function () {
                        var accessToken = store.get('gapi.access_token');
                        if (accessToken && __s.isValidToken(accessToken)) {
                            console.log('Found token! -> ', accessToken);
                            // check expiration
                            // console.log('Found gapi token:', accessToken);
                            // calculate issued date
                            var nowInSeconds = (new Date()).getTime() / 1000,
                                    issuedDate = new Date(accessToken.issued_at * 1000),
                                    secondsLeft = (accessToken.issued_at + accessToken.expires_in) - nowInSeconds;
                            console.log('gapi token stats (issued):', issuedDate, ' (seconds left):', secondsLeft);
                            // refresh if less than 15 minutes is left
                            if (secondsLeft < (15 * 60)) {
                                // refresh token (immediate:true)
                                gapi.auth.authorize({client_id: credentials.clientId, scope: vars.scopes, immediate: true, response_type: 'token'}, __s.handleResult);
                            } else
                                console.log('Skipping token refresh: ~' + (Math.round(secondsLeft) / 60) + ' minutes left');
                        } else
                            console.log('No valid google authentication token found. googleAuthService.checkToken() did nothing.');
                    },
                    handleResult: function (authResult) {
                        // build token
                        accessToken = {
                            access_token: authResult.access_token,
                            client_id: authResult.client_id,
                            expires_at: parseFloat(authResult.expires_at),
                            expires_in: parseFloat(authResult.expires_in),
                            issued_at: parseFloat(authResult.issued_at),
                            token_type: authResult.token_type,
                            response_type: authResult.response_type,
                            scope: authResult.scope,
                            state: authResult.scope
                        };
                        // cache access token for later
                        store.set('gapi.access_token', accessToken);

                        if (angular.isFunction(authCallback))
                            authCallback(authResult);
                        else if (authResult && !authResult.error) {
                            gapi.client.load('plus', 'v1').then(function () {
                                // get user information in UI
                                var request = gapi.client.plus.people.get({
                                    'userId': 'me'
                                });
                                // run request
                                request.then(function (resp) {
                                    //console.log('Google auth response:', resp.result);
                                    if (angular.isFunction(authCallback))
                                        authCallback(resp.result);
                                    else
                                        console.log('Google auth response:', resp.result);

                                    // get access token
                                    gapi.auth.authorize({
                                        client_id: credentials.clientId,
                                        immediate: false,
                                        response_type: 'token',
                                        scope: vars.scopes
                                    }, function () {
                                        console.log('Google API token:', arguments);
                                    });

                                }, function (reason) {
                                    //F7.alert(reason.result.error.message, 'Google authentication failed');
                                    errorCallback(reason.result.error.message);
                                });
                            });
                        } else {
                            //F7.alert(authResult.error.message, 'Google login failed!');
                            errorCallback(authResult.error.message);
                        }
                    },
                    updateCredentials: function (key) {
                        if (vars.hasOwnProperty(key)) {
                            console.log('Google app credentials updated!');
                            credentials = vars[key];
                        }
                    },
                    getCredentials: function () {
                        return credentials;
                    },
                    getScopes: function () {
                        // return scopes as array
                        return vars.scopes.split(' ');
                    },
                    auth: function (callback) {
                        if (angular.isFunction(callback))
                            authCallback = callback;
                        gapi.auth.authorize({client_id: credentials.clientId, scope: vars.scopes, immediate: false, response_type: 'token'}, __s.handleResult);
                    },
                    setErrorCallback: function (errorHandler) {
                        errorCallback = errorHandler;
                    },
                    setAuthResponseCallback: function (authResponseHandler) {
                        authCallback = authResponseHandler;
                    }
                };
        // show google credentials
        console.log('Google app credentials:', vars);
        return __s;

    }]);