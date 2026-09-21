/**
 * CySafe Vietnam - Password Strength Analyzer
 * Client-side only - password never leaves the browser
 * Based on NIST SP 800-63B guidelines
 */

const COMMON_PASSWORDS = [
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey',
  'master', 'dragon', 'login', 'princess', 'football', 'shadow',
  'sunshine', 'trustno1', 'iloveyou', 'batman', 'access', 'hello',
  'charlie', 'donald', 'password1', 'matkhau', 'mk123456', 'admin',
  'letmein', 'welcome', 'passw0rd', '1234567890', 'anhyeuem',
];

const COMMON_PATTERNS = [
  /^[0-9]+$/,           // All numbers
  /^[a-z]+$/,           // All lowercase
  /^[A-Z]+$/,           // All uppercase
  /(.)\1{2,}/,          // Repeated chars (aaa, 111)
  /^(012|123|234|345|456|567|678|789|890)+$/, // Sequential numbers
  /^(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)+$/i, // Sequential letters
  /^(qwerty|asdf|zxcv)/i, // Keyboard patterns
];

/**
 * Calculate password entropy
 */
function calculateEntropy(password) {
  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 33;

  return password.length * Math.log2(charsetSize || 1);
}

/**
 * Estimate brute-force crack time
 * Assuming 10 billion guesses/second (high-end GPU cluster)
 */
function estimateCrackTime(entropy) {
  const guessesPerSecond = 10_000_000_000; // 10B
  const totalGuesses = Math.pow(2, entropy);
  const seconds = totalGuesses / guessesPerSecond;

  if (seconds < 1) return 'Ngay lập tức';
  if (seconds < 60) return `${Math.round(seconds)} giây`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} phút`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} giờ`;
  if (seconds < 86400 * 30) return `${Math.round(seconds / 86400)} ngày`;
  if (seconds < 86400 * 365) return `${Math.round(seconds / (86400 * 30))} tháng`;
  if (seconds < 86400 * 365 * 1000) return `${Math.round(seconds / (86400 * 365))} năm`;
  if (seconds < 86400 * 365 * 1_000_000) return `${Math.round(seconds / (86400 * 365 * 1000))}K năm`;
  if (seconds < 86400 * 365 * 1_000_000_000) return `${Math.round(seconds / (86400 * 365 * 1_000_000))}M năm`;
  return 'Hàng tỷ năm+';
}

/**
 * Analyze password strength
 */
export function analyzePassword(password) {
  if (!password) {
    return {
      score: 0,
      level: 'none',
      label: '',
      crackTime: '',
      tips: [],
      color: 'var(--text-tertiary)'
    };
  }

  let score = 0;
  const tips = [];

  // Length scoring
  if (password.length >= 8) score += 15;
  if (password.length >= 12) score += 15;
  if (password.length >= 16) score += 10;
  if (password.length < 8) {
    tips.push('Mật khẩu cần ít nhất 8 ký tự (khuyến nghị 12+ ký tự)');
  }

  // Character variety
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  if (hasLower) score += 10;
  if (hasUpper) score += 10;
  if (hasDigit) score += 10;
  if (hasSpecial) score += 15;

  if (!hasUpper) tips.push('Thêm chữ in hoa (A-Z)');
  if (!hasDigit) tips.push('Thêm chữ số (0-9)');
  if (!hasSpecial) tips.push('Thêm ký tự đặc biệt (!@#$%^&*)');

  // Check common passwords
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    score = Math.min(score, 5);
    tips.unshift('⚠️ Đây là mật khẩu CỰC KỲ PHỔ BIẾN, dễ bị dò trong vài giây!');
  }

  // Check common patterns
  for (const pattern of COMMON_PATTERNS) {
    if (pattern.test(password)) {
      score = Math.max(0, score - 20);
      tips.push('Tránh dùng chuỗi ký tự có quy luật (123, abc, qwerty...)');
      break;
    }
  }

  // Check for personal info patterns (common in VN)
  if (/^[0-9]{6,8}$/.test(password)) {
    tips.push('Không dùng ngày sinh làm mật khẩu');
  }

  // Entropy bonus
  const entropy = calculateEntropy(password);
  if (entropy > 50) score += 10;
  if (entropy > 70) score += 5;

  score = Math.min(100, Math.max(0, score));

  // Determine level
  let level, label, color;
  if (score >= 80) { level = 'strong'; label = 'Rất Mạnh 💪'; color = 'var(--safe)'; }
  else if (score >= 60) { level = 'good'; label = 'Khá Tốt 👍'; color = '#22D3EE'; }
  else if (score >= 40) { level = 'fair'; label = 'Trung Bình ⚠️'; color = 'var(--warn)'; }
  else if (score >= 20) { level = 'weak'; label = 'Yếu 😟'; color = '#FB923C'; }
  else { level = 'critical'; label = 'Rất Yếu ❌'; color = 'var(--danger)'; }

  const crackTime = estimateCrackTime(entropy);

  // General tips
  if (tips.length === 0 && score >= 80) {
    tips.push('✅ Mật khẩu rất tốt! Nhớ bật xác thực 2 lớp (2FA) để an toàn tối đa.');
  }
  if (score < 80) {
    tips.push('💡 Thử dùng cụm từ dài (passphrase): "ConMeoChayNhanh@2024!"');
  }

  return { score, level, label, crackTime, tips, color, entropy: Math.round(entropy) };
}
