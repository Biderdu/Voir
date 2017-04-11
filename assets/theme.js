window.theme = window.theme || {};

/* ================ SLATE ================ */
window.theme = window.theme || {};

theme.Sections = function Sections() {
  this.constructors = {};
  this.instances = [];

  $(document)
    .on('shopify:section:load', this._onSectionLoad.bind(this))
    .on('shopify:section:unload', this._onSectionUnload.bind(this))
    .on('shopify:section:select', this._onSelect.bind(this))
    .on('shopify:section:deselect', this._onDeselect.bind(this))
    .on('shopify:block:select', this._onBlockSelect.bind(this))
    .on('shopify:block:deselect', this._onBlockDeselect.bind(this));
};

theme.Sections.prototype = _.assignIn({}, theme.Sections.prototype, {
  _createInstance: function(container, constructor) {
    var $container = $(container);
    var id = $container.attr('data-section-id');
    var type = $container.attr('data-section-type');

    constructor = constructor || this.constructors[type];

    if (_.isUndefined(constructor)) {
      return;
    }

    var instance = _.assignIn(new constructor(container), {
      id: id,
      type: type,
      container: container
    });

    this.instances.push(instance);
  },

  _onSectionLoad: function(evt) {
    var container = $('[data-section-id]', evt.target)[0];
    if (container) {
      this._createInstance(container);
    }
  },

  _onSectionUnload: function(evt) {
    this.instances = _.filter(this.instances, function(instance) {
      var isEventInstance = (instance.id === evt.detail.sectionId);

      if (isEventInstance) {
        if (_.isFunction(instance.onUnload)) {
          instance.onUnload(evt);
        }
      }

      return !isEventInstance;
    });
  },

  _onSelect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onSelect)) {
      instance.onSelect(evt);
    }
  },

  _onDeselect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onDeselect)) {
      instance.onDeselect(evt);
    }
  },

  _onBlockSelect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onBlockSelect)) {
      instance.onBlockSelect(evt);
    }
  },

  _onBlockDeselect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onBlockDeselect)) {
      instance.onBlockDeselect(evt);
    }
  },

  register: function(type, constructor) {
    this.constructors[type] = constructor;

    $('[data-section-type=' + type + ']').each(function(index, container) {
      this._createInstance(container, constructor);
    }.bind(this));
  }
});

window.slate = window.slate || {};

/**
 * iFrames
 * -----------------------------------------------------------------------------
 * Wrap videos in div to force responsive layout.
 *
 * @namespace iframes
 */

slate.rte = {
  wrapTable: function() {
    $('.rte table').wrap('<div class="rte__table-wrapper"></div>');
  },

  iframeReset: function() {
    var $iframeVideo = $('.rte iframe[src*="youtube.com/embed"], .rte iframe[src*="player.vimeo"]');
    var $iframeReset = $iframeVideo.add('.rte iframe#admin_bar_iframe');

    $iframeVideo.each(function() {
      // Add wrapper to make video responsive
      $(this).wrap('<div class="video-wrapper"></div>');
    });

    $iframeReset.each(function() {
      // Re-set the src attribute on each iframe after page load
      // for Chrome's "incorrect iFrame content on 'back'" bug.
      // https://code.google.com/p/chromium/issues/detail?id=395791
      // Need to specifically target video and admin bar
      this.src = this.src;
    });
  }
};

window.slate = window.slate || {};

/**
 * A11y Helpers
 * -----------------------------------------------------------------------------
 * A collection of useful functions that help make your theme more accessible
 * to users with visual impairments.
 *
 *
 * @namespace a11y
 */

slate.a11y = {

  /**
   * For use when focus shifts to a container rather than a link
   * eg for In-page links, after scroll, focus shifts to content area so that
   * next `tab` is where user expects if focusing a link, just $link.focus();
   *
   * @param {JQuery} $element - The element to be acted upon
   */
  pageLinkFocus: function($element) {
    var focusClass = 'js-focus-hidden';

    $element.first()
      .attr('tabIndex', '-1')
      .focus()
      .addClass(focusClass)
      .one('blur', callback);

    function callback() {
      $element.first()
        .removeClass(focusClass)
        .removeAttr('tabindex');
    }
  },

  /**
   * If there's a hash in the url, focus the appropriate element
   */
  focusHash: function() {
    var hash = window.location.hash;

    // is there a hash in the url? is it an element on the page?
    if (hash && document.getElementById(hash.slice(1))) {
      this.pageLinkFocus($(hash));
    }
  },

  /**
   * When an in-page (url w/hash) link is clicked, focus the appropriate element
   */
  bindInPageLinks: function() {
    $('a[href*=#]').on('click', function(evt) {
      this.pageLinkFocus($(evt.currentTarget.hash));
    }.bind(this));
  },

  /**
   * Traps the focus in a particular container
   *
   * @param {object} options - Options to be used
   * @param {jQuery} options.$container - Container to trap focus within
   * @param {jQuery} options.$elementToFocus - Element to be focused when focus leaves container
   * @param {string} options.namespace - Namespace used for new focus event handler
   */
  trapFocus: function(options) {
    var eventName = options.namespace
      ? 'focusin.' + options.namespace
      : 'focusin';

    if (!options.$elementToFocus) {
      options.$elementToFocus = options.$container;
    }

    options.$container.attr('tabindex', '-1');
    options.$elementToFocus.focus();

    $(document).off('focusin');

    $(document).on(eventName, function(evt) {
      if (options.$container[0] !== evt.target && !options.$container.has(evt.target).length) {
        options.$container.focus();
      }
    });
  },

  /**
   * Removes the trap of focus in a particular container
   *
   * @param {object} options - Options to be used
   * @param {jQuery} options.$container - Container to trap focus within
   * @param {string} options.namespace - Namespace used for new focus event handler
   */
  removeTrapFocus: function(options) {
    var eventName = options.namespace
      ? 'focusin.' + options.namespace
      : 'focusin';

    if (options.$container && options.$container.length) {
      options.$container.removeAttr('tabindex');
    }

    $(document).off(eventName);
  }
};

/**
 * Image Helper Functions
 * -----------------------------------------------------------------------------
 * A collection of functions that help with basic image operations.
 *
 */

theme.Images = (function() {

  /**
   * Preloads an image in memory and uses the browsers cache to store it until needed.
   *
   * @param {Array} images - A list of image urls
   * @param {String} size - A shopify image size attribute
   */

  function preload(images, size) {
    if (typeof images === 'string') {
      images = [images];
    }

    for (var i = 0; i < images.length; i++) {
      var image = images[i];
      this.loadImage(this.getSizedImageUrl(image, size));
    }
  }

  /**
   * Loads and caches an image in the browsers cache.
   * @param {string} path - An image url
   */
  function loadImage(path) {
    new Image().src = path;
  }

  /**
   * Swaps the src of an image for another OR returns the imageURL to the callback function
   * @param image
   * @param element
   * @param callback
   */
  function switchImage(image, element, callback) {
    var size = this.imageSize(element.src);
    var imageUrl = this.getSizedImageUrl(image.src, size);

    if (callback) {
      callback(imageUrl, image, element); // eslint-disable-line callback-return
    } else {
      element.src = imageUrl;
    }
  }

  /**
   * +++ Useful
   * Find the Shopify image attribute size
   *
   * @param {string} src
   * @returns {null}
   */
  function imageSize(src) {
    var match = src.match(/.+_((?:pico|icon|thumb|small|compact|medium|large|grande)|\d{1,4}x\d{0,4}|x\d{1,4})[_\.@]/);

    if (match !== null) {
      return match[1];
    } else {
      return null;
    }
  }

  /**
   * +++ Useful
   * Adds a Shopify size attribute to a URL
   *
   * @param src
   * @param size
   * @returns {*}
   */
  function getSizedImageUrl(src, size) {
    if (size == null) {
      return src;
    }

    if (size === 'master') {
      return this.removeProtocol(src);
    }

    var match = src.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?$/i);

    if (match != null) {
      var prefix = src.split(match[0]);
      var suffix = match[0];

      return this.removeProtocol(prefix[0] + '_' + size + suffix);
    }

    return null;
  }

  function removeProtocol(path) {
    return path.replace(/http(s)?:/, '');
  }

  return {
    preload: preload,
    loadImage: loadImage,
    switchImage: switchImage,
    imageSize: imageSize,
    getSizedImageUrl: getSizedImageUrl,
    removeProtocol: removeProtocol
  };
})();

/**
 * Currency Helpers
 * -----------------------------------------------------------------------------
 * A collection of useful functions that help with currency formatting
 *
 * Current contents
 * - formatMoney - Takes an amount in cents and returns it as a formatted dollar value.
 *
 * Alternatives
 * - Accounting.js - http://openexchangerates.github.io/accounting.js/
 *
 */

theme.Currency = (function() {
  var moneyFormat = '${{amount}}'; // eslint-disable-line camelcase

  function formatMoney(cents, format) {
    if (typeof cents === 'string') {
      cents = cents.replace('.', '');
    }
    var value = '';
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = (format || moneyFormat);

    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = precision || 2;
      thousands = thousands || ',';
      decimal = decimal || '.';

      if (isNaN(number) || number == null) {
        return 0;
      }

      number = (number / 100.0).toFixed(precision);

      var parts = number.split('.');
      var dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
      var centsAmount = parts[1] ? (decimal + parts[1]) : '';

      return dollarsAmount + centsAmount;
    }

    switch (formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, '.', ',');
        break;
      case 'amount_no_decimals_with_space_separator':
        value = formatWithDelimiters(cents, 0, ' ');
        break;
    }

    return formatString.replace(placeholderRegex, value);
  }

  return {
    formatMoney: formatMoney
  }
})();

/**
 * Variant Selection scripts
 * ------------------------------------------------------------------------------
 *
 * Handles change events from the variant inputs in any `cart/add` forms that may
 * exist.  Also updates the master select and triggers updates when the variants
 * price or image changes.
 *
 * @namespace variants
 */

slate.Variants = (function() {

  /**
   * Variant constructor
   *
   * @param {object} options - Settings from `product.js`
   */
  function Variants(options) {
    this.$container = options.$container;
    this.product = options.product;
    this.singleOptionSelector = options.singleOptionSelector;
    this.originalSelectorId = options.originalSelectorId;
    this.enableHistoryState = options.enableHistoryState;
    this.currentVariant = this._getVariantFromOptions();

    $(this.singleOptionSelector, this.$container).on('change', this._onSelectChange.bind(this));
  }

  Variants.prototype = _.assignIn({}, Variants.prototype, {

    /**
     * Get the currently selected options from add-to-cart form. Works with all
     * form input elements.
     *
     * @return {array} options - Values of currently selected variants
     */
    _getCurrentOptions: function() {
      var currentOptions = _.map($(this.singleOptionSelector, this.$container), function(element) {
        var $element = $(element);
        var type = $element.attr('type');
        var currentOption = {};

        if (type === 'radio' || type === 'checkbox') {
          if ($element[0].checked) {
            currentOption.value = $element.val();
            currentOption.index = $element.data('index');

            return currentOption;
          } else {
            return false;
          }
        } else {
          currentOption.value = $element.val();
          currentOption.index = $element.data('index');

          return currentOption;
        }
      });

      // remove any unchecked input values if using radio buttons or checkboxes
      currentOptions = _.compact(currentOptions);

      return currentOptions;
    },

    /**
     * Find variant based on selected values.
     *
     * @param  {array} selectedValues - Values of variant inputs
     * @return {object || undefined} found - Variant object from product.variants
     */
    _getVariantFromOptions: function() {
      var selectedValues = this._getCurrentOptions();
      var variants = this.product.variants;

      var found = _.find(variants, function(variant) {
        return selectedValues.every(function(values) {
          return _.isEqual(variant[values.index], values.value);
        });
      });

      return found;
    },

    /**
     * Event handler for when a variant input changes.
     */
    _onSelectChange: function() {
      var variant = this._getVariantFromOptions();

      this.$container.trigger({
        type: 'variantChange',
        variant: variant
      });

      if (!variant) {
        return;
      }

      this._updateMasterSelect(variant);
      this._updateImages(variant);
      this._updatePrice(variant);
      this._updateSKU(variant);
      this.currentVariant = variant;

      if (this.enableHistoryState) {
        this._updateHistoryState(variant);
      }
    },

    /**
     * Trigger event when variant image changes
     *
     * @param  {object} variant - Currently selected variant
     * @return {event}  variantImageChange
     */
    _updateImages: function(variant) {
      var variantImage = variant.featured_image || {};
      var currentVariantImage = this.currentVariant.featured_image || {};

      if (!variant.featured_image || variantImage.src === currentVariantImage.src) {
        return;
      }

      this.$container.trigger({
        type: 'variantImageChange',
        variant: variant
      });
    },

    /**
     * Trigger event when variant price changes.
     *
     * @param  {object} variant - Currently selected variant
     * @return {event} variantPriceChange
     */
    _updatePrice: function(variant) {
      if (variant.price === this.currentVariant.price && variant.compare_at_price === this.currentVariant.compare_at_price) {
        return;
      }

      this.$container.trigger({
        type: 'variantPriceChange',
        variant: variant
      });
    },

    /**
     * Trigger event when variant sku changes.
     *
     * @param  {object} variant - Currently selected variant
     * @return {event} variantSKUChange
     */
    _updateSKU: function(variant) {
      if (variant.sku === this.currentVariant.sku) {
        return;
      }

      this.$container.trigger({
        type: 'variantSKUChange',
        variant: variant
      });
    },

    /**
     * Update history state for product deeplinking
     *
     * @param  {variant} variant - Currently selected variant
     * @return {k}         [description]
     */
    _updateHistoryState: function(variant) {
      if (!history.replaceState || !variant) {
        return;
      }

      var newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?variant=' + variant.id;
      window.history.replaceState({path: newurl}, '', newurl);
    },

    /**
     * Update hidden master select of variant change
     *
     * @param  {variant} variant - Currently selected variant
     */
    _updateMasterSelect: function(variant) {
      $(this.originalSelectorId, this.$container).val(variant.id);
    }
  });

  return Variants;
})();


/* ================ GLOBAL ================ */
/*============================================================================
  Drawer modules
==============================================================================*/
theme.Drawers = (function() {
  function Drawer(id, position, options) {
    var defaults = {
      close: '.js-drawer-close',
      open: '.js-drawer-open-' + position,
      openClass: 'js-drawer-open',
      dirOpenClass: 'js-drawer-open-' + position
    };

    this.nodes = {
      $parent: $('html').add('body'),
      $page: $('#PageContainer')
    };

    this.config = $.extend(defaults, options);
    this.position = position;

    this.$drawer = $('#' + id);

    if (!this.$drawer.length) {
      return false;
    }

    this.drawerIsOpen = false;
    this.init();
  }

  Drawer.prototype.init = function() {
    $(this.config.open).on('click', $.proxy(this.open, this));
    this.$drawer.on('click', this.config.close, $.proxy(this.close, this));
  };

  Drawer.prototype.open = function(evt) {
    // Keep track if drawer was opened from a click, or called by another function
    var externalCall = false;

    // Prevent following href if link is clicked
    if (evt) {
      evt.preventDefault();
    } else {
      externalCall = true;
    }

    // Without this, the drawer opens, the click event bubbles up to nodes.$page
    // which closes the drawer.
    if (evt && evt.stopPropagation) {
      evt.stopPropagation();
      // save the source of the click, we'll focus to this on close
      this.$activeSource = $(evt.currentTarget);
    }

    if (this.drawerIsOpen && !externalCall) {
      return this.close();
    }


    // Add is-transitioning class to moved elements on open so drawer can have
    // transition for close animation
    this.$drawer.prepareTransition();

    this.nodes.$parent.addClass(this.config.openClass + ' ' + this.config.dirOpenClass);
    this.drawerIsOpen = true;

    // Set focus on drawer
    slate.a11y.trapFocus({
      $container: this.$drawer,
      namespace: 'drawer_focus'
    });

    // Run function when draw opens if set
    if (this.config.onDrawerOpen && typeof this.config.onDrawerOpen === 'function') {
      if (!externalCall) {
        this.config.onDrawerOpen();
      }
    }

    if (this.$activeSource && this.$activeSource.attr('aria-expanded')) {
      this.$activeSource.attr('aria-expanded', 'true');
    }

    this.bindEvents();

    return this;
  };

  Drawer.prototype.close = function() {
    if (!this.drawerIsOpen) { // don't close a closed drawer
      return;
    }

    // deselect any focused form elements
    $(document.activeElement).trigger('blur');

    // Ensure closing transition is applied to moved elements, like the nav
    this.$drawer.prepareTransition();

    this.nodes.$parent.removeClass(this.config.dirOpenClass + ' ' + this.config.openClass);

    this.drawerIsOpen = false;

    // Remove focus on drawer
    slate.a11y.removeTrapFocus({
      $container: this.$drawer,
      namespace: 'drawer_focus'
    });

    this.unbindEvents();
  };

  Drawer.prototype.bindEvents = function() {
    this.nodes.$parent.on('keyup.drawer', $.proxy(function(evt) {
      // close on 'esc' keypress
      if (evt.keyCode === 27) {
        this.close();
        return false;
      } else {
        return true;
      }
    }, this));

    // Lock scrolling on mobile
    this.nodes.$page.on('touchmove.drawer', function() {
      return false;
    });

    this.nodes.$page.on('click.drawer', $.proxy(function() {
      this.close();
      return false;
    }, this));
  };

  Drawer.prototype.unbindEvents = function() {
    this.nodes.$page.off('.drawer');
    this.nodes.$parent.off('.drawer');
  };

  return Drawer;
})();


/* ================ MODULES ================ */
window.theme = window.theme || {};

theme.Header = (function() {
  var selectors = {
    body: 'body',
    navigation: '#AccessibleNav',
    siteNavHasDropdown: '.site-nav--has-dropdown',
    siteNavChildLinks: '.site-nav__child-link',
    siteNavActiveDropdown: '.site-nav--active-dropdown',
    siteNavLinkMain: '.site-nav__link--main',
    siteNavChildLink: '.site-nav__link--last',
    siteHeader: '.site-header'
  };

  var config = {
    activeClass: 'site-nav--active-dropdown',
    childLinkClass: 'site-nav__child-link'
  };

  var cache = {};

  var windowHeight = $(window).height();
  var windowWidth = $(window).width();

  var socPanelActiveBlocks = {
    home: [2,3],
    about: [2,3,4,5,6,7],
    contact: [2],
    product: [1,2],
    launch: [1,2]
  };

  var panelsWithAnimations = {};

  //blocks with animations
  if (windowWidth < 768) {

    panelsWithAnimations = {
      about: ['about-image-panel', 'about-ingredients-panel','about-packaging-panel', 'about-made-panel'],
      home: ['home-slider-panel'],
      faq: [],
      contact: ['contact-intro-panel', 'contact-feedback-panel'],
      product: ['product-page-art-panel']
    };

  } else {

    panelsWithAnimations = {
      about: ['about-image-panel', 'about-ingredients-panel','about-packaging-panel', 'about-made-panel'],
      home: ['home-collection-panel','home-slider-panel'],
      faq: [],
      contact: ['contact-intro-panel', 'contact-feedback-panel'],
      product: ['product-page-collection-panel', 'product-page-art-panel']
    };

  }
  

  var socPanActivePos = [];

  var headerTop = 36;

  var showShipping = true;

  if(windowWidth < 1025) {
    headerTop = 28;

    if (windowWidth < 769) {
      headerTop = 30;
    }

  }

  function init() {
    cacheSelectors();

    cache.$parents.on('click.siteNav', function(evt) {
      var $el = $(this);

      if (!$el.hasClass(config.activeClass)) {
        // force stop the click from happening
        evt.preventDefault();
        evt.stopImmediatePropagation();
      }

      showDropdown($el);
    });

    // check when we're leaving a dropdown and close the active dropdown
    $(selectors.siteNavChildLink).on('focusout.siteNav', function() {
      setTimeout(function() {
        if ($(document.activeElement).hasClass(config.childLinkClass) || !cache.$activeDropdown.length) {
          return;
        }

        hideDropdown(cache.$activeDropdown);
      });
    });

    // close dropdowns when on top level nav
    cache.$topLevel.on('focus.siteNav', function() {
      if (cache.$activeDropdown.length) {
        hideDropdown(cache.$activeDropdown);
      }
    });

    cache.$subMenuLinks.on('click.siteNav', function(evt) {
      // Prevent click on body from firing instead of link
      evt.stopImmediatePropagation();
    });




    if($('#about-us-page').length != 0) {   //about page init

      console.log('about');

      $( document ).ready(function() {
        setTimeout(function(){
          $('#about-us-page').addClass('animation-start');

          $('#about-navi-item').addClass('active');
          $('#mobile-menu-about-button').addClass('active');
          
          animationForScroll(panelsWithAnimations.about);

        }, 500);
      });

      //first check
      socPanActivePos = socialPanelShowSetPos(socPanelActiveBlocks.about);
      
      
      //scroll check
      $(window).scroll( function() {

        animationForScroll(panelsWithAnimations.about);

      });

      
      
    } else if($('#general-faq-page').length != 0) {   //general-faq

      console.log('faq');


      $('.shipping-container').addClass("hidden-shipping");

      $(selectors.siteHeader).css({ top: '0px' });

      showShipping = false;

      //tabs change
      if(!window.location.hash) {
        window.location.hash = '#faq';
      }

      faqHashChanges();
      window.addEventListener("hashchange", faqHashChanges, false);

      if(windowWidth < 1025) {
        $("#faq-tab-select").click(function(){

          toggleFaqSelectList();

          return false;

        });
      }

      //view more/less buttons
      $("#privacy-view-more").click(function() {
        $('#privacy-add-info').addClass('active');
        $("#privacy-view-more").addClass('hidden');
        $("#privacy-view-less").removeClass('hidden');
      });

      $("#privacy-view-less").click(function() {
        $('#privacy-add-info').removeClass('active');
        $("#privacy-view-more").removeClass('hidden');
        $("#privacy-view-less").addClass('hidden');
      });
      
      
      
    } else if($('#contact-us-page').length != 0) {   //contact-us

      console.log('contact');


      $( document ).ready(function() {
        setTimeout(function(){


          $('#contact-navi-item').addClass('active');
          $('#mobile-menu-contact-button').addClass('active');

        }, 500);
      });
      
      
    } else if($('#launch-page-panel').length != 0) {   //launch page

      socPanActivePos = socialPanelShowSetPos(socPanelActiveBlocks.launch);

      $( document ).ready(function() {
        setTimeout(function(){

          $('#launch-navi-item').addClass('active');
          $('#mobile-menu-launch-button').addClass('active');

        }, 500);
      });


    } else if($('#product-page-panel').length != 0) {   //product page

      console.log('product');


      $( document ).ready(function() {
        setTimeout(function(){

          $('#qty-minus').on('click', function() {
            productQtyChange('minus');
          });

          $('#qty-plus').on('click', function() {
            productQtyChange('plus');
          });

          $('#detail-add-info-less').on('click', function() {
            productAddInfoToggle();
          });

          $('#detail-add-info-more').on('click', function() {
            productAddInfoToggle();
          });

          $('#info-tab-ingredients').on('click', function() {
            $('html, body').animate({
              scrollTop: $("#product-page-ingredients-panel").offset().top
            }, 1000);
          });

          $('#info-tab-how-to-use').on('click', function() {
            $('html, body').animate({
              scrollTop: $("#product-page-use-panel").offset().top
            }, 1500);
          });

          // $('.spr-summary-actions-newreview').on('click', function() {
          //   reviewsFormPositioning();
          // });

          animationForScroll(panelsWithAnimations.product);

          if(windowWidth > 1024) {
            productIngredientsMouseMoveAnimationInit();
          } else {
            $('.ingredients-pin-icon').on('click', function() {
              productSetIngredientsDetails($(this).data().id);
            })
          }


          var target = document.getElementById('shopify-product-reviews');

          var observerRev = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {

              var element = $('.spr-content .spr-form');

              if(element[0]) {

                observerRev.disconnect();

                element.detach();

                $('#product-page-modal-panel-review .review-container').append(element);

                $('.spr-summary-actions-newreview').on('click', productReviewPanelToggle);

                $('#product-page-review-overlay').on('click', productReviewPanelToggle);

                $('#product-page-review-modal-close-button').on('click', productReviewPanelToggle);


                $('.spr-form-actions input').on('click', function() {

                  setTimeout(function(){

                    if($('.spr-form .spr-form-message-success')[0]){
                      
                      $('.spr-form .spr-form-title').addClass('hidden');

                      $('.spr-form .spr-form-message-success').addClass('active');
                      
                    }

                  }, 1500);

                });

              }

            });
          });

          // конфигурация нашего observer:
          var config = { attributes: true, childList: true, characterData: true };

          // передаём в качестве аргументов целевой элемент и его конфигурацию
          observerRev.observe(target, config);

          
          //init next et prev

          $('#reel-prev-button').click(function(){
            $('#my-picture').trigger('stepLeft');
          });

          $('#reel-next-button').click(function(){
            $('#my-picture').trigger('stepRight');
          });

      }, 500);


        $('#MainContent').addClass('bright-background');

          // $('#product-page-modal-close-button').on('click', productReviewPanelToggle);

      });

      socPanActivePos = socialPanelShowSetPos(socPanelActiveBlocks.product);
      
      $('#ingredients-full-list-button').on('click', productModalPanelToggle);

      $('#product-page-modal-overlay').on('click', productModalPanelToggle);

      $('#product-page-modal-close-button').on('click', productModalPanelToggle);

      howToUseInit();


      //scroll check
      $(window).scroll( function() {

        animationForScroll(panelsWithAnimations.product);

        // reviewsFormPositioning();
      });



    } else if($('#login-page-panel').length != 0)  {      //login page

      console.log('login');


      $( document ).ready(function() {
        setTimeout(function(){

          $('#register-continue-button').on('click',function() {
            $('#register-hidden-block').addClass('active');
            $('#register-continue-button').addClass('hidden');
          })
          
        }, 500);
      });
      
    } else if($('#account-page-main-block').length != 0)  {           //account page

      $('.shipping-container').addClass("hidden-shipping");

      $(selectors.siteHeader).css({ top: '0px' });

      showShipping = false;

      if(windowWidth > 1024) {
        $('#info-show-button').on('click', function(){
          toggleAccountPanels('info');
        });

        $('#orders-show-button').on('click', function(){
          toggleAccountPanels('orders');
        });
      } else {
        $('#account-info-list-item').on('click', function(){
          toggleAccountPanels('info');
        });

        $('#account-orders-list-item').on('click', function(){
          toggleAccountPanels('orders');
        });

        $("#account-tab-select").click(function(){

          toggleAccountSelectList();

          return false;

        });

      }
      
    } else if($('#order-info-page-panel').length != 0)  {           //order page

      
      $('.shipping-container').addClass("hidden-shipping");

      $(selectors.siteHeader).css({ top: '0px' });

      showShipping = false;


    } else if($('#collections-list-page').length != 0) {

      if ($(window).width() > 1024) {
        $( document ).ready(function() {

          var slidesToShow = 4;
          var arrows = true;

          if ($(window).width() < 1025) {
            slidesToShow = 2;
            arrows = false;

          }


          $('#collection-list-container').slick({
            dots: false,
            infinite: false,
            arrows: arrows,
            slidesToShow: slidesToShow,
            centerMode: true,
            centerPadding: '20px',
            lazyLoad: 'ondemand',
            nextArrow: '<div class="slider-arrow right-arrow"><img></div>',
            prevArrow: '<div class="slider-arrow left-arrow"><img></div>'
          });

          setTimeout(function(){



          }, 500);
        });
      }



    } else if($('#home-intro-block').length != 0)  {           //home page

      console.log('home');

      $( document ).ready(function() {
        setTimeout(function(){
          $('#home-intro-block').addClass('animation-start');

          $('#shop-navi-item').addClass('active');
          $('#mobile-menu-shop-button').addClass('active');
          
          socPanActivePos = socialPanelShowSetPos(socPanelActiveBlocks.home);

          animationForScroll(panelsWithAnimations.home);

        }, 500);
      });


      
      headerStyleChange($(selectors.body).scrollTop(), windowHeight);

      $(window).scroll( function() {
        headerStyleChange($(selectors.body).scrollTop(), windowHeight);
        animationForScroll(panelsWithAnimations.home);
      });

    }



    if(showShipping) {
      headerPositionChange($(selectors.body).scrollTop());
    }

    
    socialPanelShowCheck($(selectors.body).scrollTop(), socPanActivePos);

    $(window).scroll( function() {

      if(showShipping) {
        headerPositionChange($(selectors.body).scrollTop());
      }

      socialPanelShowCheck($(selectors.body).scrollTop(), socPanActivePos);
    });


    //my bag button
    $("#my-bag-menu-button").click(function () {
      $('#my-bag-container').addClass('active-modal');
    });

    $('.hide-layer').click(function () {
      $('#my-bag-container').removeClass('active-modal');
    });

    $('#bag-close-button').click(function () {
      $('#my-bag-container').removeClass('active-modal');
    });

    //


    if(windowWidth > 1024) {
      headerEventsInit();
    } else {
      $('#mobile-menu-shop-button').on('click', function() {
        $('#mobile-menu-shop-sub-menu').toggleClass('active-sub-list');
      })
    }

  }

  //product page functions
  function productQtyChange(inc) {

    var cur_val = parseInt($('#Quantity').val());

    if(inc == 'plus') {
      $('#Quantity').val(cur_val + 1);
    } else {
      if(cur_val > 1) {
        $('#Quantity').val(cur_val - 1);
      }
    }

  }

  function productAddInfoToggle() {
    $('#detail-add-info-less').toggleClass('active');
    $('#detail-add-info-more').toggleClass('active');
    $('#detail-add-info-block').toggleClass('active');

    $('#product-page-ingredients-panel').toggleClass('down-step');
  }

  function productModalPanelToggle() {
    $('#product-page-modal-panel').toggleClass('active');
  }

  function productReviewPanelToggle() {
    $('#product-page-modal-panel-review').toggleClass('active');
  }

  function howToUseInit() {
    $('#first-step-tab').on('click', function() {
      howToUseTabSwitch('first')
    });
    $('#second-step-tab').on('click', function(){
      howToUseTabSwitch('second')
    });
    $('#third-step-tab').on('click', function(){
      howToUseTabSwitch('third')
    });
  }

  function howToUseTabSwitch(tab) {

    $('#product-page-use-tabs').children().removeClass('active');
    $('#product-page-use-descriptions').children().removeClass('active');

    $('#' + tab + '-step-tab').addClass('active');
    $('#' + tab + '-step-description').addClass('active');

  }

  function reviewsFormPositioning() {

    var topOffset = $(window).scrollTop();
    

    var leftElemOffset = $('.spr-form').offset().left;
    var topElemOffset = $('.spr-form').offset().top;

    if(leftElemOffset != 0) {
      $('.spr-form').css("left", 24 - leftElemOffset);
    }

    $('.spr-form').css("top", parseInt($('.spr-form').css("top"),10) + 80 + topOffset - topElemOffset);

  }

  function productIngredientsMouseMoveAnimationInit() {

    var imageFirstElem = $('#product-ingredients-first-illustration');
    var imageSecondElem = $('#product-ingredients-second-illustration');
    var imageThirdElem = $('#product-ingredients-third-illustration');

    var firstElemCenterY = (imageFirstElem.position().top) + (imageFirstElem.height()/2);
    var firstElemCenterX = (imageFirstElem.position().left + 30 + $('#product-image-container').position().left) + (imageFirstElem.width()/2);

    var secondElemCenterY = (imageSecondElem.position().top) - 20 + (imageSecondElem.height()/2);
    var secondElemCenterX = (imageSecondElem.position().left + 30 + $('#product-image-container').position().left) + (imageSecondElem.width()/2);

    var thirdElemCenterY = (imageThirdElem.position().top) - 40 + (imageThirdElem.height()/2);
    var thirdElemCenterX = (imageThirdElem.position().left + 50 + $('#product-image-container').position().left) + (imageThirdElem.width()/2);

    // $('#test-pointer').css({top: thirdElemCenterY, left: thirdElemCenterX});

    var ContainerTopOffset = $('#product-ingredients-container').offset().top;

    var addTopOffset1 = 0;
    var addLeftOffset1 = 0;

    var addTopOffset2 = 0;
    var addLeftOffset2 = 0;

    var addTopOffset3 = 0;
    var addLeftOffset3 = 0;

    var radius = 50;
    var ratio = 15;

    $('#product-ingredients-container').mousemove( function(event) {

      var distX1 = event.clientX - firstElemCenterX;
      var distY1 = (event.pageY - ContainerTopOffset) - firstElemCenterY;

      var absdistX1 = Math.abs(distX1);
      var absdistY1 = Math.abs(distY1);

      var rad = Math.sqrt(distX1 * distX1 + distY1 * distY1);

      var scale1 = 1.0;

      if(rad < radius * 2) {
        if(absdistX1 < radius) {
          addLeftOffset1 = distX1/ratio;
        } else {
          addLeftOffset1 = (absdistX1/distX1)*((radius*2) - absdistX1) / ratio;
        }

        if(absdistY1 < radius) {
          addTopOffset1 = distY1/ratio;
        } else {
          addTopOffset1 = (absdistY1/distY1)*((radius*2) - absdistY1) / ratio;
        }

        scale1 = 1.15;

      } else {
        addLeftOffset1 = 0;
        addTopOffset1 = 0;
      }

      imageFirstElem.css({ 'margin-top': addTopOffset1 + 'px', 'margin-left': addLeftOffset1 + 'px', transform: 'translate3d(-50%, -50%, 0) rotate(-70deg) scale(' + scale1 + ')'  });



      var distX2 = event.clientX - secondElemCenterX;
      var distY2 = (event.pageY - ContainerTopOffset) - secondElemCenterY;

      var absdistX2 = Math.abs(distX2);
      var absdistY2 = Math.abs(distY2);

      rad = Math.sqrt(distX2 * distX2 + distY2 * distY2);

      var scale2 = 1.0;

      if(rad < radius * 2) {
        if(absdistX2 < radius) {
          addLeftOffset2 = distX2/ratio;
        } else {
          addLeftOffset2 = (absdistX2/distX2)*((radius*2) - absdistX2) / ratio;
        }

        if(absdistY2 < radius) {
          addTopOffset2 = distY2/ratio;
        } else {
          addTopOffset2 = (absdistY2/distY2)*((radius*2) - absdistY2) / ratio;
        }

        scale2 = 1.15;

      } else {
        addLeftOffset2 = 0;
        addTopOffset2 = 0;
      }

      imageSecondElem.css({ 'margin-top': addTopOffset2 + 'px', 'margin-left': addLeftOffset2 + 'px', transform: 'translate3d(-50%, -50%, 0) rotate(-40deg) scale(' + scale2 + ')'  });


      var distX3 = event.clientX - thirdElemCenterX;
      var distY3 = (event.pageY - ContainerTopOffset) - thirdElemCenterY;

      var absdistX3 = Math.abs(distX3);
      var absdistY3 = Math.abs(distY3);

      rad = Math.sqrt(distX3 * distX3 + distY3 * distY3);

      var scale3 = 1.0;

      if(rad < radius * 2) {
        if(absdistX3 < radius) {
          addLeftOffset3 = distX3/ratio;
        } else {
          addLeftOffset3 = (absdistX3/distX3)*((radius*2) - absdistX3) / ratio;
        }

        if(absdistY3 < radius) {
          addTopOffset3 = distY3/ratio;
        } else {
          addTopOffset3 = (absdistY3/distY3)*((radius*2) - absdistY3) / ratio;
        }

        scale3 = 1.15;

      } else {
        addLeftOffset3 = 0;
        addTopOffset3 = 0;
      }

      imageThirdElem.css({ 'margin-top': addTopOffset3 + 'px', 'margin-left': addLeftOffset3 + 'px', transform: 'translate3d(-50%, -50%, 0) rotate(50deg) scale(' + scale3 + ')'  });

    });

  }

  function productSetIngredientsDetails(id) {

    $('#product-ingredients-mobile-title').text($('#' + id + '-pin-title').text());
    $('#product-ingredients-mobile-details').text($('#' + id + '-pin-details').text());
    
  }

  //

  //account page

  function toggleAccountPanels(id) {

    $('.account-page-tab-selector').removeClass('active');
    $('#' + id + '-show-button').addClass('active');

    $('.account-page-tab-container').removeClass('active');
    $('#' + id + '-tab-block').addClass('active');

    $('#account-tab-selected-panel').html($('#account-' + id + '-list-item').html());

  }

  function toggleAccountSelectList() {


    $('#account-tab-select-list').toggleClass('active-list');


    if( $("#account-tab-select-list").hasClass( "active-list" ) ) {

      $('body').on('click', '#account-page-main-block', toggleAccountSelectList);

    } else {

      $('body').off('click', '#account-page-main-block');

    }

  }

  //

  function faqHashChanges() {

    $('.info-menu .menu-item').removeClass('active');

    $(window.location.hash + '-menu-item').addClass('active');
    
    if(window.location.hash) {
      $('#faq-tab-selected-panel').html($(window.location.hash + '-mobile-menu-list-item > a').html());
    }
    
    $('.faq-main-container .info-container').removeClass('active');

    $(window.location.hash + '-info-panel').addClass('active');

  }

  function isScrolledIntoView(elem) {
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elemTop = parseInt($(elem).offset().top);
    var elemBottom = parseInt(elemTop + $(elem).height());

    var elemHeight = elemBottom - elemTop;
    
    var checkValue = (elemBottom + elemTop) / 2;

    var topCheck = checkValue - elemHeight * 0.2;
    var bottomCheck = checkValue + elemHeight * 0.2;

    return ( (topCheck <= docViewBottom) && (topCheck >= docViewTop) ) || ((bottomCheck <= docViewBottom) && (bottomCheck >= docViewTop));
  }

  function animationForScroll(panels) {
    panels.forEach(function(panel) {
      if(isScrolledIntoView('#' + panel)) {
        $('#' + panel).addClass('active-animation');
      } else {
        $('#' + panel).removeClass('active-animation');
      }
    });
  }
  
  function headerPositionChange(scrollTop) {
    if(scrollTop < headerTop) {
      var top = headerTop - scrollTop;
      $(selectors.siteHeader).css({ top: top + 'px' });
    } else {
      $(selectors.siteHeader).css({ top: '0px' });
    }
  }

  function headerStyleChange(scrollTop, windowHeight) {
    if(scrollTop > windowHeight*0.87) {
      $(selectors.siteHeader).addClass( "bright" );
      $('.gradient-back-block').css( "background","rgba(255,255,255,0.65)" );
    } else {

      var opacityIn = scrollTop/(windowHeight*0.87) * 0.65;

      $(selectors.siteHeader).removeClass( "bright" );
      $('.gradient-back-block').css( "background","rgba(255,255,255," + opacityIn + ")" );
    }
  }

  function headerEventsInit() {
    $('#shop-navi-item').mouseover(function () {
      $("#shop-additional-menu").addClass('active');
      $(selectors.siteHeader).addClass("bright-hover");
    });

    $("#shop-navi-item").mouseleave(function () {
      $("#shop-additional-menu").removeClass("active");
      $(selectors.siteHeader).removeClass("bright-hover");
    });

    $('#shop-additional-menu').mouseover(function () {
      $("#shop-additional-menu").addClass('active');
      $(selectors.siteHeader).addClass("bright-hover");
    });

    $("#shop-additional-menu").mouseleave(function () {
      $("#shop-additional-menu").removeClass("active");
      $(selectors.siteHeader).removeClass("bright-hover");
    });

    $('#header-menu-account-button').on('click', function() {
      $('#account-menu-dropdown-list').toggleClass('active');
    });

  }

  function socialPanelShowSetPos(activeBlocks) {

    var activePositions = [];

    activeBlocks.forEach(function(item) {

      var start = windowHeight * (item - 1) - windowHeight/2;
      var end = windowHeight * item - windowHeight/2;

      activePositions.push(
          {
            start: start,
            end: end
          }
      );

    });

    return activePositions;

  }

  function socialPanelShowCheck(scrollTop, activePos) {

    var show = false;

    activePos.forEach(function(item){
      if(scrollTop > item.start && scrollTop < item.end) {
        show = true;
      }
    });

    if(show) {
      $('#social-panel-header').addClass('active-panel');
    } else {
      $('#social-panel-header').removeClass('active-panel');
    }

  }

  function toggleFaqSelectList() {


    $('#faq-tab-select-list').toggleClass('active-list');


    if( $("#faq-tab-select-list").hasClass( "active-list" ) ) {

      $('body').on('click', '#general-faq-page', toggleFaqSelectList);

    } else {

      $('body').off('click', '#general-faq-page');

    }

  }

  function cacheSelectors() {
    cache = {
      $nav: $(selectors.navigation),
      $topLevel: $(selectors.siteNavLinkMain),
      $parents: $(selectors.navigation).find(selectors.siteNavHasDropdown),
      $subMenuLinks: $(selectors.siteNavChildLinks),
      $activeDropdown: $(selectors.siteNavActiveDropdown)
    };
  }

  function showDropdown($el) {
    $el.addClass(config.activeClass);

    // close open dropdowns
    if (cache.$activeDropdown.length) {
      hideDropdown(cache.$activeDropdown);
    }

    cache.$activeDropdown = $el;

    // set expanded on open dropdown
    $el.find(selectors.siteNavLinkMain).attr('aria-expanded', 'true');

    setTimeout(function() {
      $(window).on('keyup.siteNav', function(evt) {
        if (evt.keyCode === 27) {
          hideDropdown($el);
        }
      });

      $(selectors.body).on('click.siteNav', function() {
        hideDropdown($el);
      });
    }, 250);
  }

  function hideDropdown($el) {
    // remove aria on open dropdown
    $el.find(selectors.siteNavLinkMain).attr('aria-expanded', 'false');
    $el.removeClass(config.activeClass);

    // reset active dropdown
    cache.$activeDropdown = $(selectors.siteNavActiveDropdown);

    $(selectors.body).off('click.siteNav');
    $(window).off('keyup.siteNav');
  }

  function unload() {
    $(window).off('.siteNav');
    cache.$parents.off('.siteNav');
    cache.$subMenuLinks.off('.siteNav');
    cache.$topLevel.off('.siteNav');
    $(selectors.siteNavChildLink).off('.siteNav');
    $(selectors.body).off('.siteNav');
  }

  return {
    init: init,
    unload: unload
  };
})();

window.theme = window.theme || {};

theme.MobileNav = (function() {
  var classes = {
    mobileNavOpenIcon: 'mobile-nav--open',
    mobileNavCloseIcon: 'mobile-nav--close',
    subNavLink: 'mobile-nav__sublist-link',
    return: 'mobile-nav__return-btn',
    subNavActive: 'is-active',
    subNavClosing: 'is-closing',
    navOpen: 'js-menu--is-open',
    subNavShowing: 'sub-nav--is-open',
    thirdNavShowing: 'third-nav--is-open',
    subNavToggleBtn: 'js-toggle-submenu'
  };
  var cache = {};
  var isTransitioning;
  var $activeSubNav;
  var $activeTrigger;
  var menuLevel = 1;
  // Breakpoints from src/stylesheets/global/variables.scss.liquid
  var mediaQuerySmall = 'screen and (max-width: 749px)';

  function init() {
    cacheSelectors();

    cache.$mobileNavToggle.on('click', toggleMobileNav);
    cache.$subNavToggleBtn.on('click.subNav', toggleSubNav);

    // Close mobile nav when unmatching mobile breakpoint
    enquire.register(mediaQuerySmall, {
      unmatch: function() {
        closeMobileNav();
      }
    });
  }

  function toggleMobileNav() {
    if (cache.$mobileNavToggle.hasClass(classes.mobileNavCloseIcon)) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  }

  function cacheSelectors() {
    cache = {
      $pageContainer: $('#PageContainer'),
      $siteHeader: $('.site-header'),
      $mobileNavToggle: $('.js-mobile-nav-toggle'),
      $mobileNavContainer: $('.mobile-nav-wrapper'),
      $mobileNav: $('#MobileNav'),
      $subNavToggleBtn: $('.' + classes.subNavToggleBtn)
    };
  }

  function openMobileNav() {
    var translateHeaderHeight = cache.$siteHeader.outerHeight() + cache.$siteHeader.offset().top;

    cache.$mobileNavContainer
      .prepareTransition()
      .addClass(classes.navOpen);

    cache.$mobileNavContainer.css({
      transform: 'translate3d(0, ' + translateHeaderHeight + 'px, 0)'
    });
    cache.$pageContainer.css({
      transform: 'translate3d(0, ' + cache.$mobileNavContainer[0].scrollHeight + 'px, 0)'
    });

    slate.a11y.trapFocus({
      $container: cache.$mobileNav,
      namespace: 'navFocus'
    });

    cache.$mobileNavToggle
      .addClass(classes.mobileNavCloseIcon)
      .removeClass(classes.mobileNavOpenIcon);

    // close on escape
    $(window).on('keyup.mobileNav', function(evt) {
      if (evt.which === 27) {
        closeMobileNav();
      }
    });
  }

  function closeMobileNav() {
    cache.$mobileNavContainer.prepareTransition().removeClass(classes.navOpen);

    cache.$mobileNavContainer.css({
      transform: 'translate3d(0, -100%, 0)'
    });
    cache.$pageContainer.removeAttr('style');

    cache.$mobileNavContainer.one('TransitionEnd.navToggle webkitTransitionEnd.navToggle transitionend.navToggle oTransitionEnd.navToggle', function() {
      slate.a11y.removeTrapFocus({
        $container: cache.$mobileNav,
        namespace: 'navFocus'
      });
    });

    cache.$mobileNavToggle
      .addClass(classes.mobileNavOpenIcon)
      .removeClass(classes.mobileNavCloseIcon);

    $(window).off('keyup.mobileNav');
  }

  function toggleSubNav(evt) {
    if (isTransitioning) {
      return;
    }

    var $toggleBtn = $(evt.currentTarget);
    var isReturn = $toggleBtn.hasClass(classes.return);
    isTransitioning = true;

    if (isReturn) {
      // Close all subnavs by removing active class on buttons
      $('.' + classes.subNavToggleBtn + '[data-level="' + (menuLevel - 1) + '"]')
        .removeClass(classes.subNavActive);

      if ($activeTrigger && $activeTrigger.length) {
        $activeTrigger.removeClass(classes.subNavActive);
      }
    } else {
      $toggleBtn.addClass(classes.subNavActive);
    }

    $activeTrigger = $toggleBtn;

    goToSubnav($toggleBtn.data('target'));
  }

  function goToSubnav(target) {

    /*eslint-disable shopify/jquery-dollar-sign-reference */

    var $targetMenu = target
      ? $('.mobile-nav__dropdown[data-parent="' + target + '"]')
      : cache.$mobileNav;

    menuLevel = $targetMenu.data('level') ? $targetMenu.data('level') : 1;

    if ($activeSubNav && $activeSubNav.length) {
      $activeSubNav
        .prepareTransition()
        .addClass(classes.subNavClosing);
    }

    $activeSubNav = $targetMenu;

    var $elementToFocus = target
      ? $targetMenu.find('.' + classes.subNavLink + ':first')
      : $activeTrigger;

    /*eslint-enable shopify/jquery-dollar-sign-reference */

    var translateMenuHeight = $targetMenu[0].scrollHeight;
    if (!target) {
      translateMenuHeight = $targetMenu.outerHeight();
    }

    var openNavClass = menuLevel > 2
      ? classes.thirdNavShowing
      : classes.subNavShowing;

    cache.$mobileNavContainer
      .css('height', translateMenuHeight)
      .removeClass(classes.thirdNavShowing)
      .addClass(openNavClass);

    if (!target) {
      // Show top level nav
      cache.$mobileNavContainer
        .removeClass(classes.thirdNavShowing)
        .removeClass(classes.subNavShowing);
    }

    // Focusing an item in the subnav early forces element into view and breaks the animation.
    cache.$mobileNavContainer.one('TransitionEnd.subnavToggle webkitTransitionEnd.subnavToggle transitionend.subnavToggle oTransitionEnd.subnavToggle', function() {
      slate.a11y.trapFocus({
        $container: $targetMenu,
        $elementToFocus: $elementToFocus,
        namespace: 'subNavFocus'
      });

      cache.$mobileNavContainer.off('.subnavToggle');
      isTransitioning = false;
    });

    // Match height of subnav
    cache.$pageContainer.css({
      transform: 'translate3d(0, ' + translateMenuHeight + 'px, 0)'
    });

    $activeSubNav.removeClass(classes.subNavClosing);
  }

  return {
    init: init,
    closeMobileNav: closeMobileNav
  };
})(jQuery);

window.theme = window.theme || {};

theme.Search = (function() {
  var selectors = {
    search: '.search',
    searchSubmit: '.search__submit',
    searchInput: '.search__input',

    siteHeader: '.site-header',
    siteHeaderSearchToggle: '.site-header__search-toggle',
    siteHeaderSearch: '.site-header__search',

    searchDrawer: '.search-bar',
    searchDrawerInput: '.search-bar__input',

    searchHeader: '.search-header',
    searchHeaderInput: '.search-header__input',
    searchHeaderSubmit: '.search-header__submit',

    mobileNavWrapper: '.mobile-nav-wrapper'
  };

  var classes = {
    focus: 'search--focus',
    mobileNavIsOpen: 'js-menu--is-open'
  };

  function init() {
    if (!$(selectors.siteHeader).length) {
      return;
    }

    initDrawer();
    searchSubmit();

    $(selectors.searchHeaderInput).add(selectors.searchHeaderSubmit).on('focus blur', function() {
      $(selectors.searchHeader).toggleClass(classes.focus);
    });

    $(selectors.siteHeaderSearchToggle).on('click', function() {
      var searchHeight = $(selectors.siteHeader).outerHeight();
      var searchOffset = $(selectors.siteHeader).offset().top - searchHeight;

      $(selectors.searchDrawer).css({
        height: searchHeight + 'px',
        top: searchOffset + 'px'
      });
    });
  }

  function initDrawer() {
    // Add required classes to HTML
    $('#PageContainer').addClass('drawer-page-content');
    $('.js-drawer-open-top').attr('aria-controls', 'SearchDrawer').attr('aria-expanded', 'false');

    theme.SearchDrawer = new theme.Drawers('SearchDrawer', 'top', {
      onDrawerOpen: searchDrawerFocus
    });
  }

  function searchDrawerFocus() {
    searchFocus($(selectors.searchDrawerInput));

    if ($(selectors.mobileNavWrapper).hasClass(classes.mobileNavIsOpen)) {
      theme.MobileNav.closeMobileNav();
    }
  }

  function searchFocus($el) {
    $el.focus();
    // set selection range hack for iOS
    $el[0].setSelectionRange(0, $el[0].value.length);
  }

  function searchSubmit() {
    $(selectors.searchSubmit).on('click', function(evt) {
      var $el = $(evt.target);
      var $input = $el.parents(selectors.search).find(selectors.searchInput);
      if ($input.val().length === 0) {
        evt.preventDefault();
        searchFocus($input);
      }
    });
  }

  return {
    init: init
  };
})();

(function() {
  var selectors = {
    backButton: '.return-link'
  };

  var $backButton = $(selectors.backButton);

  if (!document.referrer || !$backButton.length || !window.history.length) {
    return;
  }

  $backButton.one('click', function(evt) {
    evt.preventDefault();

    var referrerDomain = urlDomain(document.referrer);
    var shopDomain = urlDomain(window.location.href);

    if (shopDomain === referrerDomain) {
      history.back();
    }

    return false;
  });

  function urlDomain(url) {
    var anchor = document.createElement('a');
    anchor.ref = url;

    return anchor.hostname;
  }
})();

theme.Slideshow = (function() {
  this.$slideshow = null;
  var classes = {
    wrapper: 'slideshow-wrapper',
    slideshow: 'slideshow',
    currentSlide: 'slick-current',
    video: 'slideshow__video',
    videoBackground: 'slideshow__video--background',
    closeVideoBtn: 'slideshow__video-control--close',
    pauseButton: 'slideshow__pause',
    isPaused: 'is-paused'
  };

  function slideshow(el) {
    this.$slideshow = $(el);
    this.$wrapper = this.$slideshow.closest('.' + classes.wrapper);
    this.$pause = this.$wrapper.find('.' + classes.pauseButton);

    this.settings = {
      accessibility: true,
      arrows: false,
      dots: true,
      fade: true,
      draggable: true,
      touchThreshold: 20,
      autoplay: this.$slideshow.data('autoplay'),
      autoplaySpeed: this.$slideshow.data('speed')
    };

    this.$slideshow.on('beforeChange', beforeChange.bind(this));
    this.$slideshow.on('init', slideshowA11y.bind(this));
    this.$slideshow.slick(this.settings);

    this.$pause.on('click', this.togglePause.bind(this));
  }

  function slideshowA11y(event, obj) {
    var $slider = obj.$slider;
    var $list = obj.$list;
    var $wrapper = this.$wrapper;
    var autoplay = this.settings.autoplay;

    // Remove default Slick aria-live attr until slider is focused
    $list.removeAttr('aria-live');

    // When an element in the slider is focused
    // pause slideshow and set aria-live.
    $wrapper.on('focusin', function(evt) {
      if (!$wrapper.has(evt.target).length) {
        return;
      }

      $list.attr('aria-live', 'polite');

      if (autoplay) {
        $slider.slick('slickPause');
      }
    });

    // Resume autoplay
    $wrapper.on('focusout', function(evt) {
      if (!$wrapper.has(evt.target).length) {
        return;
      }

      $list.removeAttr('aria-live');

      if (autoplay) {
        // Manual check if the focused element was the video close button
        // to ensure autoplay does not resume when focus goes inside YouTube iframe
        if ($(evt.target).hasClass(classes.closeVideoBtn)) {
          return;
        }

        $slider.slick('slickPlay');
      }
    });

    // Add arrow key support when focused
    if (obj.$dots) {
      obj.$dots.on('keydown', function(evt) {
        if (evt.which === 37) {
          $slider.slick('slickPrev');
        }

        if (evt.which === 39) {
          $slider.slick('slickNext');
        }

        // Update focus on newly selected tab
        if ((evt.which === 37) || (evt.which === 39)) {
          obj.$dots.find('.slick-active button').focus();
        }
      });
    }
  }

  function beforeChange(event, slick, currentSlide, nextSlide) {
    var $slider = slick.$slider;
    var $currentSlide = $slider.find('.' + classes.currentSlide);
    var $nextSlide = $slider.find('.slideshow__slide[data-slick-index="' + nextSlide + '"]');

    if (isVideoInSlide($currentSlide)) {
      var $currentVideo = $currentSlide.find('.' + classes.video);
      var currentVideoId = $currentVideo.attr('id');
      theme.SlideshowVideo.pauseVideo(currentVideoId);
      $currentVideo.attr('tabindex', '-1');
    }

    if (isVideoInSlide($nextSlide)) {
      var $video = $nextSlide.find('.' + classes.video);
      var videoId = $video.attr('id');
      var isBackground = $video.hasClass(classes.videoBackground);
      if (isBackground) {
        theme.SlideshowVideo.playVideo(videoId);
      } else {
        $video.attr('tabindex', '0');
      }
    }
  }

  function isVideoInSlide($slide) {
    return $slide.find('.' + classes.video).length;
  }

  slideshow.prototype.togglePause = function() {
    var slideshowSelector = getSlideshowId(this.$pause);
    if (this.$pause.hasClass(classes.isPaused)) {
      this.$pause.removeClass(classes.isPaused);
      $(slideshowSelector).slick('slickPlay');
    } else {
      this.$pause.addClass(classes.isPaused);
      $(slideshowSelector).slick('slickPause');
    }
  };

  function getSlideshowId($el) {
    return '#Slideshow-' + $el.data('id');
  }

  return slideshow;
})();

// Youtube API callback
// eslint-disable-next-line no-unused-vars
function onYouTubeIframeAPIReady() {
  theme.SlideshowVideo.loadVideos();
}

theme.SlideshowVideo = (function() {
  var autoplayCheckComplete = false;
  var autoplayAvailable = false;
  var playOnClickChecked = false;
  var playOnClick = false;
  var youtubeLoaded = false;
  var videos = {};
  var videoPlayers = [];
  var videoOptions = {
    ratio: 16 / 9,
    playerVars: {
      // eslint-disable-next-line camelcase
      iv_load_policy: 3,
      modestbranding: 1,
      autoplay: 0,
      controls: 0,
      showinfo: 0,
      wmode: 'opaque',
      branding: 0,
      autohide: 0,
      rel: 0
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerChange
    }
  };
  var classes = {
    playing: 'video-is-playing',
    paused: 'video-is-paused',
    loading: 'video-is-loading',
    loaded: 'video-is-loaded',
    slideshowWrapper: 'slideshow-wrapper',
    slide: 'slideshow__slide',
    slideBackgroundVideo: 'slideshow__slide--background-video',
    slideDots: 'slick-dots',
    videoChrome: 'slideshow__video--chrome',
    videoBackground: 'slideshow__video--background',
    playVideoBtn: 'slideshow__video-control--play',
    closeVideoBtn: 'slideshow__video-control--close',
    currentSlide: 'slick-current',
    slickClone: 'slick-cloned',
    supportsAutoplay: 'autoplay',
    supportsNoAutoplay: 'no-autoplay'
  };

  /**
    * Public functions
   */
  function init($video) {
    if (!$video.length) {
      return;
    }

    videos[$video.attr('id')] = {
      id: $video.attr('id'),
      videoId: $video.data('id'),
      type: $video.data('type'),
      status: $video.data('type') === 'chrome' ? 'closed' : 'background', // closed, open, background
      videoSelector: $video.attr('id'),
      $parentSlide: $video.closest('.' + classes.slide),
      $parentSlideshowWrapper: $video.closest('.' + classes.slideshowWrapper),
      controls: $video.data('type') === 'background' ? 0 : 1,
      slideshow: $video.data('slideshow')
    };

    if (!youtubeLoaded) {
      // This code loads the IFrame Player API code asynchronously.
      var tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }

  function customPlayVideo(playerId) {
    // Do not autoplay just because the slideshow asked you to.
    // If the slideshow asks to play a video, make sure
    // we have done the playOnClick check first
    if (!playOnClickChecked && !playOnClick) {
      return;
    }

    if (playerId && typeof videoPlayers[playerId].playVideo === 'function') {
      privatePlayVideo(playerId);
    }
  }

  function pauseVideo(playerId) {
    if (videoPlayers[playerId] && typeof videoPlayers[playerId].pauseVideo === 'function') {
      videoPlayers[playerId].pauseVideo();
    }
  }

  function loadVideos() {
    for (var key in videos) {
      if (videos.hasOwnProperty(key)) {
        var args = $.extend({}, videoOptions, videos[key]);
        args.playerVars.controls = args.controls;
        videoPlayers[key] = new YT.Player(key, args);
      }
    }

    initEvents();
    youtubeLoaded = true;
  }

  function loadVideo(key) {
    if (!youtubeLoaded) {
      return;
    }
    var args = $.extend({}, videoOptions, videos[key]);
    args.playerVars.controls = args.controls;
    videoPlayers[key] = new YT.Player(key, args);

    initEvents();
  }

  /**
    * Private functions
   */

  function privatePlayVideo(id, clicked) {
    var videoData = videos[id];
    var player = videoPlayers[id];
    var $slide = videos[id].$parentSlide;

    if (playOnClick) {
      // playOnClick means we are probably on mobile (no autoplay).
      // setAsPlaying will show the iframe, requiring another click
      // to play the video.
      setAsPlaying(videoData);
    } else if (clicked || (autoplayCheckComplete && autoplayAvailable)) {
      // Play if autoplay is available or clicked to play
      $slide.removeClass(classes.loading);
      setAsPlaying(videoData);
      player.playVideo();
      return;
    }

    // Check for autoplay if not already done
    if (!autoplayCheckComplete) {
      autoplayCheckFunction(player, $slide);
    }
  }

  function setAutoplaySupport(supported) {
    var supportClass = supported ? classes.supportsAutoplay : classes.supportsNoAutoplay;
    $(document.documentElement).addClass(supportClass);

    if (!supported) {
      playOnClick = true;
    }

    autoplayCheckComplete = true;
  }

  function autoplayCheckFunction(player, $slide) {
    // attempt to play video
    player.playVideo();

    autoplayTest(player)
      .then(function() {
        setAutoplaySupport(true);
      })
      .fail(function() {
        // No autoplay available (or took too long to start playing).
        // Show fallback image. Stop video for safety.
        setAutoplaySupport(false);
        player.stopVideo();
      })
      .always(function() {
        autoplayCheckComplete = true;
        $slide.removeClass(classes.loading);
      });
  }

  function autoplayTest(player) {
    var deferred = $.Deferred();
    var wait;
    var timeout;

    wait = setInterval(function() {
      if (player.getCurrentTime() <= 0) {
        return;
      }

      autoplayAvailable = true;
      clearInterval(wait);
      clearTimeout(timeout);
      deferred.resolve();
    }, 500);

    timeout = setTimeout(function() {
      clearInterval(wait);
      deferred.reject();
    }, 4000); // subjective. test up to 8 times over 4 seconds

    return deferred;
  }

  function playOnClickCheck() {
    // Bail early for a few instances:
    // - small screen
    // - device sniff mobile browser

    if (playOnClickChecked) {
      return;
    }

    if ($(window).width() < 750) {
      playOnClick = true;
    } else if (window.mobileCheck()) {
      playOnClick = true;
    }

    if (playOnClick) {
      // No need to also do the autoplay check
      setAutoplaySupport(false);
    }

    playOnClickChecked = true;
  }

  // The API will call this function when each video player is ready
  function onPlayerReady(evt) {
    evt.target.setPlaybackQuality('hd1080');
    var videoData = getVideoOptions(evt);

    playOnClickCheck();

    // Prevent tabbing through YouTube player controls until visible
    $('#' + videoData.id).attr('tabindex', '-1');

    sizeBackgroundVideos();

    // Customize based on options from the video ID
    switch (videoData.type) {
      case 'background-chrome':
      case 'background':
        evt.target.mute();
        // Only play the video if it is in the active slide
        if (videoData.$parentSlide.hasClass(classes.currentSlide)) {
          privatePlayVideo(videoData.id);
        }
        break;
    }

    videoData.$parentSlide.addClass(classes.loaded);
  }

  function onPlayerChange(evt) {
    var videoData = getVideoOptions(evt);

    switch (evt.data) {
      case 0: // ended
        setAsFinished(videoData);
        break;
      case 1: // playing
        setAsPlaying(videoData);
        break;
      case 2: // paused
        setAsPaused(videoData);
        break;
    }
  }

  function setAsFinished(videoData) {
    switch (videoData.type) {
      case 'background':
        videoPlayers[videoData.id].seekTo(0);
        break;
      case 'background-chrome':
        videoPlayers[videoData.id].seekTo(0);
        closeVideo(videoData.id);
        break;
      case 'chrome':
        closeVideo(videoData.id);
        break;
    }
  }

  function setAsPlaying(videoData) {
    var $slideshow = videoData.$parentSlideshowWrapper;
    var $slide = videoData.$parentSlide;

    $slide.removeClass(classes.loading);

    // Do not change element visibility if it is a background video
    if (videoData.status === 'background') {
      return;
    }

    $('#' + videoData.id).attr('tabindex', '0');

    switch (videoData.type) {
      case 'chrome':
      case 'background-chrome':
        $slideshow
          .removeClass(classes.paused)
          .addClass(classes.playing);
        $slide
          .removeClass(classes.paused)
          .addClass(classes.playing);
        break;
    }

    // Update focus to the close button so we stay within the slide
    $slide.find('.' + classes.closeVideoBtn).focus();
  }

  function setAsPaused(videoData) {
    var $slideshow = videoData.$parentSlideshowWrapper;
    var $slide = videoData.$parentSlide;

    if (videoData.type === 'background-chrome') {
      closeVideo(videoData.id);
      return;
    }

    // YT's events fire after our click event. This status flag ensures
    // we don't interact with a closed or background video.
    if (videoData.status !== 'closed' && videoData.type !== 'background') {
      $slideshow.addClass(classes.paused);
      $slide.addClass(classes.paused);
    }

    if (videoData.type === 'chrome' && videoData.status === 'closed') {
      $slideshow.removeClass(classes.paused);
      $slide.removeClass(classes.paused);
    }

    $slideshow.removeClass(classes.playing);
    $slide.removeClass(classes.playing);
  }

  function closeVideo(playerId) {
    var videoData = videos[playerId];
    var $slideshow = videoData.$parentSlideshowWrapper;
    var $slide = videoData.$parentSlide;
    var classesToRemove = [classes.pause, classes.playing].join(' ');

    $('#' + videoData.id).attr('tabindex', '-1');

    videoData.status = 'closed';

    switch (videoData.type) {
      case 'background-chrome':
        videoPlayers[playerId].mute();
        setBackgroundVideo(playerId);
        break;
      case 'chrome':
        videoPlayers[playerId].stopVideo();
        setAsPaused(videoData); // in case the video is already paused
        break;
    }

    $slideshow.removeClass(classesToRemove);
    $slide.removeClass(classesToRemove);
  }

  function getVideoOptions(evt) {
    return videos[evt.target.h.id];
  }

  function startVideoOnClick(playerId) {
    var videoData = videos[playerId];
    // add loading class to slide
    videoData.$parentSlide.addClass(classes.loading);

    videoData.status = 'open';

    switch (videoData.type) {
      case 'background-chrome':
        unsetBackgroundVideo(playerId, videoData);
        videoPlayers[playerId].unMute();
        privatePlayVideo(playerId, true);
        break;
      case 'chrome':
        privatePlayVideo(playerId, true);
        break;
    }

    // esc to close video player
    $(document).on('keydown.videoPlayer', function(evt) {
      if (evt.keyCode === 27) {
        closeVideo(playerId);
      }
    });
  }

  function sizeBackgroundVideos() {
    $('.' + classes.videoBackground).each(function(index, el) {
      sizeBackgroundVideo($(el));
    });
  }

  function sizeBackgroundVideo($player) {
    var $slide = $player.closest('.' + classes.slide);
    // Ignore cloned slides
    if ($slide.hasClass(classes.slickClone)) {
      return;
    }
    var slideWidth = $slide.width();
    var playerWidth = $player.width();
    var playerHeight = $player.height();

    // when screen aspect ratio differs from video, video must center and underlay one dimension
    if (slideWidth / videoOptions.ratio < playerHeight) {
      playerWidth = Math.ceil(playerHeight * videoOptions.ratio); // get new player width
      $player.width(playerWidth).height(playerHeight).css({
        left: (slideWidth - playerWidth) / 2,
        top: 0
      }); // player width is greater, offset left; reset top
    } else { // new video width < window width (gap to right)
      playerHeight = Math.ceil(slideWidth / videoOptions.ratio); // get new player height
      $player.width(slideWidth).height(playerHeight).css({
        left: 0,
        top: (playerHeight - playerHeight) / 2
      }); // player height is greater, offset top; reset left
    }

    $player
      .prepareTransition()
      .addClass(classes.loaded);
  }

  function unsetBackgroundVideo(playerId) {
    // Switch the background-chrome to a chrome-only player once played
    $('#' + playerId)
      .removeAttr('style')
      .removeClass(classes.videoBackground)
      .addClass(classes.videoChrome);

    videos[playerId].$parentSlideshowWrapper
      .removeClass(classes.slideBackgroundVideo)
      .addClass(classes.playing);

    videos[playerId].$parentSlide
      .removeClass(classes.slideBackgroundVideo)
      .addClass(classes.playing);

    videos[playerId].status = 'open';
  }

  function setBackgroundVideo(playerId) {
    // Switch back to background-chrome when closed
    var $player = $('#' + playerId)
      .addClass(classes.videoBackground)
      .removeClass(classes.videoChrome);

    videos[playerId].$parentSlide
      .addClass(classes.slideBackgroundVideo);

    videos[playerId].status = 'background';
    sizeBackgroundVideo($player);
  }

  function initEvents() {
    $(document).on('click.videoPlayer', '.' + classes.playVideoBtn, function(evt) {
      var playerId = $(evt.currentTarget).data('controls');
      startVideoOnClick(playerId);
    });

    $(document).on('click.videoPlayer', '.' + classes.closeVideoBtn, function(evt) {
      var playerId = $(evt.currentTarget).data('controls');
      closeVideo(playerId);
    });

    // Listen to resize to keep a background-size:cover-like layout
    $(window).on('resize.videoPlayer', $.debounce(250, function() {
      if (youtubeLoaded) {
        sizeBackgroundVideos();
      }
    }));
  }

  function removeEvents() {
    $(document).off('.videoPlayer');
    $(window).off('.videoPlayer');
  }

  return {
    init: init,
    loadVideos: loadVideos,
    loadVideo: loadVideo,
    playVideo: customPlayVideo,
    pauseVideo: pauseVideo,
    removeEvents: removeEvents
  };
})();


/* ================ TEMPLATES ================ */
(function() {
  var $filterBy = $('#BlogTagFilter');

  if (!$filterBy.length) {
    return;
  }

  $filterBy.on('change', function() {
    location.href = $(this).val();
  });

})();

window.theme = theme || {};

theme.customerTemplates = (function() {

  function initEventListeners() {
    // Show reset password form
    $('#RecoverPassword').on('click', function(evt) {
      evt.preventDefault();
      toggleRecoverPasswordForm();
    });

    // Hide reset password form
    $('#HideRecoverPasswordLink').on('click', function(evt) {
      evt.preventDefault();
      toggleRecoverPasswordForm();
    });
  }

  /**
   *
   *  Show/Hide recover password form
   *
   */
  function toggleRecoverPasswordForm() {
    $('#RecoverPasswordForm').toggleClass('hide');
    $('#CustomerLoginForm').toggleClass('hide');
  }

  /**
   *
   *  Show reset password success message
   *
   */
  function resetPasswordSuccess() {
    var $formState = $('.reset-password-success');

    // check if reset password form was successfully submited.
    if (!$formState.length) {
      return;
    }

    // show success message
    $('#ResetSuccess').removeClass('hide');
  }

  /**
   *
   *  Show/hide customer address forms
   *
   */
  function customerAddressForm() {
    var $newAddressForm = $('#AddressNewForm');

    if (!$newAddressForm.length) {
      return;
    }

    // Initialize observers on address selectors, defined in shopify_common.js
    if (Shopify) {
      // eslint-disable-next-line no-new
      new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
        hideElement: 'AddressProvinceContainerNew'
      });
    }

    // Initialize each edit form's country/province selector
    $('.address-country-option').each(function() {
      var formId = $(this).data('form-id');
      var countrySelector = 'AddressCountry_' + formId;
      var provinceSelector = 'AddressProvince_' + formId;
      var containerSelector = 'AddressProvinceContainer_' + formId;

      // eslint-disable-next-line no-new
      new Shopify.CountryProvinceSelector(countrySelector, provinceSelector, {
        hideElement: containerSelector
      });
    });

    // Toggle new/edit address forms
    $('.address-new-toggle').on('click', function() {
      $newAddressForm.toggleClass('hide');
    });

    $('.address-edit-toggle').on('click', function() {
      var formId = $(this).data('form-id');
      $('#EditAddress_' + formId).toggleClass('hide');
    });

    $('.address-delete').on('click', function() {
      var $el = $(this);
      var formId = $el.data('form-id');
      var confirmMessage = $el.data('confirm-message');

      // eslint-disable-next-line no-alert
      if (confirm(confirmMessage || 'Are you sure you wish to delete this address?')) {
        Shopify.postLink('/account/addresses/' + formId, {parameters: {_method: 'delete'}});
      }
    });
  }

  /**
   *
   *  Check URL for reset password hash
   *
   */
  function checkUrlHash() {
    var hash = window.location.hash;

    // Allow deep linking to recover password form
    if (hash === '#recover') {
      toggleRecoverPasswordForm();
    }
  }

  return {
    init: function() {
      checkUrlHash();
      initEventListeners();
      resetPasswordSuccess();
      customerAddressForm();
    }
  };
})();




/*================ SECTIONS ================*/
window.theme = window.theme || {};

theme.Cart = (function() {
  var selectors = {
    edit: '.js-edit-toggle'
  };
  var config = {
    showClass: 'cart__update--show',
    showEditClass: 'cart__edit--active'
  };

  function Cart(container) {
    this.$container = $(container);
    this.$edit = $(selectors.edit, this.$container);

    this.$edit.on('click', this._onEditClick.bind(this));
  }

  Cart.prototype = _.assignIn({}, Cart.prototype, {
    onUnload: function() {
      this.$edit.off('click', this._onEditClick);
    },

    _onEditClick: function(evt) {
      var $evtTarget = $(evt.target);
      var $updateLine = $('.' + $evtTarget.data('target'));

      $evtTarget.toggleClass(config.showEditClass);
      $updateLine.toggleClass(config.showClass);
    }
  });

  return Cart;
})();

window.theme = window.theme || {};

theme.Filters = (function() {
  var constants = {
    SORT_BY: 'sort_by'
  };
  var selectors = {
    filterSelection: '.filters-toolbar__input--filter',
    sortSelection: '.filters-toolbar__input--sort',
    defaultSort: '.collection-header__default-sort'
  };

  function Filters(container) {
    var $container = this.$container = $(container);

    this.$filterSelect = $(selectors.filterSelection, $container);
    this.$sortSelect = $(selectors.sortSelection, $container);
    this.$selects = $(selectors.filterSelection, $container).add($(selectors.sortSelection, $container));

    this.defaultSort = this._getDefaultSortValue();
    this._resizeSelect(this.$selects);
    this.$selects.removeClass('hidden');

    this.$filterSelect.on('change', this._onFilterChange.bind(this));
    this.$sortSelect.on('change', this._onSortChange.bind(this));
  }

  Filters.prototype = _.assignIn({}, Filters.prototype, {
    _onSortChange: function(evt) {
      var sort = this._sortValue();
      if (sort.length) {
        window.location.search = sort;
      } else {
        // clean up our url if the sort value is blank for default
        window.location.href = window.location.href.replace(window.location.search, '');
      }
      this._resizeSelect($(evt.target));
    },

    _onFilterChange: function(evt) {
      window.location.href = this.$filterSelect.val() + window.location.search;
      this._resizeSelect($(evt.target));
    },

    _getSortValue: function() {
      return this.$sortSelect.val() || this.defaultSort;
    },

    _getDefaultSortValue: function() {
      return $(selectors.defaultSort, this.$container).val();
    },

    _sortValue: function() {
      var sort = this._getSortValue();
      var query = '';

      if (sort !== this.defaultSort) {
        query = constants.SORT_BY + '=' + sort;
      }

      return query;
    },

    _resizeSelect: function($selection) {
      $selection.each(function() {
        var $this = $(this);
        var arrowWidth = 10;
        // create test element
        var text = $this.find('option:selected').text();
        var $test = $('<span>').html(text);

        // add to body, get width, and get out
        $test.appendTo('body');
        var width = $test.width();
        $test.remove();

        // set select width
        $this.width(width + arrowWidth);
      });
    },

    onUnload: function() {
      this.$filterSelect.off('change', this._onFilterChange);
      this.$sortSelect.off('change', this._onSortChange);
    }
  });

  return Filters;
})();

window.theme = window.theme || {};

theme.HeaderSection = (function() {

  function Header() {
    theme.Header.init();
    theme.MobileNav.init();
    theme.Search.init();
  }

  Header.prototype = _.assignIn({}, Header.prototype, {
    onUnload: function() {
      theme.Header.unload();
    }
  });

  return Header;
})();

theme.Maps = (function() {
  var config = {
    zoom: 14
  };
  var apiStatus = null;
  var mapsToLoad = [];
  var key = theme.mapKey ? theme.mapKey : '';

  function Map(container) {
    this.$container = $(container);

    if (apiStatus === 'loaded') {
      this.createMap();
    } else {
      mapsToLoad.push(this);

      if (apiStatus !== 'loading') {
        apiStatus = 'loading';
        if (typeof window.google === 'undefined') {
          $.getScript('https://maps.googleapis.com/maps/api/js?key=' + key)
            .then(function() {
              apiStatus = 'loaded';
              initAllMaps();
            });
        }
      }
    }
  }

  function initAllMaps() {
    // API has loaded, load all Map instances in queue
    $.each(mapsToLoad, function(index, instance) {
      instance.createMap();
    });
  }

  function geolocate($map) {
    var deferred = $.Deferred();
    var geocoder = new google.maps.Geocoder();
    var address = $map.data('address-setting');

    geocoder.geocode({address: address}, function(results, status) {
      if (status !== google.maps.GeocoderStatus.OK) {
        deferred.reject(status);
      }

      deferred.resolve(results);
    });

    return deferred;
  }

  Map.prototype = _.assignIn({}, Map.prototype, {
    createMap: function() {
      var $map = this.$container.find('.map-section__container');

      return geolocate($map)
        .then(function(results) {
          var mapOptions = {
            zoom: config.zoom,
            center: results[0].geometry.location,
            disableDefaultUI: true
          };

          var map = this.map = new google.maps.Map($map[0], mapOptions);
          var center = this.center = map.getCenter();

          //eslint-disable-next-line no-unused-vars
          var marker = new google.maps.Marker({
            map: map,
            position: map.getCenter()
          });

          google.maps.event.addDomListener(window, 'resize', $.debounce(250, function() {
            google.maps.event.trigger(map, 'resize');
            map.setCenter(center);
          }));
        }.bind(this))
        .fail(function() {
          var errorMessage;

          switch (status) {
            case 'ZERO_RESULTS':
              errorMessage = theme.strings.addressNoResults;
              break;
            case 'OVER_QUERY_LIMIT':
              errorMessage = theme.strings.addressQueryLimit;
              break;
            default:
              errorMessage = theme.strings.addressError;
              break;
          }

          $map
            .parent()
            .addClass('page-width map-section--load-error')
            .html('<div class="errors text-center">' + errorMessage + '</div>');
        });
    },

    onUnload: function() {
      google.maps.event.clearListeners(this.map, 'resize');
    }
  });

  return Map;
})();

// Global function called by Google on auth errors.
// Show an auto error message on all map instances.
// eslint-disable-next-line camelcase, no-unused-vars
function gm_authFailure() {
  $('.map-section').addClass('map-section--load-error');
  $('.map-section__container').remove();
  $('.map-section__link').remove();
  $('.map-section__overlay').after('<div class="errors text-center">' + theme.strings.authError + '</div>');
}

/* eslint-disable no-new */
theme.Product = (function() {
  function Product(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');

    this.settings = {
      // Breakpoints from src/stylesheets/global/variables.scss.liquid
      mediaQueryMediumUp: 'screen and (min-width: 750px)',
      mediaQuerySmall: 'screen and (max-width: 749px)',
      bpSmall: false,
      enableHistoryState: $container.data('enable-history-state') || false,
      imageSize: null,
      imageZoomSize: null,
      namespace: '.slideshow-' + sectionId,
      sectionId: sectionId,
      sliderActive: false,
      zoomEnabled: false
    };

    this.selectors = {
      addToCart: '#AddToCart-' + sectionId,
      addToCartText: '#AddToCartText-' + sectionId,
      comparePrice: '#ComparePrice-' + sectionId,
      originalPrice: '#ProductPrice-' + sectionId,
      SKU: '.variant-sku',
      originalPriceWrapper: '.product-price__price-' + sectionId,
      originalSelectorId: '#ProductSelect-' + sectionId,
      productFeaturedImage: '#FeaturedImage-' + sectionId,
      productImageWrap: '#FeaturedImageZoom-' + sectionId,
      productPrices: '.product-single__price-' + sectionId,
      productThumbImages: '.product-single__thumbnail--' + sectionId,
      productThumbs: '.product-single__thumbnails-' + sectionId,
      saleClasses: 'product-price__sale product-price__sale--single',
      saleLabel: '.product-price__sale-label-' + sectionId,
      singleOptionSelector: '.single-option-selector-' + sectionId
    };

    // Stop parsing if we don't have the product json script tag when loading
    // section in the Theme Editor
    if (!$('#ProductJson-' + sectionId).html()) {
      return;
    }

    this.productSingleObject = JSON.parse(document.getElementById('ProductJson-' + sectionId).innerHTML);

    this.settings.zoomEnabled = $(this.selectors.productFeaturedImage).hasClass('js-zoom-enabled');
    this.settings.imageSize = theme.Images.imageSize($(this.selectors.productFeaturedImage).attr('src'));

    if (this.settings.zoomEnabled) {
      this.settings.imageZoomSize = theme.Images.imageSize($(this.selectors.productImageWrap).data('zoom'));
    }

    this._initBreakpoints();
    this._stringOverrides();
    this._initVariants();
    this._initImageSwitch();
    this._setActiveThumbnail();

    // Pre-loading product images to avoid a lag when a thumbnail is clicked, or
    // when a variant is selected that has a variant image
    theme.Images.preload(this.productSingleObject.images, this.settings.imageSize);
  }

  Product.prototype = _.assignIn({}, Product.prototype, {
    _stringOverrides: function() {
      theme.productStrings = theme.productStrings || {};
      $.extend(theme.strings, theme.productStrings);
    },

    _initBreakpoints: function() {
      var self = this;

      enquire.register(this.settings.mediaQuerySmall, {
        match: function() {
          // initialize thumbnail slider on mobile if more than three thumbnails
          if ($(self.selectors.productThumbImages).length > 3) {
            self._initThumbnailSlider();
          }

          // destroy image zooming if enabled
          if (self.settings.zoomEnabled) {
            _destroyZoom($(self.selectors.productImageWrap));
          }

          self.settings.bpSmall = true;
        },
        unmatch: function() {
          if (self.settings.sliderActive) {
            self._destroyThumbnailSlider();
          }

          self.settings.bpSmall = false;
        }
      });

      enquire.register(this.settings.mediaQueryMediumUp, {
        match: function() {
          if (self.settings.zoomEnabled) {
            _enableZoom($(self.selectors.productImageWrap));
          }
        }
      });
    },

    _initVariants: function() {
      var options = {
        $container: this.$container,
        enableHistoryState: this.$container.data('enable-history-state') || false,
        singleOptionSelector: this.selectors.singleOptionSelector,
        originalSelectorId: this.selectors.originalSelectorId,
        product: this.productSingleObject
      };

      this.variants = new slate.Variants(options);

      this.$container.on('variantChange' + this.settings.namespace, this._updateAddToCart.bind(this));
      this.$container.on('variantImageChange' + this.settings.namespace, this._updateImages.bind(this));
      this.$container.on('variantPriceChange' + this.settings.namespace, this._updatePrice.bind(this));
      this.$container.on('variantSKUChange' + this.settings.namespace, this._updateSKU.bind(this));
    },

    _initImageSwitch: function() {
      if (!$(this.selectors.productThumbImages).length) {
        return;
      }

      var self = this;

      $(this.selectors.productThumbImages).on('click', function(evt) {
        evt.preventDefault();
        var $el = $(this);
        var imageSrc = $el.attr('href');
        var zoomSrc = $el.data('zoom');

        self._switchImage(imageSrc, zoomSrc);
        self._setActiveThumbnail(imageSrc);
      });
    },

    _setActiveThumbnail: function(src) {
      var activeClass = 'active-thumb';

      // If there is no element passed, find it by the current product image
      if (typeof src === 'undefined') {
        src = $(this.selectors.productFeaturedImage).attr('src');
      }

      // Set active thumbnails (incl. slick cloned thumbs) with matching 'href'
      var $thumbnail = $(this.selectors.productThumbImages + '[href="' + src + '"]');
      $(this.selectors.productThumbImages).removeClass(activeClass);
      $thumbnail.addClass(activeClass);
    },

    _switchImage: function(image, zoomImage) {
      $(this.selectors.productFeaturedImage).attr('src', image);

      // destroy image zooming if enabled
      if (this.settings.zoomEnabled) {
        _destroyZoom($(this.selectors.productImageWrap));
      }

      if (!this.settings.bpSmall && this.settings.zoomEnabled && zoomImage) {
        $(this.selectors.productImageWrap).data('zoom', zoomImage);
        _enableZoom($(this.selectors.productImageWrap));
      }
    },

    _initThumbnailSlider: function() {
      var options = {
        slidesToShow: 4,
        slidesToScroll: 3,
        infinite: false,
        prevArrow: '.thumbnails-slider__prev--' + this.settings.sectionId,
        nextArrow: '.thumbnails-slider__next--' + this.settings.sectionId,
        responsive: [
          {
            breakpoint: 321,
            settings: {
              slidesToShow: 3
            }
          }
        ]
      };

      $(this.selectors.productThumbs).slick(options);
      this.settings.sliderActive = true;
    },

    _destroyThumbnailSlider: function() {
      $(this.selectors.productThumbs).slick('unslick');
      this.settings.sliderActive = false;
    },

    _updateAddToCart: function(evt) {
      var variant = evt.variant;

      if (variant) {
        $(this.selectors.productPrices)
          .removeClass('visibility-hidden')
          .attr('aria-hidden', 'true');

        if (variant.available) {
          $(this.selectors.addToCart).prop('disabled', false);
          $(this.selectors.addToCartText).text(theme.strings.addToCart);
        } else {
          // The variant doesn't exist, disable submit button and change the text.
          // This may be an error or notice that a specific variant is not available.
          $(this.selectors.addToCart).prop('disabled', true);
          $(this.selectors.addToCartText).text(theme.strings.soldOut);
        }
      } else {
        $(this.selectors.addToCart).prop('disabled', true);
        $(this.selectors.addToCartText).text(theme.strings.unavailable);
        $(this.selectors.productPrices)
          .addClass('visibility-hidden')
          .attr('aria-hidden', 'false');
      }
    },

    _updateImages: function(evt) {
      var variant = evt.variant;
      var sizedImgUrl = theme.Images.getSizedImageUrl(variant.featured_image.src, this.settings.imageSize);
      var zoomSizedImgUrl;

      if (this.settings.zoomEnabled) {
        zoomSizedImgUrl = theme.Images.getSizedImageUrl(variant.featured_image.src, this.settings.imageZoomSize);
      }

      this._switchImage(sizedImgUrl, zoomSizedImgUrl);
      this._setActiveThumbnail(sizedImgUrl);
    },

    _updatePrice: function(evt) {
      var variant = evt.variant;

      // Update the product price
      $(this.selectors.originalPrice).html(theme.Currency.formatMoney(variant.price, theme.moneyFormat));

      // Update and show the product's compare price if necessary
      if (variant.compare_at_price > variant.price) {
        $(this.selectors.comparePrice)
          .html(theme.Currency.formatMoney(variant.compare_at_price, theme.moneyFormat))
          .removeClass('hide');

        $(this.selectors.originalPriceWrapper).addClass(this.selectors.saleClasses);

        $(this.selectors.saleLabel).removeClass('hide');
      } else {
        $(this.selectors.comparePrice).addClass('hide');
        $(this.selectors.saleLabel).addClass('hide');
        $(this.selectors.originalPriceWrapper).removeClass(this.selectors.saleClasses);
      }
    },

    _updateSKU: function(evt) {
      var variant = evt.variant;

      // Update the sku
      $(this.selectors.SKU).html(variant.sku);
    },

    onUnload: function() {
      this.$container.off(this.settings.namespace);
    }
  });

  function _enableZoom($el) {
    var zoomUrl = $el.data('zoom');
    $el.zoom({
      url: zoomUrl
    });
  }

  function _destroyZoom($el) {
    $el.trigger('zoom.destroy');
  }

  return Product;
})();

theme.Quotes = (function() {
  var config = {
    mediaQuerySmall: 'screen and (max-width: 749px)',
    mediaQueryMediumUp: 'screen and (min-width: 750px)',
    slideCount: 0
  };
  var defaults = {
    accessibility: true,
    arrows: false,
    dots: true,
    autoplay: false,
    touchThreshold: 20,
    slidesToShow: 3,
    slidesToScroll: 3
  };

  function Quotes(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    var wrapper = this.wrapper = '.quotes-wrapper';
    var slider = this.slider = '#Quotes-' + sectionId;
    var $slider = $(slider, wrapper);

    var sliderActive = false;
    var mobileOptions = $.extend({}, defaults, {
      slidesToShow: 1,
      slidesToScroll: 1,
      adaptiveHeight: true
    });

    config.slideCount = $slider.data('count');

    // Override slidesToShow/Scroll if there are not enough blocks
    if (config.slideCount < defaults.slidesToShow) {
      defaults.slidesToShow = config.slideCount;
      defaults.slidesToScroll = config.slideCount;
    }

    $slider.on('init', this.a11y.bind(this));

    enquire.register(config.mediaQuerySmall, {
      match: function() {
        initSlider($slider, mobileOptions);
      }
    });

    enquire.register(config.mediaQueryMediumUp, {
      match: function() {
        initSlider($slider, defaults);
      }
    });

    function initSlider(sliderObj, args) {
      if (sliderActive) {
        sliderObj.slick('unslick');
        sliderActive = false;
      }

      sliderObj.slick(args);
      sliderActive = true;
    }
  }

  Quotes.prototype = _.assignIn({}, Quotes.prototype, {
    onUnload: function() {
      enquire.unregister(config.mediaQuerySmall);
      enquire.unregister(config.mediaQueryMediumUp);

      $(this.slider, this.wrapper).slick('unslick');
    },

    onBlockSelect: function(evt) {
      // Ignore the cloned version
      var $slide = $('.quotes-slide--' + evt.detail.blockId + ':not(.slick-cloned)');
      var slideIndex = $slide.data('slick-index');

      // Go to selected slide, pause autoplay
      $(this.slider, this.wrapper).slick('slickGoTo', slideIndex);
    },

    a11y: function(event, obj) {
      var $list = obj.$list;
      var $wrapper = $(this.wrapper, this.$container);

      // Remove default Slick aria-live attr until slider is focused
      $list.removeAttr('aria-live');

      // When an element in the slider is focused set aria-live
      $wrapper.on('focusin', function(evt) {
        if ($wrapper.has(evt.target).length) {
          $list.attr('aria-live', 'polite');
        }
      });

      // Remove aria-live
      $wrapper.on('focusout', function(evt) {
        if ($wrapper.has(evt.target).length) {
          $list.removeAttr('aria-live');
        }
      });
    }
  });

  return Quotes;
})();

theme.slideshows = {};

theme.SlideshowSection = (function() {
  function SlideshowSection(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    var slideshow = this.slideshow = '#Slideshow-' + sectionId;

    $('.slideshow__video', slideshow).each(function() {
      var $el = $(this);
      theme.SlideshowVideo.init($el);
      theme.SlideshowVideo.loadVideo($el.attr('id'));
    });

    theme.slideshows[slideshow] = new theme.Slideshow(slideshow);
  }

  return SlideshowSection;
})();

theme.SlideshowSection.prototype = _.assignIn({}, theme.SlideshowSection.prototype, {
  onUnload: function() {
    delete theme.slideshows[this.slideshow];
  },

  onBlockSelect: function(evt) {
    var $slideshow = $(this.slideshow);

    // Ignore the cloned version
    var $slide = $('.slideshow__slide--' + evt.detail.blockId + ':not(.slick-cloned)');
    var slideIndex = $slide.data('slick-index');

    // Go to selected slide, pause autoplay
    $slideshow.slick('slickGoTo', slideIndex).slick('slickPause');
  },

  onBlockDeselect: function() {
    // Resume autoplay
    $(this.slideshow).slick('slickPlay');
  }
});

function homeSliderInit() {

  var slider_count = $('.products-slider-home').length;

  $("#all-slides").text("0" + slider_count);


  var slick = $('#home-collection-slider-container');

  var dots = false;


  slick.slick({
    slidesToShow: 1,
    dots: true,
    infinite: false,
    arrows: false
  });

}

function homeSliderDesctopInit() {

  var slides = $('#home-collection-slider-container > .product-item-container');

  slides.addClass('next');
  slides.eq(0).removeClass('next').addClass('current');


  var sliderElemTop = parseInt($('#home-slider-panel').offset().top);
  var sliderElemBottom = parseInt(sliderElemTop + $('#home-slider-panel').height());


  var sconfig = {
    state: 'enabled'
  };

  // $(window).on('mousewheel', function (event) {
  //
  //   if( sconfig.state === 'locked' ){
  //     event.stopPropagation();
  //     event.preventDefault();
  //     return false;
  //   }
  //
  //   var delta = event.originalEvent.deltaY;
  //
  //   var docViewTop = $(window).scrollTop();
  //   var docViewBottom = docViewTop + $(window).height();
  //
  //   sconfig.sliderBelow = ( delta > 0 ) && ( docViewBottom > (sliderElemTop + 100 )) && ( docViewBottom < sliderElemBottom - 20);
  //   sconfig.sliderAbove = ( delta < 0 ) && ( docViewTop < (sliderElemBottom - 100 )) && ( docViewTop > sliderElemTop + 20);
  //
  //   if( sconfig.sliderBelow || sconfig.sliderAbove ) {
  //     sconfig.state = 'locked';
  //
  //     setTimeout(function(){
  //       $("html, body").animate({
  //         scrollTop: sliderElemTop
  //       }, 500, function(){
  //         sconfig.state = 'enabled';
  //       });
  //     }, 100);
  //
  //
  //     event.stopPropagation();
  //     event.preventDefault();
  //   }
  //
  // });

  var pageSections = {
    home: 4
  };

  
  var docViewTop = $(window).scrollTop();

  var windowHeight = $(window).height();

  var activeSection = parseInt(docViewTop / windowHeight);

  setTimeout(function(){
    $("html, body").animate({
      scrollTop: activeSection * windowHeight
    }, 700, function(){
      sconfig.state = 'enabled';
    });
  }, 100);

  $(window).on('mousewheel', function (event) {

    if( sconfig.state === 'locked' ){
      event.stopPropagation();
      event.preventDefault();
      return false;
    }

    var delta = event.originalEvent.deltaY;




    if( ((delta > 0) && (activeSection < pageSections.home) ) || ((delta < 0) && (activeSection > 0) ) ) {
      sconfig.state = 'locked';

      if(delta > 0) {
        activeSection++;
      } else {
        activeSection--;
      }

      setTimeout(function(){
        $("html, body").animate({
          scrollTop: activeSection * windowHeight
        }, 700, function(){
          sconfig.state = 'enabled';
        });
      }, 50);


      event.stopPropagation();
      event.preventDefault();
    }

  });

  
  var slider_count = $('.products-slider-home').length;

  $("#all-slides").text("0" + slider_count);


  var slick = $('#home-collection-slider-container');

  var slickLength = slick.find('.product-item-container').length;

  slick.slick({
    slidesToShow: 1,
    dots: false,
    infinite: false,
    arrows: false
  });

  if($(window).width() > 1024) {

    var didScroll = false;

    setInterval(function () {
      if (didScroll) {
        didScroll = false;
      }
    }, 600);

    slick.on('mousewheel', function (e) {

      if (!didScroll && sconfig.state != 'locked') {
        if (e.originalEvent.deltaY < 0) {
          if (slick.slick('slickCurrentSlide') == 0) {
            return
          }
          didScroll = true;
          e.preventDefault();
          e.stopPropagation();
          slick.slick('slickPrev');
        }
        else {
          if (slick.slick('slickCurrentSlide') == slickLength - 1) {
            return
          }
          didScroll = true;
          e.preventDefault();
          e.stopPropagation();
          slick.slick('slickNext');
        }
      } else {
        e.preventDefault();
        e.stopPropagation();
      }

    });

  }

  $('.carousel-indicator-container .carousel-indicator').eq(0).addClass('active');


  $('.collection-slider-container').on('beforeChange', function(event, slick, currentSlide, nextSlide){

    $('.carousel-indicator').removeClass('active');

    $('.carousel-indicator-container .carousel-indicator').eq(nextSlide).addClass('active');

  });

}

function getDocHeight() {
  var D = document;
  return Math.max(
      D.body.scrollHeight, D.documentElement.scrollHeight,
      D.body.offsetHeight, D.documentElement.offsetHeight,
      D.body.clientHeight, D.documentElement.clientHeight
  );
}

function footerInit() {
  
  if($('#contact-us-page').length != 0) {

    $('.site-footer').addClass('active_footer');
    $('.back-arrow-container.header-arrow').addClass('hidden');

  } else if($('#account-page-main-block').length != 0) {
    
    $('.back-arrow-container.header-arrow').addClass('hidden');

    if($(window).width() < 1025) {
      $(window).scroll(function () {

        if ($(window).scrollTop() + $(window).height() >= getDocHeight()) {

          $('.site-footer').addClass('active_footer');
          $('#social-panel-line').addClass('hidden-line');
          $('.back-arrow-container.header-arrow').addClass('hidden');

        } else {

          $('.site-footer').removeClass('active_footer');
          $('#social-panel-line').removeClass('hidden-line');
          $('.back-arrow-container.header-arrow').removeClass('hidden');

        }

      });
    }
    
  } else {
    
    $(window).scroll(function () {
      
      if ($(window).scrollTop() + $(window).height() >= getDocHeight()) {

        $('.site-footer').addClass('active_footer');
        $('#social-panel-line').addClass('hidden-line');
        $('.back-arrow-container.header-arrow').addClass('hidden');

      } else {

        $('.site-footer').removeClass('active_footer');
        $('#social-panel-line').removeClass('hidden-line');
        $('.back-arrow-container.header-arrow').removeClass('hidden');
        
      }
      
    });
    
  }

  $('.back-arrow-container').click(function(){
    $("html, body").animate({ scrollTop: 0 }, 1000);
    return false;
  });

  $('#site-header-mobile-menu-button').on('click', function() {
    $('#mobile-header-menu-panel').toggleClass('active-modal');
  });

  $('#mobile-menu-close-button').on('click', function() {
    $('#mobile-header-menu-panel').toggleClass('active-modal');
  });

}

function instagramInit() {

  if($('#instafeed').length != 0) {

    var feed = new Instafeed({
      get: 'user',
      // userId: '4775145375',
      userId: '4482001775',

      // clientId: 'ad370d39b3694ab4b2202878bf5d5fe4',
      clientId: 'ad370d39b3694ab4b2202878bf5d5fe4',

      // accessToken: '4775145375.488d6d5.69f8d4ff2f5342698736325c3d2b0718',
      accessToken: '4482001775.1677ed0.d6759f19a65a42b6aaa6337e416430e4',

      resolution: 'standard_resolution',
      template: '<a target="_blank" href="{{link}}"><div class="insta-image-container"><img src="{{image}}" /></div></a>',
      after: function () {
        var slidesToShow = 4;
        var arrows = true;

        if ($(window).width() < 1025) {
          slidesToShow = 2.7;
          arrows = false;

          if ($(window).width() < 768) {
            slidesToShow = 1.65;
            arrows = false;
          }

        }


        $('#instafeed').slick({
          dots: false,
          infinite: true,
          arrows: arrows,
          slidesToShow: slidesToShow,
          centerMode: true,
          centerPadding: '20px',
          lazyLoad: 'ondemand',
          nextArrow: '<div class="slider-arrow right-arrow"><img></div>',
          prevArrow: '<div class="slider-arrow left-arrow"><img></div>'
        });


        $('#instafeed').removeClass("hidden-gallery");


      }
    });

    feed.run();

  }

}

function aboutArtNatureSlider() {

  //autoscroll
  
  var sliderElemTop = parseInt($('#about-art-nature-panel').offset().top);
  var sliderElemBottom = parseInt(sliderElemTop + $('#about-art-nature-panel').height());


  var sconfig = {
    state: 'enabled'
  };

  $(window).on('mousewheel', function (event) {

    if( sconfig.state === 'locked' ){
      event.stopPropagation();
      event.preventDefault();
      return false;
    }

    var delta = event.originalEvent.deltaY;

    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    sconfig.sliderBelow = ( delta > 0 ) && ( docViewBottom > (sliderElemTop + 100 )) && ( docViewBottom < sliderElemBottom - 20);
    sconfig.sliderAbove = ( delta < 0 ) && ( docViewTop < (sliderElemBottom - 100 )) && ( docViewTop > sliderElemTop + 20);

    if( sconfig.sliderBelow || sconfig.sliderAbove ) {
      sconfig.state = 'locked';

      setTimeout(function(){
        $("html, body").animate({
          scrollTop: sliderElemTop
        }, 500, function(){
          sconfig.state = 'enabled';
        });
      }, 100);

      event.stopPropagation();
      event.preventDefault();
    }

  });

  var didScroll = false;

  setInterval(function () {
    if (didScroll) {
      didScroll = false;
    }
  }, 1000);

  var art_block = $('#about-art-panel');
  var nature_block = $('#about-nature-panel');

  $('#about-art-nature-panel').on('mousewheel', function (event) {

    if( sconfig.state === 'locked' ){
      event.stopPropagation();
      event.preventDefault();
      return false;
    }

    var delta = event.originalEvent.deltaY;

    if( !didScroll && ( delta > 0 && nature_block.hasClass('active-slide') || delta < 0 && art_block.hasClass('active-slide') ) ) {
        return;
    }

    if(!didScroll) {

        didScroll = true;

          if(delta > 0) {
            art_block.removeClass('active-slide').removeClass('active-animation');
            nature_block.addClass('active-slide').addClass('active-animation');
          }

          if(delta < 0) {
            nature_block.removeClass('active-slide').removeClass('active-animation');
            art_block.addClass('active-slide').addClass('active-animation');
          }

    }

    var delta = event.originalEvent.deltaY;

    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    sconfig.sliderBelow = ( delta > 0 ) && ( docViewBottom > (sliderElemTop + 100 )) && ( docViewBottom < sliderElemBottom - 20);
    sconfig.sliderAbove = ( delta < 0 ) && ( docViewTop < (sliderElemBottom - 100 )) && ( docViewTop > sliderElemTop + 20);

    if( sconfig.sliderBelow || sconfig.sliderAbove ) {
      sconfig.state = 'locked';

      setTimeout(function(){
        $("html, body").animate({
          scrollTop: sliderElemTop
        }, 500, function(){
          sconfig.state = 'enabled';
        });
      }, 100);

      event.stopPropagation();
      event.preventDefault();
    }


    event.stopPropagation();
    event.preventDefault();

});
  
}

function homeBagInit() {

  $('.collection-add-to-bag-button').on('click', function() {
    console.log('variant id: ', $(this).data().id);

    var productData = $(this).data();

    $.ajax({
      type: "POST",
      url: '/cart/add.js',
      data: {
        quantity: 1,
        id: productData.id
      },
      success: function(response) {
        location.reload();
      },
      error:   function(jqXHR, textStatus, errorThrown) {
        location.reload();
      }
    });
  })

}

function bagInit() {

  $('.cart-item-plus').on('click', function() {

    var productData = $(this).data();
    var currentCount = parseInt($('#cart-item-quantity-' + productData.id).text());

    var newCount = currentCount + 1;

    var currentTotalCount = parseInt($('#cart-total-items-counter').text());

    $.ajax({
      type: "POST",
      url: '/cart/add.js',
      data: {
        quantity: 1,
        id: productData.id
      },
      success: function(response) {

      },
      error:   function(jqXHR, textStatus, errorThrown) {

        var responseData = JSON.parse(jqXHR.responseText);

        parseInt($('#cart-item-quantity-' + productData.id).text(newCount));

        setTotalCartCounter(currentTotalCount + 1);

        $('#cart-item-total-price-' + productData.id).text('$' + (responseData.line_price / 100).toFixed(2));

        recalcTotalPrice();
      }
    });
  });

  $('.cart-item-minus').on('click', function() {

    var productData = $(this).data();
    var currentCount = parseInt($('#cart-item-quantity-' + productData.id).text());
    
    var newCount = currentCount - 1;

    var currentTotalCount = parseInt($('#cart-total-items-counter').text());
    var newTotalCount = (currentTotalCount > 0) ? (currentTotalCount - 1) : 0;
    
    $.ajax({
      type: "POST",
      url: '/cart/change.js',
      data: {
        quantity: newCount,
        id: productData.id
      },
      success: function(response) {

      },
      error:   function(jqXHR, textStatus, errorThrown) {

        var responseData = JSON.parse(jqXHR.responseText);
        
        if(newCount < 1) {
          $('#bag-item-' + productData.id).remove();
        } else {

          var newPrice = 0;

          if(responseData.items) {
            responseData.items.forEach(function (item) {
              if(item.variant_id == productData.id) {
                newPrice = item.line_price;
              }
            })
          }

          parseInt($('#cart-item-quantity-' + productData.id).text(newCount));
          $('#cart-item-total-price-' + productData.id).text('$' + (newPrice / 100).toFixed(2));
        }

        setTotalCartCounter(newTotalCount);

        recalcTotalPrice();

      }
    });
  });

  function setTotalCartCounter(newCount) {

    $('#cart-total-items-counter').text(newCount);
    $('#header-bag-counter').text(newCount);
  }

  function recalcTotalPrice() {

    var totalPrice = 0;

    $('.cart-item-total-price').each(function() {
      totalPrice += parseFloat($(this).text().replace(/\$/g,' '));
    });

    $('#cart-total-price').text('$' + totalPrice.toFixed(2));

  }

}

function bagPageControlsInit() {

  $('.bag-page-plus').on('click', function() {

    var productData = $(this).data();


    var currentCount = parseInt($('.bag-page-quantity-' + productData.id).val());

    var newCount = currentCount + 1;

    $.ajax({
      type: "POST",
      url: '/cart/add.js',
      data: {
        quantity: 1,
        id: productData.id
      },
      success: function(response) {

      },
      error:   function(jqXHR, textStatus, errorThrown) {

        var responseData = JSON.parse(jqXHR.responseText);

        parseInt($('.bag-page-quantity-' + productData.id).val(newCount));


        $('#bag-page-total-price-' + productData.id).text('$' + (responseData.line_price / 100).toFixed(2));

        bagPagerecalcTotalPrice();
      }
    });
  });

  $('.bag-page-minus').on('click', function() {

    var productData = $(this).data();
    var currentCount = parseInt($('.bag-page-quantity-' + productData.id).val());

    var newCount = currentCount - 1;

   $.ajax({
      type: "POST",
      url: '/cart/change.js',
      data: {
        quantity: newCount,
        id: productData.id
      },
      success: function(response) {

      },
      error:   function(jqXHR, textStatus, errorThrown) {

        var responseData = JSON.parse(jqXHR.responseText);

        console.log(responseData);

        if(newCount < 1) {
          parseInt($('.bag-page-quantity-' + productData.id).val(0));

          $('#bag-page-total-price-' + productData.id).text('$0.00');

          newCount = 0;

        } else {

          var newPrice = 0;

          if(responseData.items) {
            responseData.items.forEach(function (item) {
              if(item.variant_id == productData.id) {
                newPrice = item.line_price;
              }
            })
          }

          parseInt($('.bag-page-quantity-' + productData.id).val(newCount));


          $('#bag-page-total-price-' + productData.id).text('$' + (newPrice / 100).toFixed(2));
        }


        bagPagerecalcTotalPrice();

      }
    });

  });

  function setTotalCartCounter(newCount) {

    $('#cart-total-items-counter').text(newCount);
    $('#header-bag-counter').text(newCount);
  }

  function recalcTotalPrice() {

    var totalPrice = 0;

    $('.cart-item-total-price').each(function() {
      totalPrice += parseFloat($(this).text());
    });

    $('#cart-total-price').text(totalPrice.toFixed(2));

  }

}

function bagPagerecalcTotalPrice() {

  var totalPrice = 0;

  $('.bag-page-total-price').each(function() {
    totalPrice += parseFloat($(this).text().replace(/\$/g,' '));
  });

  $('#bag-page-sub-price').text('$' + totalPrice.toFixed(2));
  $('#bag-page-taxes-price').text('$' + (totalPrice * 0.13).toFixed(2));
  $('#bag-page-total-price').text('$' + (totalPrice * 1.13).toFixed(2));

}

$(document).ready(function() {
  var sections = new theme.Sections();

  sections.register('cart-template', theme.Cart);
  sections.register('product', theme.Product);
  sections.register('collection-template', theme.Filters);
  sections.register('product-template', theme.Product);
  sections.register('header-section', theme.HeaderSection);
  sections.register('map', theme.Maps);
  sections.register('slideshow-section', theme.SlideshowSection);
  sections.register('quotes', theme.Quotes);


  if($('#home-intro-block').length != 0) {

    homeBagInit();

    if($(window).width() > 1024) {
      homeSliderDesctopInit();
    } else {
      homeSliderInit();
    }

  } else if($('#product-page-panel').length != 0) {
    
    homeBagInit();
    
  } else if($('#collections-list-page').length != 0) {
    
    homeBagInit();
    
  } else if($('#about-us-page').length != 0) {

    if($(window).width() > 1024) {
      aboutArtNatureSlider();
    }

  } else if($('#cart-page-main-panel').length != 0) {

    bagPageControlsInit();

  }

  bagInit();

  footerInit();
  
  instagramInit();

});

theme.init = function() {
  theme.customerTemplates.init();

  slate.rte.wrapTable();
  slate.rte.iframeReset();

  // Common a11y fixes
  slate.a11y.pageLinkFocus($(window.location.hash));

  $('.in-page-link').on('click', function(evt) {
    slate.a11y.pageLinkFocus($(evt.currentTarget.hash));
  });

  $('a[href="#"]').on('click', function(evt) {
    evt.preventDefault();
  });



};

$(theme.init);
