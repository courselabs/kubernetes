

k apply -f .\labs\logging\solution\

k logs -l app=fulfilment,component=processor -c logger

Kibana, filter app=fulfilment, component=processor

Downside is metadata refers to logger container, e.g. no app image