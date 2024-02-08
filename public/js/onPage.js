tinymce.init({
        selector: '#question,#answer-1,#answer-2,#answer-3,#answer-4,#answer-5',
        external_plugins: {'mathjax': '/js/tinymce/plugins/tinymce-mathjax/plugin.js'},
        plugins:'autolink,lists,media,mathjax,preview,code,spellchecker, image,emoticons',
        toolbar: 'mathjax , wordcount',
        mathjax: { lib: '/js/mathjax-tex/tex-mml-chtml.js'},
         setup: function (editor) {
            editor.on('change', function () {
              let content = editor.getBody();
              console.log('hi '+JSON.stringify(content));
            });

            editor.on('init', function () {
              
            });

          },
          images_upload_url: '/questions/upload',
          images_upload_base_path: '',
          relative_urls: false,
          file_picker_types: 'image', // Specify that we want to open the image picker
          file_picker_callback: function (cb, value, meta) {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');

            input.onchange = function () {
              const file = input.files[0];
              const reader = new FileReader();
              reader.onload = function () {
                cb(reader.result, { alt: file.name });
              };
              reader.readAsDataURL(file);
            };

            input.click();
          }
    });
    function getTextContent() {
      // Get the TinyMCE editor instance
      var editor = tinymce.get('question');

      // Check if the editor instance is available
      if (editor) {
        // Get the content from the editor
        var content = editor.getContent();

        // Display the content in a div
        document.getElementById('outputDiv').innerText = content;
      } else {
        console.error('TinyMCE editor not found.');
      }
    }


     (function ($) {

      $.fn.searchit = function (options) {

          return this.each(function () {

              $.fn.searchit.globals = $.fn.searchit.globals || {
                  counter: 0
              }
              $.fn.searchit.globals.counter++;
              var $counter = $.fn.searchit.globals.counter;

              var $t = $(this);
              var opts = $.extend({}, $.fn.searchit.defaults, options);

              // Setup default text field and class
              if (opts.textField == null) {
                  $t.before("<input type='textbox' id='__searchit" + $counter + "'><br>");
                  opts.textField = $('#__searchit' + $counter);
              }
              if (opts.textField.length > 1) opts.textField = $(opts.textField[0]);

              if (opts.textFieldClass) opts.textField.addClass(opts.textFieldClass);
              //MY CODE-------------------------------------------------------------------
              if (opts.selected) opts.textField.val($(this).find(":selected").val());
              //MY CODE ENDS HERE -------------------------------------------------------
              if (opts.dropDown) {
                  $t.css("padding", "5px")
                      .css("margin", "-5px -20px -5px -5px");

                  $t.wrap("<div id='__searchitWrapper" + $counter + "' />");
                  opts.wrp = $('#__searchitWrapper' + $counter);
                  opts.wrp.css("display", "inline-block")
                      .css("vertical-align", "top")
                      .css("overflow", "hidden")
                      .css("border", "solid grey 1px")
                      .css("position", "absolute")
                      .hide();
                  if (opts.dropDownClass) opts.wrp.addClass(opts.dropDownClass);
              }

              opts.optionsFiltered = [];
              opts.optionsCache = [];

              // Save listbox current content
              $t.find("option").each(function (index) {
                  opts.optionsCache.push(this);
              });

              // Save options 
              $t.data('opts', opts);

              // Hook listbox click
              $t.click(function (event) {
                  _opts($t).textField.val($(this).find(":selected").text());
                  _opts($t).wrp.hide();
                  event.stopPropagation();
              });

              // Hook html page click to close dropdown
              $("html").click(function () {
                  _opts($t).wrp.hide();
              });

              // Hook the keyboard and we're done
              _opts($t).textField.keyup(function (event) {
                  if (event.keyCode == 13) {
                      $(this).val($t.find(":selected").text());
                      _opts($t).wrp.hide();
                      return;
                  }
                  setTimeout(_findElementsInListBox($t, $(this)), 50);
              })

          })


          function _findElementsInListBox(lb, txt) {

              if (!lb.is(":visible")) {
                  _showlb(lb);
              }

              _opts(lb).optionsFiltered = [];
              var count = _opts(lb).optionsCache.length;
              var dropDown = _opts(lb).dropDown;
              var searchText = txt.val().toLowerCase();

              // find match (just the old classic loop, will make the regexp later)
              $.each(_opts(lb).optionsCache, function (index, value) {
                  if ($(value).text().toLowerCase().indexOf(searchText) > -1) {
                      // save matching items 
                      _opts(lb).optionsFiltered.push(value);
                  }

                  // Trigger a listbox reload at the end of cycle    
                  if (!--count) {
                      _filterListBox(lb);
                  }
              });
          }

          function _opts(lb) {
              return lb.data('opts');
          }

          function _showlb(lb) {
              if (_opts(lb).dropDown) {
                  var tf = _opts(lb).textField;
                  lb.attr("size", _opts(lb).size);
                  _opts(lb).wrp.show().offset({
                      top: tf.offset().top + tf.outerHeight(),
                      left: tf.offset().left
                  });
                  _opts(lb).wrp.css("width", tf.outerWidth() + "px");
                  lb.css("width", (tf.outerWidth() + 25) + "px");
              }
          }

          function _filterListBox(lb) {
              lb.empty();

              if (_opts(lb).optionsFiltered.length == 0) {
                  lb.append("<option>" + _opts(lb).noElementText + "</option>");
              } else {
                  $.each(_opts(lb).optionsFiltered, function (index, value) {
                      lb.append(value);
                  });
                  lb[0].selectedIndex = 0;
              }
          }
      }

      $.fn.searchit.defaults = {
          textField: null,
          textFieldClass: null,
          dropDown: true,
          dropDownClass: null,
          size: 5,
          filtered: true,
          noElementText: "No elements found",
          //MY CODE------------------------------------------
          selected: false
          //MY CODE ENDS ------------------------------------
      }

  }(jQuery))

   

  function morethan(cbox) {
    // setup new state
    var radioInput = $('input[name="quetype"]:checked').val();
    var state = "radio";
    if (radioInput == 2) {
        state = "checkbox";
    }
    // get all by name and change state
    var radios = document.getElementsByName('correctanswer');
    for (i = 0; i < radios.length; i++) {
        radios[i].type = state;
    }
}