//=============================================================================
// DisableContinue.js
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Force the Continue command on the Title Screen to always be disabled (for exhibition/demo builds).
 * @author You
 *
 * @help
 * =============================================================================
 * Disable Continue (Exhibition Mode)
 * =============================================================================
 * Makes the "Continue" command on the title screen always appear disabled,
 * regardless of whether save files exist. Prevents visitors from
 * accidentally continuing into someone else's save data.
 *
 * Works together with MOG_TitleCommands.js - place this plugin BELOW
 * MOG_TitleCommands.js in the Plugin Manager list.
 *
 * No plugin commands. No parameters. Just enable it.
 * =============================================================================
 */

(() => {
    Window_TitleCommand.prototype.isContinueEnabled = function() {
        return false;
    };
})();
