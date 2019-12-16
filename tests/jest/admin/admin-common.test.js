import CommonModule from '../../../assets/js/admin/admin-common';

describe('Test init', () => {
  test('It should call tippy 3 times for rendering tooltips', () => {
    global.tippy = jest.fn();
    CommonModule.init();
    expect(tippy).toHaveBeenCalledTimes(3);
  });
});
