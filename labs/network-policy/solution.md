
k delete -f labs\network-policy\specs\apod

k delete -f labs\network-policy\specs\apod\network-policies

k apply -f labs\network-policy\solution\apod



k exec sleep -- wget -O- http://apod-api.apod.svc.cluster.local/image

> Bad address