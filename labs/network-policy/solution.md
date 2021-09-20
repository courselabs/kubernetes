
k delete -f labs\network-policy\specs\apod

k delete -f labs\network-policy\specs\apod\network-policies

k apply -f labs\network-policy\solution\apod

k exec -n apod deploy/apod-web -- wget -O- -T2 http://apod-api/image

> Refresh http://localhost:30816, OK

k exec sleep -- wget -O- http://apod-api.apod.svc.cluster.local/image

> Bad address