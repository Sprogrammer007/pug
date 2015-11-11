;(function () {
  'user strict'
  angular.module("pug")
  .factory("Post", function PostFactory($resource) {
    return $resource("/api/p/:id", {}, {
      'update': { method: 'PUT', params: {}, isArray: false },
      'getCategories': { method: 'get', url: '/api/post/categories', isArray: true }
    });
  }); 

})();