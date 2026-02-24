/* ===================================================================
 * Ceevee 2.0.0 - Main JS
 *
 * ------------------------------------------------------------------- */

(function (html) {
  'use strict';

  html.className = html.className.replace(/\bno-js\b/g, '') + ' js ';

  /* Preloader
   * -------------------------------------------------- */
  const ssPreloader = function () {
    const preloader = document.querySelector('#preloader');
    if (!preloader) return;

    window.addEventListener('load', function () {
      document.querySelector('body').classList.remove('ss-preload');
      document.querySelector('body').classList.add('ss-loaded');

      preloader.addEventListener('transitionend', function (e) {
        if (e.target.matches('#preloader')) {
          this.style.display = 'none';
        }
      });
    });

    // force page scroll position to top at page refresh
    // window.addEventListener('beforeunload' , function () {
    //     window.scrollTo(0, 0);
    // });
  }; // end ssPreloader

  /* Parallax
   * -------------------------------------------------- */
  const ssParallax = function () {
    const rellax = new Rellax('.rellax');
  }; // end ssParallax

  /* Move header menu
   * -------------------------------------------------- */
  const ssMoveHeader = function () {
    const hdr = document.querySelector('.s-header');
    const hero = document.querySelector('#hero');
    let triggerHeight;

    if (!(hdr && hero)) return;

    setTimeout(function () {
      triggerHeight = hero.offsetHeight - 170;
    }, 300);

    window.addEventListener('scroll', function () {
      let loc = window.scrollY;

      if (loc > triggerHeight) {
        hdr.classList.add('sticky');
      } else {
        hdr.classList.remove('sticky');
      }

      if (loc > triggerHeight + 20) {
        hdr.classList.add('offset');
      } else {
        hdr.classList.remove('offset');
      }

      if (loc > triggerHeight + 150) {
        hdr.classList.add('scrolling');
      } else {
        hdr.classList.remove('scrolling');
      }
    });
  }; // end ssMoveHeader

  /* Mobile Menu
   * ---------------------------------------------------- */
  const ssMobileMenu = function () {
    const toggleButton = document.querySelector('.s-header__menu-toggle');
    const headerNavWrap = document.querySelector('.s-header__nav-wrap');
    const siteBody = document.querySelector('body');

    if (!(toggleButton && headerNavWrap)) return;

    toggleButton.addEventListener('click', function (event) {
      event.preventDefault();
      toggleButton.classList.toggle('is-clicked');
      siteBody.classList.toggle('menu-is-open');
    });

    headerNavWrap.querySelectorAll('.s-header__nav a').forEach(function (link) {
      link.addEventListener('click', function (evt) {
        // at 800px and below
        if (window.matchMedia('(max-width: 800px)').matches) {
          toggleButton.classList.toggle('is-clicked');
          siteBody.classList.toggle('menu-is-open');
        }
      });
    });

    window.addEventListener('resize', function () {
      // above 800px
      if (window.matchMedia('(min-width: 801px)').matches) {
        if (siteBody.classList.contains('menu-is-open'))
          siteBody.classList.remove('menu-is-open');
        if (toggleButton.classList.contains('is-clicked'))
          toggleButton.classList.remove('is-clicked');
      }
    });
  }; // end ssMobileMenu

  /* Highlight active menu link on pagescroll
   * ------------------------------------------------------ */
  const ssScrollSpy = function () {
    const sections = document.querySelectorAll('.target-section');

    // Add an event listener listening for scroll
    window.addEventListener('scroll', navHighlight);

    function navHighlight() {
      // Get current scroll position
      let scrollY = window.pageYOffset;

      // Loop through sections to get height(including padding and border),
      // top and ID values for each
      sections.forEach(function (current) {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 50;
        const sectionId = current.getAttribute('id');

        /* If our current scroll position enters the space where current section
         * on screen is, add .current class to parent element(li) of the thecorresponding
         * navigation link, else remove it. To know which link is active, we use
         * sectionId variable we are getting while looping through sections as
         * an selector
         */
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          document
            .querySelector('.s-header__nav a[href*=' + sectionId + ']')
            .parentNode.classList.add('current');
        } else {
          document
            .querySelector('.s-header__nav a[href*=' + sectionId + ']')
            .parentNode.classList.remove('current');
        }
      });
    }
  }; // end ssScrollSpy

  /* Swiper
   * ------------------------------------------------------ */
  const ssSwiper = function () {
    const mySwiper = new Swiper('.swiper-container', {
      slidesPerView: 1,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      breakpoints: {
        // when window width is >= 401px
        401: {
          slidesPerView: 1,
          spaceBetween: 20,
        },
        // when window width is >= 801px
        801: {
          slidesPerView: 2,
          spaceBetween: 48,
        },
      },
    });
  }; // end ssSwiper

  /* Lightbox
   * ------------------------------------------------------ */
  const ssLightbox = function () {
    const folioLinks = document.querySelectorAll('.folio-item a');
    const modals = [];

    folioLinks.forEach(function (link) {
      let modalbox = link.getAttribute('href');
      let instance = basicLightbox.create(document.querySelector(modalbox), {
        onShow: function (instance) {
          //detect Escape key press
          document.addEventListener('keydown', function (evt) {
            evt = evt || window.event;
            if (evt.keyCode === 27) {
              instance.close();
            }
          });
        },
      });
      modals.push(instance);
    });

    folioLinks.forEach(function (link, index) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        modals[index].show();
      });
    });
  }; // end ssLightbox

  /* Alert boxes
   * ------------------------------------------------------ */
  const ssAlertBoxes = function () {
    const boxes = document.querySelectorAll('.alert-box');

    boxes.forEach(function (box) {
      box.addEventListener('click', function (e) {
        if (e.target.matches('.alert-box__close')) {
          e.stopPropagation();
          e.target.parentElement.classList.add('hideit');

          setTimeout(function () {
            box.style.display = 'none';
          }, 500);
        }
      });
    });
  }; // end ssAlertBoxes

  /* Smoothscroll
   * ------------------------------------------------------ */
  const ssSmoothScroll = function () {
    const triggers = document.querySelectorAll('.smoothscroll');

    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        const target = trigger.getAttribute('href');

        Jump(target, {
          duration: 1200,
        });
      });
    });
  }; // end ssSmoothScroll

  /* back to top
   * ------------------------------------------------------ */
  const ssBackToTop = function () {
    const pxShow = 900;
    const goTopButton = document.querySelector('.ss-go-top');

    if (!goTopButton) return;

    // Show or hide the button
    if (window.scrollY >= pxShow) goTopButton.classList.add('link-is-visible');

    window.addEventListener('scroll', function () {
      if (window.scrollY >= pxShow) {
        if (!goTopButton.classList.contains('link-is-visible'))
          goTopButton.classList.add('link-is-visible');
      } else {
        goTopButton.classList.remove('link-is-visible');
      }
    });
  }; // end ssBackToTop

  /* initialize
   * ------------------------------------------------------ */
  (function ssInit() {
    ssPreloader();
    ssParallax();
    ssMoveHeader();
    ssMobileMenu();
    ssScrollSpy();
    ssSwiper();
    ssLightbox();
    ssAlertBoxes();
    ssSmoothScroll();
    ssBackToTop();
  })();
})(document.documentElement);

/* view counter */
window.addEventListener('DOMContentLoaded', (event) => {
  getVisitCount();
});

const localFunctionApi =
  'https://brian-resume-api-440395.azurewebsites.net/api/getresumecounter';

const getVisitCount = () => {
  // 1. Fetch the data from the API
  fetch(localFunctionApi)
    .then((response) => {
      return response.json();
    })
    .then((res) => {
      console.log('Website called function API.');
      // 2. Grab the count from the JSON response
      const count = res.count;
      // 3. Update the HTML
      document.getElementById('counter').innerText = count;
    })
    .catch(function (error) {
      console.log('Error fetching data:', error);
    });
};

/* Contact Form Logic */
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formSuccess = document.getElementById('form-message-success');
const formWarning = document.getElementById('form-message-warning');

// Note: This points to the new /contact route we built in your Python backend
const contactApiUrl =
  'https://brian-resume-api-440395.azurewebsites.net/api/contact';

if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault(); // Stop the form from refreshing the page

    // 1. Grab the data from the form fields
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;

    // 2. Change the button to show it is processing
    submitBtn.innerText = 'Sending...';
    submitBtn.disabled = true;

    // 3. Package the data into a clean JSON object
    const payload = {
      name: name,
      email: email,
      message: message,
    };

    // 4. Send the payload to the Azure Function
    fetch(contactApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (response.ok) {
          // Success! Reset the form and show the green success message
          contactForm.reset();
          formSuccess.style.display = 'block';
          formWarning.style.display = 'none';
          submitBtn.innerText = 'Submit Message';
          submitBtn.disabled = false;
        } else {
          throw new Error('Network response was not ok.');
        }
      })
      .catch((error) => {
        // Something went wrong. Show the red error message
        console.error('Error:', error);
        formWarning.innerText =
          'There was an error sending your message. Please try again later.';
        formWarning.style.display = 'block';
        formSuccess.style.display = 'none';
        submitBtn.innerText = 'Submit Message';
        submitBtn.disabled = false;
      });
  });
}
