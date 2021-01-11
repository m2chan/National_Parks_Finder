// Automatically scrolls to image clicked

const imageModal = document.getElementById('image-modal-body')
const carousel = document.getElementsByClassName('carousel-container')[0]

carousel.addEventListener('click', function(event) {
    console.log(event.target.tagName)
    if (event.target.tagName === 'IMG') {
        let imageNum = parseInt(event.target.getAttribute('id').substring(6))
        $('#show-photos').modal('show')
        
        setTimeout(function() {
            imageModal.scrollTo({
                top: imageModal.scrollHeight * (imageNum/(park.images.length + 0.5)),
                behavior: 'smooth'
            })
        }, 170)
    }
})
