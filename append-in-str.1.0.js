(function($) {
    $.fn.append_in_str = function(origStr, appendStr, position, maxLength) {
        position || (position = null);
        maxLength || (maxLength = null);
        // if origStr is already past maxLength, do nothing;

        if (maxLength != null && origStr.length > maxLength) {
            return origStr;
        }
        //trim append Str as needed.
        if (maxLength != null && (origStr + appendStr).length > maxLength) {
            appendStr = appendStr.substr(0, (appendStr.length-1) - ((origStr + appendStr).length - maxLength));
        }
        //Simple case, no injection
        if (position == null) {
            return origStr + appendStr;
        }

        var part1 = origStr.substr(0, position);
        var part2 = origStr.substr(position, origStr.length);
        return (part1 + appendStr + part2);
    }
})(jQuery);

