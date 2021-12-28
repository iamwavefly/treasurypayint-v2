(function ($) {
  //Declare our function
  $.fn.validatePin = function (options) {
    var defaults = {
      //Default Settings
      numericKeyboardOnMobile: false,
      blurOnSuccess: false,

      //Declaring our callback functions
      onSuccess: function () {},
      onFailure: function () {},
    };

    var settings = $.extend({}, defaults, options);

    //Cache the DOM into a jquery object so that repetitive scanning of DOM won't be necessary
    var $wrapper = $(this),
      $el = $wrapper.find('[data-role="pin"]'),
      $elCount = $wrapper.find('[data-role="pin"]').length;
    pin = "";

    $el.each(function () {
      pin += ".";
    });

    //Event Initializations
    bindEvents();

    //Function Declarations
    function bindEvents() {
      $($el).on("focus", function () {
        selectText(this);
      });

      if (checkForMobileDevices()) {
        $($el).on("keyup", function (e) {
          var $that = this;
          validateUserInput(e, $that, "keypress");
        });
      } else {
        $($el).on("keypress", function (e) {
          var $that = this;
          setTimeout(function () {
            validateUserInput(e, $that, "keypress");
          }, 0);
        });
      }
      $($el).on("keydown", function (e) {
        var $that = this;
        setTimeout(function () {
          validateUserInput(e, $that, "keydown");
        }, 0);
      });
    }

    //Select the text in an input field
    function selectText(obj) {
      var value = $(obj).val();
      if (!checkForMobileDevices() && $.trim(value) != "") {
        $(obj).select();
      }
    }

    //Validate User Input
    function validateUserInput(e, obj, event) {
      var keycode = e.charCode || e.keyCode || e.which;
      var prevInput = $(obj).prev('[data-role="pin"]'),
        nextInput = $(obj).next('[data-role="pin"]'),
        index = $(obj).index(),
        value = $(obj).val(),
        empty;

      if (event == "keydown") {
        //Case - User Hits Left Arrow
        if (keycode === 37) {
          $(prevInput).focus();
          selectText(prevInput);
        } else if (keycode === 39) {
          //Case - User Hits Right Arrow
          $(nextInput).focus();
          selectText(nextInput);
        }

        if ($.trim(value) == "") {
          if (keycode === 8) {
            $(prevInput).focus();
            settings.onFailure.call(this);
          }
        } else {
          return false;
        }
      }

      if (event == "keypress") {
        if (keycode == 0) {
          return false;
        }

        //Case - User Enters an alphabet or a special character
        if (
          (keycode >= 65 && keycode <= 90) ||
          (keycode >= 186 && keycode <= 222)
        ) {
          e.preventDefault();
        }

        //Case - User enters a number from the main keypad or the numpad
        if (
          (keycode >= 48 && keycode <= 57) ||
          (keycode >= 96 && keycode <= 105)
        ) {
          pin = $.trim(pin.replace(/\s/g, ""));
          pin = pin.split("");
          pin[index] = value;
          pin = pin.join("");

          $(nextInput).focus();

          if (!checkForMobileDevices()) {
            setTimeout(function () {
              $(obj).val("•");
            }, 200);
          } else {
            $(obj).val("•");
          }
        }

        var empty = $($el).filter(function () {
          return this.value === "";
        });

        if (empty.length) {
          settings.onFailure.call(this);
        } else {
          settings.onSuccess.call(this);
          //Check if the user wants to move the focus out of the inputs on success
          if (settings.blurOnSuccess) {
            $($el).blur();
          }
        }
      }

      //Check if default settings have been overrided by the user

      //Prompts a numberic keyboard on mobile
    }

    function checkForMobileDevices() {
      if (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      ) {
        return true;
      } else {
        return false;
      }
    }

    if (settings.numericKeyboardOnMobile) {
      if (checkForMobileDevices()) {
        $el.prop("type", "tel");
      }
    }
  };
})(jQuery);

$(document).ready(function () {
  $(".pin-wrapper").validatePin({
    numericKeyboardOnMobile: true,
    blurOnSuccess: true,
    onSuccess: function () {
      // $(".pin").html(pin);
      verifyPasscode(pin);
    },
    onFailure: function () {
      $(".pin").html("");
    },
  });
});
