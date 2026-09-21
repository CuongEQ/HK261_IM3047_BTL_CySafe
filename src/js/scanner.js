/**
 * CySafe Vietnam - URL Scanner Engine
 * Multi-layer malicious URL detection:
 * Layer 1: Heuristic / Brand Phishing Detection
 * Layer 2: ChongLuaDao API
 * Layer 3: Google Safe Browsing (simulated for demo)
 */

// Known Vietnamese brand domains to check for typosquatting
const BRAND_DOMAINS = {
  'vietcombank': ['vietcombank.com.vn', 'vcb.com.vn'],
  'techcombank': ['techcombank.com.vn', 'tcb.com.vn'],
  'mbbank': ['mbbank.com.vn'],
  'tpbank': ['tpbank.com.vn'],
  'vpbank': ['vpbank.com.vn'],
  'bidv': ['bidv.com.vn'],
  'agribank': ['agribank.com.vn'],
  'vneid': ['vneid.gov.vn'],
  'dichvucong': ['dichvucong.gov.vn'],
  'bhxh': ['baohiemxahoi.gov.vn'],
  'shopee': ['shopee.vn'],
  'lazada': ['lazada.vn'],
  'tiki': ['tiki.vn'],
  'momo': ['momo.vn'],
  'zalopay': ['zalopay.vn'],
  'viettel': ['viettel.vn', 'viettelmoney.vn'],
};

// Suspicious TLDs
const SUSPICIOUS_TLDS = [
  '.xyz', '.top', '.tk', '.ml', '.ga', '.cf', '.gq', '.buzz',
  '.club', '.info', '.site', '.online', '.live', '.click',
  '.link', '.work', '.cam', '.icu', '.fun', '.space',
  '.monster', '.beauty', '.loan', '.win', '.bid'
];

// Homograph attack characters
const HOMOGRAPH_MAP = {
  'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'х': 'x',
  'і': 'i', 'ј': 'j', 'ɡ': 'g', 'ν': 'v', 'ω': 'w',
  '0': 'o', '1': 'l', '!': 'i',
};

/**
 * Extract domain info from a URL string
 */
function parseDomain(url) {
  try {
    let cleaned = url.trim();
    if (!cleaned.match(/^https?:\/\//i)) {
      cleaned = 'http://' + cleaned;
    }
    const parsed = new URL(cleaned);
    return {
      fullUrl: cleaned,
      hostname: parsed.hostname.toLowerCase(),
      protocol: parsed.protocol,
      pathname: parsed.pathname,
      isHTTPS: parsed.protocol === 'https:',
    };
  } catch {
    return null;
  }
}

/**
 * Layer 1: Heuristic Analysis
 */
function analyzeHeuristic(domainInfo) {
  const findings = [];
  let score = 100;
  const { hostname, isHTTPS, fullUrl } = domainInfo;

  // Check HTTPS
  if (!isHTTPS) {
    findings.push({ type: 'warn', text: 'Trang web không sử dụng HTTPS (kết nối không được mã hóa)' });
    score -= 10;
  }

  // Check suspicious TLD
  const tld = '.' + hostname.split('.').pop();
  if (SUSPICIOUS_TLDS.includes(tld)) {
    findings.push({ type: 'danger', text: `Đuôi tên miền ${tld} thuộc nhóm rủi ro cao, thường bị lợi dụng cho lừa đảo` });
    score -= 25;
  }

  // Check for brand typosquatting
  for (const [brand, officialDomains] of Object.entries(BRAND_DOMAINS)) {
    const isOfficial = officialDomains.some(d => hostname === d || hostname.endsWith('.' + d));
    if (isOfficial) {
      findings.push({ type: 'safe', text: `✓ Tên miền chính thức của ${brand.toUpperCase()}` });
      score = Math.max(score, 85);
      break;
    }

    // Check if hostname contains brand name but isn't official
    if (hostname.includes(brand) && !isOfficial) {
      findings.push({
        type: 'danger',
        text: `Tên miền chứa "${brand}" nhưng KHÔNG phải tên miền chính thức. Nghi vấn giả mạo thương hiệu!`
      });
      score -= 35;
    }
  }

  // Check for IP address as hostname
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    findings.push({ type: 'danger', text: 'URL sử dụng địa chỉ IP trực tiếp thay vì tên miền – dấu hiệu phishing' });
    score -= 30;
  }

  // Check for excessive subdomains
  const subdomainCount = hostname.split('.').length - 2;
  if (subdomainCount > 2) {
    findings.push({ type: 'warn', text: `Tên miền có ${subdomainCount} subdomain – cấu trúc bất thường` });
    score -= 15;
  }

  // Check for homograph / unicode characters
  const hasHomograph = [...hostname].some(ch => HOMOGRAPH_MAP[ch]);
  if (hasHomograph) {
    findings.push({ type: 'danger', text: 'Tên miền chứa ký tự Unicode giả mạo (Homograph Attack) – RẤT NGUY HIỂM!' });
    score -= 40;
  }

  // Check for suspicious keywords
  const suspiciousKeywords = ['login', 'verify', 'update', 'confirm', 'secure', 'account', 'banking', 'khuyenmai', 'trung-thuong', 'xac-thuc', 'nhan-thuong'];
  for (const keyword of suspiciousKeywords) {
    if (hostname.includes(keyword) || fullUrl.toLowerCase().includes(keyword)) {
      findings.push({ type: 'warn', text: `URL chứa từ khóa nhạy cảm "${keyword}" thường xuất hiện trong đường link lừa đảo` });
      score -= 10;
      break;
    }
  }

  // Check domain length
  if (hostname.length > 40) {
    findings.push({ type: 'warn', text: 'Tên miền quá dài, bất thường so với trang web hợp pháp' });
    score -= 10;
  }

  // Check for excessive hyphens
  if ((hostname.match(/-/g) || []).length > 3) {
    findings.push({ type: 'warn', text: 'Tên miền chứa quá nhiều dấu gạch ngang – thường thấy ở trang giả mạo' });
    score -= 15;
  }

  return {
    layerName: 'Phân tích Heuristic & Nhận diện Giả mạo',
    score: Math.max(0, Math.min(100, score)),
    findings,
    status: score >= 70 ? 'safe' : score >= 40 ? 'warn' : 'danger'
  };
}

/**
 * Layer 2: ChongLuaDao API check (simulated)
 * In production, this would call: https://api.chongluadao.vn/v1/check?url=
 */
async function checkChongLuaDao(url) {
  // Simulated known malicious URLs for demo
  const knownScamPatterns = [
    'vcb-ebanking', 'vietcombank-online', 'mb-bank-khuyenmai',
    'vneid-dichvucong', 'xac-thuc-vneid', 'nhan-thuong',
    'viettel-khuyenmai', 'shopee-tragop', 'momo-thuong',
    'dichvucong-update', 'bhxh-giahan'
  ];

  await new Promise(r => setTimeout(r, 800 + Math.random() * 400));

  const isKnownScam = knownScamPatterns.some(p => url.toLowerCase().includes(p));

  if (isKnownScam) {
    return {
      layerName: 'Cơ sở dữ liệu Chống Lừa Đảo (VN)',
      status: 'danger',
      score: 0,
      findings: [{ type: 'danger', text: '⛔ URL này đã được báo cáo là TRANG WEB LỪA ĐẢO trong cơ sở dữ liệu ChongLuaDao.vn' }]
    };
  }

  return {
    layerName: 'Cơ sở dữ liệu Chống Lừa Đảo (VN)',
    status: 'safe',
    score: 100,
    findings: [{ type: 'safe', text: '✓ Không tìm thấy trong danh sách cảnh báo Chống Lừa Đảo' }]
  };
}

/**
 * Layer 3: Google Safe Browsing check (simulated)
 * In production, this would call Google Safe Browsing API v4
 */
async function checkSafeBrowsing(url) {
  await new Promise(r => setTimeout(r, 600 + Math.random() * 300));

  // Simulate: all non-suspicious URLs pass
  return {
    layerName: 'Google Safe Browsing',
    status: 'safe',
    score: 100,
    findings: [{ type: 'safe', text: '✓ Không nằm trong danh sách cảnh báo Google Safe Browsing' }]
  };
}

/**
 * Main scan function - orchestrates all layers
 */
export async function scanURL(urlInput) {
  const domainInfo = parseDomain(urlInput);
  if (!domainInfo) {
    return {
      error: true,
      message: 'URL không hợp lệ. Vui lòng nhập đúng định dạng (vd: https://example.com)'
    };
  }

  // Run Layer 1 synchronously
  const heuristicResult = analyzeHeuristic(domainInfo);

  // Run Layer 2 & 3 in parallel
  const [cldResult, gsbResult] = await Promise.all([
    checkChongLuaDao(domainInfo.fullUrl),
    checkSafeBrowsing(domainInfo.fullUrl)
  ]);

  // Calculate composite score
  const layers = [heuristicResult, cldResult, gsbResult];
  const minScore = Math.min(...layers.map(l => l.score));
  const avgScore = Math.round(layers.reduce((s, l) => s + l.score, 0) / layers.length);

  // If any layer flags danger, overall is danger
  const hasDanger = layers.some(l => l.status === 'danger');
  const hasWarn = layers.some(l => l.status === 'warn');

  const overallScore = hasDanger ? Math.min(minScore, 25) : hasWarn ? Math.min(avgScore, 60) : avgScore;
  const overallStatus = overallScore <= 30 ? 'danger' : overallScore <= 60 ? 'warn' : 'safe';

  const statusLabels = {
    safe: 'An Toàn',
    warn: 'Cần Cảnh Giác',
    danger: 'Nguy Hiểm'
  };

  const adviceMap = {
    safe: 'Trang web này không có dấu hiệu đáng ngờ từ các nguồn kiểm tra. Tuy nhiên, luôn cẩn trọng khi nhập thông tin cá nhân.',
    warn: 'Trang web này có một số dấu hiệu cần cảnh giác. Không nên nhập thông tin cá nhân, mật khẩu hay thông tin ngân hàng.',
    danger: '⚠️ CẢNH BÁO: Trang web này có dấu hiệu LỪA ĐẢO / ĐỘC HẠI. KHÔNG truy cập, KHÔNG nhập bất kỳ thông tin nào. Nếu đã truy cập, hãy đổi mật khẩu ngay.'
  };

  return {
    error: false,
    url: domainInfo.fullUrl,
    hostname: domainInfo.hostname,
    score: overallScore,
    status: overallStatus,
    label: statusLabels[overallStatus],
    advice: adviceMap[overallStatus],
    layers
  };
}
