
Connect to the buildkit CLI Pod:

```
k exec -it buildkit-cli -- sh
```

Set an environment variable for the build version:

```
export BUILD_NUMBER=0.1.0
```

```
cd ~

buildctl --addr tcp://buildkitd:1234 \
  build --frontend=dockerfile.v0 \
        --local context=. \
        --local dockerfile=. \
        --output type=image,name=${REGISTRY}/${REPOSITORY}/simple:${BUILD_NUMBER},push=true
```

```
export BUILD_NUMBER=0.2.0

buildctl --addr tcp://buildkitd:1234 \
  build --frontend=dockerfile.v0 \
        --local context=. \
        --local dockerfile=. \
        --output type=image,name=${REGISTRY}/${REPOSITORY}/simple:${BUILD_NUMBER},push=true
```