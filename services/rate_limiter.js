// src/services/rate-limiter.js
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000;  // Thời gian cửa sổ (1 phút)
const MAX_REQUESTS = 5;           // Số yêu cầu tối đa trong mỗi cửa sổ 1 phút

// Lưu trữ thông tin rate limiting cho mỗi URL (hoặc worker)
const getRateLimitKey = (url) => {
  return `rate-limit-${url}`;  // Key cho mỗi URL (hoặc IP) để theo dõi tốc độ yêu cầu
};

// Kiểm tra và cấp phép hoặc từ chối yêu cầu dựa trên giới hạn tốc độ
const checkRateLimit = (url) => {
  const key = getRateLimitKey(url);
  const currentTime = Date.now();

  // Nếu không có thông tin rate limiting cho URL, khởi tạo mới
  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, {
      timestamps: [currentTime],  // Lưu trữ thời gian của yêu cầu
    });
    return true;  // Chấp nhận yêu cầu đầu tiên
  }

  const rateLimitData = rateLimitMap.get(key);

  // Lọc ra các yêu cầu trong cửa sổ thời gian
  rateLimitData.timestamps = rateLimitData.timestamps.filter(
    (timestamp) => currentTime - timestamp < RATE_LIMIT_WINDOW
  );

  // Kiểm tra nếu số yêu cầu đã vượt quá giới hạn
  if (rateLimitData.timestamps.length >= MAX_REQUESTS) {
    return false;  // Từ chối yêu cầu nếu vượt quá giới hạn
  }

  // Thêm yêu cầu mới vào danh sách
  rateLimitData.timestamps.push(currentTime);
  return true;  // Cho phép yêu cầu
};

// Hàm xử lý rate limiting cho từng worker
const applyRateLimit = (url, next) => {
  if (checkRateLimit(url)) {
    next();  // Nếu không vượt quá giới hạn, cho phép tiếp tục xử lý
  } else {
    setTimeout(() => applyRateLimit(url, next), RATE_LIMIT_WINDOW);  // Nếu vượt quá, chờ và thử lại
  }
};

// Thử nghiệm, mô phỏng request từ worker
const simulateRequest = (url, workerId) => {
  console.log(`Worker ${workerId} đang yêu cầu ${url}`);
  
  applyRateLimit(url, () => {
    console.log(`Worker ${workerId} được phép crawl ${url}`);
    // Logic crawl tiếp theo sẽ ở đây, ví dụ: gửi request HTTP, lưu trữ, etc.
  });
};

module.exports = {
  applyRateLimit,
  simulateRequest,
};
