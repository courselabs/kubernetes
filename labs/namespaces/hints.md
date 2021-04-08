# Lab Hints

This is about making sure your new objects are created in the right namespace, and the Nginx configuration uses the right URL to find the Pi web app.

The original Nginx config in [nginx-configMap.yaml](../persistentvolumes/specs/pi/nginx-configMap.yaml) used a local DNS name: 

```
proxy_pass             http://pi-web-internal;
```

That won't do when the Nginx is in a different namespace from the app it's proxying.

> Need more? Here's the [solution](solution.md).