;(function () {
  "user strict"

  angular.module("dfr")
  .factory("User", function UserFactory($resource) {
    return $resource("/api/user/:id", {id: '@id'}, {
      'update': { method: 'PUT', params: {}},
      'services': { 
        method: 'get',
        url: "/api/user/services"
      },
      'pay': {
        method: 'post',
        url: '/api/user/payment'
      },
      'coupon': {
        method: 'post',
        url: '/api/user/coupon'
      },
      'batchSubscribe': {
        method: 'post',
        url: '/api/user/batch/subscribe'
      },
      'updateService': {
        method: 'post',
        url: '/api/user/update/service/:id'
      },
      'resendConfirm': {
        method: 'get',
        url: '/api/user/confirm/resend'
      }
    });
  }); 

  angular.module("dfr")
  .factory("DateFilter", function DateFilterFactory() {
    var filters = {
      startDate: undefined,
      endDate: undefined    
    };

    return {
      set: function(startDate, endDate) {
        filters.startDate = startDate;
        filters.endDate = endDate;
      },
      get: function() {
        return filters;
      }

    }
  });


  angular.module("dfr")
  .factory("ChartDefaults", function ChartDefaultsFactory() {
    var chartDefault = {
      type:  "LineChart",
      displayed: false,
      data: {},
      options: {
        width: '100%',
        height: 180,
        legend: 'none',
        pointSize: 5,
        colors: ['#F88B4D'],
        chartArea: {
          width: '95%'
        },
        crosshair: {
          trigger: 'both',
          orientation: 'vertical',
          color: '#BDBDBD'
        },
        hAxis: {
          gridlines: {count: -1,color: '#E3E3E3'}
        },
        vAxis: {

          gridlines: {count: -1, color: '#E3E3E3'}
        },
        animation: { 
          duration: 1000,
          easing: 'linear'
        }
      }
    };
    
    var defaultColors = [
      "#ff5a5f",
      "#E868FD",
      "#24FD8D",
      "#FDF40D",
      "#FD72AE",
      "#F7464A", 
      "#46BFBD", 
      "#FDB45C", 
      "#60FD57", 
      "#3AAAFD",
      "#2162B2"
    ]

    return {
      default: function() {
        return angular.copy(chartDefault)
      },
      merge: function(options) {
        return angular.merge({}, chartDefault, options)
      },
      colors: function(n) {
        return defaultColors.slice(0, n);
      },
      color: function(i) {
        return  defaultColors[i];
      }

    }
  });   


  angular.module("dfr").service('Params', function() {

    window.parseQuery = function () {
      // This function is anonymous, is executed immediately and 
      // the return value is assigned to QueryString!
      var query_string = {};
      var query = window.location.search.substring(1);
      var vars = query.split("&");
      for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
            // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
          query_string[pair[0]] = decodeURIComponent(pair[1]);
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
          var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
          query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
          query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
      } 
        return query_string;
    };
    return window.parseQuery();
  });

})();