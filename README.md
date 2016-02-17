Textmaster API for Node
===========

This Node.js module provides access to the [Textmaster API](https://www.app.textmaster.com/documentation#principles-api) for ordering translations.

Installation
----------

Install via [npm](http://npmjs.org/)

    npm install textmaster --save


Initialize Textmaster with your public and private keys. If querying the Textmaster sandbox, set `sandbox` to true.

    var textmaster = require('textmaster')(publicKey, privateKey);


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

    textmaster.project.get.list(callback);

    textmaster.project.update({projectId: projectId}, projectObject, callback);

    textmaster.project.asyncLaunch({ projectId: projectId}, callback);

**textmaster.document**

    textmaster.document.complete.single({ id: id, projectId: projectId}, { satisfaction: satisfaction, message: message }, callback);

    textmaster.document.complete.batch({ projectId: projectId}, { documents: [docId, docId2], satisfaction: satisfaction, message: message}, callback);

    textmaster.document.create.single({projectId: projectId}, documentObject, callback);

    textmaster.document.create.batch({projectId: projectId}}, { documents: [docOBject, docObject2]}, callback);

    textmaster.document.delete({id: id, projectId: projectId }, callback);

    textmaster.document.get.single({id: id, projectId: projectId }, callback);

    textmaster.document.get.batch({projectId: projectId }, callback);

    textmaster.document.get.filter({projectId: projectId, page: page}, filterObject,callback);

    textmaster.document.update({projectId: projectId, id: id}, documentObject, callback); // must pass data


**textmaster.service**

    textmaster.service.languages(callback);

    textmaster.service.locales(callback);

    textmaster.service.quote(projectData, callback);

    textmaster.service.pricing({locale: locale}, callback);


Contribute
----------

Forks and pull requests welcome!

TODO
----------
* Add tests


Author
----------

Jonathan Wu. Email me if you have any questions: [jonathan.x.wu@gmail.com](mailto:jonathan.x.wu@gmail.com). Supported by [Localize](https://localizejs.com/).
