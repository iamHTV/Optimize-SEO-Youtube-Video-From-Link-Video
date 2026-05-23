// YouTube Master - Menu UI & Auto Setup
// Paste into same Apps Script project as youtube_master_ingest.gs

// ============================================================
// MENU SETUP - Chạy khi mở Sheets
// ============================================================

function onOpen() {
  createYouTubeMasterMenu_();
}

function createYouTubeMasterMenu_() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🎬 YouTube Master')
    .addItem('🔄 Initial Full Sync', 'initialFullSync')
    .addItem('📅 Sort + Sync All', 'sortAllSheetsByDate')
    .addSeparator()
    .addItem('➕ Add New Videos', 'addNewVideosDaily')
    .addItem('📊 Refresh Stats', 'refreshStatsDaily')
    .addSeparator()
    .addItem('📑 Sync Short/Long Sheets', 'syncShortLongSheets')
    .addItem('📅 Sort by Date (Newest)', 'sortYouTubeMasterByDate')
    .addSeparator()
    .addItem('🔧 Setup Sheet', 'setupYouTubeMasterSheet')
    .addItem('⚡ Setup Auto Triggers', 'setupYouTubeMasterAutoTriggers')
    .addSeparator()
    .addItem('ℹ️ Hướng dẫn', 'showYouTubeMasterGuide_')
    .addToUi();
}

// ============================================================
// AUTO TRIGGER - Chạy hàng ngày
// ============================================================

function setupDailyTriggers() {
  deleteYouTubeMasterTriggers_();

  // 08:00 - Add new videos
  ScriptApp.newTrigger('addNewVideosDaily')
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .create();

  // 09:00 - Refresh stats
  ScriptApp.newTrigger('refreshStatsDaily')
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .create();

  // Thứ 2 hàng tuần 07:00 - Full sync
  ScriptApp.newTrigger('initialFullSync')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(7)
    .create();

  Browser.msgBox('✅ Auto triggers setup:\n\n• 08:00 - Add new videos\n• 09:00 - Refresh stats\n• Thứ 2 (07:00) - Full sync');
}

function deleteYouTubeMasterTriggers_() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach((trigger) => {
    const fn = trigger.getHandlerFunction();
    if (fn === 'addNewVideosDaily' || fn === 'refreshStatsDaily' || fn === 'initialFullSync') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
}

function setupYouTubeMasterAutoTriggers() {
  setupDailyTriggers();
}

// ============================================================
// UTILITY
// ============================================================

function showYouTubeMasterGuide_() {
  const msg = `
🎬 YOUTUBE MASTER - HƯỚNG DẪN

📋 MENU CHÍNH:
• Initial Full Sync → Quét full channel, preserve manual edits
• Add New Videos → Chỉ thêm video mới (published_at > sheet latest)
• Refresh Stats → Update views, likes, comments, title, desc, tags

⏰ AUTO TRIGGERS:
• 08:00 - Add new videos
• 09:00 - Refresh stats
• Thứ 2 (07:00) - Full sync

🔧 MANUAL FIELDS (preserve qua sync):
• label
• review_notes
• selected_for_optimize
• video_type (nếu manual)
• optimize_status (nếu manual: selected/working/skipped/error)

⚠️ LƯU Ý:
• Full sync có thể mất 5-10 phút
• Stats update chạy batch 50 rows, có checkpoint
• Auto triggers cần chạy "Setup Auto Triggers" 1 lần
  `.trim();
  SpreadsheetApp.getUi().alert('📖 Hướng Dẫn', msg, SpreadsheetApp.getUi.ButtonSet.OK);
}