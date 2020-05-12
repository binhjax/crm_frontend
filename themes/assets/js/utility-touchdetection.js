function is_touch_device() {
  return 'ontouchstart' in window // works on most browsers
      || 'onmsgesturechange' in window; // works on ie10
};
function assignTouchClass() {
    if(is_touch_device()){
        document.body.className = document.body.className + " touch";
		SUGAR.dom.extNode(window).on('page-init', function() {
			SUGAR.dom.extNode(document).find('input.tab-nav-sub-visibility-storage').prop('checked', false);
		});
	}
};
SUGAR.onDomReady(assignTouchClass);
