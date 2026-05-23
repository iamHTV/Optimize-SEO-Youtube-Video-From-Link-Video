---
created: 2026-04-13 11:50
updated: 2026-04-22 15:04
version: 2026-04-22 15:04
in:
  - "[[PROJECT]]"
related:
  - "[[YTO Workflow Spec]]"
  - "[[YTO Requirements]]"
  - "[[YTO Solution Architecture]]"
tags:
  - status/doing
  - topic/company/chccdn
  - type/note
---

# YTO Skill Spec

## Summary

- Skill này phải hiểu project có 2 lane:
  - `Data/reference lane`
  - `Direct-link optimize lane`
- Skill không được giả định mọi video cần optimize đều phải có row trong sheet.
- Skill phải hỗ trợ tối ưu trực tiếp từ `video_url` user gửi.

## Skill Purpose

Giúp user:

- đọc context từ `YouTube Master` khi cần
- optimize video trực tiếp từ link khi user gửi
- dùng local Markdown làm nơi làm việc chi tiết
- định nghĩa lại workflow khi nghiệp vụ thay đổi

## Trigger Cases

- User nói: quét video mới
- User nói: xem dữ liệu trong `YouTube Master`
- User nói: optimize video này
- User gửi `video_url` trực tiếp
- User nói: generate title, description, tags
- User nói: cần vẽ flow, plan, requirement, success criteria

## Inputs

- sheet data nếu có
- `video_url` trực tiếp nếu có
- transcript / description / notes user cung cấp
- workflow constraints đã chốt với user

## Outputs

- title
- description
- tags
- local Markdown working content
- flow / requirements / solution steps khi ở analysis mode

## Responsibilities

### R-1 Understand which lane is active

- Nếu user đang nói về dữ liệu quét và dashboard -> dùng `YouTube Master`
- Nếu user gửi link trực tiếp -> dùng `direct-link optimize lane`

### R-2 Use the correct source of truth

- `YouTube Master` là source of truth cho metadata quét được.
- `Direct link + user-provided content` là source of truth cho private/scheduled optimize.
- Local Markdown là working file, không phải dashboard dữ liệu.

### R-3 Generate usable optimize output

- Output phải có:
  - title
  - description
  - tags
- Không bịa nội dung không có trong content đầu vào.

### R-4 Respect execution boundary

- Không tự cập nhật YouTube Studio.
- Không ép user thêm row manual vào sheet nếu họ chỉ muốn tối ưu từ link.

### R-5 Define before build

- Nếu flow chưa rõ, skill phải vào analysis mode trước.
- Sau khi define xong, skill phải đưa ra:
  - objective
  - workflow
  - requirements
  - process
  - step-by-step solution
  - deliverables
  - success criteria

## Guardrails

- Không dùng duration làm cách duy nhất để quyết định Shorts trong mọi ngữ cảnh.
- Không coi sheet là nơi vận hành bắt buộc cho private/scheduled optimize.
- Không nhảy vào code khi workflow còn mơ hồ.
- Không để docs và implementation lệch nhau sau khi chốt nghiệp vụ mới.

## Success Criteria

- Skill hiểu đúng lane đang dùng.
- Skill có thể optimize video chỉ từ `video_url + content`.
- Skill có thể đọc `YouTube Master` như lớp dữ liệu tham chiếu khi cần.
- Skill giúp user define workflow trước khi build nếu flow thay đổi.
