// src/core/crawler.js

const urlValidator = require('../utils/url-validator');
const rateLimiter = require('../services/rate-limiter');
const proxyManager = require('../services/proxy-manager');
const authentication = require('../services/authentication');
const logger = require('../utils/logger');
const sanitizer = require('../utils/sanitizer');
const queueManager = require('./queue-manager');
const storage = require('./storage');
const processorWorker = require('../workers/processor-worker');

const Crawler = {
  async crawlUrl(url) {
    try {
      // Kiểm tra tính hợp lệ của URL
      if (!urlValidator.isValid(url)) {
        logger.log(`Invalid URL: ${url}`);
        return;
      }
      
      // Kiểm tra và thực hiện xác thực (nếu cần)
      const authResult = await authentication.authenticate(url);
      if (!authResult.success) {
        logger.log(`Authentication failed for URL: ${url}`);
        return;
      }

      // Kiểm tra rate limit trước khi gửi yêu cầu
      await rateLimiter.limitRequest(url);

      // Lấy proxy (nếu cần thiết)
      const proxy = await proxyManager.getProxy();
      const response = await this.fetchData(url, proxy);

      // Làm sạch dữ liệu thu thập được
      const sanitizedData = sanitizer.clean(response.data);

      // Xử lý dữ liệu nếu cần
      await processorWorker.processData(sanitizedData);

      // Lưu trữ dữ liệu đã xử lý
      await storage.save(sanitizedData);
      
      logger.log(`Successfully crawled and saved data for URL: ${url}`);
      
    } catch (error) {
      logger.log(`Error crawling URL ${url}: ${error.message}`);
    }
  },

  async fetchData(url, proxy) {
    // Giả sử sử dụng thư viện 'axios' để gửi yêu cầu HTTP
    const axios = require('axios');
    try {
      const response = await axios.get(url, {
        proxy: {
          host: proxy.host,
          port: proxy.port,
        },
      });
      return response;
    } catch (error) {
      logger.log(`Failed to fetch data from ${url}: ${error.message}`);
      throw error;
    }
  },

  async startCrawling() {
    // Lấy URL từ hàng đợi và bắt đầu crawl
    const url = await queueManager.getNextUrl();
    if (url) {
      await this.crawlUrl(url);
      this.startCrawling(); // Tiếp tục với URL tiếp theo
    }
  },
};

module.exports = Crawler;
