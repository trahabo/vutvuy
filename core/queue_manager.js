// src/core/queue-manager.js

const urlValidator = require('../utils/url-validator');
const logger = require('../utils/logger');
const storage = require('./storage'); // Để lưu trạng thái URL đã được crawl
const Crawler = require('./crawler'); // Crawler chính để bắt đầu crawl URL

// Dữ liệu mẫu cho hàng đợi (thực tế có thể là cơ sở dữ liệu, Redis, hoặc message queue)
let queue = [];

// Queue Manager
const QueueManager = {
  // Lấy URL tiếp theo từ hàng đợi
  async getNextUrl() {
    // Lấy URL đầu tiên trong hàng đợi, nếu có
    const url = queue.find((item) => item.status === 'pending');
    if (!url) {
      logger.log('No pending URLs in the queue');
      return null;
    }
    
    // Cập nhật trạng thái của URL thành "in-progress"
    url.status = 'in-progress';
    await storage.updateUrlStatus(url.url, 'in-progress');
    logger.log(`Crawling URL: ${url.url}`);

    return url.url;
  },

  // Thêm URL vào hàng đợi
  async addUrl(url) {
    if (!urlValidator.isValid(url)) {
      logger.log(`Invalid URL: ${url}`);
      return;
    }

    // Kiểm tra nếu URL đã có trong hàng đợi
    if (queue.some(item => item.url === url)) {
      logger.log(`URL already in queue: ${url}`);
      return;
    }

    // Thêm URL vào hàng đợi với trạng thái "pending"
    queue.push({
      url,
      status: 'pending',
      createdAt: new Date(),
    });

    // Lưu URL vào cơ sở dữ liệu hoặc nơi lưu trữ
    await storage.saveUrl({ url, status: 'pending', createdAt: new Date() });
    logger.log(`Added URL to queue: ${url}`);
  },

  // Cập nhật trạng thái của URL
  async updateUrlStatus(url, status) {
    const urlItem = queue.find(item => item.url === url);
    if (urlItem) {
      urlItem.status = status;
      await storage.updateUrlStatus(url, status);
      logger.log(`Updated status for ${url} to ${status}`);
    }
  },

  // Cập nhật danh sách URL từ cơ sở dữ liệu (nếu có)
  async loadUrls() {
    // Ví dụ lấy URL từ cơ sở dữ liệu (có thể sử dụng Redis, MongoDB, MySQL, v.v.)
    const urlsFromDb = await storage.getUrls(); // Giả sử storage trả về danh sách URL từ DB
    queue = urlsFromDb.map(url => ({
      url: url.url,
      status: url.status,
      createdAt: url.createdAt,
    }));
    logger.log('Loaded URLs from storage');
  },

  // Kiểm tra xem còn URL nào chờ được crawl hay không
  hasPendingUrls() {
    return queue.some(item => item.status === 'pending');
  },
};

module.exports = QueueManager;
