const ROOT = document.documentElement;
const HEADER_STICKY_OFFSET = 150;
let headerHeight = 0;
let scrollPosition = 0;

function isTouchPointer() {
    return matchMedia("(pointer: coarse)").matches;
}
if (isTouchPointer()) {
    ROOT.classList.add('touch-device');
} else {
    ROOT.classList.add('not-touch-device');
}
const debouncedPaging = debounce(function(this_input,page_selected) {
    if (this_input) {
        loadNextPage(this_input,page_selected);
    }
}, 1000);
function scrollLock(lock) {
    let BODY = document.body;

    if ( lock && !BODY.classList.contains('scroll-lock') ) {
        scrollPosition = window.pageYOffset;
        BODY.style.overflow = 'hidden scroll';
        BODY.style.position = 'fixed';
        BODY.style.top = `-${scrollPosition}px`;
        BODY.style.width = '100%';
        ROOT.style.scrollBehavior = 'auto';
        BODY.style.scrollBehavior = 'auto';
        BODY.classList.add("scroll-lock");
    }
    if ( !lock && BODY.classList.contains('scroll-lock') ) {
        BODY.style.removeProperty('overflow');
        BODY.style.removeProperty('position');
        BODY.style.removeProperty('top');
        BODY.style.removeProperty('width');
        BODY.classList.remove("scroll-lock");
        window.scrollTo(0, scrollPosition);
        BODY.style.scrollBehavior = '';
        ROOT.style.scrollBehavior = '';
    }
}
function debounce(func, wait=500, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        }, wait);
        if (immediate && !timeout) func.apply(context, args);
    };
}
function throttle(callback, delay=300) {
    var timeoutHandler = null;
    return function () {
        if (timeoutHandler == null) {
            timeoutHandler = setTimeout(function () {
                callback();
                timeoutHandler = null;
            }, delay);
        }
    }
}
function closeNanobar(e, name, type, cssVar) {
    var $target = $(e).closest('#nanobar');
    $target.stop().animate({
        height: "0px"
    }, 500, function() {
        $target.remove();
        set_front_var(name,1,type);
    });
}
function getContrastYIQ(hexcolor){
    var r = parseInt(hexcolor.substr(0,2),16);
    var g = parseInt(hexcolor.substr(2,2),16);
    var b = parseInt(hexcolor.substr(4,2),16);
    var yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? 'light' : 'dark';
}
function getHeight(el) {
    if (el.length > 0) {
        return el.outerHeight();
    } else {
        return 0;
    }
}
let headerCorrection =  function(from, to) {
    let correction = 12;

    if ( ROOT.classList.contains('header-with-sticky-behavior') ||
        ( ROOT.classList.contains('header-with-sticky-behavior-on-scroll-up') && from > to )
    ) {
        correction += getHeaderHeight();
    }

    return correction;
}
function getHeaderHeight() { /* ne töröld! shop_common hivatkozás van rá */
    return $('#header').outerHeight();
}
/* Business logic to handle hover behaviour on one product element */
function altPicHover() {
    let item = $(this);

    /* Get the main image */
    let mainPic = item.find(".js-main-img");
    let mainPicSrc = mainPic.attr("data-src-orig");
    let mainPicSrcSet = mainPic.attr("data-srcset-orig");
    if (mainPicSrcSet==undefined) mainPicSrcSet="";

    /* Get the alt image wrappers */
    let altPics = item.find(".js-alt-img-wrap");

    /* Business logic to handle swapping of the main img and one alt img */
    function handleSwap() {
        let $this = $(this);

        /* Function to swap images */
        function swapImages() {
            let currentAltPicSrc = $this.find("img").attr("data-src-orig");
            mainPic.attr("src", currentAltPicSrc);

            let currentAltPicSrcSet = $this.find("img").attr("data-srcset-orig");
            if (currentAltPicSrcSet === undefined) currentAltPicSrcSet = "";
            mainPic.attr("srcset", currentAltPicSrcSet);
        }

        /* When hovering over the alt img swap it with the main img */
        $this.mouseover(swapImages);

        /* Handle focus event */
        $this.focus(swapImages);

        /* Handle blur event */
        $this.blur(function() {
            mainPic.attr("src", mainPicSrc);
            mainPic.attr("srcset", mainPicSrcSet);
        });
    }

    item.find('.js-alt-images').mouseleave(function() {
        mainPic.attr("src", mainPicSrc);
        mainPic.attr("srcset", mainPicSrcSet);
    });

    /* Call the handleSwap fn on all alt imgs */
    altPics.each(handleSwap);
}
/* CHECK SEARCH INPUT CONTENT  */
function checkForInput(element) {
    let thisEl = $(element);
    let tmpval = thisEl.val();
    let searchButton = thisEl.siblings(".search-box__search-btn");

    thisEl.toggleClass("not-empty", tmpval.length >= 1).toggleClass("search-enable", tmpval.length >= thisEl.data('search-min-length'));

    if (tmpval.length < thisEl.data('search-min-length')) {
        searchButton.attr({"aria-disabled": true, "disabled": true});
    } else {
        searchButton.attr({"aria-disabled": false, "disabled": false});
    }
}

function getScrollTop() {
    return $(window).scrollTop();
}

function getWindowWidth() {
    return $(window).width();
}

function getVisibleDistanceTillHeaderBottom() {
    let $header = $('#header');
    let $headerTop = $header.offset().top - $(window).scrollTop();
    let visibleDistanceTillHeaderBottom = getHeight($header) + $headerTop;
    return visibleDistanceTillHeaderBottom;
}
function positionStickyDisable() {
    ROOT.classList.remove("header-is-sticky","header-is-visible-by-scroll-up","header-is-hidden-by-scroll-down","header-is-sticky-with-transition");
}
function handleStickyHeader() {
    let st = $(this).scrollTop();

    if (Math.abs(lastScrollTop - st) <= DELTA)
        return;

    if (st > headerHeight + HEADER_STICKY_OFFSET) {
        ROOT.classList.remove("header-is-visible-by-scroll-up");
        ROOT.classList.add("header-is-sticky","header-is-hidden-by-scroll-down");

        setTimeout(function (){
            ROOT.classList.add("header-is-sticky-with-transition");
        }, 100);
        if (st > lastScrollTop) {
            ROOT.classList.add("header-is-hidden-by-scroll-down");
            ROOT.classList.remove("header-is-visible-by-scroll-up");
        } else {
            ROOT.classList.remove("header-is-hidden-by-scroll-down");
            ROOT.classList.add("header-is-visible-by-scroll-up");
        }
    } else {
        positionStickyDisable();
    }
    lastScrollTop = st;
}
function initDrag(el) {
    const slider = document.getElementById(el);
    if (slider) {
        slider.classList.add('draggable');
        let isDown = false;
        let startX, startY;
        let scrollLeft, scrollTop;

        slider.addEventListener("mousedown", (e) => {
            isDown = true;
            startX = e.pageX - slider.offsetLeft;
            startY = e.pageY - slider.offsetTop;
            scrollLeft = slider.scrollLeft;
            scrollTop = slider.scrollTop;
            slider.classList.add("is-pointer-down");
        });
        slider.addEventListener("mouseleave", () => {
            isDown = false;
            slider.classList.remove("dragging", "is-pointer-down");
        });
        slider.addEventListener("mouseup", () => {
            isDown = false;
            slider.classList.remove("dragging", "is-pointer-down");
        });
        slider.addEventListener("mousemove", (e) => {
            if (!isDown) return;
            e.preventDefault();
            const scroll_speed = 1;  /* normal - fast (1-5)*/
            const x = e.pageX - slider.offsetLeft;
            const y = e.pageY - slider.offsetTop;
            const walkX = (x - startX) * scroll_speed;
            const walkY = (y - startY) * scroll_speed;
            if (Math.abs(walkX) > 0 || Math.abs(walkY) > 0) {
                slider.classList.add("dragging");
            }
            slider.scrollLeft = scrollLeft - walkX;
            slider.scrollTop = scrollTop - walkY;
        });
    }
}

let lastScrollTop = 0;
const DELTA = 1;

$(document).ready(function () {
    const HEADER = document.getElementById("header");
    const HEADER_INNER = document.getElementById("header__inner");

    /* back to top */
    const SCROLL_TOP_ELEMENT = $('#scroll-to-top-btn');
    function showBackToTop(offset = 500) {
        if ($(window).scrollTop() > offset) {
            SCROLL_TOP_ELEMENT.addClass('show');
        } else {
            SCROLL_TOP_ELEMENT.removeClass('show');
        }
    }
    SCROLL_TOP_ELEMENT.on('click', function(e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return false;
    });
    $(window).on('load scroll', throttle(function () {
        showBackToTop();
    }, 100));

    initTippy();

    if ( HEADER !== null && (ROOT.classList.contains('header-with-sticky-behavior') || ROOT.classList.contains('header-with-sticky-behavior-on-scroll-up')) ) {
        headerHeight = getHeight($(HEADER_INNER));
        ROOT.style.setProperty('--header-height', headerHeight + "px");

        if ( ROOT.classList.contains('header-with-sticky-behavior') ) {
            function get_header_top_position() {
                let stickyTop = parseInt(window.getComputedStyle(HEADER).top);
                let windowYOffset = window.pageYOffset;
                let currentTop = HEADER.offsetTop - windowYOffset;

                if (currentTop < 1 ) currentTop = 0;

                if (windowYOffset > 0 && currentTop === stickyTop) {
                    ROOT.classList.add('header-is-sticky');
                } else {
                    ROOT.classList.remove('header-is-sticky');
                }
            }
            $(window).on('scroll', {passive: true}, throttle(function () {
                get_header_top_position();
            }, 100));
            window.onload = (event) => {
                get_header_top_position();
            };
        }
        if ( ROOT.classList.contains('header-with-sticky-behavior-on-scroll-up') ) {
            handleStickyHeader();

            $(window).on('scroll', {passive: true}, throttle(function () {
                if (!ROOT.classList.contains('freeze-sticky-header')) {
                    handleStickyHeader();
                }
            }, 100));
        }
    }

    $(window).on('resize', debounce(function () {
        if ( HEADER !== null && (ROOT.classList.contains('header-with-sticky-behavior') || ROOT.classList.contains('header-with-sticky-behavior-on-scroll-up')) ) {
            headerHeight = getHeight($(HEADER_INNER));
            ROOT.style.setProperty('--header-height', headerHeight + "px");
        }
    }, 100));

    /* CHECK SEARCH INPUT CONTENT  */
    $('#box_search_input').on('input blur focus', function(e) {
        const type = e.type;

        if (type === 'focus') {
            ROOT.classList.add('freeze-sticky-header');
        } else {
            checkForInput(this);
            if (type === 'blur') {
                ROOT.classList.remove('freeze-sticky-header');
            }
        }
    });

    /* DATA SCROLL DOWN */
    $(document).on('click', '[data-js-scroll-to]', function(e) {
        e.preventDefault();

        let $this = $(this);
        let scrollToAttribute = $this.data('js-scroll-to');
        let $scrollTo = $(scrollToAttribute);

        if ($scrollTo.length > 0) {
            let existingTimeout = $scrollTo.data('highlight-timeout');
            if (existingTimeout) {
                clearTimeout(existingTimeout);
                $scrollTo.removeClass("scroll-to-highlighted");
            }

            let callback = function () {
                $scrollTo.addClass("scroll-to-highlighted");
                let timeoutId = setTimeout(function () {
                    $scrollTo.removeClass("scroll-to-highlighted");
                    $scrollTo.removeData('highlight-timeout');
                }, 1000);
                $scrollTo.data('highlight-timeout', timeoutId);
            }
            if ( !isInViewport($scrollTo) ) {
                ROOT.style.scrollBehavior = 'auto';

                if ($scrollTo.parent().css('position') == 'sticky' || $scrollTo.closest('.modal').length > 0) {
                    let scrollIn = $scrollTo[0].parentElement;

                    if ($scrollTo.closest('.modal').length > 0) {
                        scrollIn = $scrollTo.closest('.modal-body');

                        scrollToElement({
                            element: $scrollTo,
                            scrollIn: scrollIn,
                            container: scrollIn,
                            callback: callback
                        });
                    } else {
                        function runScrollFunctions() {
                            return new Promise(resolve => {
                                scrollToElement({
                                    element: scrollIn,
                                    callback: () => {
                                        scrollToElement({
                                            element: $scrollTo,
                                            scrollIn: scrollIn,
                                            container: scrollIn,
                                            callback: () => {
                                                callback();
                                                resolve();
                                            }
                                        });
                                    }
                                });
                            });
                        }

                        runScrollFunctions().then(() => {
                        });
                    }
                } else {
                    scrollToElement({
                        element: $scrollTo,
                        callback: callback
                    });
                }
            } else {
                callback();
            }
        }
    });
    $(document).on('productTooltipButtonClicked', function (e, data) {
        data.event.currentTarget.classList.add('loader','active');
        EVENT_DATA['product_tooltip_opened_by'] = data.event.currentTarget;
    });
});

/*** PRODUCT VARIANT CHANGE AND ERROR HANDLING ***/
function changeVariant(el) {
    let $thisSelect = $(el);

    if (!$thisSelect.hasClass('is-selected')) {
        $thisSelect.addClass('is-selected').removeClass('is-invalid');
        $thisSelect.attr('aria-invalid','false');
        $thisSelect.removeAttr('aria-describedby');
    }
    checkVariants(el, true)
}
let $faultInVariants;
function checkVariants(el, onlyCheck) {
    $faultInVariants = false;
    let $thisProduct = $(el).closest('.js-product');
    let $variantSelectWraps = null;

    if ( typeof el === 'string' && el.includes('artdet') ) {
        $variantSelectWraps = $('.js-variant-wrap', $(el));
    } else {
        $variantSelectWraps = $('.js-variant-wrap', $thisProduct);
    }

    if ($variantSelectWraps.length > 0) {
        $variantSelectWraps.each(function () {
            let selectWrap = $(this);
            let selectItem = $(selectWrap).find('select');

            if (!selectItem.hasClass('is-selected')) {
                if (!onlyCheck) {
                    selectItem.attr('aria-invalid', 'true').addClass('is-invalid');
                    selectItem.attr("aria-describedby", "error-" + selectItem.attr('id'));
                    if (!$faultInVariants) {
                        selectItem.focus();
                    }
                }
                $faultInVariants = true;
            } else {
                if (!onlyCheck) selectItem.attr('aria-invalid','false').removeAttr("aria-describedby").removeClass('is-invalid');
            }
        });
    }

    if (!$faultInVariants) {
        $thisProduct.removeClass('has-unselected-variant');
        $thisProduct.addClass('all-variant-selected');
    } else {
        $thisProduct.addClass('has-unselected-variant');
        $thisProduct.removeClass('all-variant-selected');
    }
}
function inputsErrorHandling(isTooltip,el) {
    /*check error in spec params inputs*/
    let faultInInputs = 0;
    if (isTooltip === 1) {
        faultInInputs = check_cust_input(null,"tooltip");
    } else {
        faultInInputs = check_cust_input();
    }
    /*check error in variant inputs*/
    let faultInVariant = $faultInVariants;

    /* IS not select onchange fn call (it runs only when clicked on btn), is a text input param, is artdet */
    const faultContainers = [];
    const product = $(el).closest(".js-product");

    if (faultInInputs === 1 || faultInVariant === true) {
        function createScrollCallback($scrollTo) {
            const $el = $($scrollTo);

            return function () {
                // class eltávolítás és újraadás az animáció resethez
                $el.removeClass("scroll-to-highlighted");

                // force reflow trükk – hogy tényleg újrainduljon az animáció
                void $el[0].offsetWidth;

                $el.addClass("scroll-to-highlighted");

                // timeout törlése, ha még fut
                let existingTimeout = $el.data("highlight-timeout");
                if (existingTimeout) {
                    clearTimeout(existingTimeout);
                }

                // új timeout
                let timeoutId = setTimeout(function () {
                    $el.removeClass("scroll-to-highlighted");
                    $el.removeData("highlight-timeout");
                }, 1000);

                $el.data("highlight-timeout", timeoutId);
            };
        }

        if (faultInVariant === true) {
            const variantsEl = product.find(".artdet__variants");

            if (variantsEl.length > 0) {
                const scrollCallback = createScrollCallback(variantsEl);
                faultContainers.push(variantsEl[0]);

                if (isTooltip === 1) {
                    scrollCallback();
                } else {
                    const elementParent = variantsEl.parent();
                    const isSticky = elementParent.css('position') === 'sticky';

                    if (isSticky) {
                        scrollCallback();
                    } else {
                        if (isInViewport(variantsEl)) {
                            scrollCallback();
                        } else {
                            scrollToElement({
                                element: variantsEl,
                                offset: headerHeight + 20,
                                callback: scrollCallback
                            });
                        }
                    }
                }
            }
        }

        if (faultInInputs === 1) {
            const specParamInputsEl = product.find('.js-spec-params-input');
            if (specParamInputsEl.length > 0) {
                const scrollCallback = createScrollCallback(specParamInputsEl);
                faultContainers.push(specParamInputsEl[0]);

                if (isTooltip === 1) {
                    scrollToElement({
                        element: specParamInputsEl,
                        offset: headerHeight + 20,
                        scrollIn: '#modal-tooltip .modal-body',
                        container: '#modal-tooltip',
                        callback: scrollCallback
                    });
                } else {
                    const elementParent = specParamInputsEl.parent();
                    const isSticky = elementParent.css('position') === 'sticky';

                    if (isInViewport(specParamInputsEl)) {
                        scrollCallback();
                    } else {
                        if (isSticky) {
                            scrollToElement({
                                element: specParamInputsEl,
                                offset: headerHeight + 20,
                                scrollIn: elementParent,
                                container: elementParent,
                                callback: scrollCallback
                            });
                        } else {
                            scrollToElement({
                                element: specParamInputsEl,
                                offset: headerHeight + 20,
                                callback: scrollCallback
                            });
                        }
                    }
                }
            }
        }
        /* legkorábbi hiba konténer megkeresése */
        const firstContainer = faultContainers.reduce((earliest, current) => {
            if (!earliest) return current;
            return earliest.compareDocumentPosition(current) & Node.DOCUMENT_POSITION_FOLLOWING
                ? earliest
                : current;
        }, null);

        /* első input fókuszálása a legkorábbi konténerben */
        if (firstContainer) {
            const firstInput = firstContainer.querySelector('input.is-invalid, select.is-invalid');
            if (firstInput) {
                firstInput.focus();
            }
        }
    } else {
        let mainBtn = $(el);
        let onclickFn = mainBtn.data("onclick");
        mainBtn.addClass('call-onclick');
        if (mainBtn.hasClass('artdet__quick-order-btn')) mainBtn.addClass('loader');
        eval(onclickFn);
    }
}
function closeVariantsOverlay(el) {
    function closeThisOverlay(el) {
        let $thisOpenBtn = $(el);
        let $thisProduct = $thisOpenBtn.closest('.js-product');
        let $thisVariants = $thisProduct.find('.js-variants');

        $thisProduct.removeClass('is-variants-opened');
        $thisVariants.removeClass('show');
        $thisProduct.find('.product__variants-btn').attr('aria-expanded', false).focus();
    }

    /* Listák bezárásra és ESC eseményfigyelők törlése */
    if (!variantsHandle.controllers) return;

    variantsHandle.controllers.forEach(controller => {
        if (typeof controller.onKeydown === 'function') {
            closeThisOverlay(controller.openButton);
            document.removeEventListener('keydown', controller.onKeydown);
        }
    });

    variantsHandle.controllers = [];
    announceToScreenReader?.('listCollapse', {'label': UNAS.text.product_variants});
}
let lastFocusedElement;
function handleFocusIn(e) {
    lastFocusedElement = e.target;
}
document.addEventListener('focusin', handleFocusIn);

function openVariantsOverlay(el) {
    let $thisOpenBtn = $(el);
    let $thisProduct = $thisOpenBtn.closest('.js-product');
    let $thisVariants = $thisProduct.find('.js-variants');

    let focusableSelectors = [], focusableElements = [];
    let firstEl,lastEl;

    function onKeydown(e) {
        if (e.key === 'Escape' || e.key === 'Esc') {
            closeVariantsOverlay();
            return;
        }
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (lastFocusedElement === $thisOpenBtn[0]) {
                    e.preventDefault();
                    firstEl.focus();
                    return;
                }
                if (document.activeElement === firstEl || lastFocusedElement === $thisVariants[0] ) {
                    e.preventDefault();
                    $thisOpenBtn.focus();
                }
            } else {
                if (lastFocusedElement === $thisOpenBtn[0]) {
                    e.preventDefault();
                    firstEl.focus();
                    return;
                }
                if (document.activeElement === lastEl) {
                    e.preventDefault();
                    $thisOpenBtn.focus();
                }
            }
        }
    }

    if( $thisProduct.is('.all-variant-selected.is-variants-opened') || $thisProduct.is('.all-variant-selected.js-variant-type-2') ){
        let cartadd = $thisOpenBtn.data("cartadd");
        eval(cartadd);
        $thisProduct.removeClass('is-variants-opened');
        $thisVariants.removeClass('show');
        $thisOpenBtn.attr('aria-expanded',false);
        return;
    }
    if( !$thisProduct.hasClass('is-variants-opened') && !$thisProduct.hasClass('js-variant-type-2') ){
        focusableSelectors = [
            'a[href]', 'button:not([disabled])', 'input:not([disabled])',
            'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])'
        ];
        focusableElements = Array.from($thisVariants[0].querySelectorAll(focusableSelectors.join(',')))
            .filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));

        if (focusableElements.length === 0) return;

        firstEl = focusableElements[0];
        lastEl = focusableElements[focusableElements.length - 1];

        $thisVariants.addClass('show').attr('tabindex','-1').focus();
        $thisVariants[0].removeAttribute('tabindex');
        $thisProduct.addClass('is-variants-opened');
        $thisOpenBtn.attr('aria-expanded',true);
        announceToScreenReader?.('listExpand', {'label': UNAS.text.product_variants});
        document.addEventListener('keydown', onKeydown);
        variantsHandle.controllers.push({
            openButton: $thisOpenBtn[0],
            onKeydown: onKeydown
        });
    }else{
        checkVariants(el);
    }
}
let variantsHandle = { controllers: [] };

$(window).bind("pageshow", function() {
    $('.js-variant-wrap').each(function () {
        $('select option', this).each(function () {
            if (this.defaultSelected) {
                this.selected = true;
                return false;
            }
        });
    });
    $('.cust_input_select:not(.param_cust_input_save_select)').each(function () {
        $('option', this).each(function () {
            if (this.defaultSelected) {
                this.selected = true;
                return false;
            }
        });
    });
    $('.cust_input_file, .cust_input_text').each(function () {
        let $this = $(this);
        if (!$this.hasClass('param_cust_input_save')) {
            $this.val("");
        }
        if ($this.hasClass('cust_input_file')) {
            $this.siblings(".file-name").html($this.siblings(".file-name").attr('data-empty'));
        }
    });
});

/**** FILE INPUT CUSTOMIZATION ****/
function file_input_filname_change(el){
    let thisInput = $(el);
    let thisLabel = thisInput.next('.custom-file-label');
    let thisLabelName = thisLabel.find('.custom-file-name');
    let thisDelButton = thisLabel.find('.custom-file-delete-button');
    let thisLabelNameText = thisLabel.find('.custom-file-name-text');
    let fileName = thisInput.val().split("\\").pop();

    if (fileName === "") {
        thisLabelNameText.html(thisLabel.attr('data-text')).removeClass('not-empty');
        thisDelButton.prop('disabled',true).attr('aria-hidden','true');

        if ( thisInput.hasClass("required") ) {
            thisInput.addClass("is-invalid");
            thisLabelName.addClass("is-invalid");
        }
    } else {
        thisLabelNameText.html(fileName).addClass('not-empty');
        thisDelButton.prop('disabled',false).attr('aria-hidden','false');

        if ( thisInput.hasClass("required") ) {
            thisInput.removeClass("is-invalid");
            thisLabelName.removeClass("is-invalid");
        }
    }
    thisInput.focus();
}
function file_input_filename_delete(event,el) {
    event.stopPropagation();
    event.preventDefault();
    let thisButton = $(el);
    let thisLabel = thisButton.closest('.custom-file-label');
    let thisLabelName = thisLabel.find('.custom-file-name');
    let thisDelButton = thisLabel.find('.custom-file-delete-button');
    let thisLabelNameText = thisLabel.find('.custom-file-name-text');
    let thisInput = thisLabel.siblings('.custom-file-input');

    thisLabelNameText.removeClass('not-empty').html(thisLabel.attr('data-text'));
    thisDelButton.prop('disabled',true).attr('aria-hidden','true');
    if ( thisInput.hasClass("required") ) {
        thisInput.addClass("is-invalid");
        thisLabelName.addClass("is-invalid");
    }
    thisInput[0].value = '';
    thisInput.focus();
}
/*** CUSTOM CONTENT/SHORT DESCRIPTION OPENER ***/
function readMoreOpener(){
    let $container = $(this);
    let $content = $('.read-more__content', $container);
    let $button = $('.read-more__btn', $container);
    let $buttonWrap = $('.read-more__btn-wrap', $container);
    let $contentHeight = $content.outerHeight(true);
    let $defaultMaxHeight = $container.css('max-height');

    if ($defaultMaxHeight.indexOf('px') !== -1 ) {
        $defaultMaxHeight = parseInt($defaultMaxHeight.replace(/[^-\d\.]/g, ''));
    }

    if ($contentHeight > $defaultMaxHeight) {
        $container.addClass('has-button').css({height: $defaultMaxHeight});
        $button.prop('disabled',false);

        $button.on('click',function () {
            $contentHeight = $content.outerHeight(true);

            if (!$button.hasClass('is-active')) {
                $container.css('max-height', 'unset').animate({height: $contentHeight + $buttonWrap.outerHeight(true)}, 400, function (){
                    if (!isInViewport($container)) {
                        scrollToElement({
                            element: $container
                        });
                    }
                }).addClass('is-opened');
                $button.addClass('is-active').attr('aria-label',$button.data('opened'));
            } else {
                $container.animate({height: $defaultMaxHeight}, 400).removeClass('is-opened');
                $button.removeClass('is-active').attr('aria-label',$button.data('closed'));
                if (!isInViewport($container)) {
                    scrollToElement({
                        element: $container
                    });
                }
            }
        });
    }
    $(this).addClass('is-processed');
}

if (service_type == 'shop') {
    /* OVERLAY onLoad/onClose event */
    $(document).on('show.bs.modal', function (e) {
        if (e.target.id == 'overlay_login_outer') {
            passwordShowHide();

            const mainBtn = document.querySelectorAll('.orderflow-main-btn');

            mainBtn.forEach((button) => {
                button.classList.remove('loader')
            });
        }
        if (typeof tippy !== "undefined" ) tippy.hideAll({duration: 0});
    });

    $(document).on('hide.bs.modal', function (e) {
        if (typeof tippy !== "undefined" ) tippy.hideAll({duration: 0});
    });
    $(document).on('clickOrderButton', function(e,data) {
        if (!data.direction) {
            const mainBtn = document.querySelectorAll('.orderflow-main-btn');

            mainBtn.forEach((button) => {
                button.classList.add('loader')
            });
        }
    });
}

function initTippy(id) {
    let tippyElements = document.getElementById(id);

    if (tippyElements) {
        tippyElements = tippyElements.querySelectorAll("[data-tippy]:not(.binded)");
    } else {
        tippyElements = document.querySelectorAll("[data-tippy]:not(.binded)");
    }

    tippyElements.forEach((el) => {
        ["focus", "mouseenter", "focusin"].forEach(event => {
            el.addEventListener(event, async (e) => {
                if (el.classList.contains("inited")) return;
                e.preventDefault();

                if (EVENT_DATA.tippy_state === "not_loaded") {
                    el.classList.add("tippy-module-loading");
                    /* Prevent further attempts to load modules */
                    EVENT_DATA.tippy_state = 'loading';
                    try {
                        console.info('Loading TippyJS...');
                        await import(shop_url_main+"/!common_packages/jquery/plugins/tippy/tippy-bundle.umd.min.js");

                        if (typeof tippy !== 'undefined') {
                            EVENT_DATA.tippy_state = 'loaded';
                            /* It will only be displayed if the mouse is still over it */
                            if (!el.classList.contains("mouseleave")) {
                                instantiateTippy(el);
                            }
                        } else {
                            throw new Error('Tippy did not load correctly');
                        }
                    } catch (err) {
                        console.error("Error loading modules: ", err);
                        /* Allow retrying in case of failure */
                        EVENT_DATA.tippy_state = 'not_loaded';
                    }
                    el.classList.remove("tippy-module-loading");
                } else if (EVENT_DATA.tippy_state === 'loaded' && !el.classList.contains("inited")) {
                    instantiateTippy(el);
                }
            });
        });
        /* mouse over fix */
        el.addEventListener('mouseleave', () => {
            el.classList.add("mouseleave");
        }, {once:true});
        el.classList.add("binded");

        let blurTimeout;

        ["focusin","click","focusout"].forEach(event => {
            el.addEventListener(event, () => {
                const isTippy = el._tippy;

                if (isTippy) {
                    const isPopper = isTippy.popper;
                    const isPopperTippy = isPopper._tippy;

                    if (event == 'focusin') {
                        clearTimeout(blurTimeout);
                    }
                    if (isPopper) {
                        if (isPopperTippy.state.isShown === false && event != 'focusout') {
                            isPopperTippy.show();
                        } else if (event == 'click' && isTippy && isTippy.reference.nodeName != 'BUTTON' || event == 'focusout') {
                            blurTimeout = setTimeout(() => {
                                isPopperTippy.hide();
                            }, 0);
                        }
                    }
                }
            });
        });
    });

    function instantiateTippy(el) {
        tippy(el, {
            allowHTML: true,
            content: el.getAttribute("data-tippy"),
            hideOnClick: false,
            zIndex: 10000,
            maxWidth: "320px",
            showOnCreate: true,
            onCreate: function onCreate(instance) {
                const ref = instance.reference;
                ref.classList.add('inited');
                if (["DIV", "SPAN"].includes(ref.tagName) && ref.getAttribute('tabindex') === '0') {
                    ref.setAttribute("role", "button");
                    ref.setAttribute('aria-expanded', 'false');
                }
            },
            onShow(instance) {
                const ref = instance.reference;
                ref.setAttribute('aria-live', 'polite');
                ref.setAttribute('aria-expanded', 'true');
                instance.popper.setAttribute('role', 'tooltip');
            },
            onHide(instance) {
                const ref = instance.reference;
                ref.removeAttribute('aria-live');
                ref.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

const eventTippyReady = new CustomEvent('initTippyReady');
document.dispatchEvent(eventTippyReady);

function changeTippyText(text, el) {
    el.setAttribute("data-tippy", text);
    const isTippy = el._tippy;
    if (isTippy) {
        isTippy.setContent(text);
    }
}

$(document).ready(function() {
    $(document).on('addToFavourites', function (e, product_array) {
        let el = $('.page_artdet_func_favourites_outer_' + product_array['sku_id'] + '[data-tippy]');
        let text = UNAS.text.delete_from_favourites;

        el.each(function (){
            changeTippyText(text, this);
        });
    });
    $(document).on('removeFromFavourites', function (e, product_array) {
        let el = $('.page_artdet_func_favourites_outer_' + product_array['sku_id'] + '[data-tippy]');
        let text = UNAS.text.add_to_favourites;

        el.each(function (){
            changeTippyText(text, this);
        });
    });
    $(document).on('addToCompare', function (e, product_array) {
        let el = $('.page_artdet_func_compare_' + product_array['sku_id'] + '[data-tippy]');
        let text = UNAS.text.delete_from_compare;

        el.each(function (){
            changeTippyText(text, this);
        });
    });
    $(document).on('removeFromCompare', function (e, product_array) {
        let el = $('.page_artdet_func_compare_' + product_array['sku_id'] + '[data-tippy]');
        let text = UNAS.text.comparison;

        el.each(function (){
            changeTippyText(text, this);
        });
    });
});