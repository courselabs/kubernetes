

argocd app create lab `
 --repo http://gogs.infra.svc.cluster.local:3000/kiamol/kiamol.git `
 --path labs/argo/project/apod/base `
 --dest-server https://kubernetes.default.svc `
 --dest-namespace default `
 --sync-policy auto `
 --self-heal


argocd app list

k get po -n default -l project=apod --watch


App URL from ArgoCD UI or svc details  - http://localhost:30810


