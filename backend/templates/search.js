var documents = {{ documents | safe }};

var documentsById = {}
for (let cursor = 0; cursor < documents.length; cursor++){
  documentsById[documents[cursor].id] = documents[cursor];
}

var idx = lunr(function () {
  this.ref('id')
  this.field('body')
  this.field('title', {boost: 8})
  this.field('pageTitle', {boost: 4})
  this.metadataWhitelist = ['position'] // add the position to the metadata

  documents.forEach(function (doc) {
    this.add(doc)
  }, this)
})