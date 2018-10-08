// Libs
  //= vendor/jquery-3.3.1.min.js
  //= ../../node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.js
// Helpers

// Partials
  //= partials/_images.js

// App
  $(document).ready(function() {
    var
      data = new galleryModel([1, 2, 3, 4, 5]),
      gallery = new galleryView(data, {
        'list': $('.gallery__list'),
        'content': $('.gallery__content'),
      }),
      controller = new galleryController(data, gallery);

    gallery.show();
  });