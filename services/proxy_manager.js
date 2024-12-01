const axios = require('axios');  // Dùng để kiểm tra proxy
const fs = require('fs');
const logger = require('../utils/logger'); // Sử dụng logger để ghi log các sự kiện

class ProxyManager {
    constructor() {
        this.proxyList = [];  // Danh sách proxy
        this.currentProxy = null; // Proxy hiện tại đang sử dụng
    }

    // Tải danh sách proxy từ file hoặc từ dịch vụ bên ngoài
    loadProxyList(filePath) {
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            this.proxyList = JSON.parse(data);
            if (this.proxyList.length > 0) {
                this.currentProxy = this.proxyList[0]; // Chọn proxy đầu tiên để sử dụng
                logger.info(`Loaded ${this.proxyList.length} proxies from ${filePath}`);
            } else {
                logger.error('Proxy list is empty');
            }
        } catch (error) {
            logger.error('Error loading proxy list:', error);
        }
    }

    // Kiểm tra proxy có khả dụng không bằng cách gửi request HTTP
    async checkProxy(proxy) {
        try {
            const response = await axios.get('http://example.com', {
                proxy: {
                    host: proxy.host,
                    port: proxy.port,
                },
                timeout: 5000,  // Timeout trong 5 giây
            });
            return response.status === 200;
        } catch (error) {
            logger.warn(`Proxy ${proxy.host}:${proxy.port} is not working. Error: ${error.message}`);
            return false;
        }
    }

    // Chọn proxy tiếp theo khi proxy hiện tại không còn khả dụng
    async switchProxy() {
        let nextProxyIndex = this.proxyList.indexOf(this.currentProxy) + 1;
        if (nextProxyIndex >= this.proxyList.length) {
            nextProxyIndex = 0;  // Quay lại proxy đầu tiên nếu hết proxy
        }
        const nextProxy = this.proxyList[nextProxyIndex];
        const isProxyWorking = await this.checkProxy(nextProxy);

        if (isProxyWorking) {
            this.currentProxy = nextProxy;
            logger.info(`Switched to new proxy: ${nextProxy.host}:${nextProxy.port}`);
        } else {
            logger.error('No working proxies available.');
        }
    }

    // Lấy proxy hiện tại
    getCurrentProxy() {
        return this.currentProxy;
    }

    // Kiểm tra và thay đổi proxy nếu cần
    async manageProxy() {
        const isProxyWorking = await this.checkProxy(this.currentProxy);
        if (!isProxyWorking) {
            logger.warn('Current proxy is not working. Switching proxy...');
            await this.switchProxy();
        }
    }
}

module.exports = new ProxyManager();
