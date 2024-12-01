const { URL } = require('url');  // Sử dụng built-in URL module để xử lý và kiểm tra URL
const logger = require('../utils/logger');  // Sử dụng logger để ghi log các sự kiện
const validUrl = require('valid-url');  // Thư viện để kiểm tra URL hợp lệ (có thể thay thế bằng Regex nếu cần)

class UrlValidator {
    constructor() {
        this.visitedUrls = new Set();  // Set lưu các URL đã truy cập để tránh việc crawl lại
    }

    // Kiểm tra định dạng của URL có hợp lệ không
    isValidUrl(url) {
        // Kiểm tra định dạng URL hợp lệ bằng cách sử dụng valid-url
        return validUrl.isWebUri(url);
    }

    // Chuẩn hóa URL, nếu thiếu protocol (https://) thì thêm vào
    normalizeUrl(url) {
        try {
            // Sử dụng URL API để chuẩn hóa
            let normalizedUrl = new URL(url);

            // Nếu URL thiếu http/https, thêm https:// vào mặc định
            if (!normalizedUrl.protocol) {
                normalizedUrl = new URL('https://' + url);
            }

            return normalizedUrl.toString();
        } catch (error) {
            logger.error('Error normalizing URL:', error);
            return null;
        }
    }

    // Kiểm tra nếu URL đã được crawl trước đó hay chưa
    isUrlVisited(url) {
        return this.visitedUrls.has(url);
    }

    // Thêm URL vào danh sách đã visit
    markUrlAsVisited(url) {
        this.visitedUrls.add(url);
    }

    // Xử lý URL: kiểm tra tính hợp lệ và chuẩn hóa
    async processUrl(url) {
        if (!url) {
            logger.warn('Empty URL provided.');
            return null;
        }

        // Kiểm tra xem URL có hợp lệ không
        if (!this.isValidUrl(url)) {
            logger.warn(`Invalid URL format: ${url}`);
            return null;
        }

        // Chuẩn hóa URL
        const normalizedUrl = this.normalizeUrl(url);
        if (!normalizedUrl) {
            logger.warn(`URL normalization failed: ${url}`);
            return null;
        }

        // Kiểm tra xem URL đã được crawl chưa
        if (this.isUrlVisited(normalizedUrl)) {
            logger.warn(`URL already visited: ${normalizedUrl}`);
            return null;
        }

        // Đánh dấu URL là đã crawl
        this.markUrlAsVisited(normalizedUrl);
        logger.info(`URL is valid and normalized: ${normalizedUrl}`);

        return normalizedUrl;
    }
}

module.exports = new UrlValidator();
