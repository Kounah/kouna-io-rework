var script = document.currentScript;
(function($) {
  document.addEventListener('DOMContentLoaded', function() {
    var form = script.parentElement;
    form.onsubmit = function(e) {
      var password = form.querySelector('input[name="password"]');
      var repeatPassword = form.querySelector('input[name="repeat-password"]');

      if($(password).val() != $(repeatPassword).val()) {
        if(!repeatPassword.classList.contains('invalid')) repeatPassword.classList.add('invalid');
        return false;
      } else {
        if(repeatPassword.classList.contains('invalid')) repeatPassword.classList.remove('invalid');
        return true;
      }
    }.bind(this);
  })
})(jQuery);