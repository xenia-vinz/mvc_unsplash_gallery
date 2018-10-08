// Observer
  function Event(sender) {
    this._sender = sender;
    this._listeners = [];
  }
  Event.prototype = {
    attach: function (listener) {
      this._listeners.push(listener);
    },
    notify: function (args) {
      var
        index;
      for (index = 0; index < this._listeners.length; index += 1) {
        this._listeners[index](this._sender, args);
      }
    }
  };

// Model
  function galleryModel(ids) {
    this._collectionsIds = ids;
    this._collections = [];
    this._currentCollection = [];
    this._currentCollectionId = -1;
    this._api = 'https://api.unsplash.com/';
    this._appId = '9fb4a9f580f94957629fcce6ac996018dd399d23fda6aa983399b6dde68b4237';

    this.collectionsLoaded = new Event(this);
    this.currentCollectionChanged = new Event(this);
  }
  galleryModel.prototype = {
    loadCollections: function () {
      var
        _this = this,
        ids = [].concat(this._collectionsIds),
        collections = [],
        processed = 0;

      ids.forEach(function(id) {
        var
          url = _this._api + 'collections/' + id + '?client_id=' + _this._appId;

        fetch(url).then(function(response) {
          if (response.status !== 200) {
            console.log('Something went wrong while loading collection #' + id + '. Response status code: ' + response.status);
            return;
          }
          response.json().then(function(data) {
            //console.log('Collection #' + id + ' loaded');
            collections.push(data);
            processed++;
            if (processed === ids.length) {
              //console.log('All collections loaded');
              _this._collections = collections;
              _this.collectionsLoaded.notify();
            }
          });
        }).catch(function(err) {
          console.log('Error while loading collection #' + id, err);
        });
      });
    },
    getCollectionImages: function(id) {
      var
        _this = this,
        url = _this._api + 'collections/' + id + '/photos?client_id=' + _this._appId;

      fetch(url).then(function(response) {
        if (response.status !== 200) {
          console.log('Something went wrong while loading photos from collection #' + id + '. Response status code: ' + response.status);
          return;
        }
        response.json().then(function(data) {
          _this._currentCollection = data;
          _this.currentCollectionChanged.notify();
        });
      }).catch(function(err) {
        console.log('Error while loading photos from collection #' + id, err);
      });
    },
    getCurrentCollectionId: function() {
      return this._currentCollectionId;
    },
    setCurrentCollection: function(id) {
      this._currentCollectionId = id;
      this.getCollectionImages(id);
    },
    getCurrentImage: function() {
      return this._currentImage;
    },
    setCurrentImage: function(id) {
      this._currentImage = id;
      this.currentImageChanged.notify();
    }
  };

// View
  function galleryView(model, elements) {
    this._model = model;
    this._elements = elements;

    this.initGallery = new Event(this);
    this.listBuilded = new Event(this);

    var
      _this = this;

    this._model.collectionsLoaded.attach(function () {
      _this.listNames();
    });
    this._model.currentCollectionChanged.attach(function () {
      _this.showImages();
    });
  }
  galleryView.prototype = {
    show: function () {
      this.initGallery.notify();
    },
    listNames: function () {
      var
        _this = this,
        list = _this._elements.list,
        items = _this._model._collections;

      list.html('');
      for (key in items) {
        if (items.hasOwnProperty(key)) {
          var
            item = items[key],
            code = '<button class="gallery__list__button" data-collection-id="'+ item.id +'">' + item.title + '</button>';
          list.append($(code));
        }
      }
      _this.listBuilded.notify();
    },
    showImages: function() {
      var
        _this = this,
        content = _this._elements.content,
        collection = _this._model._currentCollection;

      content.html('');
      for (key in collection) {
        if (collection.hasOwnProperty(key)) {
          var
            image = collection[key],
            code = '<a data-fancybox="gallery" class="gallery__content-image" href="' + image.urls.full +'" data-caption="' + image.description + '">' +
                      '<img class="gallery__content-image__src" src="' + image.urls.small +'" alt="" />' +
                    '</a>';
          content.append($(code));
        }
      }
    }
  };

// Controller
  function galleryController(model, view) {
    this._model = model;
    this._view = view;

    var
      _this = this;

    this._view.initGallery.attach(function () {
      _this.initGallery();
    });
    this._view.listBuilded.attach(function () {
      view._elements.list.on('click', '.gallery__list__button', function(e) {
        e.preventDefault;
        _this.loadCollection($(this).data('collection-id'));
      });
    });
  }

  galleryController.prototype = {
    initGallery: function () {
      this._model.loadCollections();
    },
    loadCollection: function (id) {
      this._model.setCurrentCollection(id);
    }
  };