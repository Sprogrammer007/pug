CKEDITOR.editorConfig = function (config) {
  // ... other configuration ...

  config.toolbar_mini = [
    ["Bold",  "Italic",  "Underline",  "Strike",  "-",  "Subscript",  "Superscript"],
  ];

  config.toolbarGroups = [
    { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
    { name: 'paragraph',   groups: [ 'list', 'indent', 'align'] },
    { name: 'colors' }
  ];
  config.floatSpaceDockedOffsetX = 10;
  config.removePlugins = 'elementspath, resize';
  // ... rest of the original config.js  ...
}
    
$(document).ready(function() {
  if ($('#CKEditor').length != 0) {
    CKEDITOR.replace( 'CKEditor', {
      skin: 'BootstrapCK4,/CKSkins/bootstrapck/',
      resize_enabled: false,
      removePlugins : 'elementspath'  
    });
  }
  
});

$( ".publish-date" ).datepicker();