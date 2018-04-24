window.addEventListener('load', () => {
  if (!document.body.classList.contains('images')) return
  const imageResults = document.querySelectorAll('.image.result')
  const firstRow = imageResults[0].parentNode
  const detailHeight = firstRow.offsetHeight * 2

  for (let image of imageResults) {
    image.addEventListener('click', e => {
      e.preventDefault()

      // Store the image data with the imageDetail block
      const imageDetail = document.getElementById('imageDetail')
      imageDetail.style.height = detailHeight + 'px'
      imageDetail.data = e.currentTarget.dataset
      imageDetail.target = e.target

      toggleDetail(imageDetail, 'hide')
        .then(imageDetail => addDetails(imageDetail))
        .then(imageDetail => positionDetail(imageDetail))
        .then(imageDetail => toggleDetail(imageDetail, 'show'))
    })
  }
})

function toggleDetail (imageDetail, action) {
  return new Promise((resolve, reject) => {
    const isVisible = () => !imageDetail.classList.contains('hidden')

    const transitionHandler = e => {
      if (e.propertyName !== 'max-height') return
      imageDetail.removeEventListener('transitionend', transitionHandler)
      resolve(imageDetail)
    }

    const correctState = (action === 'hide') ? !isVisible() : isVisible()
    if (!correctState) {
      imageDetail.classList.toggle('hidden')
      imageDetail.addEventListener('transitionend', transitionHandler)
    } else {
      resolve(imageDetail)
    }
  })
}

function addDetails (imageDetail) {
  return new Promise((resolve, reject) => {
    let data = imageDetail.data

    // A full URL can be too long so we just show the domain
    const justDomain = url => url.match(/^https?:\/\/([^/]*).*$/)[1]

    // Create the thumbnail for the image detail block
    let thumbnailAnchor = document.createElement('a')
    let img = document.createElement('img')
    thumbnailAnchor.setAttribute('href', data.contentUrl)
    thumbnailAnchor.setAttribute('target', '_blank')
    img.setAttribute('src', data.thumbnailUrl)
    img.setAttribute('alt', data.name)
    thumbnailAnchor.appendChild(img)

    // Create the source image link for the image detail block
    let contentAnchor = document.createElement('a')
    contentAnchor.setAttribute('href', data.contentUrl)
    contentAnchor.setAttribute('target', '_blank')
    contentAnchor.innerText = justDomain(data.contentUrl)

    // Create a link to the page hosting the image for the details
    let hostPageAnchor = document.createElement('a')
    hostPageAnchor.setAttribute('href', data.hostPage)
    hostPageAnchor.setAttribute('target', '_blank')
    hostPageAnchor.innerText = justDomain(data.hostPage)

    // Add the thumbnail
    imageDetail.querySelector('.image').innerHTML = ''
    imageDetail.querySelector('.image').appendChild(thumbnailAnchor)

    // Add the image's descriptive name
    imageDetail.querySelector('.description').innerText = data.name

    // Add the source image link
    imageDetail.querySelector('.contentUrl').innerHTML = ''
    imageDetail.querySelector('.contentUrl').appendChild(contentAnchor)

    // Add the file type to the details
    imageDetail.querySelector('.format').innerText = data.format

    // Add the file size to the details
    imageDetail.querySelector('.size').innerText = data.size

    // Add the resolution to the details
    imageDetail.querySelector('.resolution').innerHTML = data.width + '&times;' + data.height

    // Add the host page link
    imageDetail.querySelector('.hostPageUrl').innerHTML = ''
    imageDetail.querySelector('.hostPageUrl').appendChild(hostPageAnchor)
    resolve(imageDetail)
  })
}

function positionDetail (imageDetail) {
  return new Promise((resolve, reject) => {
    const target = imageDetail.target

    // Identify the image's containing block
    let image = target.parentNode
    while (!image.classList.contains('image')) image = image.parentNode

    // Identify the row that contains the image
    let row = image.parentNode
    while (!row.classList.contains('row')) row = row.parentNode

    row.insertAdjacentElement('afterend', imageDetail)

    // The next transition doesn't occur unless we wait a little while first
    setTimeout(resolve.bind(null, imageDetail), 100)
    // resolve(imageDetail)
  })
}
