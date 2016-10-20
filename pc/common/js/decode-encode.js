module.exports = {
    htmlEncode: function(str) {
        if (!str || !str.length) {
            return str;
        }

        return str
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/ /g, "&nbsp;")
            .replace(/\'/g, "&#39;")
            .replace(/\"/g, "&quot;")
            .replace(/\n/g, "<br>");
    },

    htmlDecode: function(str) {
        if (!str || !str.length) {
            return str;
        }

        return str
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&nbsp;/g, " ")
            .replace(/&#39;/g, "\'")
            .replace(/&quot;/g, "\"")
            .replace(/<br>/g, "\n")
            .replace(/&amp;/g, '&');
    }
};
