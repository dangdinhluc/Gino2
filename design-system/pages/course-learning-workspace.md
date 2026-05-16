# Design System Page Override

## Page
- Name: Course Learning Workspace
- Route/Screen: `/app/courses/:id/learn`
- Purpose: tạo không gian học riêng theo khóa, cảm giác như workbench học tập chuyên nghiệp
- Primary CTA: Tiếp tục học từ / action theo tab đang active

## Layout Override
- Hero/header: compact command center thay vì hero marketing; headline ngắn, progress capsule, daily mission card rõ mục tiêu
- Main sections: left rail nav, dominant center learning panel, slim productivity right rail
- Sidebar/nav: active tab dùng capsule background + stronger icon tile; inactive tab nhẹ và sạch
- Content density: medium-high ở center panel nhưng phải có khoảng trắng lớn giữa list, preview, feedback

## Component Overrides
- Cards: hero và main panels dùng radius lớn 28-32px; list item cards nhỏ hơn để hierarchy rõ
- Tables/Lists: vocabulary list cần row-card rõ ràng, status badge và strength badge nằm một trục logic
- Forms: search/filter zone phải gọn và chuyên nghiệp như product toolbar
- Charts: tránh radar/chart màu mè; dùng progress bars, stat pills, weekly blocks nếu cần
- Dialogs/Drawers: vocabulary detail dialog dùng premium study sheet với clear sections, no busy gradients

## State Notes
- Loading: skeleton cho hero metrics, tabs, list cards, preview panel
- Empty: khi filter không có kết quả, hiện guidance card với reset filter CTA
- Error: panel-local alert cho từng tab; không dùng full-page interruption
- Success: correct answer, remembered word, audio played dùng confirmation tone ngắn và ấm

## Content and Hierarchy
- Main message: hôm nay học gì, cần ưu tiên gì, tiến độ đang tới đâu
- Secondary content: tài liệu phụ, AI gợi ý, podcast, từ yếu nằm rail phải hoặc section phụ
- Priority actions: học tiếp, ôn tập, mở chi tiết từ, nghe podcast

## Responsive Notes
- Mobile behavior: sticky top header + sticky bottom tab dock; right rail biến thành stacked support cards
- Tablet behavior: hero rút gọn, preview panel xuống dưới list khi thiếu ngang
- Desktop behavior: three-zone workspace giữ ổn định, right rail luôn trong viewport nếu đủ cao

## Accessibility Notes
- Focus order: header actions → tab nav → panel controls → content list → preview/detail → rail actions
- Screen reader notes: tab/panel labels phải khớp, progress bars có aria text rõ ngữ cảnh học
- Motion cautions: tab switch và dialog transitions phải nhẹ, không bounce playful

## Deviation from Master
- What changes here: tăng mật độ thông tin vừa phải và nhấn productivity shell mạnh hơn các page marketing/list thường
- Why this page needs it: đây là màn user quay lại mỗi ngày, nên cần cảm giác tool chuyên dụng thay vì landing page mở rộng
