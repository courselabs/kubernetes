

helm install vweb labs\rollouts\solution\helm\vweb

k get deploy -l app.kubernetes.io/managed-by=Helm

k describe svc vweb-web

> slot=blue

curl localhost:30899/v.txt



helm upgrade --set activeSlot=green  vweb labs\rollouts\solution\helm\vweb

k describe svc vweb-web

> slot=green

curl localhost:30899/v.txt


k get po -l slot=blue --watch

helm upgrade --reuse-values --set blueImage=kiamol/ch09-vweb:v3 --atomic --timeout 30s  vweb labs\rollouts\solution\helm\vweb

> New v3 Pods fail, Helm rolls back
