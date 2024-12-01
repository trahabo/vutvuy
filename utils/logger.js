const winston = require('winston');

// Tạo cấu hình logger với các mức độ log khác nhau
const logConfiguration = {
    level: 'info', // Mặc định là 'info', có thể thay đổi khi cần
    transports: [
        // Ghi log ra console
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),  // Tô màu cho các mức độ log khác nhau
                winston.format.simple()     // Định dạng đơn giản
            )
        }),

        // Ghi log vào file (log sẽ được tạo mới mỗi ngày)
        new winston.transports.File({
            filename: 'logs/application.log',
            level: 'info',  // Mức độ log cho file là 'info'
            format: winston.format.combine(
                winston.format.timestamp(),  // Thêm timestamp vào log
                winston.format.json()        // Định dạng log dưới dạng JSON
            ),
        })
    ],
};

const logger = winston.createLogger(logConfiguration);

// Các phương thức ghi log cho các mức độ khác nhau
logger.info = (message) => {
    logger.log({ level: 'info', message });
};

logger.warn = (message) => {
    logger.log({ level: 'warn', message });
};

logger.error = (message) => {
    logger.log({ level: 'error', message });
};

// Hàm để làm sạch và định dạng thông tin log (nếu cần)
logger.clean = (message) => {
    return message.replace(/[\n\r]+/g, ' ').trim();  // Xóa bỏ các ký tự xuống dòng
};

module.exports = logger;
