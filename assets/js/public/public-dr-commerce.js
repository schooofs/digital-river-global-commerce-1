const $ = global.jQuery;

const DRCommerceModule = {
	apiBaseUrl: `https://${drgc_params.domain}/v1/shoppers`,

	getProductPricing(productID) {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: 'GET',
        headers: {
          Authorization: `Bearer ${drgc_params.accessToken}`,
        },
        url: `${this.apiBaseUrl}/me/products/${productID}/pricing?format=json`,
        success: (data) => {
          resolve(data);
          console.log('getProductPricing', data);
        },
        error: (jqXHR) => {
          reject(jqXHR);
        }
      });
    });
  }
};

export default DRCommerceModule;
