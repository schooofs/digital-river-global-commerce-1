const CommonModule = (($) => {
  const init = () => {
    tippy('#drgc_api_key');
    tippy('#drgc_api_secret');
    tippy('#drgc_digitalRiver_key');
  };

  return {
    init
  }
})(jQuery);

jQuery(document).ready(($) => {
  CommonModule.init();
});

export default CommonModule;
