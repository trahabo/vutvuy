const sanitizeHtml = require('sanitize-html');
const validator = require('validator');
const logger = require('./logger'); // Ghi log khi cần thiết

class Sanitizer {
    constructor() {
        // Cấu hình cho sanitize HTML
        this.sanitizeOptions = {
            allowedTags: [ 'b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'br' ],
            allowedAttributes: {
                'a': [ 'href' ]
            }
        };
    }

    // Làm sạch dữ liệu HTML
    sanitizeHtmlData(html) {
        try {
            const cleanedHtml = sanitizeHtml(html, this.sanitizeOptions);
            logger.info('HTML sanitized successfully.');
            return cleanedHtml;
        } catch (error) {
            logger.error(`HTML sanitization failed: ${error.message}`);
            return '';
        }
    }

    // Làm sạch văn bản
    sanitizeTextData(text) {
        try {
            // Loại bỏ các ký tự không hợp lệ (ví dụ: mã script, HTML tags)
            const sanitizedText = text.replace(/[^\x00-\x7F]/g, ""); // Giữ lại các ký tự ASCII hợp lệ
            logger.info('Text sanitized successfully.');
            return sanitizedText;
        } catch (error) {
            logger.error(`Text sanitization failed: ${error.message}`);
            return '';
        }
    }

    // Làm sạch URL (kiểm tra hợp lệ, chuẩn hóa)
    sanitizeUrl(url) {
        try {
            // Kiểm tra xem URL có hợp lệ không
            if (validator.isURL(url, { require_protocol: true })) {
                const sanitizedUrl = validator.escape(url); // Mã hóa URL để loại bỏ các ký tự nguy hiểm
                logger.info('URL sanitized successfully.');
                return sanitizedUrl;
            } else {
                logger.warn(`Invalid URL: ${url}`);
                return null;
            }
        } catch (error) {
            logger.error(`URL sanitization failed: ${error.message}`);
            return null;
        }
    }

    // Làm sạch toàn bộ dữ liệu
    sanitizeData(data) {
        if (typeof data === 'string') {
            // Kiểm tra nếu là HTML
            if (data.includes('<') && data.includes('>')) {
                return this.sanitizeHtmlData(data);
            }
            // Nếu là văn bản
            return this.sanitizeTextData(data);
        }
        return null;
    }
}

module.exports = Sanitizer;
