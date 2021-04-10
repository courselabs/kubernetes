# Lab Hints

The first part isn't too complicated, you just need to map Ingress rules for the application's Service.

Be aware that the app is in its own namespace too; the Ingress Controller watches all namespaces, but you should check the HTTPS cert that gets applied when you browse to the site.

The second part you can only do if you're using LoadBalancer services. You'll need to change the Service ports and this is a good chance to explore the Ingress controller spec.

> Need more? Here's the [solution](solution.md).