/* global drgc_params, iFrameResize */
/* eslint-disable no-alert, no-console */
import DRCommerceModule from './public-dr-commerce'; // Commerce API

const PdpModule = {
    fetchVariationPrice($, pricing, $target, idx) {
        if (!pricing.listPrice || !pricing.salePriceWithQuantity) return;
        if (pricing.listPrice.value > pricing.salePriceWithQuantity.value) {
            $target.data('old-price', pricing.listPrice.value);
            $target.data('price', pricing.formattedSalePriceWithQuantity);
        } else {
            $target.data('price', pricing.formattedSalePriceWithQuantity);
        }

        if (idx === 0) {
            if ($target.is('input[type=radio]')) $target.prop('checked', true).trigger('click');
            else $target.prop('selected', true).trigger('change');
        }
    },

    displayRealTimePricing($, pricing, option, $target) {
        if (!pricing.listPrice || !pricing.salePriceWithQuantity) {
            $target.text(''); // no pricing data
            return;
        }
        if (pricing.listPrice.value > pricing.salePriceWithQuantity.value) {
            $target.html(`
                <${option.listPriceDiv} class="${option.listPriceClass()}">${pricing.listPrice.value}</${option.listPriceDiv}>
                <${option.salePriceDiv} class="${option.salePriceClass()}">${pricing.formattedSalePriceWithQuantity}</${option.salePriceDiv}>
            `);
        } else {
            $target.html(`
                <${option.priceDiv} class="${option.priceClass()}">${pricing.formattedSalePriceWithQuantity}</${option.priceDiv}>
            `);
        }
    }
};

jQuery(document).ready(($) => {
    class DRService {

        constructor() {
            this.domain = drgc_params.domain;
            this.apiBaseUrl = 'https://' + this.domain + '/v1/shoppers';
            this.drLocale = drgc_params.drLocale || 'en_US';
        }

        updateShopper() {
            return new Promise((resolve, reject) => {
                $.ajax({
                    type: 'POST',
                    headers: {
                        Authorization: `Bearer ${drgc_params.accessToken}`,
                    },
                    url: `${this.apiBaseUrl}/me?locale=${this.drLocale}`,
                    success: (data) => {
                        resolve(data);
                    },
                    error: (jqXHR) => {
                        reject(jqXHR);
                    }
                });
            });
        }

        getCart() {
            return new Promise((resolve, reject) => {
                $.ajax({
                    type: 'GET',
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${drgc_params.accessToken}`
                    },
                    url: `${this.apiBaseUrl}/me/carts/active`,
                    success: (data) => {
                        resolve(data.cart);
                    },
                    error: (jqXHR) => {
                        reject(jqXHR);
                    }
                });
            });
        }

        updateCart(productID, quantity) {
            return new Promise((resolve, reject) => {
                $.ajax({
                    type: 'POST',
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${drgc_params.accessToken}`
                    },
                    url: (() => {
                        let url = `${this.apiBaseUrl}/me/carts/active?productId=${productID}`;
                        if (quantity) url += `&quantity=${quantity}`;
                        if (drgc_params.testOrder == "true") url += '&testOrder=true';
                        return url;
                    })(),
                    success: (data) => {
                        resolve(data.cart);
                        openMiniCartDisplay();
                    },
                    error: (jqXHR) => {
                        reject(jqXHR);
                    }
                });
            });
        }


        removeLineItem(lineItemID) {
            return new Promise((resolve, reject) => {
                $.ajax({
                    type: 'DELETE',
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${drgc_params.accessToken}`
                    },
                    url: `${this.apiBaseUrl}/me/carts/active/line-items/${lineItemID}`,
                    success: () => {
                        resolve();
                    },
                    error: (jqXHR) => {
                        reject(jqXHR);
                    }
                });
            });
        }

        getOffersByPoP(popName) {
            return new Promise((resolve, reject) => {
                $.ajax({
                    type: 'GET',
                    headers: {
                        Authorization: `Bearer ${drgc_params.accessToken}`,
                    },
                    url: `${this.apiBaseUrl}/me/point-of-promotions/SiteMerchandising_${popName}/offers?format=json&expand=all`,
                    success: (data) => {
                        resolve(data);
                        console.log('getOffers', data);
                    },
                    error: (jqXHR) => {
                        reject(jqXHR);
                    }
                });
            });
        }

        getProductPricing(productID) {
            return new Promise((resolve, reject) => {
                $.ajax({
                    type: 'GET',
                    headers: {
                        Authorization: `Bearer ${drgc_params.accessToken}`,
                    },
                    url: `${this.apiBaseUrl}/me/products/${productID}/pricing?format=json&expand=all`,
                    success: (data) => {
                        resolve(data);
                    },
                    error: (jqXHR) => {
                        reject(jqXHR);
                    }
                });
            });
        }

        getProductInventoryStatus(productID) {
            return new Promise((resolve, reject) => {
                $.ajax({
                    type: 'GET',
                    headers: {
                        Authorization: `Bearer ${drgc_params.accessToken}`,
                    },
                    url: `${this.apiBaseUrl}/me/products/${productID}/inventory-status?format=json&expand=all`,
                    success: (data) => {
                        resolve(data);
                        console.log('getProductInventoryStatus', data);
                    },
                    error: (jqXHR) => {
                        reject(jqXHR);
                    }
                });
            });
        }
    }

    const drService = new DRService();
    let lineItems = [];

    function toggleMiniCartDisplay() {
        const $miniCartDisplay = $('.dr-minicart-display');
        if ($miniCartDisplay.is(':visible')) {
            $miniCartDisplay.fadeOut(200);
        } else {
            $miniCartDisplay.fadeIn(200);
        }
    }

    function openMiniCartDisplay() {
        const $miniCartDisplay = $('.dr-minicart-display');
        if (! $miniCartDisplay.is(':visible')) {
            $miniCartDisplay.fadeIn(200);
        }
    }

    function displayMiniCart(cart) {
        const $display = $('.dr-minicart-display');
        const $body = $('<div class="dr-minicart-body"></div>');
        const $footer = $('<div class="dr-minicart-footer"></div>');

        lineItems = (cart.lineItems && cart.lineItems.lineItem) ? cart.lineItems.lineItem : [];

        $('.dr-minicart-count').text(cart.totalItemsInCart);
        $('.dr-minicart-header').siblings().remove();
        if ($('section.dr-login-sections__section.logged-in').length && cart.totalItemsInCart == 0) {
            $('section.dr-login-sections__section.logged-in > div').hide();
        }

        if (!lineItems.length) {
            const emptyMsg = `<p class="dr-minicart-empty-msg">${drgc_params.translations.empty_cart_msg}</p>`;
            $body.append(emptyMsg);
            $display.append($body);
        } else {
            let miniCartLineItems = '<ul class="dr-minicart-list">';
            const miniCartSubtotal = `<p class="dr-minicart-subtotal"><label>${drgc_params.translations.subtotal_label}</label><span>${cart.pricing.formattedSubtotal}</span></p>`;
            const miniCartViewCartBtn = `<a class="dr-btn" id="dr-minicart-view-cart-btn" href="${drgc_params.cartUrl}">${drgc_params.translations.view_cart_label}</a>`;
            const miniCartCheckoutBtn = `<a class="dr-btn" id="dr-minicart-checkout-btn" href="${drgc_params.checkoutUrl}">${drgc_params.translations.checkout_label}</a>`;

            lineItems.forEach((li) => {
                const productId = li.product.uri.replace(`${drService.apiBaseUrl}/me/products/`, '');
                const listPrice = Number(li.pricing.listPriceWithQuantity.value);
                const salePrice = Number(li.pricing.salePriceWithQuantity.value);
                const formattedSalePrice = li.pricing.formattedSalePriceWithQuantity;
                let priceContent = '';

                if (listPrice > salePrice) {
                    priceContent = `<del class="dr-strike-price">${listPrice}</del><span class="dr-sale-price">${formattedSalePrice}</span>`;
                } else {
                    priceContent = formattedSalePrice;
                }

                const miniCartLineItem = `
                <li class="dr-minicart-item clearfix">
                    <div class="dr-minicart-item-thumbnail">
                        <img src="${li.product.thumbnailImage}" alt="${li.product.displayName}" />
                    </div>
                    <div class="dr-minicart-item-info" data-product-id="${productId}">
                        <span class="dr-minicart-item-title">${li.product.displayName}</span>
                        <span class="dr-minicart-item-qty">${drgc_params.translations.qty_label}.${li.quantity}</span>
                        <p class="dr-pd-price dr-minicart-item-price">${priceContent}</p>
                    </div>
                    <a href="#" class="dr-minicart-item-remove-btn" aria-label="Remove" data-line-item-id="${li.id}">${drgc_params.translations.remove_label}</a>
                </li>`;
                miniCartLineItems += miniCartLineItem;
            });
            miniCartLineItems += '</ul>';
            $body.append(miniCartLineItems, miniCartSubtotal);
            $footer.append(miniCartViewCartBtn, miniCartCheckoutBtn);
            $display.append($body, $footer);
        }
    }

    function errorCallback(jqXHR) {
        console.log('errorStatus', jqXHR.status);
    }

    (function() {
        if ( $('#dr-minicart'.length)) {
            displayMiniCart(drgc_params.cart.cart);
        }
    }());

    $('.dr-minicart-toggle, .dr-minicart-close-btn').click((e) => {
        e.preventDefault();
        toggleMiniCartDisplay();
    });

    $('body').on('click', '.dr-buy-btn', (e) => {
        e.preventDefault();
        let quantity = 1;
        var $this = $(e.target);

        var productID = $this.attr('data-product-id') ? $this.attr('data-product-id').toString() : '';

        var existingProducts = lineItems.map((li) => {
            var { uri } = li.product;
            var id = uri.replace(`${drService.apiBaseUrl}/me/products/`, '');
            return {
                id,
                quantity: li.quantity
            };
        });

        // PD page
        if ($('#dr-pd-offers').length) {
            quantity = parseInt($('#dr-pd-qty').val(), 10);
        }

        existingProducts.forEach((pd) => {
            if (pd.id === productID) {
                quantity += pd.quantity;
            }
        });

        drService.updateCart(productID, quantity)
            .then(cart => displayMiniCart(cart))
            .catch(jqXHR => errorCallback(jqXHR));
    });

    $('.dr-minicart-display').on('click', '.dr-minicart-item-remove-btn', (e) => {
        e.preventDefault();
        const lineItemID = $(e.target).data('line-item-id');

        drService.removeLineItem(lineItemID)
            .then(() => drService.getCart())
            .then(cart => displayMiniCart(cart))
            .catch(jqXHR => errorCallback(jqXHR));
    });

    $('span.dr-pd-qty-plus, span.dr-pd-qty-minus').on('click', (e) => {
        // Get current quantity values
        const $qty = $('#dr-pd-qty');
        const val = parseInt($qty.val(), 10);
        const max = parseInt($qty.attr('max'), 10);
        const min = parseInt($qty.attr('min'), 10);
        const step = parseInt($qty.attr('step'), 10);
        if (val) {
            // Change the value if plus or minus
            if ($(e.currentTarget).is('.dr-pd-qty-plus')) {
                if (max && (max <= val)) {
                    $qty.val(max);
                } else {
                    $qty.val(val + step);
                }
            } else if ($(e.currentTarget).is('.dr-pd-qty-minus')) {
                if (min && (min >= val)) {
                    $qty.val(min);
                } else if (val > 1) {
                    $qty.val(val - step);
                }
            }
        } else {
            $qty.val('1');
        }
    });

    $('.dr_prod-variations select').on('change', function(e) {
        e.preventDefault();

        var varId = $(this).val();
        var price = $(this).children('option:selected').data('price');
        var listPriceValue = $(this).children('option:selected').data('old-price');
        var $prodPrice = $('.single-dr_product .dr-pd-content .dr-pd-price');
        var $buyBtn = $('.dr-buy-btn');
        var prodPriceHtml = '';
        $buyBtn.attr('data-product-id', varId);
        if (listPriceValue) prodPriceHtml = '<del class="dr-strike-price">' + listPriceValue + '</del>';
        prodPriceHtml += '<strong class="dr-sale-price">' + price + '</strong>';
        $prodPrice.html(prodPriceHtml);
    });

    $( "iframe[name^='controller-']" ).css('display', 'none');

    // Real-time pricing option (for DR child/non-DR child themes)
    let pdPriceOption = {};
    let isPdCard = false;
    if ($('#digital-river-child-css').length) { // DR child theme
        pdPriceOption = {
            $card: $('.c-product-card'),
            $variationOption: $('input[type=radio][name=variation]'),
            priceDivSelector: () => { return isPdCard ? '.c-product-card__bottom__price' : '.product-pricing'; },
            listPriceDiv: 'span',
            listPriceClass: () => { return isPdCard ? 'old-price' : 'product-price-old'; },
            salePriceDiv: 'span',
            salePriceClass: () => { return isPdCard ? 'new-price' : 'product-price'; },
            priceDiv: 'span',
            priceClass: () => { return isPdCard ? 'price' : 'product-price'; }
        };
    } else { // non-DR child theme
        pdPriceOption = {
            $card: $('.dr-pd-item'),
            $variationOption: $('select[name=dr-variation] option'),
            priceDivSelector: () => { return isPdCard ? '.dr-pd-item-price' : '.dr-pd-price'; },
            listPriceDiv: 'del',
            listPriceClass: () => { return 'dr-strike-price'; },
            salePriceDiv: 'strong',
            salePriceClass: () => { return 'dr-sale-price'; },
            priceDiv: 'strong',
            priceClass: () => { return 'dr-sale-price'; }
        };
    }

    // Real-time pricing for single PD page (including variation/base products)
    if ($('.single-dr_product').length) {
        isPdCard = false;
        if (pdPriceOption.$variationOption && pdPriceOption.$variationOption.length) { // variation product
            pdPriceOption.$variationOption.each((idx, elem) => {
                const $target = $(elem);
                const productID = $target.val();
                $(pdPriceOption.priceDivSelector()).text(drgc_params.translations.loading_msg);

                if (!productID) return;
                DRCommerceModule.getProductPricing(productID).then((productPricing) => {
                    isPdCard = false; // to avoid being overwritten by concurrency
                    PdpModule.fetchVariationPrice($, productPricing.pricing, $target, idx);
                });
            });
        } else { // base product
            const productID = $('.dr-buy-btn').data('product-id');
            const $target = $(pdPriceOption.priceDivSelector()).text(drgc_params.translations.loading_msg);

            if (!productID) return;
            DRCommerceModule.getProductPricing(productID).then((productPricing) => {
                isPdCard = false; // to avoid being overwritten by concurrency
                PdpModule.displayRealTimePricing($, productPricing.pricing, pdPriceOption, $target);
            });
        }
    }

    // Real-time pricing for PD card (category page & recommended products)
    if (pdPriceOption.$card && pdPriceOption.$card.length) {
        isPdCard = true;
        pdPriceOption.$card.each((idx, elem) => {
            const productID = $(elem).find('.dr-buy-btn').data('product-id');
            const $target = $(elem).find(pdPriceOption.priceDivSelector()).text(drgc_params.translations.loading_msg);

            if (!productID) return;
            DRCommerceModule.getProductPricing(productID).then((productPricing) => {
                isPdCard = true; // to avoid being overwritten by concurrency
                PdpModule.displayRealTimePricing($, productPricing.pricing, pdPriceOption, $target);
            });
        });
    }
});

export default PdpModule;
