

## Reference

- [NATS Operator](https://github.com/nats-io/nats-operator)
- [Presslabs MySql Operator](https://github.com/presslabs/charts)

## CustomResourceDefinitions

k apply -f labs\operators\specs\crd

k get crd

k apply -f labs\operators\specs\students

k get students

k describe student priti

## NATS Operator

k apply -f labs\operators\specs\nats\operator

k get crd

k apply -f labs\operators\specs\nats\cluster

k get natscluster -o wide

k get svc

k get po -l app=nats

k logs -l name=nats-operator

k get rs

> Only for operator

k describe po msgq-1

> _Controlled By:  NatsCluster/msgq_

k delete po msgq-2

k get po -l app=nats

k logs -l name=nats-operator


## MySql Operator

helm install mysql-operator labs\operators\specs\mysql\mysql-operator-0.4.0.tgz

> Output tells you what to do...

k get po -l app=mysql-operator

What is the Pod controller?

> _Controlled By:  StatefulSet/mysql-operator_

k apply -f labs\operators\specs\mysql\database

k get statefulset

What is the container setup?

k describe po db-mysql-0

> init container, percona sql container + 3 sidecars, exporter & heartbeat

k logs db-mysql-0 -c mysql

## Lab

k delete natscluster,mysqlcluster --all

k apply -f labs\operators\specs\todo-list

- Create NATS cluster & MySql database to match app config


## Cleanup

k delete all,cm,secret,crd -l kubernetes.courselabs.co=operators

> Order is important, deleting CRDs delete custom resources - make sure the controller still exists to tidy up

k delete -f labs\operators\specs\nats/operator

k delete crd -l app=mysql-operator

helm uninstall mysql-operator