# JSChat Client Application
This directory contains the client part of JSChat project.

## Directories
  - `/collections` - collections
  - `/interface` - our own UI component's base (forked from Twitter Bootstrap), we can change it as we need
  - `/libraries` - local components (instead of remote, because not all libraries have `component.json` file)
  - `/models` - models (by one for each collection)
  - `/routers` - routers (by one for each page)
  - `/views` - blocks and elementary components for pages composing
    - `/pages` - application pages

## Abstract Layer
  - `/collections`
    - `/AbstractCollection.js` - wraps `Backbone.Collection` and provides base collection class
  - `/models`
    - `/AbstractModel.js` - wraps `Backbone.Model` and provides base model class
  - `/routers`
    - `/AbstractRouter.js` - wraps `Backbone.Router` and provides base router class
  - `/views`
    - `/pages`
      - `AbstractPage.js` - wraps `AbstractCompositeView` and provides base page class
    - `/AbstractCollectionView.js` - base view decorated with `Backbone.CollectionBinder`
    - `/AbstractCompositeView.js` - base view decorated with `Backbone.Composite`
    - `/AbstractFormView.js` - wraps `AbstractModelView` and provides API for sending forms
    - `/AbstractModelView.js` - base view decorated with `Backbone.ModelBinder`
    - `/AbstractView.js` - wraps `Backbone.View` and provides base view class

I'll try keep this page up to date. If you have any questions, feel free to ask me :)
