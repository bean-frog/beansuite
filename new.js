tinymce.init({
  skin: "CUSTOM",
  content_css: "CUSTOM",
  selector: 'textarea',
  plugins: 'tinycomments mentions anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount checklist mediaembed casechange export formatpainter pageembed permanentpen footnotes advtemplate advtable advcode editimage tableofcontents mergetags powerpaste tinymcespellchecker autocorrect a11ychecker typography inlinecss preview save',
  toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | align lineheight | tinycomments | checklist numlist bullist indent outdent | emoticons charmap | preview removeformat | save | customInsertButton',
  tinycomments_mode: 'embedded',
  setup: (editor) => {
      editor.ui.registry.addButton('customInsertButton', {
          text: 'MLA',
          onAction: function() {
              let htmltemplate = `
              <p style="line-height: 2;"><span style="font-family: 'times new roman', times, serif;">Your Name</span></p>
              <p style="line-height: 2;"><span style="font-family: 'times new roman', times, serif;">Your Teacher's Name</span></p>
              <p style="line-height: 2;"><span style="font-family: 'times new roman', times, serif;">Course Name</span></p>
              <p style="line-height: 2;"><span style="font-family: 'times new roman', times, serif;">DD Month YYYY</span></p>
              <p style="line-height: 2; text-align: center;"><span style="font-family: 'times new roman', times, serif;">Title</span></p>
              <p style="line-height: 2; text-align: left;"><span style="font-family: 'times new roman', times, serif;">Write Here....</span></p>
          `;
              editor.setContent(htmltemplate);
          }
      });
  },
  save_onsavecallback: () => {
      handleSave(tinymce.activeEditor.getContent())
  },
  init_instance_callback: () => {
      appendFlags();
      addTitleBar();
      checkParams();
  }
});

function handleSave(content) {
  const docTitle = localStorage.getItem("doctitle");
  fetch('http://localhost:3000/save-tinymce-content', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              title: docTitle,
              content: content
          })
      })
      .then(response => {
          if (response.ok) {
              return response.text();
          } else {
              throw new Error('Error saving content');
          }
      })
      .then(data => {
          console.log('Success:', data);
          let flagSuccess = document.getElementById('flag-success');
          flagSuccess.classList.remove('hidden');
          setTimeout(function() {
              flagSuccess.classList.add('hidden')
          }, 3000);
      })
      .catch(error => {
          console.error('Error:', error);
          let flagFailure = document.getElementById('flag-failure');
          flagFailure.classList.remove('hidden');
          setTimeout(function() {
              flagFailure.classList.add('hidden');
          }, 3000);
      });
}

function appendFlags() {
  var flags = `
<div id="flag-success" class="fixed top-0 right-0 m-5 animate-fade-in-down z-10 hidden">
  <div class="bg-green-500 text-white py-2 px-4 rounded-lg">
    <p>Your changes were saved successfully!</p>
  </div>
</div>
<div id="flag-failure" class="fixed top-0 right-0 m-5 animate-fade-in-down z-10 hidden">
  <div class="bg-red-500 text-white py-2 px-4 rounded-lg">
    <p>Error while saving changes.</p>
  </div>
</div>
`
  document.body.insertAdjacentHTML('afterbegin', flags)
}

function addTitleBar() {
  let titleInput = document.createElement('input');
  titleInput.type = "text";
  titleInput.style.color = '#ffffff';
  titleInput.style.paddingLeft = '15px';
  titleInput.setAttribute('placeholder', "Enter Document Title");
  titleInput.id = 'titleInput'
  if (localStorage.getItem('doctitle')) {
      titleInput.value = localStorage.getItem('doctitle');
  } else {
      const pageTitle = document.title.trim();
      if (pageTitle !== '' && pageTitle.toLowerCase() !== 'docs.html') {
          titleInput.value = "pageTitle";
          localStorage.setItem('doctitle', pageTitle)
      } else {
          titleInput.value = "";
      }

  }
  const pageTitle = document.title.trim();
  if (pageTitle.toLowerCase() == 'docs.html') {
      titleInput.value = ''
  }
  titleInput.addEventListener('input', function(event) {
      localStorage.setItem('doctitle', event.target.value);
  });
  let menubar = document.querySelector('.tox-menubar');
  if (menubar) {
      menubar.insertAdjacentElement('afterbegin', titleInput);
  }
}

function checkParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const loadParam = urlParams.get('load');
  if (loadParam) {
      console.log(loadParam)
      fetch(`http://localhost:3000/docs/${loadParam}.html`)
          .then(response => response.text())
          .then(html => {
              tinymce.activeEditor.setContent(html);
              let titleInput = document.getElementById('titleInput')
              titleInput.value = loadParam;
          })
          .catch(error => {
              console.error('Error fetching data:', error);
          });
  } else {
      console.log('no load parameter supplied, using default newdoc layout')
  }
}