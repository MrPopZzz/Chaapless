document.addEventListener("DOMContentLoaded", function () {
    const track = document.querySelector('.carousel-track');
    const images = document.querySelectorAll('.carousel-track img');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');

    let currentIndex = 0;
    const imageWidth = 100; // Percentage
    const totalImages = images.length;
    let interval;

    // Cloning first and last images for infinite effect
    const firstClone = images[0].cloneNode(true);
    const lastClone = images[totalImages - 1].cloneNode(true);
    track.appendChild(firstClone);
    track.insertBefore(lastClone, images[0]);

    function updateCarousel() {
        track.style.transition = 'transform 0.5s ease-in-out';
        // track.style.transform = `translateY(-${(currentIndex + 1) * imageWidth})`;
        track.style.transform = `translateX(-${(currentIndex + 1) * imageWidth}%)`;
    }

    function resetCarousel() {
        // Waiting for transition to end before resetting
        setTimeout(() => {
            track.style.transition = 'none';
            if (currentIndex >= totalImages) {
                currentIndex = 0;
                track.style.transform = `translateX(-${imageWidth}%)`;
            } else if (currentIndex < 0) {
                currentIndex = totalImages - 1;
                track.style.transform = `translateX(-${totalImages * imageWidth}%)`;
            }
        }, 500);
    }

    function nextImage() {
        currentIndex++;
        updateCarousel();
        if (currentIndex >= totalImages) {
            resetCarousel();
        }
    }

    function prevImage() {
        currentIndex--;
        updateCarousel();
        if (currentIndex < 0) {
            resetCarousel();
        }
    }

    function startAutoSlide() {
        interval = setInterval(nextImage, 3000);
    }

    function stopAutoSlide() {
        clearInterval(interval);
    }

    // Event listeners
    nextBtn.addEventListener('click', () => {
        stopAutoSlide();
        nextImage();
        startAutoSlide();
    });

    prevBtn.addEventListener('click', () => {
        stopAutoSlide();
        prevImage();
        startAutoSlide();
    });

    // Pause on hover
    track.addEventListener('mouseenter', stopAutoSlide);
    track.addEventListener('mouseleave', startAutoSlide);

    // Initializing carousel
    track.style.transform = `translateX(-${imageWidth}%)`;
    startAutoSlide();

    // Handling transition end for smooth reset
    track.addEventListener('transitionend', () => {
        if (currentIndex >= totalImages || currentIndex < 0) {
            resetCarousel();
        }
    });
});