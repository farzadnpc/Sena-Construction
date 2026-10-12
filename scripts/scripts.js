document.addEventListener('DOMContentLoaded', () => {
            
    // 1. EmailJS Quote Form Logic
    // IMPORTANT: Replace these strings with your actual EmailJS keys
    if (typeof emailjs !== 'undefined') {
        emailjs.init("sFH-gMwS4s8AJ4MUH"); 
    }

    const quoteForm = document.getElementById('quote-form');
    const submitBtn = document.getElementById('submit-btn');
    const formStatus = document.getElementById('form-status');

    if (quoteForm) {
        quoteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = "Sending...";
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-70');

            emailjs.sendForm('service_8xgqvse', 'template_raxrkfr', this)
                .then(() => {
                    formStatus.textContent = "Message sent successfully! We will contact you soon.";
                    formStatus.classList.remove('hidden', 'bg-red-100', 'text-red-700');
                    formStatus.classList.add('block', 'bg-green-100', 'text-green-700');
                    quoteForm.reset();
                })
                .catch((error) => {
                    console.error('EmailJS Error:', error);
                    formStatus.textContent = "Oops! Something went wrong. Please call us directly.";
                    formStatus.classList.remove('hidden', 'bg-green-100', 'text-green-700');
                    formStatus.classList.add('block', 'bg-red-100', 'text-red-700');
                })
                .finally(() => {
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('opacity-70');
                });
        });
    }

    // 2. Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const icon = mobileBtn ? mobileBtn.querySelector('i') : null;

    if(mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('flex');
            if(mobileMenu.classList.contains('hidden')) {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            } else {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            }
        });
    }

    // 3. Mobile Services Accordion Toggle
    const mobileServicesBtn = document.getElementById('mobile-services-btn');
    const mobileServicesMenu = document.getElementById('mobile-services-menu');
    const mobileServicesIcon = document.getElementById('mobile-services-icon');

    if(mobileServicesBtn) {
        mobileServicesBtn.addEventListener('click', () => {
            mobileServicesMenu.classList.toggle('hidden');
            mobileServicesMenu.classList.toggle('flex');
            mobileServicesIcon.classList.toggle('rotate-180');
        });
    }

    // 4. FAQ Accordion Toggle
    const faqBtns = document.querySelectorAll('.faq-btn');
    faqBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const content = btn.nextElementSibling;
            const chevron = btn.querySelector('i');
            
            content.classList.toggle('hidden');
            if(content.classList.contains('hidden')) {
                chevron.classList.remove('rotate-180');
            } else {
                chevron.classList.add('rotate-180');
            }
        });
    });

    // 5. Estimation Calculator Logic
    const calculateBtn = document.getElementById('calculate-btn');
    const serviceSelect = document.getElementById('service-type');
    const floorSpaceInput = document.getElementById('floor-space');
    const resultContainer = document.getElementById('result-container');
    const estimatedCostDisplay = document.getElementById('estimated-cost');

    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            const rate = parseFloat(serviceSelect.value);
            const sqm = parseFloat(floorSpaceInput.value);

            if (!rate) {
                alert('Please select what you would like to build.');
                return;
            }
            if (!sqm || sqm < 50) {
                alert('Please enter a valid floor space (minimum 50 sqm).');
                return;
            }

            const totalCost = rate * sqm;

            const formattedCost = new Intl.NumberFormat('en-AU', {
                style: 'currency',
                currency: 'AUD',
                maximumFractionDigits: 0
            }).format(totalCost);

            estimatedCostDisplay.textContent = formattedCost;
            resultContainer.classList.remove('hidden');
        });
    }
// 6. Testimonial Carousel Arrow Logic (Looping)
const testimonialTrack = document.getElementById('testimonial-track');
const prevTestimonialBtn = document.getElementById('prev-testimonial');
const nextTestimonialBtn = document.getElementById('next-testimonial');

if (testimonialTrack && prevTestimonialBtn && nextTestimonialBtn) {
    nextTestimonialBtn.addEventListener('click', () => {
        const slideWidth = testimonialTrack.clientWidth;
        const maxScroll = testimonialTrack.scrollWidth - slideWidth;
        
        // If at the end, loop back to the start
        if (testimonialTrack.scrollLeft >= maxScroll - 10) {
            testimonialTrack.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            testimonialTrack.scrollBy({ left: slideWidth, behavior: 'smooth' });
        }
    });

    prevTestimonialBtn.addEventListener('click', () => {
        const slideWidth = testimonialTrack.clientWidth;
        const maxScroll = testimonialTrack.scrollWidth - slideWidth;
        
        // If at the beginning, loop to the end
        if (testimonialTrack.scrollLeft <= 10) {
            testimonialTrack.scrollTo({ left: maxScroll, behavior: 'smooth' });
        } else {
            testimonialTrack.scrollBy({ left: -slideWidth, behavior: 'smooth' });
        }
    });
}
});