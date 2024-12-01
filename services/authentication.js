// src/services/authentication.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');  // Sử dụng để mã hóa mật khẩu
const logger = require('../utils/logger');

// Lấy secret key từ môi trường
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key';  // Key để mã hóa và giải mã JWT

// Định nghĩa các quyền truy cập
const ROLE = {
  ADMIN: 'admin',
  USER: 'user',
};

// Xác thực thông tin người dùng (kết nối với cơ sở dữ liệu hoặc file)
const validateUser = async (username, password) => {
  // Thực tế: Bạn sẽ cần kết nối với cơ sở dữ liệu để tìm thông tin người dùng
  // Ở đây mình giả lập dữ liệu người dùng:
  const mockUser = {
    username: 'admin',
    password: '$2a$10$4W4zOEFz1eIK3zXBLKvNEeHnd7kkQAWfAn5M8WqMIakjRZwr4uK7e', // Mật khẩu đã được mã hóa (admin123)
    role: ROLE.ADMIN,
  };

  // Kiểm tra người dùng có tồn tại không và mật khẩu có chính xác không
  if (username === mockUser.username) {
    const passwordMatch = await bcrypt.compare(password, mockUser.password);
    if (passwordMatch) {
      return mockUser; // Nếu hợp lệ, trả về đối tượng người dùng
    }
  }

  return null; // Nếu không hợp lệ, trả về null
};

// Tạo token JWT sau khi người dùng đăng nhập thành công
const generateToken = (user) => {
  const payload = {
    username: user.username,
    role: user.role,
  };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' }); // Token có thời gian sống 1 giờ
  return token;
};

// Xác thực token JWT
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];  // Lấy token từ header

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);  // Kiểm tra tính hợp lệ của token
    req.user = decoded; // Lưu thông tin người dùng vào req.user
    next(); // Tiếp tục xử lý
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// Phân quyền truy cập (middleware)
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (roles.includes(req.user.role)) {
      next(); // Nếu người dùng có quyền truy cập, cho phép tiếp tục
    } else {
      return res.status(403).json({ message: 'Access Denied: Insufficient permissions.' });
    }
  };
};

// Hàm đăng nhập, tạo và trả về token nếu hợp lệ
const login = async (username, password) => {
  const user = await validateUser(username, password);
  if (user) {
    const token = generateToken(user); // Tạo token cho người dùng hợp lệ
    return { token };
  }
  throw new Error('Invalid username or password');
};

// Hàm đăng ký (cho người dùng mới)
const register = async (username, password) => {
  const hashedPassword = await bcrypt.hash(password, 10); // Mã hóa mật khẩu
  // Thực tế: Bạn sẽ lưu người dùng vào cơ sở dữ liệu ở đây.
  // Ví dụ:
  const newUser = { username, password: hashedPassword, role: ROLE.USER };
  logger.log('User registered successfully!');
  return newUser; // Trả về đối tượng người dùng đã đăng ký
};

module.exports = {
  login,
  register,
  authenticateToken,
  authorizeRole,
};
