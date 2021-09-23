k get po -l app=whoami -o wide

k cordon k3d-lab-clusters-agent-1

k drain k3d-lab-clusters-agent-1 --ignore-daemonsets

> Replacement whoami pods created

k get nodes -o wide

k uncordon k3d-lab-clusters-agent-1

> Not automatically rebalanced

k rollout restart deploy whoami 

k get po -l app=whoami -o wide
