
k apply -f labs\operators\solution

k get po,svc -l app=nats

k rollout restart deploy todo-save-handler

k logs -l app=todo-list,component=save-handler

k get po,svc -l app.kubernetes.io/instance=todo-db

http://localhost:30820

- Add a new item
- Refresh list
