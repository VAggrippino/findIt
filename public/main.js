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

      let image = e.target.parentNode
      while (!image.classList.contains('image')) image = image.parentNode
      if (image.classList.contains('active')) return

      imageResults.forEach(i => i.classList.remove('active'))
      image.classList.add('active')

      toggleDetail(imageDetail, 'hide')
        .then(imageDetail => addDetails(imageDetail))
        .then(imageDetail => positionDetail(imageDetail))
        .then(imageDetail => toggleDetail(imageDetail, 'show'))
        .then(imageDetail => positionWindow(imageDetail))
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

    const imageMiddle = image.offsetLeft + image.offsetWidth / 2
    const pointer = imageDetail.getElementsByClassName('pointer')[0]
    const pointerPosition = imageMiddle - pointer.offsetWidth / 2
    pointer.style.left = pointerPosition + 'px'

    // Identify the row that contains the image
    let row = image.parentNode
    while (!row.classList.contains('row')) row = row.parentNode

    row.insertAdjacentElement('afterend', imageDetail)

    // Trigger a reflow before resolving the promise
    // https://stackoverflow.com/a/50000450/2948042
    // https://gist.github.com/paulirish/5d52fb081b3570c81e3a
    row.offsetWidth // eslint-disable-line no-unused-expressions
    resolve(imageDetail)
  })
}

function positionWindow (imageDetail) {
  let activeRow = imageDetail.previousSibling
  let windowBottom = window.scrollY + window.innerHeight
  let detailBottom = imageDetail.offsetTop + imageDetail.offsetHeight

  // If the image detail isn't fully visible, scroll just enough so that it is
  if (windowBottom < detailBottom + 10) {
    let goodPosition = imageDetail.offsetTop + window.innerHeight - imageDetail.offsetHeight + 10
    window.scrollTo(0, goodPosition)
  }

  // If the active row isn't fully visible, scroll just enough so that it is
  if (window.scrollY > activeRow.offsetTop - 10) {
    window.scrollTo(0, activeRow.offsetTop - 10)
  }
}
