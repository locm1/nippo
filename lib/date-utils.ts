/**
 * 今日の日付を YYYY-MM-DD 形式で取得
 */
export function getTodayDate(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 日付文字列を表示用の日本語形式に変換
 * @param dateString YYYY-MM-DD 形式の日付文字列
 * @returns YYYY年MM月DD日 形式の文字列
 */
export function formatDateToJapanese(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00') // タイムゾーンの問題を避けるため
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}年${month}月${day}日`
}

/**
 * 日付文字列が今日かどうかを判定
 */
export function isToday(dateString: string): boolean {
  return dateString === getTodayDate()
}

/**
 * 報告日から日報タイトルを生成
 * @param reportDate YYYY-MM-DD 形式の報告日
 * @returns "YYYY/MM/DDの日報" 形式の文字列
 */
export function generateNippoTitle(reportDate: string): string {
  const date = new Date(reportDate + 'T00:00:00')
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}の日報`
}

/**
 * 日付文字列を Date オブジェクトに変換（タイムゾーン考慮）
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString + 'T00:00:00')
}