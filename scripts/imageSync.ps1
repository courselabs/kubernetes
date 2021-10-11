$images = $(cat images.txt)

Write-Output '* Pulling images'
foreach ($tag in $images) {
    Write-Output "** Processing tag: $tag"
    & docker pull $tag

    $newTag = "courselabs.azurecr.io/$tag"
    Write-Output "** Tagging as: $newTag"
    & docker tag $tag $newTag
    
    Write-Output "** Pushing: $newTag"
    & docker push $newTag
}