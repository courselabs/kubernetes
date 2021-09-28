
scale down existing pods if low on resources

k scale deploy/products-api deploy/stock-api deploy/web sts/products-db --replicas 0

- helm chart, deploy to separate ns with new domain

helm install widg-uat -n widg-uat --create-namespace -f hackathon\files\helm\uat.yaml hackathon\solution-part-7\helm\widgetario

k get all -n widg-uat

k get ingress -A

- add hosts

```
# On Windows (run as Admin)
./scripts/add-to-hosts.ps1 widgetario.uat 127.0.0.1
./scripts/add-to-hosts.ps1 api.widgetario.uat 127.0.0.1

# OR on Linux/macOS
./scripts/add-to-hosts.sh widgetario.uat 127.0.0.1
./scripts/add-to-hosts.sh api.widgetario.uat 127.0.0.1
```

http://widgetario.uat

> New _Buy_ button

curl -k https://api.widgetario.uat/products

- ci infra

k apply -f hackathon\solution-part-7\infrastructure

- push code

git remote add gogs http://localhost:30301/kiamol/kiamol.git

git push --set-upstream gogs main

- create registry creds

kubectl -n infra create secret docker-registry registry-creds --docker-server=$REGISTRY_SERVER --docker-username=$REGISTRY_USER --docker-password=$REGISTRY_PASSWORD

kubectl -n infra create configmap build-config --from-literal=REGISTRY=docker.io  --from-literal=REPOSITORY=courselabs

> Jenkins http://localhost:30880, sign in 

http://localhost:30880/job/widgetario/ - enable job, build now

- new deployments not in Prom, why? (ns)

- add helm deploy to Jenkins