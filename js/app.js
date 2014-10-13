(function() {
  var templatePostcard;
  var postcardMaxSize = 640;

  $(document).ready(function() {
    $.getJSON("/postcards.json", function(data) {
      $.each(data, function(n, postcardData) {
        loadPostcard(postcardData);
      })
    });

    templatePostcard = $('#mustache-postcard').html();
    Mustache.parse(templatePostcard);
  })

  function loadPostcard(data) {
    data.boundingBox = postcardMaxSize;
    var frontLoaded = $.Deferred();
    var backLoaded = $.Deferred();
    var front = $('<img src="' + data.front + '" />').load(function() { frontLoaded.resolve(); });
    var back = $('<img src="' + data.back + '" />').load(function() { backLoaded.resolve(); });;
    var getInfo = $.getJSON(data.info, function (res) { data.info = res; });
    var waitFor = [frontLoaded, backLoaded, getInfo];

    $.when.apply($, waitFor).then(function() {
      data.front = {
        url: data.front,
        height: front[0].height,
        width: front[0].width,
        ratio: front[0].width / front[0].height
      }
      data.back = {
        url: data.back,
        height: back[0].height,
        width: back[0].width,
        ratio: back[0].width / back[0].height
      }
      // Resize to be within postcardMaxSize
      $.each(['front', 'back'], function(_, side) {
        var scale = Math.max(data[side].height, data[side].width);
        data[side].height = Math.round(data[side].height * (postcardMaxSize / scale));
        data[side].width = Math.round(data[side].width * (postcardMaxSize / scale));
        data[side].marginVertical = Math.round((postcardMaxSize - data[side].height) / 2);
        data[side].marginHorizontal = Math.round((postcardMaxSize - data[side].width) / 2);
      })

      data.relativeOrientation = ((data.front.ratio > 1) == (data.back.ratio > 1)) ? 'same' : 'opposite';
      var rendered = $(Mustache.render(templatePostcard, data));
      var postcard = rendered.children();
      postcard.click(function() {
        postcard.toggleClass('flip');
      });
      $('#postcards').append(rendered);
    });
  }
})();