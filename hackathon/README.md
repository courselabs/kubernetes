# Hackathon!

The hackathon is your chance to spend some decent time modelling and deploying a Kubernetes app on your own.

You'll use all the key skills you've learned in the course, and:

- you will get stuck
- you will have errors and broken apps
- you will need to research and troubleshoot

**That's why the hackathon is so useful!** 

It will help you understand which areas you're comfortable and which you might need to brush up on.

And it will give you a reference app that you modelled yourself, which you can use next time you model a new app.

> There are five parts to the hackathon - you're not expected to complete them all. Just get as far as you can in the time, it's all great experience.

## Part 1 - Welcome to Widgetario

Widgetario sell gadgets. They want to run their public web app on Kubernetes. 

They've made a start - all the components are packaged into container images and published on Docker Hub. Your job is to get it running in Kubernetes for them.

Use this architecture diagram as the basis to model your YAML. It has the port numbers, Docker image tags and the number of replicas needed for each component:

![](/img/widgetario-architecture.png)

It's not much to go on, but it has all the information you need for the first stage.

> Hint - the component names in the diagram are the DNS names the app expects to use. And when you're working on the YAML, it's easier to start with one replica for every component and get it working before you scale up.

When you're done you should be able to browse to port 8080 on your cluster and see this:

![](/img/widgetario-solution-1.png)

## Part 2 - Configuration

Well done! Seems pretty straightforward when you look at the YAML, but now we need to go to the next stage and stop using the default configuraion in the Docker images.

Why? If you run `docker image inspect widgetario/products-db:21.03` you'll see the database password is in the default environment variables, so if someone manages to get the image they'll know our production password.

Also the front-end team are experimenting with a new dark mode, and they want to quickly turn it on and off with a config setting.

You'll need to model configuration for all the components, but the product teams can't help so you'll need to figure out what goes where yourself.

* Products DB is the simplest - it just needs a password stored and surfaced in the `POSTGRES_PASSWORD` environment variable in the Pod (of course - anything with a password is sensitive data).

* The Stock API is a Go app. It uses an environment variable for the database connection string, and the password will need to match the DB. The team thinks the environment variable name starts with `POSTGRES`.

* The Products API is a Java app. The team who built it left to found a startup and we have no documentation. It's a Spring Boot app though, so the config files are usually called `application.properties` and we'll need to update the password there too.

* The web app is .NET Core. We know quite a lot about this - it reads default config from `/app/appsettings.json` but it will override any settings it finds in `/app/secrets/api.json`. We want to update the URLs for the APIs to use fully-qualified domain names.

* That feature flag for the UI can be set with an environment variable - `Widgetario__Theme` = `dark`.

> Hint - remember you have a running app right now, so you can investigate the current configuration by running commands in the Pods (`printenv`, `ls` and `cat` will be useful).

When you've rolled out your update, the UI will be updated but the products and stock details should be the same:

![](/img/widgetario-solution-2.png)

## Part 3 - Storage

It's going well, but we need to think about storage. 

The Stock API has a nice caching feature: when it fetches data from the database it stores a local copy in the filesystem. We want that cache to be kept available if the app crashes, but it doesn't need persistent storage - it's just a performance boost.

* the cache is already in use, writing files to `/cache`. It just needs to be modelled so the data survives Pod restarts.

And the DB team are keen to spend more time looking at running Postgres in Kubernetes, with persistent storage for the data. They've built an alternative Docker image which can run a replicated database as a primary and a secondary.

* this is the `widgetario/products-db:postgres-replicated` image, and luckily we've already used it in this course so you can find a good sample to start with

* the replication setup needs the same Postgres password set in two different environment variables

* the connection strings will need changing - the Products API should connect to the primary database server, but the Stock API only reads data so it can connect to the secondary

> Hint. You'll need to change configuration for the APIs, but for the database you'll need to switch to a different type of workload altogether. And if you have product-db data volumes from other labs, they'll need to be removed.

The app won't look any different if you get your update right. If not, you'll need to dig into the logs.

## Part 4 - Ingress

We're nearly there, but all these weird ports are no good. We'd like to get some proper DNS names set up, so we can publish the web app and the products API on standard HTTP ports:

* the web app should publish to `widgetario.local` 
* the products API shoud publish to `api.widgetario.local`

> Hint - ingress controllers are generic components, so you can deploy one we used in an earlier lab. And remember how Kubernetes doesn't check to see if the port names match when you deploy Services and Pods? It doesn't check with Ingress objects either.

The app will still look the same from the new domains. If not, you'll need to look at endpoints and object descriptions.

## Part 5 - Productionizing

All right! 

We've commissioned a 200-node Kubernetes cluster in the cloud and we're ready to go. 

Now's your chance to make any last updates you think we need before we go to production.