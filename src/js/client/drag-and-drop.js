document.addEventListener('DOMContentLoaded', function(){


  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function uploadFile(file, callback) {
    let url = '/api/image'
    let formData = new FormData()

    formData.append('file', file)

    fetch(url, {
      method: 'POST',
      body: formData
    })
    .then((d) => { callback(null, d) })
    .catch((err) => { callback(err, null) })
  }

  function handleFiles(files, sourceElement) {
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

        uploadFile(file, function(err, result) {
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

  function handleDrop(e, container) {
    let dt = e.dataTransfer;
    let files = dt.files;

    handleFiles(files, container);
  }

  var dndContainers = document.querySelectorAll('.drag-and-drop');
  dndContainers.forEach(function(dndContainer) {
    var boxes = dndContainer.querySelectorAll('.box');
    boxes.forEach(function(box) {
      var input = box.querySelector('input[type="file"]');

      input.addEventListener('change', handleDrop);

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
        handleDrop(e, dndContainer);
      }, false)

      box.addEventListener('click', function() {
        input.dispatchEvent('click');
      })
    })
  })

})