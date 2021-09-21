

## Reference

- [](https://cert-manager.io/docs/concepts/ca-injector/)
- [OPA Gatekeeper](https://open-policy-agent.github.io/gatekeeper/website/docs/)
- [Gatekeeper policy library](https://github.com/open-policy-agent/gatekeeper-library)

## In-cluster webhook servers

k apply -f labs\admission\specs\cert-manager

k apply -f labs\admission\specs\cert-manager\issuers

k apply -f labs\admission\specs\webhook-server

k get certificates

k describe secret admission-webhook-cert

k apply -f labs\admission\specs\sleep

k exec sleep -- curl https://admission-webhook.default.svc

> Self-signed cert

## Validating Webhooks

k apply -f labs\admission\specs\validating-webhook

k get validatingwebhookconfiguration

k describe validatingwebhookconfiguration servicetokenpolicy

> CA bundle provided by cert-manager

k apply -f labs\admission\specs\whoami

k get deploy whoami

k describe rs -l app=whoami

> _Error creating: admission webhook "servicetokenpolicy.courselabs.co" denied the request: automountServiceAccountToken must be set to false_

Fix...

k apply -f labs\admission\specs\whoami\fix

k get po -l app=whoami

> Created

## Mutating Webhooks

k apply -f labs\admission\specs\mutating-webhook

k get mutatingwebhookconfiguration

k apply -f labs\admission\specs\pi

k get po -l app=pi-web

> _CreateContainerConfigError_

k describe po -l app=pi-web

> _Error: container has runAsNonRoot and image will run as root_

Fix...

k apply -f labs\admission\specs\pi/fix

## OPA Gatekeeper

Delete everything:

k delete ns,all,ValidatingWebhookConfiguration,MutatingWebhookConfiguration -l kubernetes.courselabs.co=admission

k delete crd,ValidatingWebhookConfiguration,MutatingWebhookConfiguration -l app.kubernetes.io/instance=cert-manager

Deploy OPA:

k apply -f labs\admission\specs\opa-gatekeeper

Templates:

k apply -f labs\admission\specs\opa-gatekeeper\templates

k get crd

Constraints:

k apply -f labs\admission\specs\opa-gatekeeper\constraints

k describe requiredlabels.constraints.gatekeeper.sh/requiredlabels-ns

## Lab

 fix deployment to meet rules

 k apply -f labs\admission\specs\apod


## Cleanup

k delete ns -l kubernetes.courselabs.co=admission

k delete crd -l gatekeeper.sh/system

k delete crd -l gatekeeper.sh/constraint