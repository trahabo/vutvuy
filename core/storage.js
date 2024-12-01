// src/core/storage.js
const fs = require('fs');
const path = require('path');

// Đường dẫn lưu trữ dữ liệu tạm thời (trong trường hợp không có cơ sở dữ liệu)
const dbFilePath = path.resolve(__dirname, '../data/urls.json');

// Đọc dữ liệu từ file (hoặc có thể thay thế bằng cơ sở dữ liệu thực tế)
const readData = () => {
  if (!fs.existsSync(dbFilePath)) return [];
  const data = fs.readFileSync(dbFilePath);
  return JSON.parse(data);
};

const writeData = (data) => {
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
};

// Lưu URL vào cơ sở dữ liệu
const saveUrl = (urlData) => {
  const urls = readData();
  urls.push(urlData);
  writeData(urls);
};

// Cập nhật trạng thái URL
const updateUrlStatus = (url, status) => {
  const urls = readData();
  const urlIndex = urls.findIndex(item => item.url === url);
  if (urlIndex !== -1) {
    urls[urlIndex].status = status;
    writeData(urls);
  }
};

// Lấy danh sách URL từ cơ sở dữ liệu
const getUrls = () => {
  return readData();
};

module.exports = {
  saveUrl,
  updateUrlStatus,
  getUrls,
};
