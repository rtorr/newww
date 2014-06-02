newww
=====

We're using [Hapi](https://github.com/spumko/hapi) as a framework for the next iteration of the npm website.

## General Layout

There are two major pieces to the app, facets and services. Both are implemented as Hapi plugins, though the way they are used in the application are intentionally different.

### Facets

A **facet** is a mostly-self-involved piece of the website. Each facet is entirely self-contained, and includes the following pieces:

* Routes (in `index.js`)
* Template controls (`show-[thing].js` for getting information from services and `presenters/[thing].js` for template-based utilities)
* Templates (`[thing].hbs`)
* Facet-specific tests (`test/*.js`). 

Template partials are *not* housed in facets, as they are cross-facet (i.e. headers, footers, etc).

By self-containing each facet, we can turn them into microservices (which can be installed with npm) later, should we choose to do so.

There are currently four facets:

* The **company** facet focuses on all the npm, Inc. bits:
	* /
	* About page
	* Team page
	* Business partnerships (i.e. the Who's Hiring? page)
	* FAQ

* The **user** facet focuses on all the things that users who visit the site might care about: 
	* Login/logout
	* Editing profiles
	* Editing email
	* Viewing profiles
	* Setting/Resetting passwords
	* Signing up
	* Starring packages

* The **registry** facet focuses on the bits that specifically pertain to the registry/using npm:
	* Package pages
	* Documentation
	* Browsing (i.e. keywords)
	* Search
	* Download counts

* The **ops** facet focuses on the things that we care about from an operational standpoint, but don't really fall into any of the other buckets:
	* Healthchecks
	* Content Security Policy logging


### Services

A service is a shared resource, like our couchDB instance. Services have methods that can be called from any facet.

For example:

_In `services/hapi-couchdb/`:_

```
  service.method('getPackageFromCouch', function (package, next) {
    anonCouch.get('/registry/' + package, function (er, cr, data) {
      next(er, data);
    });
  });
```

_Then, in `facets/registry/package-page.js`:_

```
  var getPackageFromCouch = request.server.methods.getPackageFromCouch;

	// stuff before getting package

  getPackageFromCouch(couchLookupName(name), function (er, data) {

	// stuff now that we have the package
	
	reply.view('package-page', pkg);

  });

```

## Tests

There are tests! We're using [Lab](https://github.com/spumko/lab) as our testing utility. Site-wide tests are currently located in the `test/` folder and can be run with `npm test`. Facet-specific tests are located in their respective `facet/[name]/test/` folders. 

Expect this bit to evolve as things get more complex. But for now, just having tests is a HUGE improvement.

## Templating and Styling

We're using [Handlebars](http://handlebarsjs.com/) as our templating engine. Think of it as a compromise between Jade and EJS; also an opportunity to learn a new templating language. It's got its ups and downs, but so far so good. (Plus the spumko team uses it, so all the integration is basically done for us.)

We're sticking with [Stylus](http://learnboost.github.io/stylus/) as our CSS preprocessor. The Stylus-to-CSS conversion happens as an npm prestart script.

## Running the server locally

For now, you'll need the `npm run dev-db` bit from the original npm-www. (We may or may not port this over. That's still TBD.) Once that's running, run `npm start`. 

For ease of development, we've got a Gulpfile that uses [gulp](http://gulpjs.com/). It watches appropriate directories and restarts stuff for you when other stuff changes. Fortunately, you don't have to use gulp if you don't want to; just change the `start` line in the root `package.json` to `start: "node index.js"`.

## Code

Let's bring back semi-colons and comma-last. No rhyme or reason; just cuz.

