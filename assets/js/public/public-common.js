const CommonModule = {};

(function(w) {
  w.URLSearchParams = w.URLSearchParams || function (searchString) {
    var self = this;
    self.searchString = searchString;
    self.get = function (name) {
      var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(self.searchString);
      if (results == null) {
        return null;
      }
      else {
        return decodeURI(results[1]) || 0;
      }
    };
  }
})(window);

window.onpageshow = function(event) {
  if (event.persisted || window.performance && window.performance.navigation.type === 2) {
    window.location.reload();
  }
};

// Bypass CORS issue, please see https://github.com/Rob--W/cors-anywhere for more details
jQuery.ajaxPrefilter(function(options) {
  const host = new URL(options.url).host;
  const corsAnywhereEnabled = (host !== 'api.digitalriver.com' && host !== 'drh-fonts.img.digitalrivercontent.net');

  if (options.crossDomain && jQuery.support.cors && corsAnywhereEnabled) {
    options.url = 'https://cors-anywhere.herokuapp.com/' + options.url;
  }
});

jQuery(document).ready(($) => {
  $('input[type=text]:required').on('input', (e) => {
    const elem = e.target;

    elem.setCustomValidity((elem.value && !$.trim(elem.value)) ? drgc_params.translations.required_field_msg : '');
    if (elem.validity.valueMissing) {
      $(elem).next('.invalid-feedback').text(drgc_params.translations.required_field_msg);
    } else if (elem.validity.customError) {
      $(elem).next('.invalid-feedback').text(elem.validationMessage);
    }
  });
});

export default CommonModule;
