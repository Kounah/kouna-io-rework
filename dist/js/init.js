(function(M, $) {
  document.addEventListener('DOMContentLoaded', function() {
    { // initialize sidenavs
      let els = document.querySelectorAll('.sidenav');
      let instances = [];

      els.forEach(function(el) {
        var edgeAttribute = el.getAttribute('data-edge');

        console.log(el, edgeAttribute);

        instances.push(M.Sidenav.init(el, {
          edge: edgeAttribute ? edgeAttribute : 'left'
        }));
      })
    }

    { // init dropdowns
      let els = document.querySelectorAll('.dropdown-trigger');
      let instances = M.Dropdown.init(els, {
        container: document.body,
        constrainWidth: false,
        coverTrigger: false,
      });
    }

    { // label fix
      let els = document.querySelectorAll('form input');

      els.forEach(function(el) {
        let pe = el.parentElement;
        let label = pe.querySelector('label[for="' + el.getAttribute('name') + '"]');

        $(label).click(function() {
          $(el).focus();
        })
      });
    }

    M.AutoInit();

    $('.modal').appendTo(document.body);
  });
})(M, jQuery)