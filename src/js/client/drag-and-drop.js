document.addEventListener('DOMContentLoaded', function(){
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function uploadFile(file, target, callback) {
    let url = target
    let formData = new FormData()

    formData.append('image', file)

    fetch(url, {
      method: 'POST',
      body: formData
    })
    .then((d) => { callback(null, d) })
    .catch((err) => { callback(err, null) })
  }

  function handleFiles(files, sourceElement, target) {
    console.log(sourceElement);

    ([...files]).forEach(file => {
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = function() {
        let img = document.createElement('img');
        img.classList.add('hoverable');
        img.classList.add('loading');
        img.src = reader.result;
        sourceElement.querySelector('.gallery').appendChild(img);

        uploadFile(file, target, function(err, result) {
          img.classList.remove('loading');
          if(err) {
            img.classList.add('error')
            return;
          }

          if(result) {
            console.log(result);
          }
        });
      }
    })
  }

  function handleDrop(e, container, target) {
    let dt = e.dataTransfer;
    let files = dt.files;

    handleFiles(files, container, target);
  }

  var dndContainers = document.querySelectorAll('.drag-and-drop');
  dndContainers.forEach(function(dndContainer) {
    var boxes = dndContainer.querySelectorAll('.box');
    var form = dndContainer.parentElement;
    while(form.tagName.toLowerCase() != 'form') {
      form = form.parentElement;
    }
    var target = form.getAttribute('action');
    boxes.forEach(function(box) {
      ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        box.addEventListener(eventName, preventDefaults)
      })

      ;['dragenter', 'dragover'].forEach(eventName => {
        box.addEventListener(eventName, function() { dndContainer.classList.add('dragging'); }, false);
      })

      ;['dragleave', 'drop'].forEach(eventName => {
        box.addEventListener(eventName, function() { dndContainer.classList.remove('dragging'); }, false);
      })

      box.addEventListener('drop', function(e) {
        handleDrop(e, dndContainer, target);
      }, false)
    })
  })

})