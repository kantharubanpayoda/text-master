Textmaster API for Node
===========

This Node.js module provides access to the [Textmaster API](https://www.app.textmaster.com/documentation#principles-api) for ordering translations.

Installation
----------

Install via [npm](http://npmjs.org/)

    npm install textmaster --save


Initialize Textmaster with your public and private keys. If querying the Textmaster sandbox, set `sandbox` to true.

    var textmaster = require('textmaster')(publicKey, privateKey, sandbox);


Endpoints
----------

- All callbacks are passed an error and response: `callback(err, res)`.
- Supports camelCase and underscore naming conventions (Textmaster uses the underscore convention).
- Please refer to Textmaster's [API Docs](https://www.app.textmaster.com/documentation#principles-work-flow) for endpoint details.


**textmaster.account**

    textmaster.account.info(callback);

**textmaster.project**

    textmaster.project.create(projectObject, callback);

    textmaster.project.get.single({ projectId: projectId}, callback);

    textmaster.project.get.list({}, callback);

    textmaster.project.update(projectObject, callback); // must include projectId

    textmaster.project.launch({ projectId: projectId}, callback);

**textmaster.document**

    textmaster.document.complete.single({ documentId: documentId, projectId: projectId}, callback);

    textmaster.document.complete.batch({ projectId: projectId, documents: [docId, docId2], satisfaction: 'positive', message: 'Well Done!'}, callback);

    textmaster.document.create.single(documentObject, callback); // must include projectId

    textmaster.document.create.batch(documentObjects, callback); // must include projectId

    textmaster.document.delete({documentId: documentId, projectId: projectId }, callback);

    textmaster.document.get.single({documentId: documentId, projectId: projectId }, callback);

    textmaster.document.get.batch({projectId: projectId }, callback);

    textmaster.document.get.filter({projectId: projectId}, callback);

    textmaster.document.update({projectId: projectId, documentId: documentId}, callback); // must pass data


**textmaster.service**

    textmaster.service.languages(callback);

    textmaster.service.quote(projectData, callback); // must pass data https://www.app.textmaster.com/documentation#projects-get-quotation-for-a-project


Contribute
----------

Forks and pull requests welcome!

TODO
----------
* textmaster.service.quoteFiles isn't working currently
* Add tests


Author
----------

Jonathan Wu. Email me if you have any questions: [jonathan.x.wu@gmail.com](mailto:jonathan.x.wu@gmail.com). Supported by [Localize](https://localizejs.com/).
