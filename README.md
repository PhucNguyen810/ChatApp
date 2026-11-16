# ChatFlow (React Native CLI)

Ứng dụng chat 1-1 realtime sử dụng React Native CLI, React Navigation và Firebase JS SDK (Authentication + Realtime Database). Không sử dụng Expo.

## 1. Tạo và cấu hình Firebase

1. Tạo project tại [Firebase Console](https://console.firebase.google.com/).
2. Trong **Authentication → Sign-in method**, bật **Email/Password**.
3. Tạo **Realtime Database** và chọn khu vực phù hợp.
4. Sao chép cấu hình Web app của Firebase vào `src/services/firebase.ts`. Thay các giá trị `YOUR_FIREBASE_...`, đặc biệt `databaseURL` bằng URL đầy đủ của Realtime Database.
5. Sao chép nội dung `database.rules.json` vào tab **Realtime Database → Rules** rồi Publish. Nếu bạn có bộ rules riêng được cung cấp cho bài tập, hãy đối chiếu cấu trúc dữ liệu trước khi áp dụng.

Ứng dụng lưu hồ sơ ở `/users/{uid}`, trạng thái ở `/status/{uid}`, tin nhắn ở `/chats/{uidA_uidB}/messages` và danh sách hội thoại ở `/userChats/{uid}/{peerUid}`. Chỉ tài khoản đăng nhập mới đọc được danh bạ/trạng thái; rules giới hạn hồ sơ và trạng thái theo chủ tài khoản, chat theo thành viên.

## 2. Cài đặt và chạy

Cần Node.js 22.11 trở lên, Android Studio/Android SDK và emulator hoặc thiết bị Android đã bật USB debugging.

```powershell
npm install
npm start
```

Mở terminal thứ hai tại thư mục dự án:

```powershell
npm run android
```

iOS cần macOS và CocoaPods:

```sh
bundle install
bundle exec pod install
npm run ios
```

## Tính năng

- Đăng ký với họ tên, email, mật khẩu tối thiểu 6 ký tự và xác nhận mật khẩu; đăng nhập, thông báo lỗi và đăng xuất.
- Danh bạ realtime, tìm theo tên/email, hiển thị online/offline.
- Chat 1-1 realtime, thời gian tin nhắn, không gửi nội dung rỗng, cuộn tới tin mới nhất và số tin chưa đọc.
- Các bộ lắng nghe Firebase được hủy khi màn hình unmount.

`@react-native-community/geolocation` đã được thêm làm dependency theo yêu cầu. Ứng dụng hiện chưa yêu cầu quyền vị trí vì các tính năng chat không cần truy cập vị trí.
