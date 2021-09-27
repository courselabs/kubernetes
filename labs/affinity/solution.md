
## Apply labels

- do this first, so labels are in place when the pods are scheduled

k label node k3d-lab-affinity-agent-1 cis-compliance=verified

k label node k3d-lab-affinity-agent-0 cis-compliance=requested

k get nodes -L cis-compliance -l cis-compliance

## Deploy

k apply -f labs\affinity\solution

k get po -o wide -l app=whoami

> Majority on agent -1, up to max for node - rest on agent 0. May be 4-2 etc. depending on scheduler
