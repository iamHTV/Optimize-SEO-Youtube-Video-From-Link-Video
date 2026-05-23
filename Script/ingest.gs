// YouTube Master - Ingest & Refresh
// 3 main entry points:
// - initialFullSync()     → Quét full channel, merge preserve manual edits
// - addNewVideosDaily()   → Thêm video mới (published_at > sheet latest)
// - refreshStatsDaily()   → Cập nhật stats (views, likes, comments, etc)

const YTMASTER_CHANNEL_ID = 'UCNx59xFflN_TZakxtp05usQ';
const YTMASTER_SHEET_NAME = 'YouTube Master';

const YTMASTER_HEADERS = [
  'video_id', 'published_at', 'current_title', 'current_description',
  'current_tags', 'label', 'thumbnail', 'duration', 'views_today',
  'like_count', 'comment_count', 'video_url', 'last_updated_at',
  'video_type', 'type_source', 'optimize_status', 'selected_for_optimize', 'review_notes'
];

// Manual status values that should NOT be auto-updated
const YTMASTER_MANUAL_STATUS = ['selected', 'working', 'skipped', 'error'];

// ============================================================
// MAIN ENTRY POINTS
// ============================================================

/**
 * initialFullSync
 * Quét FULL channel, merge với existing data.
 * Preserve manual edits: label, review_notes, selected_for_optimize,
 * manual video_type, manual optimize_status.
 */
function initialFullSync() {
  const sheet = ytMasterGetReadySheet_();
  const headerMap = ytMasterGetHeaderMap_(sheet);
  const existingRows = ytMasterLoadExistingRowsMap_(sheet, headerMap);
  const uploadsPlaylistId = ytMasterGetUploadsPlaylistId_();
  const now = ytMasterFormatDateTime_(new Date());

  let nextPageToken = '';
  let total = 0;
  let mergeResults = [];

  do {
    const playlistResponse = YouTube.PlaylistItems.list('contentDetails', {
      playlistId: uploadsPlaylistId,
      maxResults: 50,
      pageToken: nextPageToken
    });

    const videoIds = (playlistResponse.items || [])
      .map((item) => item.contentDetails && item.contentDetails.videoId)
      .filter(Boolean);

    if (videoIds.length) {
      const videos = ytMasterFetchVideoDetails_(videoIds).filter((v) => !ytMasterIsLive_(v));
      videos.forEach((video) => {
        const existingRow = existingRows[video.id] || null;
        mergeResults.push(ytMasterBuildMergedRow_(video, existingRow, now));
        total++;
      });
    }

    nextPageToken = playlistResponse.nextPageToken || '';
  } while (nextPageToken);

  // Merge: update existing rows + append new rows
  ytMasterMergeToSheet_(sheet, headerMap, mergeResults, existingRows);

  // Sort by date (newest first) after merge
  sortYouTubeMasterByDate();

  // Sync Short/Long sheets after sort
  syncShortLongSheets();

  Browser.msgBox(`✅ Initial sync done. ${total} videos processed. Sorted and synced.`);
}

/**
 * addNewVideosDaily
 * Thêm video mới dựa trên published_at > sheet latest date.
 */
function addNewVideosDaily() {
  const sheet = ytMasterGetReadySheet_();
  const headerMap = ytMasterGetHeaderMap_(sheet);
  const uploadsPlaylistId = ytMasterGetUploadsPlaylistId_();
  const now = ytMasterFormatDateTime_(new Date());

  // Get latest published_at in sheet
  const latestDate = ytMasterGetLatestPublishedDate_(sheet, headerMap);

  // Fetch all videos from channel (paginate if needed)
  let nextPageToken = '';
  let newVideos = [];

  do {
    const playlistResponse = YouTube.PlaylistItems.list('contentDetails', {
      playlistId: uploadsPlaylistId,
      maxResults: 50,
      pageToken: nextPageToken
    });

    const videoIds = (playlistResponse.items || [])
      .map((item) => item.contentDetails && item.contentDetails.videoId)
      .filter(Boolean);

    if (videoIds.length) {
      const videos = ytMasterFetchVideoDetails_(videoIds).filter((v) => !ytMasterIsLive_(v));

      videos.forEach((video) => {
        const videoDate = new Date(video.snippet.publishedAt);

        if (!latestDate || videoDate > latestDate) {
          newVideos.push(ytMasterBuildNewRow_(video, now));
        }
      });
    }

    nextPageToken = playlistResponse.nextPageToken || '';
  } while (nextPageToken);

  if (!newVideos.length) {
    Browser.msgBox('No new videos found. Sheet is up-to-date.');
    return;
  }

  // Append new rows
  const startRow = sheet.getLastRow() + 1;
  sheet.getRange(startRow, 1, newVideos.length, YTMASTER_HEADERS.length).setValues(newVideos);
  ytMasterFormatInsertedRows_(sheet, startRow, newVideos.length);

  Browser.msgBox(`✅ Added ${newVideos.length} new videos to "${YTMASTER_SHEET_NAME}".`);
}

/**
 * refreshStatsDaily
 * Cập nhật stats: views_today, like_count, comment_count, title, description, tags.
 * KHÔNG thay đổi: label, video_type (manual), optimize_status (manual), review_notes.
 */
function refreshStatsDaily() {
  const sheet = ytMasterGetReadySheet_();
  const headerMap = ytMasterGetHeaderMap_(sheet);
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    Browser.msgBox('YouTube Master has no data rows to update.');
    return;
  }

  const rowCount = lastRow - 1;
  const data = sheet.getRange(2, 1, rowCount, YTMASTER_HEADERS.length).getValues();
  const now = ytMasterFormatDateTime_(new Date());

  // Progress tracking
  const props = PropertiesService.getScriptProperties();
  const bookmarkKey = 'YTMASTER_STATS_BOOKMARK';
  const startIndex = Math.max(0, parseInt(props.getProperty(bookmarkKey), 10) || 0);
  const startedAt = new Date().getTime();
  const MAX_RUNTIME_MS = 270000; // 4.5 minutes (leave buffer for format step)

  for (let i = startIndex; i < data.length; i += 50) {
    // Check if we're running out of time
    if (new Date().getTime() - startedAt > MAX_RUNTIME_MS) {
      props.setProperty(bookmarkKey, i.toString());
      sheet.getRange(2, 1, data.length, YTMASTER_HEADERS.length).setValues(data);
      Browser.msgBox(`⏸️ Partial update saved. Resume at row ${i + 2}.`);
      return;
    }

    // Process batch
    const batchRows = data.slice(i, Math.min(i + 50, data.length));
    const batchIds = batchRows.map((row) => row[headerMap.video_id]).filter(Boolean);

    if (!batchIds.length) {
      continue;
    }

    // Fetch stats from YouTube
    const videosResponse = YouTube.Videos.list('snippet,statistics', {
      id: batchIds.join(',')
    });
    const statsMap = {};

    (videosResponse.items || []).forEach((video) => {
      statsMap[video.id] = video;
    });

    // Update each row in batch
    for (let j = 0; j < batchRows.length; j++) {
      const rowIndex = i + j;
      const row = data[rowIndex];
      const videoId = row[headerMap.video_id];
      const ytVideo = statsMap[videoId];

      if (!ytVideo) {
        continue;
      }

      // Update stats columns
      row[headerMap.current_title] = ytVideo.snippet.title || '';
      row[headerMap.current_description] = ytVideo.snippet.description || '';
      row[headerMap.current_tags] = ytMasterJoinTags_(ytVideo.snippet.tags);
      row[headerMap.views_today] = Number(ytVideo.statistics.viewCount || 0);
      row[headerMap.like_count] = Number(ytVideo.statistics.likeCount || 0);
      row[headerMap.comment_count] = Number(ytVideo.statistics.commentCount || 0);
      row[headerMap.last_updated_at] = now;

      // Auto-calculate optimize_status (only if NOT manual status)
      const currentStatus = row[headerMap.optimize_status];
      if (YTMASTER_MANUAL_STATUS.indexOf(currentStatus) === -1) {
        row[headerMap.optimize_status] = ytMasterResolveOptimizeStatus_(
          row[headerMap.current_description],
          row[headerMap.current_tags]
        );
      }
    }

    // Write batch back immediately
    sheet.getRange(i + 2, 1, batchRows.length, YTMASTER_HEADERS.length).setValues(batchRows);
  }

  // Done - reset bookmark
  props.setProperty(bookmarkKey, '0');
  Browser.msgBox(`✅ Stats refreshed for ${data.length} videos in "${YTMASTER_SHEET_NAME}".`);
}

// ============================================================
// MERGE LOGIC
// ============================================================

/**
 * ytMasterMergeToSheet_
 * Merge videos to sheet without overwriting manual fields.
 * - Existing video_id: update auto-fields, preserve manual fields
 * - New video_id: append new row
 */
function ytMasterMergeToSheet_(sheet, headerMap, mergeResults, existingRowsMap) {
  const existingIds = Object.keys(existingRowsMap);
  const newRows = [];
  const updateData = {};

  // Separate new vs existing
  mergeResults.forEach((row) => {
    const videoId = row[headerMap.video_id];
    if (existingIds.indexOf(videoId) !== -1) {
      // Mark row for update, but preserve manual fields
      updateData[videoId] = row;
    } else {
      newRows.push(row);
    }
  });

  // Update existing rows
  const lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    const existingData = sheet.getRange(2, 1, lastRow - 1, YTMASTER_HEADERS.length).getValues();

    existingData.forEach((row, rowIndex) => {
      const videoId = row[headerMap.video_id];
      if (updateData[videoId]) {
        const newRow = updateData[videoId];

        // Auto fields: update these
        row[headerMap.current_title] = newRow[headerMap.current_title];
        row[headerMap.current_description] = newRow[headerMap.current_description];
        row[headerMap.current_tags] = newRow[headerMap.current_tags];
        row[headerMap.views_today] = newRow[headerMap.views_today];
        row[headerMap.like_count] = newRow[headerMap.like_count];
        row[headerMap.comment_count] = newRow[headerMap.comment_count];
        row[headerMap.last_updated_at] = newRow[headerMap.last_updated_at];
        row[headerMap.duration] = newRow[headerMap.duration];
        row[headerMap.thumbnail] = newRow[headerMap.thumbnail];
        row[headerMap.video_url] = newRow[headerMap.video_url];
        row[headerMap.published_at] = newRow[headerMap.published_at];

        // Auto video_type: only update if current is duration_rule or empty
        const currentTypeSource = row[headerMap.type_source];
        if (currentTypeSource === 'duration_rule' || !currentTypeSource) {
          row[headerMap.video_type] = newRow[headerMap.video_type];
          row[headerMap.type_source] = newRow[headerMap.type_source];
        }

        // Auto optimize_status: only if NOT manual
        const currentStatus = row[headerMap.optimize_status];
        if (YTMASTER_MANUAL_STATUS.indexOf(currentStatus) === -1) {
          row[headerMap.optimize_status] = newRow[headerMap.optimize_status];
        }

        // Preserve these fields completely:
        // - label (manual)
        // - review_notes (manual)
        // - selected_for_optimize (checkbox)
        // - video_type (if manual)
        // - optimize_status (if manual)

        existingData[rowIndex] = row;
      }
    });

    // Write back updated existing rows (clear validation to avoid cell-by-cell rejection)
    const existingRange = sheet.getRange(2, 1, existingData.length, YTMASTER_HEADERS.length);
    existingRange.setDataValidation(null);
    existingRange.setValues(existingData);
  }

  // Append new rows
  if (newRows.length > 0) {
    const appendStartRow = sheet.getLastRow() + 1;
    sheet.getRange(appendStartRow, 1, newRows.length, YTMASTER_HEADERS.length).setValues(newRows);
    ytMasterFormatInsertedRows_(sheet, appendStartRow, newRows.length);
  }
}

// ============================================================
// ROW BUILDERS
// ============================================================

function ytMasterBuildMergedRow_(video, existingRow, now) {
  const seconds = ytMasterParseDuration_(video.contentDetails.duration);
  const autoType = seconds <= 180 ? 'short' : 'long';
  const currentDescription = video.snippet.description || '';
  const currentTags = ytMasterJoinTags_(video.snippet.tags);

  // Determine video_type: preserve manual override
  let videoType = autoType;
  let typeSource = 'duration_rule';

  if (existingRow && existingRow.video_type && existingRow.type_source === 'manual') {
    videoType = existingRow.video_type;
    typeSource = 'manual';
  }

  // Determine optimize_status: preserve manual status
  let optimizeStatus = ytMasterResolveOptimizeStatus_(currentDescription, currentTags);

  if (existingRow && YTMASTER_MANUAL_STATUS.indexOf(existingRow.optimize_status) !== -1) {
    optimizeStatus = existingRow.optimize_status;
  } else if (existingRow && existingRow.optimize_status) {
    optimizeStatus = existingRow.optimize_status;
  }

  return [
    video.id,
    ytMasterFormatDate_(new Date(video.snippet.publishedAt)),
    video.snippet.title || '',
    currentDescription,
    currentTags,
    existingRow ? existingRow.label : '',
    ytMasterBuildImageFormula_(video),
    ytMasterFormatDuration_(seconds),
    Number(video.statistics.viewCount || 0),
    Number(video.statistics.likeCount || 0),
    Number(video.statistics.commentCount || 0),
    `https://www.youtube.com/watch?v=${video.id}`,
    now,
    videoType,
    typeSource,
    optimizeStatus,
    existingRow ? existingRow.selected_for_optimize : false,
    existingRow ? existingRow.review_notes : ''
  ];
}

function ytMasterBuildNewRow_(video, now) {
  const seconds = ytMasterParseDuration_(video.contentDetails.duration);
  const autoType = seconds <= 180 ? 'short' : 'long';
  const currentDescription = video.snippet.description || '';
  const currentTags = ytMasterJoinTags_(video.snippet.tags);

  return [
    video.id,
    ytMasterFormatDate_(new Date(video.snippet.publishedAt)),
    video.snippet.title || '',
    currentDescription,
    currentTags,
    '', // label
    ytMasterBuildImageFormula_(video),
    ytMasterFormatDuration_(seconds),
    Number(video.statistics.viewCount || 0),
    Number(video.statistics.likeCount || 0),
    Number(video.statistics.commentCount || 0),
    `https://www.youtube.com/watch?v=${video.id}`,
    now,
    autoType,
    'duration_rule',
    ytMasterResolveOptimizeStatus_(currentDescription, currentTags),
    false, // selected_for_optimize
    '' // review_notes
  ];
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function ytMasterGetUploadsPlaylistId_() {
  const response = YouTube.Channels.list('contentDetails', { id: YTMASTER_CHANNEL_ID });
  const channel = response.items && response.items[0];

  if (!channel) {
    throw new Error(`Channel not found: ${YTMASTER_CHANNEL_ID}`);
  }

  return channel.contentDetails.relatedPlaylists.uploads;
}

function ytMasterFetchVideoDetails_(videoIds) {
  if (!videoIds.length) return [];

  const response = YouTube.Videos.list(
    'snippet,contentDetails,statistics,liveStreamingDetails',
    { id: videoIds.join(',') }
  );

  return response.items || [];
}

function ytMasterIsLive_(video) {
  return !!(video && video.liveStreamingDetails);
}

function ytMasterResolveOptimizeStatus_(description, tags) {
  const hasDesc = String(description || '').trim() !== '';
  const hasTags = String(tags || '').trim() !== '';

  if (hasDesc && hasTags) return 'done';
  return 'pending';
}

function ytMasterLoadExistingRowsMap_(sheet, headerMap) {
  const lastRow = sheet.getLastRow();
  const rowsMap = {};

  if (lastRow < 2) return rowsMap;

  const values = sheet.getRange(2, 1, lastRow - 1, YTMASTER_HEADERS.length).getValues();

  values.forEach((row) => {
    const videoId = row[headerMap.video_id];
    if (!videoId) return;

    rowsMap[videoId] = {
      label: row[headerMap.label],
      video_type: row[headerMap.video_type],
      type_source: row[headerMap.type_source],
      optimize_status: row[headerMap.optimize_status],
      selected_for_optimize: row[headerMap.selected_for_optimize] === true,
      review_notes: row[headerMap.review_notes]
    };
  });

  return rowsMap;
}

function ytMasterGetLatestPublishedDate_(sheet, headerMap) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;

  const dateCol = headerMap.published_at + 1;
  const dates = sheet.getRange(2, dateCol, lastRow - 1, 1).getValues();

  let latest = null;
  dates.forEach(([dateVal]) => {
    if (!dateVal) return;
    const d = new Date(dateVal);
    if (!latest || d > latest) latest = d;
  });

  return latest;
}

function ytMasterGetReadySheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(YTMASTER_SHEET_NAME);

  if (!sheet) {
    if (typeof setupYouTubeMasterSheet === 'function') {
      setupYouTubeMasterSheet();
      sheet = spreadsheet.getSheetByName(YTMASTER_SHEET_NAME);
    } else {
      sheet = spreadsheet.insertSheet(YTMASTER_SHEET_NAME);
      sheet.getRange(1, 1, 1, YTMASTER_HEADERS.length).setValues([YTMASTER_HEADERS]);
    }
  }

  const headerMap = ytMasterGetHeaderMap_(sheet);
  YTMASTER_HEADERS.forEach((header) => {
    if (typeof headerMap[header] === 'undefined') {
      throw new Error(`Missing required column: ${header}`);
    }
  });

  return sheet;
}

function ytMasterGetHeaderMap_(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const headerMap = {};

  headers.forEach((header, index) => {
    if (header) {
      headerMap[String(header).trim()] = index;
    }
  });

  return headerMap;
}

function ytMasterFormatInsertedRows_(sheet, startRow, rowCount) {
  if (rowCount < 1) return;

  // Apply formatting to new rows only (no validation - validation already set via Setup Sheet)

  const CENTER_COLUMNS = ['video_id', 'published_at', 'duration', 'views_today', 'like_count',
    'comment_count', 'last_updated_at', 'video_type', 'type_source', 'optimize_status', 'selected_for_optimize'];

  CENTER_COLUMNS.forEach((header) => {
    const idx = YTMASTER_HEADERS.indexOf(header);
    if (idx !== -1) {
      sheet.getRange(startRow, idx + 1, rowCount, 1)
        .setHorizontalAlignment('center')
        .setVerticalAlignment('middle');
    }
  });

  // Row height
  sheet.setRowHeightsForced(startRow, rowCount, 84);
}

function ytMasterBuildImageFormula_(video) {
  const thumb =
    (video.snippet.thumbnails && video.snippet.thumbnails.medium && video.snippet.thumbnails.medium.url) ||
    (video.snippet.thumbnails && video.snippet.thumbnails.default && video.snippet.thumbnails.default.url) ||
    '';

  return thumb ? `=IMAGE("${thumb}")` : '';
}

function ytMasterJoinTags_(tags) {
  return Array.isArray(tags) ? tags.join(', ') : '';
}

function ytMasterFormatDate_(date) {
  return Utilities.formatDate(date, 'GMT+7', 'dd/MM/yyyy');
}

function ytMasterFormatDateTime_(date) {
  return Utilities.formatDate(date, 'GMT+7', 'dd/MM/yyyy HH:mm:ss');
}

function ytMasterParseDuration_(durationText) {
  const match = String(durationText || '').match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  return (parseInt(match[1], 10) || 0) * 3600 +
    (parseInt(match[2], 10) || 0) * 60 +
    (parseInt(match[3], 10) || 0);
}

function ytMasterFormatDuration_(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

// ============================================================
// SHORT / LONG SHEET SPLITTER
// ============================================================

const SHORT_SHEET_NAME = 'Short Videos';
const LONG_SHEET_NAME = 'Long Videos';

/**
 * syncShortLongSheets
 * Tạo/cập nhật 2 sheet phân loại short/long từ YouTube Master.
 * Chạy sau mỗi initialFullSync hoặc refreshStatsDaily.
 */
function syncShortLongSheets() {
  const masterSheet = ytMasterGetReadySheet_();
  const headerMap = ytMasterGetHeaderMap_(masterSheet);

  // Read all data from YouTube Master
  const lastRow = masterSheet.getLastRow();
  if (lastRow < 2) {
    Browser.msgBox('YouTube Master has no data.');
    return;
  }

  const allData = masterSheet.getRange(2, 1, lastRow - 1, YTMASTER_HEADERS.length).getValues();

  // Separate short vs long
  const shortRows = [];
  const longRows = [];

  allData.forEach((row) => {
    const videoType = row[headerMap.video_type];
    if (videoType === 'short') {
      shortRows.push(row);
    } else if (videoType === 'long') {
      longRows.push(row);
    }
  });

  // Update or create sheets
  updateTargetSheet_(SHORT_SHEET_NAME, shortRows, headerMap);
  updateTargetSheet_(LONG_SHEET_NAME, longRows, headerMap);

  Browser.msgBox(
    `✅ Synced:\n• ${shortRows.length} short videos\n• ${longRows.length} long videos`
  );
}

/**
 * updateTargetSheet_
 * Update or create a target sheet with filtered data.
 * Preserves manual edits on target sheet if possible.
 */
function updateTargetSheet_(sheetName, rows, headerMap) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(sheetName);

  // Create sheet if not exists
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    // Set headers
    const headers = YTMASTER_HEADERS.map((h) => h);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#d9ead3');
  }

  // Clear existing data (except header row)
  const existingLastRow = sheet.getLastRow();
  if (existingLastRow > 1) {
    sheet.getRange(2, 1, existingLastRow - 1, YTMASTER_HEADERS.length).clearContent();
  }

  // Write new data
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, YTMASTER_HEADERS.length).setValues(rows);
    sheet.setRowHeightsForced(2, rows.length, 84);
  }
}

function splitShortLong() {
  syncShortLongSheets();
}

// ============================================================
// SORT FUNCTIONS
// ============================================================

/**
 * sortYouTubeMasterByDate
 * Sort YouTube Master sheet by published_at (newest first).
 * Chạy thủ công hoặc sau initialFullSync.
 */
function sortYouTubeMasterByDate() {
  const sheet = ytMasterGetReadySheet_();
  const lastRow = sheet.getLastRow();

  if (lastRow < 3) {
    Browser.msgBox('Not enough data to sort.');
    return;
  }

  const headerMap = ytMasterGetHeaderMap_(sheet);
  const dateColIndex = headerMap.published_at;
  const colCount = sheet.getLastColumn();

  // Get data with actual date values
  const range = sheet.getRange(2, 1, lastRow - 1, colCount);
  const data = range.getValues();

  // Sort by published_at (index) - newest first
  data.sort((a, b) => {
    const dateA = parseDateValue_(a[dateColIndex]);
    const dateB = parseDateValue_(b[dateColIndex]);
    return dateB.getTime() - dateA.getTime();
  });

  // Write back in batches to avoid service errors
  const BATCH_SIZE = 100;
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    const batchRange = sheet.getRange(i + 2, 1, batch.length, colCount);
    batchRange.setDataValidation(null);
    batchRange.setValues(batch);
  }

  Browser.msgBox(`✅ Sorted ${lastRow - 1} rows by date (newest first).`);
}

/**
 * parseDateValue_
 * Parse date from various formats (Date object or string dd/MM/yyyy)
 */
function parseDateValue_(value) {
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return new Date(0);
    return value;
  }
  if (typeof value === 'string' && value.includes('/')) {
    const parts = value.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      if (isNaN(d.getTime())) return new Date(0);
      return d;
    }
  }
  const d = new Date(value);
  if (isNaN(d.getTime())) return new Date(0);
  return d;
}

/**
 * sortAllSheetsByDate
 * Sort YouTube Master + Short/Long sheets by date.
 */
function sortAllSheetsByDate() {
  sortYouTubeMasterByDate();
  syncShortLongSheets(); // Re-sync after sort
  Browser.msgBox('✅ All sheets sorted by date.');
}

// Alias
function sortByDate() {
  sortYouTubeMasterByDate();
}

// ============================================================
// LEGACY FUNCTIONS - Aliases for backward compatibility
// ============================================================

function fetchYouTubeMasterFullData() {
  initialFullSync();
}

function dailyAddNewVideosToMaster() {
  addNewVideosDaily();
}

function updateYouTubeMasterStatsBatch() {
  refreshStatsDaily();
}