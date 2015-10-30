;(function () {
  'user strict'
  angular.module("dfr")
  .factory("Post", function PostFactory($resource) {
    return $resource("/campaign/p/:id", {}, {
      'update': { method: 'PUT', params: {}, isArray: false }
    });
  }); 

})();