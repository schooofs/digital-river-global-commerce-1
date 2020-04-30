import FloatLabel from './float-label'; // 3rd-party plugin
import CheckoutUtils from './checkout-utils';
import DRGooglePay from './payment-googlepay';
import DRApplePay from './payment-applepay';

const CheckoutModule = (($) => {
    const initPreTAndC = () => {
        $('#dr-preTAndC').change((e) => {
            if ($(e.target).is(':checked')) {
                $('#dr-preTAndC-err-msg').text('').hide();
                $('.dr-cloudpay-btn').css({ 'pointer-events': 'auto' });
            } else {
                $('.dr-cloudpay-btn').css({ 'pointer-events': 'none' });
            }
        });

        $('.dr-cloudpay-btn-wrapper').click(() => {
            if (!$('#dr-preTAndC').is(':checked')) {
                $('#dr-preTAndC-err-msg').text(drgc_params.translations.required_tandc_msg).show();
            }
        });

        $('#dr-preTAndC').trigger('change');
    };

    const shouldDisplayVat = () => {
        const currency = $('.dr-currency-select').val();
        return (currency === 'GBP' || currency === 'EUR');
    };

    const updateSummaryLabels = () => {
        if ($('.dr-checkout__payment').hasClass('active') || $('.dr-checkout__confirmation').hasClass('active')) {
            $('.dr-summary__tax .item-label').text(shouldDisplayVat() ?
                drgc_params.translations.vat_label :
                drgc_params.translations.tax_label
            );
            $('.dr-summary__shipping .item-label').text(drgc_params.translations.shipping_label);
        } else {
            $('.dr-summary__tax .item-label').text(shouldDisplayVat() ?
                drgc_params.translations.estimated_vat_label :
                drgc_params.translations.estimated_tax_label
            );
            $('.dr-summary__shipping .item-label').text(drgc_params.translations.estimated_shipping_label);
        }
    };

    const getCountryOptionsFromGC = () => {
        const selectedLocale = $('.dr-currency-select option:selected').data('locale') || drgc_params.drLocale;
        return new Promise((resolve, reject) => {
            $.ajax({
                type: 'GET',
                url: `https://drh-fonts.img.digitalrivercontent.net/store/${drgc_params.siteID}/${selectedLocale}/DisplayPage/id.SimpleRegistrationPage`,
                success: (response) => {
                    const addressTypes = drgc_params.cart.cart.hasPhysicalProduct ? ['shipping', 'billing'] : ['billing'];
                    addressTypes.forEach((type) => {
                        const savedCountryCode = $(`#${type}-field-country`).val();
                        const $options = $(response).find(`select[name=${type.toUpperCase()}country] option`).not(':first');
                        const optionArr = $.map($options, (option) => { return option.value; });
                        $(`#${type}-field-country option`).not(':first').remove();
                        $(`#${type}-field-country`)
                            .append($options)
                            .val(savedCountryCode.indexOf(optionArr) > -1 ? savedCountryCode : '');
                    });
                    resolve();
                },
                error: (jqXHR) => {
                    reject(jqXHR);
                }
            });
        });
    };

    return {
        initPreTAndC,
        updateSummaryLabels,
        getCountryOptionsFromGC
    };
})(jQuery);

jQuery(document).ready(($) => {
    if ($('#checkout-payment-form').length) {
        const domain = drgc_params.domain;
        const isLogin = drgc_params.isLogin;
        const apiBaseUrl = 'https://' + domain + '/v1/shoppers';
        const drLocale = drgc_params.drLocale || 'en_US';
        let cartData = drgc_params.cart.cart;
        const requestShipping = (cartData.shippingOptions.shippingOption) ? true : false;
        const isGooglePayEnabled = drgc_params.isGooglePayEnabled === 'true';
        const isApplePayEnabled = drgc_params.isApplePayEnabled === 'true';

        function getAddress(addressType) {
            const address = {
            address: {
                nickName: $('#'+ addressType +'-field-address1').val(),
                firstName: $('#'+ addressType +'-field-first-name').val(),
                lastName: $('#'+ addressType +'-field-last-name').val(),
                line1: $('#'+ addressType +'-field-address1').val(),
                line2: $('#'+ addressType +'-field-address2').val(),
                city: $('#'+ addressType +'-field-city').val(),
                countrySubdivision: $('#'+ addressType +'-field-state').val(),
                postalCode: $('#'+ addressType +'-field-zip').val(),
                countryName: $('#'+ addressType +'-field-country :selected').text(),
                country: $('#'+ addressType +'-field-country :selected').val(),
                phoneNumber: $('#'+ addressType +'-field-phone').val()
            }
            };
            return address;
        }

        function saveShippingAddress() {
            var address = getAddress('shipping');
            address.address.isDefault = true;
            saveShopperAddress(JSON.stringify(address))
        }

        function saveBillingAddress() {
            var address = getAddress('billing');
            address.address.isDefault = false;
            saveShopperAddress(JSON.stringify(address))
        }

        function saveShopperAddress(address) {
            $.ajax({
                type: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${drgc_params.accessToken}`
                },
                data: address,
                url: `${apiBaseUrl}/me/addresses`,
                success: () => {
                    console.log('address update success.');
                },
                error: (jqXHR) => {
                    console.log(jqXHR);
                }
            });
        }

        //floating labels
        FloatLabel.init();

        // Globals
        var digitalriverjs = new DigitalRiver(drgc_params.digitalRiverKey);
        var payload  = { shipping: {}, billing: {} };
        var paymentPayload = {};
        var paymentSourceId = null;

        // Section progress
        let finishedSectionIdx = -1;

        // Submit first (email) form
        var emailPayload;

        if (cartData.totalItemsInCart) {
            CheckoutModule.getCountryOptionsFromGC().then(() => {
                $('#shipping-field-country, #billing-field-country').trigger('change');
            });
        }
        CheckoutUtils.applyLegalLinks(digitalriverjs);
        CheckoutModule.initPreTAndC();

        // Create elements through DR.js
        if ($('.credit-card-section').length) {
            const options = {
                classes: {
                    base: 'DRElement',
                    complete: 'DRElement--complete',
                    empty: 'DRElement--empty',
                    invalid: 'DRElement--invalid'
                },
                style: {
                    base: getStyleOptionsFromClass('DRElement'),
                    complete: getStyleOptionsFromClass('DRElement--complete'),
                    empty: getStyleOptionsFromClass('DRElement--empty'),
                    invalid: getStyleOptionsFromClass('DRElement--invalid')
                }
            };

            var cardNumber = digitalriverjs.createElement('cardnumber', options);
            var cardExpiration = digitalriverjs.createElement('cardexpiration', Object.assign({}, options, { placeholderText: 'MM/YY' }));
            var cardCVV = digitalriverjs.createElement('cardcvv', Object.assign({}, options, { placeholderText: 'CVV' }));

            cardNumber.mount('card-number');
            cardExpiration.mount('card-expiration');
            cardCVV.mount('card-cvv');

            cardNumber.on('change', function(evt) {
                activeCardLogo(evt);
                displayDRElementError(evt, $('#card-number-error'));
            });
            cardExpiration.on('change', function(evt) {
                displayDRElementError(evt, $('#card-expiration-error'));
            });
            cardCVV.on('change', function(evt) {
                displayDRElementError(evt, $('#card-cvv-error'));
            });

            function getStyleOptionsFromClass(className) {
                const tempDiv = document.createElement('div');
                tempDiv.setAttribute('id', 'tempDiv' + className);
                tempDiv.className = className;
                document.body.appendChild(tempDiv);
                const tempDivEl = document.getElementById('tempDiv' + className);
                const tempStyle = window.getComputedStyle(tempDivEl);

                const styles = {
                    color: tempStyle.color,
                    fontFamily: tempStyle.fontFamily.replace(new RegExp('"', 'g'), ''),
                    fontSize: tempStyle.fontSize,
                    height: tempStyle.height
                };
                document.body.removeChild(tempDivEl);

                return styles;
            }

            function activeCardLogo(evt) {
                $('.cards .active').removeClass('active');
                if (evt.brand && evt.brand !== 'unknown') {
                    $(`.cards .${evt.brand}-icon`).addClass('active');
                }
            }

            function displayDRElementError(evt, $target) {
                if (evt.error) {
                    $target.text(evt.error.message).show();
                } else {
                    $target.text('').hide();
                }
            }
        }

        function prepareAddress($form) {
            const addressType = ($form.attr('id') === 'checkout-shipping-form') ? 'shipping' : 'billing';

            // Validate form
            $form.addClass('was-validated');
            $form.find('.dr-err-field').hide();
            const validateItems = document.querySelectorAll(`[name^=${addressType}-]`);
            for (let i = 0, len = validateItems.length; i < len; i++) {
                if ($(validateItems[i]).is(':visible') && validateItems[i].checkValidity() === false) {
                    return false;
                }
            }

            // Build payload
            $.each($form.serializeArray(), function(index, obj) {
                const key = obj.name.split('-')[1];
                payload[addressType][key] = obj.value;
            });
            payload[addressType].emailAddress = emailPayload;
            if (payload[addressType].country !== 'US') {
                payload[addressType].countrySubdivision = '';
            }
            return true;
        }

        function updateCart(queryParams = {}, cartRequest = {}) {
            const queryStr = $.param(queryParams);
            return new Promise((resolve, reject) => {
                $.ajax({
                    type: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type':'application/json',
                        Authorization: `Bearer ${drgc_params.accessToken}`
                    },
                    url: `${apiBaseUrl}/me/carts/active?${queryStr}`,
                    data: JSON.stringify({
                        cart: cartRequest
                    })
                })
                .done((data) => {
                    resolve(data);
                })
                .fail((jqXHR) => {
                    reject(jqXHR);
                });
            });
        }

        function displaySavedAddress(addressObj, $target) {
            const addressArr = [
                `${addressObj.firstName} ${addressObj.lastName}`,
                addressObj.line1,
                addressObj.city,
                addressObj.country
            ];
            $target.text(addressArr.join(', '));
        }

        function displayAddressErrMsg(jqXHR, $target) {
            if (jqXHR.status === 409) {
                if (jqXHR.responseJSON.errors.error[0].code === 'restricted-bill-to-country') {
                    $target.text(drgc_params.translations.address_error_msg).show();
                } else if (jqXHR.responseJSON.errors.error[0].code === 'restricted-ship-to-country') {
                    $target.text(drgc_params.translations.address_error_msg).show();
                } else {
                    $target.text(drgc_params.translations.undefined_error_msg).show();
                }
            } else {
                $target.text(jqXHR.responseJSON.errors.error[0].description).show();
            }
        }

        function moveToNextSection($section) {
            const $prevSection = $section.prev();
            const $nextSection = $section.next();

            if ($('.dr-checkout__el').index($section) > finishedSectionIdx) {
                finishedSectionIdx = $('.dr-checkout__el').index($section);
            }

            $section.removeClass('active').addClass('closed');
            $nextSection.addClass('active').removeClass('closed');

            if ($nextSection.hasClass('small-closed-left')) {
                $nextSection.removeClass('small-closed-left');
                $nextSection.next().removeClass('small-closed-right');
            }

            adjustColumns($section);
            CheckoutModule.updateSummaryLabels();
            $('html, body').animate({
                scrollTop: ($nextSection.first().offset().top - 80)
            }, 500);
        }

        function updateSummaryPricing(cart) {
            const {formattedOrderTotal, formattedTax} = cart.pricing;

            if (Object.keys(cart.shippingMethod).length > 0) {
                const formattedShippingAndHandling = (cart.pricing.shippingAndHandling.value === 0) ? drgc_params.translations.free_label : cart.pricing.formattedShippingAndHandling;

                $('div.dr-summary__shipping > .item-value').text(formattedShippingAndHandling);
            }

            $('div.dr-summary__tax > .item-value').text(formattedTax);
            $('div.dr-summary__total > .total-value').text(formattedOrderTotal);
        }

        function adjustColumns($section) {
            const $shippingSection = $('.dr-checkout__shipping');
            const $billingSection = $('.dr-checkout__billing');
            const $paymentSection = $('.dr-checkout__payment');
            const $confirmSection = $('.dr-checkout__confirmation');

            if ($shippingSection.is(':visible') && $shippingSection.hasClass('closed') && $billingSection.hasClass('closed')) {
                $shippingSection.addClass('small-closed-left');
                $billingSection.addClass('small-closed-right');
            } else {
                $shippingSection.removeClass('small-closed-left');
                $billingSection.removeClass('small-closed-right');
            }

            if ($section && $section.hasClass('dr-checkout__payment')) {
                $paymentSection.addClass('small-closed-left');
                $confirmSection.addClass('small-closed-right').removeClass('d-none');
            } else {
                $paymentSection.removeClass('small-closed-left');
                $confirmSection.removeClass('small-closed-right').addClass('d-none');
            }
        }

        $('#checkout-email-form').on('submit', function(e) {
            e.preventDefault();

            // If no items are in cart, do not even continue, maybe give feedback
            if (! drgc_params.cart.cart.lineItems.hasOwnProperty('lineItem')) return;

            const $form = $('#checkout-email-form');
            const email = $form.find('input[name=email]').val().trim();

            $form.addClass('was-validated');

            if ($form[0].checkValidity() === false) {
                return false;
            }

            emailPayload = email;

            const $section = $('.dr-checkout__email');
            $section.find('.dr-panel-result__text').text(emailPayload);
            moveToNextSection($section);
        });

        if ( $('input[name=email]').val() && $('#checkout-email-form').length ){
            $('#checkout-email-form').submit();
        }

        // Submit shipping info form
        $('#checkout-shipping-form').on('submit', function(e) {
            e.preventDefault();

            const $form = $(e.target);
            const $button = $form.find('button[type="submit"]');
            const isFormValid = prepareAddress($form);

            if (!isFormValid) return;

            $button.addClass('sending').blur();
            updateCart({ expand: 'all' }, { shippingAddress: payload.shipping }).then((data) => {
                if (isLogin === 'true') saveShippingAddress();

                return makeSureShippingOptionPreSelected(data);
            }).then((data) => {
                $button.removeClass('sending').blur();
                setShippingOptions(data.cart);

                const $section = $('.dr-checkout__shipping');
                displaySavedAddress(data.cart.shippingAddress, $section.find('.dr-panel-result__text'));
                moveToNextSection($section);
                updateSummaryPricing(data.cart);
            }).catch((jqXHR) => {
                $button.removeClass('sending').blur();
                displayAddressErrMsg(jqXHR, $form.find('.dr-err-field'));
            });
        });

        $('#checkout-billing-form').on('submit', function(e) {
            e.preventDefault();

            const $form = $(e.target);
            const $button = $form.find('button[type="submit"]');
            const billingSameAsShipping = $('[name="checkbox-billing"]').is(':visible:checked');
            const isFormValid = prepareAddress($form);

            if (!isFormValid) return;
            if (billingSameAsShipping) payload.billing = Object.assign({}, payload.shipping);

            $button.addClass('sending').blur();
            updateCart({ expand: 'all' }, { billingAddress: payload.billing }).then((data) => {
                if (isLogin == 'true') {
                    if ((requestShipping && !billingSameAsShipping) || !requestShipping) {
                        saveBillingAddress();
                    }
                }

                // Still needs to apply shipping option once again or the value will be rolled back after updateCart (API's bug)
                return drgc_params.cart.cart.hasPhysicalProduct ?
                    makeSureShippingOptionPreSelected(data) :
                    new Promise(resolve => resolve(data));
            }).then((data) => {
                $button.removeClass('sending').blur();
                setShippingOptions(data.cart);

                const $section = $('.dr-checkout__billing');
                displaySavedAddress(data.cart.billingAddress, $section.find('.dr-panel-result__text'));
                moveToNextSection($section);
                updateSummaryPricing(data.cart);
            }).catch((jqXHR) => {
                $button.removeClass('sending').blur();
                displayAddressErrMsg(jqXHR, $form.find('.dr-err-field'));
            });
        });

        function setShippingOptions(cart) {
            const freeShipping = cart.pricing.shippingAndHandling.value === 0;
            const shippingOptionId = cart.shippingMethod.code;

            $.each(cart.shippingOptions.shippingOption, function( index, option ) {
                if ($('#shipping-option-' + option.id).length) return;

                const html = `
                    <div class="field-radio">
                        <input type="radio"
                            name="selector"
                            id="shipping-option-${option.id}"
                            data-cost="${option.formattedCost}"
                            data-id="${option.id}"
                            data-desc="${option.description}"
                            >
                        <label for="shipping-option-${option.id}">
                            <span>
                                ${option.description}
                            </span>
                            <span class="black">
                                ${freeShipping ? drgc_params.translations.free_label : option.formattedCost}
                            </span>
                        </label>
                    </div>
                `;

                $('form#checkout-delivery-form .dr-panel-edit__el').append(html);
            });

            $('form#checkout-delivery-form').children().find('input:radio[data-id="' + shippingOptionId + '"]').prop("checked", true);
        }

        function applyShippingOption() {
            const shippingOptionId = $('form#checkout-delivery-form').children().find('input:radio:checked').first().data('id');
            applyShippingAndUpdateCart(shippingOptionId);
        }

        // Submit delivery form
        $('form#checkout-delivery-form').on('submit', function(e) {
            e.preventDefault();

            const $form = $(e.target);
            const $input = $(this).children().find('input:radio:checked').first();
            const $button = $(this).find('button[type="submit"]').toggleClass('sending').blur();
            // Validate shipping option
            const data = {
                expand: 'all',
                shippingOptionId: $input.data('id')
            };
            $form.find('.dr-err-field').hide();

            $.ajax({
                type: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${drgc_params.accessToken}`
                },
                url: `${apiBaseUrl}/me/carts/active/apply-shipping-option?${$.param(data)}`,
                success: (data) => {
                    $button.removeClass('sending').blur();

                    const $section = $('.dr-checkout__delivery');
                    const freeShipping = data.cart.pricing.shippingAndHandling.value === 0;
                    const resultText = `${$input.data('desc')} ${freeShipping ? drgc_params.translations.free_label : $input.data('cost')}`;
                    $section.find('.dr-panel-result__text').text(resultText);
                    moveToNextSection($section);
                    updateSummaryPricing(data.cart);
                },
                error: (jqXHR) => {
                    $button.removeClass('sending').blur();
                    displayAddressErrMsg(jqXHR, $form.find('.dr-err-field'));
                }
            });
        });

        $('form#checkout-delivery-form').on('change', 'input[type="radio"]', function() {
            applyShippingOption();
        });

        $('form#checkout-payment-form').on('submit', function(e) {
            e.preventDefault();
            const $form = $('form#checkout-payment-form');
            const $button = $form.find('button[type="submit"]');

            $form.addClass('was-validated');
            if ($form[0].checkValidity() === false) {
                return false;
            }

            const formdata = $(this).serializeArray();
            paymentPayload = {};
            $(formdata).each(function(index, obj){
                paymentPayload[obj.name] = obj.value;
            });

            $('#dr-payment-failed-msg, #dr-checkout-err-field').text('').hide();

            const $section = $('.dr-checkout__payment');

            if (paymentPayload.selector === 'credit-card') {
                const cart = drgc_params.cart.cart;
                const creditCardPayload = {
                    type: 'creditCard',
                    owner: {
                        firstName: payload.billing.firstName,
                        lastName: payload.billing.lastName,
                        email: payload.billing.emailAddress,
                        address: {
                            line1: payload.billing.line1,
                            city: payload.billing.city,
                            state: payload.billing.countrySubdivision,
                            country: payload.billing.country,
                            postalCode: payload.billing.postalCode
                        }
                    },
                    amount: cart.pricing.orderTotal.value,
                    currency: cart.pricing.orderTotal.currency
                };

                $button.addClass('sending').blur();
                digitalriverjs.createSource(cardNumber, creditCardPayload).then(function(result) {
                    $button.removeClass('sending').blur();
                    if (result.error) {
                        if (result.error.state === 'failed') {
                            $('#dr-payment-failed-msg').text(drgc_params.translations.credit_card_error_msg).show();
                        }
                        if (result.error.errors) {
                            $('#dr-payment-failed-msg').text(result.error.errors[0].message).show();
                        }
                    } else {
                        if (result.source.state === 'chargeable') {
                            paymentSourceId = result.source.id;
                            $section.find('.dr-panel-result__text').text(
                                `${drgc_params.translations.credit_card_ending_label} ${result.source.creditCard.lastFourDigits}`
                            );
                            moveToNextSection($section);
                        }
                    }
                });
            }
        });

        $('#checkout-confirmation-form button[type="submit"]').on('click', (e) => {
            e.preventDefault();
            if (!$('#dr-tAndC').prop('checked')) {
                $('#dr-checkout-err-field').text(drgc_params.translations.required_tandc_msg).show();
            } else {
                $('#dr-checkout-err-field').text('').hide();
                $(e.target).toggleClass('sending').blur();
                $('#dr-payment-failed-msg').hide();
                applyPaymentToCart(paymentSourceId);
            }
        });

        function makeSureShippingOptionPreSelected(data) {
            // If default shipping option is not in the list, then pre-select the 1st one
            const defaultShippingOption = data.cart.shippingMethod.code;
            let shippingOptions = data.cart.shippingOptions.shippingOption || [];
            shippingOptions = shippingOptions.map((option) => {
                return option.id;
            });
            if (shippingOptions.length && shippingOptions.indexOf(defaultShippingOption) === -1) {
                return applyShippingAndUpdateCart(shippingOptions[0]);
            } else {
                return new Promise(resolve => resolve(data));
            }
        }

        function applyShippingAndUpdateCart(shippingOptionId) {
            const data = {
                expand: 'all',
                shippingOptionId: shippingOptionId
            };

            return new Promise((resolve, reject) => {
                $.ajax({
                    type: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        Authorization: `Bearer ${drgc_params.accessToken}`
                    },
                    url: `${apiBaseUrl}/me/carts/active/apply-shipping-option?${$.param(data)}`,
                    success: (data) => {
                        updateSummaryPricing(data.cart);
                        resolve(data);
                    },
                    error: (jqXHR) => {
                        reject(jqXHR);
                    }
                });
            });
        }

        // Initial state for payPal
        if ( drgc_params.payPal.sourceId ) {
            $('.dr-checkout').children().addClass('closed');
            $('.dr-checkout').children().removeClass('active');
            $('.dr-checkout__payment').removeClass('closed').addClass('active');

            if (drgc_params.payPal.failure == 'true') {
                // TODO: Display Error on paypal form maybe
            }

            if (drgc_params.payPal.success == 'true') {
                applyPaymentToCart(drgc_params.payPal.sourceId);
            }
        }

        function applyPaymentToCart(id) {
            if (!id) return;

            const data = {
                'paymentMethod': {
                'sourceId': id
                }
            }

            $.ajax({
                type: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${drgc_params.accessToken}`
                },
                url: `${apiBaseUrl}/me/carts/active/apply-payment-method?expand=all`,
                data: JSON.stringify(data),
                success: () => {
                    submitCart();
                },
                error: (jqXHR) => {
                    $('form#checkout-confirmation-form').find('button[type="submit"]').removeClass('sending').blur();
                    $('#dr-checkout-err-field').text(jqXHR.responseJSON.errors.error[0].description).show();
                    $('body').css({'pointer-events': 'auto', 'opacity': 1});
                }
            });
        }

        function submitCart() {
            $.ajax({
                type: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type':'application/json',
                    Authorization: `Bearer ${drgc_params.accessToken}`
                },
                url: `${apiBaseUrl}/me/carts/active/submit-cart?expand=all&ipAddress=${drgc_params.client_ip}`,
                success: (data) => {
                    $('#checkout-confirmation-form input[name="order_id"]').val(data.submitCart.order.id);
                    $('#checkout-confirmation-form').submit();
                },
                error: (jqXHR) => {
                    $('form#checkout-confirmation-form').find('button[type="submit"]').removeClass('sending').blur();
                    $('#dr-checkout-err-field').text(jqXHR.responseJSON.errors.error[0].description).show();
                    $('body').css({'pointer-events': 'auto', 'opacity': 1});
                }
            });
        }

        // check billing info
        $('[name="checkbox-billing"]').on('click', function (ev) {
            const $this = $(this);

            if (!$this.is(':checked')) {
                $('.billing-section').css('display', 'block');
            } else {
                $('.billing-section').css('display', 'none');
            }
        });

        // show and hide sections
        $('.dr-accordion__edit').on('click', function(e) {
            e.preventDefault();

            const $section = $(e.target).parent().parent();
            const $allSections = $section.siblings().andSelf();
            const $finishedSections = $allSections.eq(finishedSectionIdx).prevAll().andSelf();
            const $activeSection = $allSections.filter($('.active'));
            const $nextSection =  $section.next();
            const $prevSection = $section.prev();

            if ($allSections.index($section) > $allSections.index($activeSection)) {
                return;
            }

            $finishedSections.addClass('closed');
            $activeSection.removeClass('active');
            $section.removeClass('closed').addClass('active');

            adjustColumns();
            CheckoutModule.updateSummaryLabels();
        });

        if ($('#radio-credit-card').is(':checked')) {
            $('.credit-card-info').show();
        }

        $('input:radio[name="selector"]').on('change', function() {
            switch ($(this).val()) {
                case 'credit-card':
                    $('#dr-paypal-button').hide();
                    $('.credit-card-info').show();
                    $('#dr-submit-payment').text(drgc_params.translations.pay_with_card_label.toUpperCase()).show();

                    break;
                case 'paypal':
                    $('#dr-submit-payment').hide();
                    $('.credit-card-info').hide();
                    $('#dr-paypal-button').show();
                    $('#dr-submit-payment').text(drgc_params.translations.pay_with_paypal_label.toUpperCase());

                    break;
            }
        });

        $('#shipping-field-country').on('change', function() {
            if ( this.value === 'US' ) {
                $('#shipping-field-state').parent('.form-group').removeClass('d-none');
            } else {
                $('#shipping-field-state').parent('.form-group').addClass('d-none');
            }
        });

        $('#billing-field-country').on('change', function() {
            if ( this.value === 'US' ) {
                $('#billing-field-state').parent('.form-group').removeClass('d-none');
            } else {
                $('#billing-field-state').parent('.form-group').addClass('d-none');
            }
        });

        if ($('#dr-paypal-button').length) {
            // need to get the actual height of the wrapper for rendering the PayPal button
            $('#checkout-payment-form').removeClass('dr-panel-edit').css('visibility', 'hidden');

            paypal.Button.render({
                env: (domain.indexOf('test') === -1) ? 'production' : 'sandbox',
                locale: drLocale,
                style: {
                    label: 'checkout',
                    size: 'responsive',
                    height: 40,
                    color: 'gold',
                    shape: 'rect',
                    layout: 'horizontal',
                    fundingicons: 'false',
                    tagline: 'false'
                },
                onEnter: function() {
                    $('#checkout-payment-form').addClass('dr-panel-edit').css('visibility', 'visible');
                    $('#dr-paypal-button').hide();
                },
                payment: function() {
                    const cart = drgc_params.cart.cart;
                    let payPalItems = [];

                    $.each(cart.lineItems.lineItem, function( index, item ) {
                        payPalItems.push({
                            'name': item.product.name,
                            'quantity': item.quantity,
                            'unitAmount': item.pricing.listPrice.value
                        })
                    });

                    let payPalPayload = {
                        'type': 'payPal',
                        'amount': cart.pricing.orderTotal.value,
                        'currency': 'USD',
                        'payPal': {
                            'returnUrl': window.location.href + '?ppsuccess=true',
                            'cancelUrl': window.location.href + '?ppcancel=true',
                            'items': payPalItems,
                            'taxAmount': cart.pricing.tax.value,
                            'requestShipping': requestShipping
                        }
                    };

                    if (requestShipping) {
                        payPalPayload['shipping'] = {
                            'recipient':  `${cart.shippingAddress.firstName} ${cart.shippingAddress.lastName} `,
                            'phoneNumber':  cart.shippingAddress.phoneNumber,
                            'address': {
                                'line1': cart.shippingAddress.line1,
                                'line2': cart.shippingAddress.line2,
                                'city': cart.shippingAddress.city,
                                'state': cart.shippingAddress.countrySubdivision,
                                'country':  cart.shippingAddress.country,
                                'postalCode': cart.shippingAddress.postalCode
                            }
                        }
                    }

                    return digitalriverjs.createSource(payPalPayload).then(function(result) {
                        if (result.error) {
                            $('#dr-payment-failed-msg').text(result.error.errors[0].message).show();
                        } else {
                            sessionStorage.setItem('paymentSourceId', result.source.id);

                            return result.source.payPal.token;
                        }
                    });
                },
                onAuthorize: function() {
                    const sourceId = sessionStorage.getItem('paymentSourceId');

                    $('body').css({'pointer-events': 'none', 'opacity': 0.5});
                    applyPaymentToCart(sourceId);
                }
            }, '#dr-paypal-button');
        }

        const buttonStyle = {
            buttonType: 'long',
            buttonColor: 'dark',
            buttonLanguage: drLocale.split('_')[0]
        };
        const baseRequest = CheckoutUtils.getBaseRequestData(cartData, requestShipping, buttonStyle);
        const paymentDataRequest = digitalriverjs.paymentRequest(baseRequest);

        if ($('#dr-googlepay-button').length && isGooglePayEnabled) {
            DRGooglePay.init({
                digitalriverJs: digitalriverjs,
                paymentDataRequest: paymentDataRequest,
                requestShipping: requestShipping
            });
        }

        if ($('#dr-applepay-button').length && isApplePayEnabled) {
            DRApplePay.init({
                digitalriverJs: digitalriverjs,
                paymentDataRequest: paymentDataRequest,
                requestShipping: requestShipping
            });
        }
    }
});

export default CheckoutModule;
