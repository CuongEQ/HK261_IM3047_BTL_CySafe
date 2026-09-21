/**
 * CySafe Vietnam - Main Application
 * Single Page Application with section-based routing
 */

import './css/style.css';
import { scanURL } from './js/scanner.js';
import { analyzePassword } from './js/password.js';
import { sound } from './js/audio.js';
import { initCyberMatrix } from './js/cyberMatrix.js';
import campaignsData from './data/campaigns.json';
import scamTypesData from './data/scamTypes.json';
import questionsData from './data/questions.json';
import simulationsData from './data/simulations.json';

// =============================================
// APP STATE
// =============================================
const state = {
  currentPage: 'home',
  mobileMenuOpen: false,
  cyberMatrixController: null,
  // Handbook
  activeFilter: 'all',
  scamSearchQuery: '',
  // Quiz
  quizStarted: false,
  quizCurrentQ: 0,
  quizAnswers: [],
  quizFinished: false,
  // Simulation & Branching Tree
  simCategory: 'all',
  simCurrentIndex: 0,
  simFoundFlags: new Set(),
  simCallState: 'incoming', // 'incoming' | 'active' | 'ended'
  simCallTimer: null,
  simCallSeconds: 0,
  simCallStep: 0,
  simUserChoices: {},
  simChatMessages: null,
  simChatChoice: null,
  simNodeId: null,
  simNodeHistory: [],
  simExploredOutcomes: {},
  simShowDecisionTree: false,
  simVideoMicMuted: false,
  simVideoCamOff: false,
  simPhishBrowserOpen: false,
  simPhishConsequenceActive: false,
  simPhishFormValues: {},
  simOutcomePopupVisible: true,
};

// =============================================
// ROUTER
// =============================================
function navigateTo(page) {
  state.currentPage = page;
  state.mobileMenuOpen = false;

  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(`page-${page}`);
  if (target) target.classList.add('active');

  // Update nav
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === page);
  });

  // Close mobile menu
  document.querySelector('.nav')?.classList.remove('mobile-open');

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Cleanup cyber matrix canvas if leaving home
  if (page !== 'home' && state.cyberMatrixController) {
    state.cyberMatrixController.destroy();
    state.cyberMatrixController = null;
  }

  // Stop any active phone ring or call timers
  if (page !== 'lab') {
    sound.stopPhoneRing();
    if (state.simCallTimer) {
      clearInterval(state.simCallTimer);
      state.simCallTimer = null;
    }
  }

  // Initialize page content if needed
  if (page === 'home') renderHome();
  if (page === 'campaigns') renderCampaigns();
  if (page === 'handbook') renderHandbook();
  if (page === 'tools') initToolsPage();
  if (page === 'lab') initLabPage();
  if (page === 'quiz') initQuizPage();
}

// =============================================
// RENDER: HOME PAGE
// =============================================
function renderHome() {
  const el = document.getElementById('page-home');

  // Clean up any existing cyber matrix canvas
  if (state.cyberMatrixController) {
    state.cyberMatrixController.destroy();
    state.cyberMatrixController = null;
  }

  el.innerHTML = `
    <!-- Hero Section with Canvas & Interactive 3D Cyber Shield -->
    <section class="hero">
      <canvas id="hero-canvas"></canvas>

      <div class="container">
        <div class="hero-grid">
          <!-- Left Column: Title, Subtitle, Actions, Stats -->
          <div class="hero-left">
            <h1>Xây dựng <span class="text-gradient">Lá chắn số</span> vì một Việt Nam an toàn</h1>
            
            <p class="hero-desc">
              Mỗi công dân là một chiến sĩ trên mặt trận số. Chủ động nhận diện các thủ đoạn tấn công trên không gian mạng và nâng cao kỹ năng phòng vệ thông minh, cùng đẩy lùi tội phạm mạng.
            </p>

            <!-- National Cyber Defense Statistics Dashboard -->
            <div class="hero-stats-panel">
              <div class="hero-stats-head">
                <div class="hero-stats-badge">
                  <span class="pulse-live-indicator"></span>
                  SỐ LIỆU TÁC CHIẾN KHÔNG GIAN MẠNG
                </div>
                <h3 class="hero-stats-title">Mỗi ngày tại Việt Nam</h3>
              </div>

              <!-- Live Metrics with Animated Number Counters -->
              <div class="hero-stats-grid">
                <div class="hero-stat-card">
                  <div class="stat-icon-wrap">📰</div>
                  <div class="stat-number-box">
                    <div class="stat-number counter-anim" data-target="3420" data-suffix="+">0</div>
                    <div class="stat-label">Tin giả được phát hiện</div>
                  </div>
                </div>

                <div class="hero-stat-card">
                  <div class="stat-icon-wrap">🚫</div>
                  <div class="stat-number-box">
                    <div class="stat-number counter-anim" data-target="8650" data-suffix="+">0</div>
                    <div class="stat-label">Trang web độc hại bị chặn</div>
                  </div>
                </div>

                <div class="hero-stat-card">
                  <div class="stat-icon-wrap">📞</div>
                  <div class="stat-number-box">
                    <div class="stat-number counter-anim" data-target="145000" data-suffix="+">0</div>
                    <div class="stat-label">Cuộc gọi lừa đảo đã xác định</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Interactive 3D Shield with Center Star -->
          <div class="hero-right">
            <div class="hero-shield-3d-scene" id="hero-shield-3d" title="Rê chuột để chuyển động Lá chắn số 3D">
              <!-- Hologram Cyber Rings -->
              <div class="shield-ambient-glow"></div>
              <div class="shield-energy-ring-1"></div>
              <div class="shield-energy-ring-2"></div>
              <div class="shield-radar-sweep-line"></div>

              <!-- 3D Tilting Shield Card -->
              <div class="shield-3d-card" id="shield-card-inner">
                <!-- Glare Light Reflection -->
                <div class="shield-dynamic-glare" id="shield-glare"></div>

                <!-- SVG 3D Shield Mesh -->
                <svg class="shield-svg" viewBox="0 0 340 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="shieldPlateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#0e223d"/>
                      <stop offset="45%" stop-color="#0a1a30"/>
                      <stop offset="100%" stop-color="#030b17"/>
                    </linearGradient>
                    <linearGradient id="shieldRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#00F2FE"/>
                      <stop offset="30%" stop-color="#38BDF8"/>
                      <stop offset="70%" stop-color="#2563EB"/>
                      <stop offset="100%" stop-color="#00F2FE"/>
                    </linearGradient>
                    <linearGradient id="shieldInnerPlateGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stop-color="#0b1e38" stop-opacity="0.95"/>
                      <stop offset="100%" stop-color="#040d1c" stop-opacity="0.98"/>
                    </linearGradient>
                    <linearGradient id="vietnamStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#FFF59D"/>
                      <stop offset="35%" stop-color="#FBBF24"/>
                      <stop offset="75%" stop-color="#F59E0B"/>
                      <stop offset="100%" stop-color="#D97706"/>
                    </linearGradient>
                    <filter id="starGlowFilter" x="-40%" y="-40%" width="180%" height="180%">
                      <feGaussianBlur stdDeviation="6" result="blur"/>
                      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                    </filter>
                    <filter id="rimGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="7" result="blur"/>
                      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                    </filter>
                  </defs>

                  <!-- Outer Shield Bevel Plate with Neon Cyan Rim -->
                  <path class="shield-outer-path" 
                        d="M170 14 L310 60 C310 240 245 338 170 390 C95 338 30 240 30 60 L170 14 Z" 
                        fill="url(#shieldPlateGrad)" 
                        stroke="url(#shieldRimGrad)" 
                        stroke-width="5" 
                        filter="url(#rimGlowFilter)" />

                  <!-- Inner Inset Plate -->
                  <path class="shield-inner-path" 
                        d="M170 32 L290 72 C290 226 235 314 170 362 C105 314 50 226 50 72 L170 32 Z" 
                        fill="url(#shieldInnerPlateGrad)" 
                        stroke="#00F2FE" 
                        stroke-opacity="0.4" 
                        stroke-width="1.8" />

                  <!-- Circuit lines & Cyber geometry -->
                  <g class="shield-circuit-lines" stroke="#00F2FE" stroke-opacity="0.3" stroke-width="1.2">
                    <circle cx="170" cy="188" r="95" stroke-dasharray="5 5" fill="none" />
                    <circle cx="170" cy="188" r="120" stroke-dasharray="8 6" stroke-opacity="0.2" fill="none" />
                    <line x1="60" y1="188" x2="280" y2="188" stroke-opacity="0.2" stroke-dasharray="4 4" />
                    <line x1="170" y1="46" x2="170" y2="350" stroke-opacity="0.2" stroke-dasharray="4 4" />
                    <circle cx="95" cy="115" r="3" fill="#00F2FE" />
                    <circle cx="245" cy="115" r="3" fill="#00F2FE" />
                    <circle cx="115" cy="290" r="3" fill="#00F2FE" />
                    <circle cx="225" cy="290" r="3" fill="#00F2FE" />
                    <polyline points="75,140 105,140 120,160" fill="none" stroke-width="1.5" />
                    <polyline points="265,140 235,140 220,160" fill="none" stroke-width="1.5" />
                    <polyline points="105,270 135,298 170,298" fill="none" stroke-width="1.5" />
                    <polyline points="235,270 205,298 170,298" fill="none" stroke-width="1.5" />
                  </g>
                </svg>

                <!-- Center 3D Golden Star (pops out in 3D translateZ) -->
                <div class="shield-star-3d" id="hero-shield-star" title="Bấm vào ngôi sao để chuyển xuống Ký Cam Kết Số" style="cursor:pointer">
                  <div class="star-aurora"></div>
                  <svg class="star-3d-svg" viewBox="0 0 120 120">
                    <polygon points="60,8 75,44 114,44 82,67 95,104 60,80 25,104 38,67 6,44 45,44"
                             fill="url(#vietnamStarGrad)"
                             stroke="#FEF08A"
                             stroke-width="2.5"
                             filter="url(#starGlowFilter)" />
                  </svg>
                  <div class="star-specular-dot"></div>
                </div>

                <!-- 3D Shield Emblem Text Tag -->
                <div class="shield-emblem-badge" data-target-pillar="section-pillars" title="Bấm để chuyển xuống Ba Trụ Cột Phòng Tuyến Số" style="cursor:pointer">
                  <div class="emblem-title">BA TRỤ CỘT</div>
                  <div class="emblem-sub">MỘT MỤC TIÊU</div>
                </div>

                <!-- 3D Floating Security Status Chips -->
                <div class="shield-floating-chip chip-top-left" data-target-pillar="pillar-1" title="Bấm để xem Trụ Cột 1: Tỉnh Táo Nhận Diện" style="cursor:pointer">
                  <span class="chip-pulse-dot pulse-cyan"></span> Tỉnh táo nhận diện
                </div>
                <div class="shield-floating-chip chip-top-right" data-target-pillar="pillar-2" title="Bấm để xem Trụ Cột 2: Chủ Động Phòng Vệ" style="cursor:pointer">
                  <span class="chip-pulse-dot pulse-amber"></span> Chủ động phòng vệ
                </div>
                <div class="shield-floating-chip chip-bottom" data-target-pillar="pillar-3" title="Bấm để xem Trụ Cột 3: Tố Giác và Lan Toả" style="cursor:pointer">
                  <span class="chip-pulse-dot pulse-green"></span> Tố giác và lan toả
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION: 3 Trụ Cột Phòng Tuyến Số (Three Pillars of Defense) -->
    <section class="section" id="section-pillars" style="background:linear-gradient(180deg,transparent 0%,rgba(15,23,42,0.6) 100%)">
      <div class="container">
        <div class="section-header">
          <div class="badge badge-cyan" style="margin-bottom:var(--space-sm)">MẶT TRẬN AN NINH MẠNG</div>
          <h2>3 Trụ Cột <span class="text-gradient">Phòng Tuyến Số Toàn Dân</span></h2>
          <p>Mỗi người dân nắm vững 3 nguyên lý cốt lõi để bảo vệ tài sản, thông tin cá nhân và bình yên cho gia đình</p>
        </div>

        <div class="pillar-grid">
          <!-- Pillar 1 -->
          <div class="pillar-card" id="pillar-1">
            <div class="pillar-header">
              <div class="pillar-icon-glow">👁️</div>
              <div>
                <div class="pillar-tag">Trụ Cột 01</div>
                <h3>Tỉnh Táo Nhận Diện</h3>
              </div>
            </div>
            <p class="pillar-desc">
              Không hoảng sợ trước mọi lời đe dọa, không tham lam trước những phần thưởng ảo và lời mời việc nhẹ lương cao phi thực tế.
            </p>
            <ul class="pillar-checklist">
              <li><span class="pillar-check-icon">✓</span> Cơ quan Công an, Tòa án KHÔNG làm việc qua điện thoại</li>
              <li><span class="pillar-check-icon">✓</span> Ngân hàng KHÔNG BAO GIỜ yêu cầu cung cấp OTP hay mật khẩu</li>
              <li><span class="pillar-check-icon">✓</span> Cảnh giác với video call ngắn, giật lag của người thân mượn tiền</li>
            </ul>
          </div>

          <!-- Pillar 2 -->
          <div class="pillar-card" id="pillar-2">
            <div class="pillar-header">
              <div class="pillar-icon-glow">🔒</div>
              <div>
                <div class="pillar-tag">Trụ Cột 02</div>
                <h3>Chủ Động Phòng Vệ</h3>
              </div>
            </div>
            <p class="pillar-desc">
              Thiết lập hàng rào kỹ thuật vững chắc trên các thiết bị thông minh và tài khoản giao dịch ngân hàng của bạn.
            </p>
            <ul class="pillar-checklist">
              <li><span class="pillar-check-icon">✓</span> Bật xác thực 2 lớp (2FA / Sinh trắc học) cho mọi tài khoản</li>
              <li><span class="pillar-check-icon">✓</span> Tuyệt đối không cài đặt các ứng dụng trôi nổi ngoài Google Play/App Store</li>
              <li><span class="pillar-check-icon">✓</span> Luôn kiểm tra tính xác thực của liên kết trước khi click vào</li>
            </ul>
          </div>

          <!-- Pillar 3 -->
          <div class="pillar-card" id="pillar-3">
            <div class="pillar-header">
              <div class="pillar-icon-glow">📢</div>
              <div>
                <div class="pillar-tag">Trụ Cột 03</div>
                <h3>Tố Giác và Lan Toả</h3>
              </div>
            </div>
            <p class="pillar-desc">
              Mỗi thông tin phản ánh là một đòn giáng mạnh vào tội phạm số, giúp bảo vệ hàng triệu đồng bào khỏi cạm bẫy lừa đảo.
            </p>
            <ul class="pillar-checklist">
              <li><span class="pillar-check-icon">✓</span> Chủ động tố giác cơ quan công an các hành vi vi phạm, tội phạm mạng</li>
              <li><span class="pillar-check-icon">✓</span> Lên án mạnh mẽ các hành vi lừa đảo không gian mạng</li>
              <li><span class="pillar-check-icon">✓</span> Lan tỏa kiến thức an toàn số cho người thân, đặc biệt là người cao tuổi và trẻ em</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION: Quy Tắc Vàng 3 Không – 2 Phải – 1 Báo Cáo -->
    <section class="section" style="background:rgba(15,23,42,0.4)">
      <div class="container">
        <div class="section-header">
          <h2>Thông điệp vàng <span class="text-gradient">3 Không – 2 Phải – 1 Báo cáo</span></h2>
          <p>Khuyến nghị chính thức từ Cục An toàn Thông tin dành cho mọi người dân Việt Nam</p>
        </div>
        <div class="rule-grid">
          <div class="rule-card dont">
            <div class="rule-card-header">
              <div class="rule-icon">🚫</div>
              <div class="rule-card-tag">KHÔNG 01</div>
            </div>
            <h3>KHÔNG cung cấp thông tin cá nhân & OTP</h3>
            <p>Tuyệt đối không đọc CCCD, mật khẩu ngân hàng, mã xác thực OTP cho bất kỳ ai qua điện thoại hoặc tin nhắn.</p>
          </div>
          <div class="rule-card dont">
            <div class="rule-card-header">
              <div class="rule-icon">🚫</div>
              <div class="rule-card-tag">KHÔNG 02</div>
            </div>
            <h3>KHÔNG bấm link lạ / tải app APK trôi nổi</h3>
            <p>Không click vào đường link trong SMS/Email không rõ nguồn gốc. Chỉ cài đặt ứng dụng từ App Store và Google Play.</p>
          </div>
          <div class="rule-card dont">
            <div class="rule-card-header">
              <div class="rule-icon">🚫</div>
              <div class="rule-card-tag">KHÔNG 03</div>
            </div>
            <h3>KHÔNG chuyển tiền theo yêu cầu đe dọa</h3>
            <p>Cơ quan bảo vệ pháp luật không có "Tài khoản an toàn" và không bao giờ yêu cầu chuyển tiền giám định qua điện thoại.</p>
          </div>
          <div class="rule-card do">
            <div class="rule-card-header">
              <div class="rule-icon">✅</div>
              <div class="rule-card-tag">PHẢI 01</div>
            </div>
            <h3>PHẢI xác minh danh tính qua kênh chính thức</h3>
            <p>Khi nhận thông báo khẩn cấp hoặc đe dọa, cúp máy ngay và gọi tới số tổng đài chính thức của đơn vị đó để đối chiếu.</p>
          </div>
          <div class="rule-card do">
            <div class="rule-card-header">
              <div class="rule-icon">✅</div>
              <div class="rule-card-tag">PHẢI 02</div>
            </div>
            <h3>PHẢI kích hoạt bảo mật 2 lớp (2FA)</h3>
            <p>Bật xác thực 2 yếu tố và liên kết sinh trắc học cho toàn bộ tài khoản ngân hàng, Zalo, Facebook, Email cá nhân.</p>
          </div>
          <div class="rule-card report">
            <div class="rule-card-header">
              <div class="rule-icon">📞</div>
              <div class="rule-card-tag">BÁO CÁO</div>
            </div>
            <h3>BÁO CÁO ngay khi phát hiện dấu hiệu lừa đảo</h3>
            <p>Gọi ngay Tổng đài 156 (miễn phí) hoặc gửi phản ánh lên cổng quốc gia canhbao.khonggianmang.vn để cơ quan chức năng xử lý.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION: Cam Kết "Công Dân Số An Toàn" (Digital Citizen Pledge) -->
    <section class="section" id="pledge-section">
      <div class="container">
        <div class="pledge-card-wrapper">
          <div class="pledge-header">
            <div class="pledge-badge-tag">HÀNH ĐỘNG VÌ TỔ QUỐC SỐ</div>
            <h2>Ký cam kết <span class="text-gradient-gold">Công dân số tiên phong</span></h2>
            <p style="color:var(--text-secondary);font-size:0.95rem;max-width:560px;margin:var(--space-sm) auto 0">
              Trở thành một chiến sĩ trên mặt trận phòng tuyến số. Bảo vệ chính mình, bảo vệ gia đình và cộng đồng!
            </p>
          </div>

          <div id="pledge-container">
            <form class="pledge-form" id="pledge-form">
              <div class="pledge-input-group">
                <label for="pledge-name">Họ và Tên:</label>
                <input type="text" id="pledge-name" class="pledge-input" placeholder="Ví dụ: Nguyễn Văn An" required />
              </div>

              <div class="pledge-checkboxes">
                <label class="pledge-item">
                  <input type="checkbox" id="pledge-c1" checked required />
                  <span>Tôi cam kết <strong>TUYỆT ĐỐI KHÔNG cung cấp mã OTP</strong>, mật khẩu ngân hàng, CCCD cho bất kỳ ai qua điện thoại hay tin nhắn.</span>
                </label>
                <label class="pledge-item">
                  <input type="checkbox" id="pledge-c2" checked required />
                  <span>Tôi cam kết <strong>KHÔNG bấm vào link lạ</strong>, không tải app nguồn gốc không rõ ràng ngoài kho ứng dụng chính thức.</span>
                </label>
                <label class="pledge-item">
                  <input type="checkbox" id="pledge-c3" checked required />
                  <span>Tôi cam kết <strong>tuyên truyền, nhắc nhở gia đình</strong> và người thân cùng nâng cao cảnh giác trước mọi thủ đoạn lừa đảo số.</span>
                </label>
              </div>

              <div style="text-align:center;margin-top:var(--space-md)">
                <button type="submit" class="btn btn-primary btn-lg" style="background:linear-gradient(135deg,#F59E0B,#D97706);box-shadow:0 0 25px rgba(245,158,11,0.4)">
                  <span>✍️ Ký Cam kết</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION: Quick Features / Tool Navigation -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>Công cụ và Tài nguyên <span class="text-gradient">An toàn số</span></h2>
          <p>Nền tảng trang bị toàn diện từ thông tin phong trào, cẩm nang kiến thức đến phòng thực chiến, là hành trang hữu ích bảo vệ người dân trên không gian mạng</p>
        </div>
        <div class="grid-4">
          <div class="card" style="cursor:pointer" data-nav="campaigns">
            <div class="card-icon">🛡️</div>
            <h3>Phong trào quốc gia</h3>
            <p>Cập nhật chỉ đạo và chiến dịch an ninh mạng của nhà nước và cơ quan chức năng</p>
          </div>
          <div class="card" style="cursor:pointer" data-nav="handbook">
            <div class="card-icon">📖</div>
            <h3>Cẩm nang Tự vệ</h3>
            <p>Tổng hợp đa dạng các hình thức tấn công và lừa đảo phổ biến nhắm đến các đối tượng: Người cao tuổi, học sinh, phụ huynh...</p>
          </div>
          <div class="card" style="cursor:pointer" data-nav="tools">
            <div class="card-icon">🔧</div>
            <h3>Công cụ Kiểm tra</h3>
            <p>Công cụ kiểm tra liên kết đáng ngờ 3 lớp. Công cụ phân tích độ mạnh và tạo mật khẩu chuẩn quốc tế NIST</p>
          </div>
          <div class="card" style="cursor:pointer" data-nav="lab">
            <div class="card-icon">🧪</div>
            <h3>Phòng Lab Thực chiến</h3>
            <p>Nhập vai, trải nghiệm và tương tác trong các tình huống lừa đảo và tấn công mạng phổ biến. Nâng cao kỹ năng nhận diện và phản ứng trước các mối đe dọa</p>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION: Emergency Hotlines -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>Mạng lưới tiếp nhận và hỗ trợ vấn đề an ninh mạng quốc gia</span></h2>
          <p>Lực lượng hỗ trợ an ninh mạng trực chiến 24/7 bảo vệ người dân</p>
        </div>
        <div class="hotlines">
          <div class="hotline-card">
            <div style="font-size:2rem">🛡️</div>
            <div class="hotline-number">024.3209.6789</div>
            <div class="hotline-label">Cục An toàn Thông tin / Trung tâm NCSC</div>
          </div>
          <div class="hotline-card">
            <div style="font-size:2rem">📱</div>
            <div class="hotline-number">156</div>
            <div class="hotline-label">Tổng đài tiếp nhận Cuộc gọi rác & Lừa đảo (Miễn phí)</div>
          </div>
          <div class="hotline-card">
            <div style="font-size:2rem">🚔</div>
            <div class="hotline-number">113</div>
            <div class="hotline-label">Cảnh sát Phản ứng nhanh — Bộ Công An</div>
          </div>
          <div class="hotline-card">
            <div style="font-size:2rem">👶</div>
            <div class="hotline-number">111</div>
            <div class="hotline-label">Tổng đài Quốc gia Bảo vệ Trẻ em trên mạng</div>
          </div>
        </div>
      </div>
    </section>
  `;

  // Initialize Cyber Matrix Canvas
  setTimeout(() => {
    state.cyberMatrixController = initCyberMatrix('hero-canvas');
  }, 50);

  // Bind 3D interactive shield on home page
  bind3DShieldInteraction();

  // Run animated number counters for stats
  animateHeroCounters();

  // Bind Shield interactive clicks (Pillars & Pledge)
  bindShieldNavigationClicks();

  // Bind Digital Citizen Pledge Form
  bindPledgeWidget();

  // Bind feature cards navigation
  el.querySelectorAll('[data-nav]').forEach(card => {
    card.addEventListener('click', () => navigateTo(card.dataset.nav));
  });
}

function bindPledgeWidget() {
  const form = document.getElementById('pledge-form');
  const container = document.getElementById('pledge-container');
  if (!form || !container) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('pledge-name');
    const citizenName = nameInput ? nameInput.value.trim() : 'Công Dân An Toàn';
    if (!citizenName) return;

    sound.playSuccessChime();

    const serialNum = `CYSAFE-${Math.floor(10000 + Math.random() * 90000)}`;
    const today = new Date().toLocaleDateString('vi-VN');

    container.innerHTML = `
      <div class="pledge-certificate">
        <div class="citizen-badge-card">
          <div class="seal-stamp">
            <span>XÁC NHẬN</span>
            <span>${today}</span>
          </div>

          <div class="citizen-badge-icon">🎖️</div>
          <div style="font-size:0.75rem;font-weight:700;color:var(--cyan);text-transform:uppercase;letter-spacing:0.1em">
            CHỨNG NHẬN CÔNG DÂN SỐ TIÊN PHONG
          </div>
          <div class="citizen-name">${citizenName}</div>
          <div class="citizen-serial">MÃ ĐỊNH DANH: ${serialNum}</div>

          <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;margin-bottom:var(--space-md)">
            Đã tham gia ký <strong>Cam Kết Công dân số tiên phong</strong>, góp phần xây dựng không gian mạng Việt Nam văn minh và an toàn cho mọi người.
          </p>

          <div style="display:flex;justify-content:center;gap:12px;margin-top:var(--space-md)">
            <button class="btn btn-sm btn-primary" id="btn-share-pledge" style="background:linear-gradient(135deg,#00F2FE,#2563EB)">
              📢 Chia sẻ ngay
            </button>
            <button class="btn btn-sm btn-secondary" id="btn-reset-pledge">
              🔄 Ký cam kết khác
            </button>
          </div>
        </div>
      </div>
    `;

    const shareBtn = container.querySelector('#btn-share-pledge');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        const text = `Tôi vừa ký cam kết trở thành "Công Dân Số Tiên Phong" trên nền tảng CySafe Vietnam (${serialNum})! Hãy cùng nhau nâng cao cảnh giác và bảo vệ bản thân trên không gian mạng!`;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text);
          alert('✅ Đã sao chép thông điệp cam kết! Hãy chia sẻ lên Facebook/Zalo để lan tỏa phong trào an ninh mạng!');
        } else {
          alert(text);
        }
      });
    }

    const resetBtn = container.querySelector('#btn-reset-pledge');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        bindPledgeWidget();
        renderHome();
      });
    }
  });
}

function bind3DShieldInteraction() {
  const container = document.getElementById('hero-shield-3d');
  const card = document.getElementById('shield-card-inner');
  const glare = document.getElementById('shield-glare');
  if (!container || !card) return;

  let bounds = null;

  const updateBounds = () => {
    bounds = container.getBoundingClientRect();
  };

  updateBounds();
  window.addEventListener('resize', updateBounds);

  container.addEventListener('mouseenter', () => {
    updateBounds();
    card.classList.add('is-interacting');
  });

  container.addEventListener('mousemove', (e) => {
    if (!bounds) updateBounds();
    const mouseX = e.clientX - bounds.left;
    const mouseY = e.clientY - bounds.top;

    const xRatio = (mouseX - bounds.width / 2) / (bounds.width / 2); // -1 to 1
    const yRatio = (mouseY - bounds.height / 2) / (bounds.height / 2); // -1 to 1

    const clampedX = Math.max(-1, Math.min(1, xRatio));
    const clampedY = Math.max(-1, Math.min(1, yRatio));

    // Dynamic 3D tilt
    const rotateY = (clampedX * 22).toFixed(2);
    const rotateX = (-clampedY * 20).toFixed(2);

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.06, 1.06, 1.06)`;

    // Interactive specular glare sheen
    if (glare) {
      const glareX = (50 + clampedX * 35).toFixed(1);
      const glareY = (50 + clampedY * 35).toFixed(1);
      glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.4) 0%, rgba(0, 242, 254, 0.2) 35%, transparent 70%)`;
      glare.style.opacity = '1';
    }
  });

  container.addEventListener('mouseleave', () => {
    card.classList.remove('is-interacting');
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    if (glare) {
      glare.style.opacity = '0';
    }
  });
}

function animateHeroCounters() {
  const counters = document.querySelectorAll('.counter-anim');
  if (!counters.length) return;

  counters.forEach(counter => {
    const target = parseInt(counter.dataset.target, 10) || 0;
    const suffix = counter.dataset.suffix || '';
    const duration = 2000;
    let startTimestamp = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(ease * target);

      counter.textContent = currentVal.toLocaleString('en-US') + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        counter.textContent = target.toLocaleString('en-US') + suffix;
      }
    };

    requestAnimationFrame(step);
  });
}

function bindShieldNavigationClicks() {
  // Chips & emblem click -> scroll to 3 Pillars
  const pillarTriggers = document.querySelectorAll('[data-target-pillar]');
  pillarTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetId = trigger.dataset.targetPillar;
      const targetEl = document.getElementById(targetId) || document.getElementById('section-pillars');
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (targetId && targetId.startsWith('pillar-')) {
          targetEl.classList.remove('pillar-card-highlight');
          void targetEl.offsetWidth; // trigger reflow
          targetEl.classList.add('pillar-card-highlight');
          setTimeout(() => targetEl.classList.remove('pillar-card-highlight'), 2200);
        }
      }
    });
  });

  // Central 3D star click -> scroll to Pledge section & focus name input
  const starEl = document.getElementById('hero-shield-star');
  if (starEl) {
    starEl.addEventListener('click', (e) => {
      e.stopPropagation();
      const pledgeSection = document.getElementById('pledge-section');
      if (pledgeSection) {
        pledgeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const nameInput = document.getElementById('pledge-name');
        if (nameInput) {
          setTimeout(() => nameInput.focus(), 650);
        }
      }
    });
  }
}

function renderScanResult(container, result) {
  if (result.error) {
    container.innerHTML = `<div class="scan-result"><div class="scan-result-card warn"><p>⚠️ ${result.message}</p></div></div>`;
    return;
  }

  const statusIcons = { safe: '✅', warn: '⚠️', danger: '🚨' };

  container.innerHTML = `
    <div class="scan-result">
      <div class="scan-result-card ${result.status}">
        <div class="score-display">
          <div class="score-circle ${result.status}">${result.score}</div>
          <div class="score-details">
            <h3>${statusIcons[result.status]} ${result.label}</h3>
            <p style="font-family:var(--font-mono);font-size:0.8rem;color:var(--text-tertiary)">${result.hostname}</p>
          </div>
        </div>
        <p style="margin-bottom:var(--space-lg);font-size:0.9rem;color:var(--text-secondary);line-height:1.7">${result.advice}</p>
        <div class="scan-layers">
          ${result.layers.map(layer => `
            <div class="scan-layer">
              <span class="scan-layer-name">
                <span>${layer.status === 'safe' ? '✅' : layer.status === 'warn' ? '⚠️' : '🚨'}</span>
                ${layer.layerName}
              </span>
              <span class="scan-layer-status badge badge-${layer.status}">${layer.score}/100</span>
            </div>
            ${layer.findings.map(f => `
              <div style="padding:8px 16px 8px 40px;font-size:0.8rem;color:var(--text-tertiary);line-height:1.5">
                ${f.text}
              </div>
            `).join('')}
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// =============================================
// RENDER: CAMPAIGNS PAGE
// =============================================
function renderCampaigns() {
  const el = document.getElementById('page-campaigns');
  el.innerHTML = `
    <div class="container">
      <div class="section-header" style="padding-top:var(--space-xl)">
        <span class="badge badge-cyan">Cập nhật 2024</span>
        <h2 style="margin-top:var(--space-md)">Phong Trào An Ninh Mạng <span class="text-gradient">Quốc Gia</span></h2>
        <p>Tổng hợp các chiến dịch, chương trình an ninh mạng chính thống từ các cơ quan Nhà nước Việt Nam</p>
      </div>

      <div style="display:flex;flex-direction:column;gap:var(--space-xl)">
        ${campaignsData.map(c => `
          <div class="card campaign-card">
            <div class="campaign-icon">${c.icon}</div>
            <div class="campaign-info">
              <div class="flex-between flex-wrap gap-sm">
                <h3>${c.title}</h3>
                <span class="badge badge-cyan">${c.badge}</span>
              </div>
              <div class="organizer">${c.organizer} • ${c.year}</div>
              <p>${c.summary}</p>
              <ul class="campaign-points">
                ${c.keyPoints.map(p => `<li>${p}</li>`).join('')}
              </ul>
              <div class="campaign-link">
                <a href="${c.link}" target="_blank" rel="noopener" class="btn btn-sm btn-secondary">
                  🔗 Truy cập nguồn chính thức
                </a>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// =============================================
// RENDER: HANDBOOK PAGE
// =============================================
function renderHandbook() {
  const el = document.getElementById('page-handbook');
  const groups = [
    { id: 'all', label: `📋 Tất cả (${scamTypesData.length})` },
    { id: 'family', label: '👨‍👩‍👧 Phụ huynh & Gia đình' },
    { id: 'youth', label: '🎓 Thanh niên & Sinh viên' },
    { id: 'worker', label: '💼 Người lao động & Công sở' },
    { id: 'elderly', label: '👴 Người cao tuổi' },
  ];

  const query = (state.scamSearchQuery || '').trim().toLowerCase();
  const filtered = scamTypesData.filter(scam => {
    const matchesGroup = state.activeFilter === 'all' || scam.group === state.activeFilter;
    if (!matchesGroup) return false;
    if (!query) return true;
    return (
      scam.title.toLowerCase().includes(query) ||
      scam.groupLabel.toLowerCase().includes(query) ||
      scam.scenario.toLowerCase().includes(query) ||
      scam.signs.some(s => s.toLowerCase().includes(query)) ||
      scam.action.toLowerCase().includes(query) ||
      scam.prevention.toLowerCase().includes(query)
    );
  });

  const dangerLabels = { critical: 'Cực kỳ nguy hiểm', high: 'Nguy hiểm cao' };

  el.innerHTML = `
    <div class="container">
      <div class="section-header" style="padding-top:var(--space-xl)">
        <h2>Cẩm Nang <span class="text-gradient">Các Hình Thức Lừa Đảo</span></h2>
        <p>Bộ nhận diện toàn diện các thủ đoạn tội phạm mạng lừa đảo trực tuyến phổ biến tại Việt Nam — Tham khảo Cục An toàn thông tin (Bộ TT&TT) & Cục An ninh mạng (Bộ Công an)</p>
      </div>

      <!-- Search Box -->
      <div class="scam-search-container" style="max-width:640px;margin:0 auto var(--space-xl);">
        <div class="scam-search-box">
          <span style="font-size:1.15rem;margin-right:var(--space-sm);opacity:0.75">🔍</span>
          <input 
            type="text" 
            id="scam-search-input" 
            placeholder="Tìm theo tên thủ đoạn, dấu hiệu (ví dụ: bắt cóc, cấp cứu, VNeID, Shopee, OTP...)" 
            value="${state.scamSearchQuery || ''}"
          />
          ${state.scamSearchQuery ? `<button class="clear-search-btn" id="clear-scam-search" title="Xóa tìm kiếm">✕</button>` : ''}
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs" style="margin-bottom:var(--space-2xl);">
        ${groups.map(g => `
          <button class="filter-tab ${state.activeFilter === g.id ? 'active' : ''}" data-filter="${g.id}">${g.label}</button>
        `).join('')}
      </div>

      ${filtered.length > 0 ? `
        <div class="grid-3">
          ${filtered.map(scam => `
            <div class="card scam-card" data-scam-id="${scam.id}">
              <div class="scam-card-header">
                <div class="card-icon">${scam.icon}</div>
                <span class="danger-level badge ${scam.danger === 'critical' ? 'badge-danger' : 'badge-warn'}">${dangerLabels[scam.danger]}</span>
              </div>
              <h3 class="scam-card-title">${scam.title}</h3>
              <div class="scam-target-tag"><span class="scam-target-icon">🎯</span> ${scam.groupLabel}</div>
              <p class="scam-preview-sign">${scam.signs[0]}</p>
              <div class="scam-card-footer">
                <span class="scam-detail-btn">Xem chi tiết kịch bản & cách xử lý <span class="arrow">→</span></span>
              </div>
            </div>
          `).join('')}
        </div>
      ` : `
        <div style="text-align:center;padding:var(--space-3xl) var(--space-md);background:var(--bg-card);border-radius:var(--radius-xl);border:1px dashed var(--border-color);max-width:600px;margin:0 auto;">
          <div style="font-size:3rem;margin-bottom:var(--space-md)">🔎</div>
          <h3 style="margin-bottom:var(--space-sm)">Không tìm thấy hình thức lừa đảo phù hợp</h3>
          <p style="color:var(--text-secondary);margin-bottom:var(--space-lg);font-size:0.95rem;">Không có kết quả nào khớp với từ khóa <strong>"${state.scamSearchQuery}"</strong> trong nhóm hiện tại.</p>
          <button class="btn btn-secondary" id="reset-scam-filter">Xem tất cả 24 hình thức</button>
        </div>
      `}
    </div>

    <!-- Modal -->
    <div class="modal-overlay" id="scam-modal">
      <div class="modal">
        <button class="modal-close" id="modal-close-btn">✕</button>
        <div id="modal-content"></div>
      </div>
    </div>
  `;

  // Bind Search Input
  const searchInput = document.getElementById('scam-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.scamSearchQuery = e.target.value;
      renderHandbook();
      // Keep focus on search input and move cursor to end
      const newInput = document.getElementById('scam-search-input');
      if (newInput) {
        newInput.focus();
        newInput.selectionStart = newInput.selectionEnd = newInput.value.length;
      }
    });
  }

  // Bind Clear Search Button
  document.getElementById('clear-scam-search')?.addEventListener('click', () => {
    state.scamSearchQuery = '';
    renderHandbook();
  });

  // Bind Reset Filter Button
  document.getElementById('reset-scam-filter')?.addEventListener('click', () => {
    state.scamSearchQuery = '';
    state.activeFilter = 'all';
    renderHandbook();
  });

  // Bind filter tabs
  el.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      state.activeFilter = tab.dataset.filter;
      renderHandbook();
    });
  });

  // Bind scam cards
  el.querySelectorAll('.scam-card').forEach(card => {
    card.addEventListener('click', () => {
      const scam = scamTypesData.find(s => s.id == card.dataset.scamId);
      if (scam) showScamModal(scam);
    });
  });

  // Bind modal close
  document.getElementById('modal-close-btn')?.addEventListener('click', closeScamModal);
  document.getElementById('scam-modal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeScamModal();
  });
}

function showScamModal(scam) {
  const modal = document.getElementById('scam-modal');
  const content = document.getElementById('modal-content');

  content.innerHTML = `
    <div style="font-size:2.5rem;margin-bottom:var(--space-md)">${scam.icon}</div>
    <span class="badge ${scam.danger === 'critical' ? 'badge-danger' : 'badge-warn'}" style="margin-bottom:var(--space-md);display:inline-flex">${scam.danger === 'critical' ? 'Cực kỳ nguy hiểm' : 'Nguy hiểm cao'}</span>
    <h2>${scam.title}</h2>

    <div class="modal-section">
      <h4>🔍 Dấu hiệu nhận biết</h4>
      <ul>
        ${scam.signs.map(s => `<li>${s}</li>`).join('')}
      </ul>
    </div>

    <div class="modal-section scenario">
      <h4>🎭 Kịch bản kẻ gian sử dụng</h4>
      <p>${scam.scenario}</p>
    </div>

    <div class="modal-section action">
      <h4>🚀 Cách xử lý ngay lập tức</h4>
      <p>${scam.action}</p>
    </div>

    <div class="modal-section prevention">
      <h4>🛡️ Mẹo phòng tránh dài hạn</h4>
      <p>${scam.prevention}</p>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeScamModal() {
  document.getElementById('scam-modal')?.classList.remove('active');
  document.body.style.overflow = '';
}

// =============================================
// RENDER: TOOLS PAGE
// =============================================
function initToolsPage() {
  const el = document.getElementById('page-tools');
  el.innerHTML = `
    <div class="container">
      <div class="section-header" style="padding-top:var(--space-xl)">
        <h2>Bộ Công Cụ <span class="text-gradient">Phòng Vệ Số</span></h2>
        <p>Công cụ kiểm tra bảo mật trực tuyến — dữ liệu được xử lý an toàn, mật khẩu không bao giờ được gửi đi</p>
      </div>

      <!-- Tool Tabs -->
      <div class="filter-tabs" style="margin-bottom:var(--space-2xl)">
        <button class="filter-tab active" data-tool="scanner">🔍 Kiểm tra Website</button>
        <button class="filter-tab" data-tool="password">🔑 Kiểm tra Mật khẩu</button>
      </div>

      <div id="tool-content"></div>
    </div>
  `;

  // Bind tool tabs
  el.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      el.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (tab.dataset.tool === 'scanner') renderScannerTool();
      else renderPasswordTool();
    });
  });

  renderScannerTool();
}

function renderScannerTool() {
  const container = document.getElementById('tool-content');
  container.innerHTML = `
    <div style="max-width:700px;margin:0 auto">
      <div class="card" style="padding:var(--space-2xl)">
        <h3 style="text-align:center;margin-bottom:var(--space-sm)">🔍 Kiểm Tra Đường Link An Toàn</h3>
        <p style="text-align:center;color:var(--text-secondary);margin-bottom:var(--space-xl);font-size:0.9rem">
          Kiểm tra URL qua 3 lớp bảo vệ: Phân tích Heuristic, Cơ sở dữ liệu Chống Lừa Đảo VN, và Google Safe Browsing
        </p>
        <div class="scanner-box" id="tool-scanner-box">
          <span class="icon">🔗</span>
          <input type="text" id="tool-url-input" placeholder="Dán đường link cần kiểm tra vào đây..." />
          <button class="btn btn-primary" id="tool-scan-btn">Quét Ngay</button>
        </div>
        <div id="tool-scan-result"></div>

        <div style="margin-top:var(--space-2xl);padding-top:var(--space-xl);border-top:1px solid var(--bg-glass-border)">
          <h4 style="font-size:0.8rem;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:var(--space-md)">Thử nghiệm nhanh:</h4>
          <div style="display:flex;flex-wrap:wrap;gap:var(--space-sm)">
            <button class="btn btn-sm btn-secondary test-url" data-url="https://vietcombank.com.vn">✅ vietcombank.com.vn</button>
            <button class="btn btn-sm btn-secondary test-url" data-url="http://vcb-ebanking.xyz">🚨 vcb-ebanking.xyz</button>
            <button class="btn btn-sm btn-secondary test-url" data-url="http://mb-bank-khuyenmai.top/nhan-thuong">🚨 mb-bank-khuyenmai.top</button>
            <button class="btn btn-sm btn-secondary test-url" data-url="https://google.com">✅ google.com</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Bind scanner
  const input = document.getElementById('tool-url-input');
  const btn = document.getElementById('tool-scan-btn');
  const resultEl = document.getElementById('tool-scan-result');

  const doScan = async () => {
    const url = input.value.trim();
    if (!url) { input.focus(); return; }
    resultEl.innerHTML = `<div class="scanner-loading"><div class="spinner"></div><span>Đang phân tích ${url}...</span></div>`;
    const result = await scanURL(url);
    renderScanResult(resultEl, result);
  };

  btn.addEventListener('click', doScan);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') doScan(); });

  // Test URL buttons
  container.querySelectorAll('.test-url').forEach(b => {
    b.addEventListener('click', () => {
      input.value = b.dataset.url;
      doScan();
    });
  });
}

function renderPasswordTool() {
  const container = document.getElementById('tool-content');
  container.innerHTML = `
    <div style="max-width:700px;margin:0 auto">
      <div class="card" style="padding:var(--space-2xl)">
        <h3 style="text-align:center;margin-bottom:var(--space-sm)">🔑 Kiểm Tra Độ Mạnh Mật Khẩu</h3>
        <p style="text-align:center;color:var(--text-secondary);margin-bottom:var(--space-xl);font-size:0.9rem">
          Phân tích hoàn toàn trên trình duyệt — mật khẩu KHÔNG được gửi đến bất kỳ máy chủ nào
        </p>

        <div class="password-input-wrapper">
          <input type="password" id="password-input" placeholder="Nhập mật khẩu cần kiểm tra..." autocomplete="off" />
          <button class="password-toggle" id="pw-toggle">👁️</button>
        </div>
        
        <div class="strength-bar">
          <div class="strength-bar-fill" id="strength-fill" style="width:0%"></div>
        </div>

        <div class="strength-info" id="strength-info">
          <p style="color:var(--text-tertiary);font-size:0.9rem">Nhập mật khẩu để kiểm tra...</p>
        </div>
      </div>
    </div>
  `;

  const input = document.getElementById('password-input');
  const toggle = document.getElementById('pw-toggle');
  const fill = document.getElementById('strength-fill');
  const info = document.getElementById('strength-info');

  toggle.addEventListener('click', () => {
    const isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';
    toggle.textContent = isPass ? '🙈' : '👁️';
  });

  input.addEventListener('input', () => {
    const result = analyzePassword(input.value);
    fill.style.width = result.score + '%';
    fill.style.background = result.color;

    if (result.score === 0) {
      info.innerHTML = `<p style="color:var(--text-tertiary);font-size:0.9rem">Nhập mật khẩu để kiểm tra...</p>`;
      return;
    }

    info.innerHTML = `
      <div style="margin-bottom:var(--space-md)">
        <span style="font-size:0.85rem;color:${result.color};font-weight:700">${result.label}</span>
        <span style="font-size:0.8rem;color:var(--text-tertiary);margin-left:var(--space-sm)">Entropy: ${result.entropy} bit</span>
      </div>
      <div class="crack-time" style="color:${result.color}">⏱️ ${result.crackTime}</div>
      <p style="font-size:0.8rem;color:var(--text-tertiary);margin-bottom:var(--space-lg)">Thời gian ước tính để bẻ khóa (GPU cluster 10 tỷ lần thử/giây)</p>
      <div style="text-align:left">
        ${result.tips.map(tip => `
          <div style="padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:var(--radius-md);margin-bottom:6px;font-size:0.85rem;color:var(--text-secondary)">
            ${tip}
          </div>
        `).join('')}
      </div>
    `;
  });
}

// =============================================
// RENDER: LAB PAGE (Interactive Multi-Channel Threat Simulation)
// =============================================
function initLabPage() {
  const el = document.getElementById('page-lab');

  // Cleanup any active call timer or ringing
  sound.stopPhoneRing();
  if (state.simCallTimer) {
    clearInterval(state.simCallTimer);
    state.simCallTimer = null;
  }

  // Ensure valid current index
  if (!state.simCurrentIndex || state.simCurrentIndex >= simulationsData.length) {
    state.simCurrentIndex = 0;
  }
  state.simCallState = 'incoming';
  state.simCallSeconds = 0;
  state.simCallStep = 0;
  state.simUserChoices = {};
  state.simFoundFlags = new Set();
  state.simChatChoice = null;

  renderLabLayout(el);
}

function renderLabLayout(el) {
  const allCount = simulationsData.length;
  const videoCallCount = simulationsData.filter(s => s.type === 'videocall').length;
  const callCount = simulationsData.filter(s => s.type === 'call').length;
  const msgCount = simulationsData.filter(s => s.type === 'sms' || s.type === 'chat').length;
  const emailCount = simulationsData.filter(s => s.type === 'email').length;

  const currentCategory = state.simCategory || 'all';
  const filteredSims = simulationsData.map((sim, idx) => ({ ...sim, originalIndex: idx })).filter(sim => {
    if (currentCategory === 'all') return true;
    if (currentCategory === 'videocall') return sim.type === 'videocall';
    if (currentCategory === 'call') return sim.type === 'call';
    if (currentCategory === 'message') return sim.type === 'sms' || sim.type === 'chat';
    if (currentCategory === 'email') return sim.type === 'email';
    return true;
  });

  el.innerHTML = `
    <div class="container">
      <div class="section-header" style="padding-top:var(--space-xl)">
        <h2>Phòng Lab <span class="text-gradient">Mô Phỏng Thực Tế</span></h2>
        <p>Nhập vai xử lý tình huống lừa đảo đa kênh. Tìm các điểm bất thường và đưa ra quyết định dẫn đến các kết cục khác nhau.</p>
      </div>

      <!-- Controls bar: Category filter & Audio toggle -->
      <div class="lab-controls-bar">
        <div class="lab-category-tabs">
          <button class="lab-cat-tab ${currentCategory === 'all' ? 'active' : ''}" data-cat="all">
            🌟 Tất Cả (${allCount})
          </button>
          <button class="lab-cat-tab ${currentCategory === 'videocall' ? 'active' : ''}" data-cat="videocall">
            📹 Video Call (${videoCallCount})
          </button>
          <button class="lab-cat-tab ${currentCategory === 'call' ? 'active' : ''}" data-cat="call">
            📞 Gọi Thoại (${callCount})
          </button>
          <button class="lab-cat-tab ${currentCategory === 'message' ? 'active' : ''}" data-cat="message">
            💬 Tin Nhắn (${msgCount})
          </button>
          <button class="lab-cat-tab ${currentCategory === 'email' ? 'active' : ''}" data-cat="email">
            📧 Email (${emailCount})
          </button>
        </div>

        <button class="sound-toggle-btn" id="lab-sound-toggle">
          ${sound.isMuted ? '🔇 Tắt tiếng' : '🔊 Bật tiếng'}
        </button>
      </div>

      <!-- Scenario Selector Cards Grid -->
      <div class="sim-selector-grid">
        ${filteredSims.map(sim => {
    const isSelected = sim.originalIndex === state.simCurrentIndex;
    const typeIcon = sim.type === 'videocall' ? '📹' : (sim.type === 'call' ? '📞' : (sim.type === 'email' ? '📧' : '💬'));
    const typeLabel = sim.type === 'videocall' ? 'Video Call' : (sim.type === 'call' ? 'Gọi thoại' : (sim.type === 'email' ? 'Email' : 'Tin nhắn'));
    const diffMap = { easy: 'Dễ', medium: 'Trung bình', hard: 'Nâng cao' };
    const diffClass = sim.difficulty === 'hard' ? 'diff-hard' : (sim.difficulty === 'medium' ? 'diff-medium' : 'diff-easy');

    const exploredSet = state.simExploredOutcomes[sim.id];
    const exploredCount = exploredSet ? exploredSet.size : 0;
    const totalOutcomes = sim.branchingTree?.totalOutcomes;

    return `
            <div class="sim-item-card ${isSelected ? 'active' : ''}" data-original-index="${sim.originalIndex}">
              <div class="sim-item-header">
                <span class="sim-item-type ${sim.type}">
                  ${typeIcon} ${typeLabel}
                </span>
                <span class="sim-difficulty-badge ${diffClass}">
                  ${diffMap[sim.difficulty] || 'Dễ'}
                </span>
              </div>
              <div class="sim-item-title">${sim.title}</div>
              <div class="sim-item-meta">
                <div class="sim-item-stats">
                  <span class="sim-stat-chip">🚩 ${sim.totalFlags} điểm bất thường</span>
                  ${totalOutcomes ? `<span class="sim-stat-chip outcome">⚡ ${exploredCount}/${totalOutcomes} kết cục</span>` : ''}
                </div>
                <span class="sim-item-action ${isSelected ? 'active' : ''}">
                  ${isSelected ? '▶ Đang mở' : 'Luyện tập →'}
                </span>
              </div>
            </div>
          `;
  }).join('')}
      </div>

      <!-- Main Interactive Simulation Container -->
      <div id="sim-content"></div>
    </div>
  `;

  // Bind Category Tabs
  el.querySelectorAll('.lab-cat-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      state.simCategory = tab.dataset.cat;
      const available = simulationsData.map((s, idx) => ({ ...s, idx })).filter(s => {
        if (state.simCategory === 'all') return true;
        if (state.simCategory === 'videocall') return s.type === 'videocall';
        if (state.simCategory === 'call') return s.type === 'call';
        if (state.simCategory === 'message') return s.type === 'sms' || s.type === 'chat';
        if (state.simCategory === 'email') return s.type === 'email';
        return true;
      });
      if (available.length > 0 && !available.some(s => s.idx === state.simCurrentIndex)) {
        switchSimulation(available[0].idx);
      } else {
        renderLabLayout(el);
      }
    });
  });

  // Bind Sound Toggle
  const soundBtn = el.querySelector('#lab-sound-toggle');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      soundBtn.innerHTML = isMuted ? '🔇 Âm thanh: Tắt' : '🔊 Âm thanh: Bật';
    });
  }

  // Bind Scenario Card Clicks
  el.querySelectorAll('.sim-item-card').forEach(card => {
    card.addEventListener('click', () => {
      const targetIdx = parseInt(card.dataset.originalIndex, 10);
      switchSimulation(targetIdx);
    });
  });

  renderSimulation();
}

function switchSimulation(newIndex) {
  sound.stopPhoneRing();
  if (state.simCallTimer) {
    clearInterval(state.simCallTimer);
    state.simCallTimer = null;
  }
  state.simCurrentIndex = newIndex;
  state.simCallState = 'incoming';
  state.simCallSeconds = 0;
  state.simCallStep = 0;
  state.simNodeId = null;
  state.simNodeHistory = [];
  state.simUserChoices = {};
  state.simFoundFlags = new Set();
  state.simChatChoice = null;
  state.simShowDecisionTree = false;
  state.simPhishBrowserOpen = false;
  state.simPhishConsequenceActive = false;
  state.simPhishFormValues = {};
  state.simOutcomePopupVisible = true;

  const el = document.getElementById('page-lab');
  renderLabLayout(el);
}

function renderSimulation() {
  const container = document.getElementById('sim-content');
  if (!container) return;

  const sim = simulationsData[state.simCurrentIndex];
  if (!sim) return;

  if (sim.type === 'videocall') {
    renderVideoCallSim(container, sim);
  } else if (sim.type === 'call') {
    renderCallSim(container, sim);
  } else if (sim.type === 'chat') {
    renderChatSim(container, sim);
  } else if (sim.type === 'sms') {
    renderSmsSim(container, sim);
  } else {
    renderEmailSim(container, sim);
  }

  // Bind universal red flag markers in the simulation
  container.querySelectorAll('.red-flag-marker').forEach(marker => {
    marker.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const flagId = marker.dataset.flag;
      if (flagId && !state.simFoundFlags.has(flagId)) {
        state.simFoundFlags.add(flagId);
        sound.playSuccessChime();
        renderSimulation();
      }
    });
  });
}

// =============================================
// HELPER: STANDALONE OUTCOME POPUP MODAL
// =============================================
function renderOutcomePopupHTML(sim, currentNode, phishConsequence) {
  if (state.simOutcomePopupVisible === false) return '';

  // Case 1: Link-based phishing consequence popup
  if (phishConsequence) {
    const c = phishConsequence;
    return `
      <div class="outcome-popup-backdrop" id="outcome-popup-backdrop">
        <div class="outcome-popup-modal trap" id="active-outcome-banner">
          <button class="outcome-popup-close-btn" id="btn-close-outcome-popup" title="Đóng">✕</button>

          <div class="outcome-banner-header">
            <div style="flex:1;min-width:200px">
              <h2 class="outcome-banner-title">${c.title}</h2>
            </div>
            <span class="outcome-risk-badge badge-danger">⚠️ Nghiêm trọng</span>
          </div>

          <div class="outcome-banner-grid outcome-grid-3col">
            <div class="outcome-banner-box">
              <div class="outcome-banner-box-title" style="color:#f87171">
                <span>📊</span>
                <span>HẬU QUẢ VÀ THIỆT HẠI</span>
              </div>
              <div style="font-size:1.15rem;font-weight:800;color:#ef4444;font-family:var(--font-mono,monospace);margin-bottom:6px">
                ${c.financialLoss}
              </div>
              <div style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:8px">
                Số dư còn lại: <strong style="color:#f87171">${c.remainingBalance}</strong>
              </div>
              <div style="padding:8px 10px;background:rgba(255,255,255,0.04);border-radius:8px;font-size:0.78rem;color:#e2e8f0;font-family:var(--font-mono,monospace);line-height:1.5;margin-bottom:8px">
                📂 ${c.stolenData}
              </div>
              <div style="font-size:0.8rem;line-height:1.5;color:var(--text-secondary)">
                ${c.explanation}
              </div>
            </div>

            <div class="outcome-banner-box">
              <div class="outcome-banner-box-title" style="color:#fbbf24">
                <span>⚡</span>
                <span>VIỆC CẦN LÀM NGAY</span>
              </div>
              <ul style="margin:0;padding-left:16px;font-size:0.82rem;color:#fde68a;line-height:1.6;display:flex;flex-direction:column;gap:5px">
                ${c.urgentActions.map(a => `<li>${a}</li>`).join('')}
              </ul>
            </div>

            <div class="outcome-banner-box">
              <div class="outcome-banner-box-title" style="color:#34d399">
                <span>🛡️</span>
                <span>BÀI HỌC RÚT RA</span>
              </div>
              <ul style="margin:0;padding-left:16px;font-size:0.82rem;color:#cbd5e1;line-height:1.6;display:flex;flex-direction:column;gap:5px">
                <li>Tuyệt đối không nhập thông tin tài khoản, mật khẩu, mã OTP trên các đường link gửi qua SMS, email hoặc mạng xã hội.</li>
                <li>Luôn kiểm tra tên miền chính thức trước khi đăng nhập bất kỳ dịch vụ nào.</li>
                <li>Phản ánh tin nhắn/cuộc gọi lừa đảo tới đầu số <strong>156</strong> (miễn cước).</li>
              </ul>
            </div>
          </div>

          <div class="outcome-banner-actions">
            <button class="btn btn-primary" id="btn-banner-retry" style="font-size:0.88rem;padding:9px 20px;font-weight:700">
              🔄 Thử lại tình huống
            </button>
            <button class="btn btn-secondary" id="btn-banner-tree" style="font-size:0.88rem;padding:9px 20px;font-weight:600">
              🗺️ Sơ đồ lựa chọn
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Case 2: Branching decision outcome popup (Video Call & Voice Call)
  if (currentNode && currentNode.speaker === 'outcome') {
    const outcomeType = currentNode.outcomeType || 'SAFE';
    const typeClass = outcomeType === 'TRAP' ? 'trap' : (outcomeType === 'PROBE' ? 'probe' : 'safe');
    const riskBadgeClass = outcomeType === 'TRAP' ? 'badge-danger' : (outcomeType === 'PROBE' ? 'badge-cyan' : 'badge-safe');
    const riskIcon = outcomeType === 'TRAP' ? '⚠️' : (outcomeType === 'PROBE' ? '🎯' : '🛡️');
    const riskLabel = outcomeType === 'TRAP' ? 'Nghiêm trọng' : (outcomeType === 'PROBE' ? 'Trung bình' : 'An toàn');
    const boxColor = outcomeType === 'TRAP' ? '#f87171' : (outcomeType === 'PROBE' ? '#38bdf8' : '#34d399');

    const urgentActionsHTML = currentNode.urgentActions && currentNode.urgentActions.length > 0
      ? currentNode.urgentActions.map(a => `<li>${a}</li>`).join('')
      : (outcomeType === 'TRAP'
        ? '<li>Lập tức liên hệ ngân hàng phong tỏa tài khoản.</li><li>Trình báo Công an và giữ lại bằng chứng.</li><li>Thay đổi mật khẩu các tài khoản liên quan.</li>'
        : '<li>Tiếp tục cảnh giác và kiểm chứng thông tin đa kênh.</li><li>Chia sẻ kinh nghiệm nhận diện lừa đảo cho người thân.</li><li>Phản ánh số điện thoại/tài khoản đáng ngờ qua đầu số 156.</li>');

    const lessonsHTML = currentNode.lessons && currentNode.lessons.length > 0
      ? currentNode.lessons.map(l => `<li>${l}</li>`).join('')
      : '<li>Luôn bình tĩnh, kiểm chứng thông tin đa kênh trước khi thực hiện bất kỳ giao dịch chuyển tiền hay chia sẻ thông tin cá nhân nào.</li>';

    return `
      <div class="outcome-popup-backdrop" id="outcome-popup-backdrop">
        <div class="outcome-popup-modal ${typeClass}" id="active-outcome-banner">
          <button class="outcome-popup-close-btn" id="btn-close-outcome-popup" title="Đóng">✕</button>

          <div class="outcome-banner-header">
            <div style="flex:1;min-width:200px">
              <h2 class="outcome-banner-title">${currentNode.outcomeTitle}</h2>
            </div>
            <span class="outcome-risk-badge ${riskBadgeClass}">${riskIcon} ${riskLabel}</span>
          </div>

          <div class="outcome-banner-grid outcome-grid-3col">
            <div class="outcome-banner-box">
              <div class="outcome-banner-box-title" style="color:${boxColor}">
                <span>📊</span>
                <span>HẬU QUẢ VÀ THIỆT HẠI</span>
              </div>
              <div style="font-size:0.88rem;line-height:1.6;color:var(--text-primary)">
                ${currentNode.impact}
              </div>
            </div>

            <div class="outcome-banner-box">
              <div class="outcome-banner-box-title" style="color:#fbbf24">
                <span>⚡</span>
                <span>VIỆC CẦN LÀM NGAY</span>
              </div>
              <ul style="margin:0;padding-left:16px;font-size:0.82rem;color:#fde68a;line-height:1.6;display:flex;flex-direction:column;gap:5px">
                ${urgentActionsHTML}
              </ul>
            </div>

            <div class="outcome-banner-box">
              <div class="outcome-banner-box-title" style="color:#34d399">
                <span>🛡️</span>
                <span>BÀI HỌC RÚT RA</span>
              </div>
              <ul style="margin:0;padding-left:16px;display:flex;flex-direction:column;gap:5px;font-size:0.82rem;color:var(--text-secondary);line-height:1.6">
                ${lessonsHTML}
              </ul>
            </div>
          </div>

          <div class="outcome-banner-actions">
            <button class="btn btn-primary" id="btn-banner-retry" style="font-size:0.88rem;padding:9px 20px;font-weight:700">
              🔄 Thử lại tình huống
            </button>
            <button class="btn btn-secondary" id="btn-banner-tree" style="font-size:0.88rem;padding:9px 20px;font-weight:600">
              🗺️ Sơ đồ lựa chọn
            </button>
          </div>
        </div>
      </div>
    `;
  }

  return '';
}

const renderOutcomeBannerHTML = renderOutcomePopupHTML;

function bindOutcomeBannerEvents(container, sim, currentNode) {
  // Popup close button (X)
  container.querySelector('#btn-close-outcome-popup')?.addEventListener('click', (e) => {
    e.stopPropagation();
    state.simOutcomePopupVisible = false;
    renderSimulation();
  });

  // Click backdrop outside modal to dismiss
  container.querySelector('#outcome-popup-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'outcome-popup-backdrop') {
      state.simOutcomePopupVisible = false;
      renderSimulation();
    }
  });

  // Re-open popup buttons inside mockup screens
  container.querySelector('#btn-reopen-outcome-popup')?.addEventListener('click', (e) => {
    e.stopPropagation();
    state.simOutcomePopupVisible = true;
    renderSimulation();
  });

  container.querySelector('#btn-reopen-phish-popup')?.addEventListener('click', (e) => {
    e.stopPropagation();
    state.simOutcomePopupVisible = true;
    renderSimulation();
  });

  const banner = container.querySelector('#active-outcome-banner');
  if (!banner) return;

  // Standardized Action: "Thử Lại"
  banner.querySelector('#btn-banner-retry')?.addEventListener('click', () => {
    if (sim.type === 'call') {
      state.simCallState = 'incoming';
      state.simCallSeconds = 0;
      if (state.simCallTimer) clearInterval(state.simCallTimer);
    }
    if (sim.branchingTree) {
      state.simNodeId = sim.branchingTree.startNode;
      state.simNodeHistory = [];
    }
    state.simPhishConsequenceActive = false;
    state.simPhishBrowserOpen = false;
    state.simOutcomePopupVisible = false;
    sound.playNotificationPing();
    renderSimulation();
  });

  // Standardized Action: "Sơ Đồ Quyết Định"
  banner.querySelector('#btn-banner-tree')?.addEventListener('click', () => {
    renderDecisionTreeModal(sim);
  });
}

// ---------------------------------------------
// 1. VIDEO CALL SIMULATOR (Deepfake AI Engine)
// ---------------------------------------------
function renderVideoCallSim(container, sim) {
  const tree = sim.branchingTree;
  if (!tree) return;

  if (!state.simExploredOutcomes[sim.id]) {
    state.simExploredOutcomes[sim.id] = new Set();
  }
  const exploredSet = state.simExploredOutcomes[sim.id];

  if (!state.simNodeId) {
    state.simNodeId = tree.startNode;
  }

  const currentNode = tree.nodes[state.simNodeId] || tree.nodes[tree.startNode];
  if (currentNode.speaker === 'outcome') {
    exploredSet.add(currentNode.id);
  }

  const exploredCount = exploredSet.size;
  const totalOutcomes = tree.totalOutcomes || 4;
  const progressPercent = Math.min(100, Math.round((exploredCount / totalOutcomes) * 100));

  // Format call duration MM:SS
  const mins = String(Math.floor(state.simCallSeconds / 60)).padStart(2, '0');
  const secs = String(state.simCallSeconds % 60).padStart(2, '0');
  const timerDisplay = `${mins}:${secs}`;

  const isOutcome = currentNode.speaker === 'outcome';
  const outcomePopup = isOutcome ? renderOutcomePopupHTML(sim, currentNode, null) : '';

  let screenContent = '';

  if (state.simCallState === 'incoming') {
    sound.playPhoneRing();

    screenContent = `
      <div class="videocall-screen">
        <div style="padding:var(--space-xl);text-align:center;margin-top:var(--space-2xl)">
          <div class="caller-avatar-wrapper">
            <div class="caller-avatar ringing" style="border-color:#a855f7;box-shadow:0 0 25px rgba(168,85,247,0.4)">
              ${sim.callerAvatar}
            </div>
          </div>
          <h3 class="caller-name" style="font-size:1.25rem">${sim.callerName}</h3>
          <div class="caller-number">${sim.callerNumber}</div>
          <div style="margin-top:8px">
            <span class="call-status-badge incoming" style="border-color:rgba(168,85,247,0.4);color:#c084fc;background:rgba(168,85,247,0.15)">
              📹 Cuộc gọi đến Video
            </span>
          </div>
        </div>

        <div style="margin:auto 16px;padding:var(--space-md);background:rgba(255,255,255,0.04);border-radius:var(--radius-lg);border:1px solid rgba(255,255,255,0.08);text-align:center">
          <div style="font-size:0.75rem;color:#38bdf8;font-weight:700;margin-bottom:4px">
            HOÀN CẢNH TÌNH HUỐNG
          </div>
          <p style="font-size:0.82rem;color:var(--text-secondary);line-height:1.5">
            ${sim.description}
          </p>
          <div style="margin-top:8px;font-size:0.75rem;color:#94a3b8">
            💡 Nhận cuộc gọi để đối thoại và thử nghiệm các hướng xử lý khác nhau!
          </div>
        </div>

        <div class="call-actions-row" style="margin-bottom:var(--space-xl)">
          <div style="text-align:center">
            <button class="circle-call-btn decline" id="btn-vc-decline" title="Từ chối cuộc gọi">
              ✕
            </button>
            <div class="call-btn-label">Từ chối</div>
          </div>

          <div style="text-align:center">
            <button class="circle-call-btn answer" id="btn-vc-answer" title="Nhận cuộc gọi video" style="background:#22c55e">
              📹
            </button>
            <div class="call-btn-label">Nhận Video Call</div>
          </div>
        </div>
      </div>
    `;
  } else if (state.simCallState === 'active') {
    sound.stopPhoneRing();

    if (isOutcome) {
      const outcomeType = currentNode.outcomeType || 'SAFE';
      const badgeIcon = outcomeType === 'TRAP' ? '💥' : (outcomeType === 'PROBE' ? '🎯' : '🛡️');

      screenContent = `
        <div class="videocall-screen" style="justify-content:center;text-align:center;padding:24px 16px">
          <div style="font-size:2.8rem;margin-bottom:8px">${badgeIcon}</div>
          <div style="font-size:0.75rem;color:${outcomeType === 'TRAP' ? '#fca5a5' : '#6ee7b7'};font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">
            ${outcomeType === 'TRAP' ? '⚠️ ĐÃ RƠI VÀO BẪY' : (outcomeType === 'PROBE' ? '🎯 ĐÃ BÓC MẼ KẺ GIAN' : '🛡️ PHÒNG VỆ AN TOÀN')}
          </div>
          <h3 style="color:#fff;font-size:1.05rem;line-height:1.4;margin-bottom:6px">
            ${currentNode.outcomeTitle}
          </h3>
          <p style="color:var(--text-secondary);font-size:0.78rem;margin-bottom:16px">
            Thời lượng cuộc gọi: <strong style="color:var(--cyan)">${timerDisplay}</strong>
          </p>

          <div style="display:flex;flex-direction:column;gap:8px;width:100%;max-width:280px;margin:0 auto">
            <button class="btn btn-sm btn-primary" id="btn-reopen-outcome-popup" style="font-size:0.8rem;padding:9px 12px;font-weight:700">
              📋 Xem Báo Cáo Kết Cục (Popup)
            </button>
            <button class="btn btn-sm btn-secondary" id="btn-vc-try-other" style="font-size:0.8rem;padding:8px 12px">
              🔄 Thử Nhánh Quyết Định Khác
            </button>
            <button class="btn btn-sm btn-secondary" id="btn-vc-open-tree" style="font-size:0.8rem;padding:8px 12px">
              🗺️ Sơ Đồ Cây Quyết Định (${exploredCount}/${totalOutcomes})
            </button>
          </div>
        </div>
      `;
    } else {
      const isUserChoice = currentNode.speaker === 'user_choice';

      screenContent = `
        <div class="videocall-screen">
          <!-- Top bar with caller & timer -->
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 14px;background:rgba(0,0,0,0.7);z-index:20">
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:1.1rem">${sim.callerAvatar}</span>
              <div>
                <div style="font-size:0.82rem;font-weight:700;color:#fff">${sim.callerName}</div>
                <div style="font-size:0.68rem;color:#94a3b8">🔴 Đang đàm thoại: ${timerDisplay}</div>
              </div>
            </div>
            <div class="videocall-status-tag">
              📶 Kết nối HD
            </div>
          </div>

          <!-- Video Feed Area -->
          <div class="videocall-feed-wrapper">
            <!-- Picture-in-Picture Webcam (Self View) -->
            <div class="videocall-pip">
              <div class="pip-avatar">${state.simVideoCamOff ? '🚫' : '👤'}</div>
              <div class="pip-label">${state.simVideoCamOff ? 'Cam Tắt' : 'Bạn'}</div>
              <div class="pip-badge">
                <span class="pip-dot" style="${state.simVideoCamOff ? 'background:#ef4444' : ''}"></span>
                ${state.simVideoCamOff ? 'OFF' : 'HD'}
              </div>
            </div>

            <!-- Main Caller Video Mockup -->
            <div class="videocall-caller-visual">
              <div class="videocall-avatar-box">
                ${sim.callerAvatar}
              </div>
              <div style="margin-top:10px;text-align:center">
                <div style="font-size:0.85rem;font-weight:600;color:#f8fafc">
                  ${currentNode.speakerName || sim.callerName}
                </div>
                <div style="font-size:0.7rem;color:#94a3b8;margin-top:2px">
                  ${sim.callerNumber}
                </div>
              </div>
            </div>

            <!-- Subtitle / Dialogue Drawer -->
            <div class="videocall-dialogue-drawer">
              ${currentNode.subtitle ? `
                <div class="videocall-clue-alert">
                  <span style="font-weight:700">🔍 Dấu hiệu đáng ngờ:</span>
                  <span>${currentNode.subtitle}</span>
                </div>
              ` : ''}

              ${currentNode.speaker === 'caller' ? `
                <div class="videocall-subtitle-box">
                  "${currentNode.text}"
                </div>
                <div style="display:flex;justify-content:flex-end;margin-top:4px">
                  <button class="btn btn-sm btn-primary" id="btn-vc-next" style="font-size:0.8rem;padding:6px 14px">
                    Tiếp tục →
                  </button>
                </div>
              ` : ''}

              ${isUserChoice ? `
                <div style="font-size:0.82rem;font-weight:700;color:var(--cyan);margin-bottom:2px">
                  ❓ ${currentNode.question}
                </div>
                <div style="display:flex;flex-direction:column;gap:6px">
                  ${currentNode.options.map(opt => `
                    <button class="choice-btn vc-choice-btn" data-next-node="${opt.nextNode}" data-opt-type="${opt.type}">
                      ${opt.text}
                    </button>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Bottom Action Controls -->
          <div class="videocall-controls-bar">
            <button class="vc-ctrl-btn" id="btn-vc-mic" title="Bật/Tắt Mic" style="${state.simVideoMicMuted ? 'color:#ef4444;background:rgba(239,68,68,0.2)' : ''}">
              ${state.simVideoMicMuted ? '🔇' : '🎙️'}
            </button>
            <button class="vc-ctrl-btn" id="btn-vc-cam" title="Bật/Tắt Camera" style="${state.simVideoCamOff ? 'color:#ef4444;background:rgba(239,68,68,0.2)' : ''}">
              ${state.simVideoCamOff ? '🚫' : '📷'}
            </button>
            <button class="vc-ctrl-btn hangup" id="btn-vc-hangup" title="Cúp máy">
              📞
            </button>
            <button class="vc-ctrl-btn" id="btn-vc-tree-quick" title="Sơ đồ cây quyết định">
              🗺️
            </button>
          </div>
        </div>
      `;
    }
  } else {
    // Ended state
    screenContent = `
      <div class="videocall-screen" style="justify-content:center;text-align:center;padding:var(--space-xl)">
        <div style="font-size:3rem;margin-bottom:var(--space-md)">📵</div>
        <h3 style="color:#fff;font-size:1.25rem;margin-bottom:var(--space-xs)">Cuộc Gọi Video Đã Kết Thúc</h3>
        <p style="color:var(--text-secondary);font-size:0.85rem">
          Thời lượng đàm thoại: <strong style="color:var(--cyan)">${timerDisplay}</strong> · Đã mở khóa: <strong style="color:#34d399">${exploredCount}/${totalOutcomes} kết cục</strong>
        </p>

        <div class="card mt-2" style="background:rgba(255,255,255,0.03);text-align:left;font-size:0.82rem;line-height:1.6">
          <div style="font-weight:700;color:#c084fc;margin-bottom:4px">
            🛡️ Khuyến cáo từ Bộ Công An & Cục An Toàn Thông Tin:
          </div>
          <div>${sim.advice}</div>
        </div>

        <div style="margin-top:var(--space-xl);display:flex;flex-direction:column;gap:8px">
          <button class="btn btn-primary" id="btn-vc-restart" style="width:100%">
            🔄 Thử Lại Tình Huống Này
          </button>
          <button class="btn btn-secondary" id="btn-vc-open-tree" style="width:100%">
            🗺️ Xem Toàn Bộ Sơ Đồ Cây Quyết Định (${exploredCount}/${totalOutcomes})
          </button>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="sim-container">
      ${outcomePopup}

      <!-- Branch Tracker Bar -->
      <div class="branch-tracker-bar">
        <div class="branch-progress-info">
          <span>⚡ Cây Quyết Định Đa Nhánh:</span>
          <span style="color:var(--cyan);font-weight:700">Đã khám phá ${exploredCount} / ${totalOutcomes} kết cục (${progressPercent}%)</span>
        </div>

        <div style="display:flex;align-items:center;gap:8px">
          ${state.simNodeHistory.length > 0 && state.simCallState === 'active' ? `
            <button class="btn btn-sm btn-secondary" id="btn-vc-backtrack" style="font-size:0.75rem;padding:5px 10px">
              ⏪ Lùi 1 bước
            </button>
          ` : ''}
          <button class="btn-open-tree" id="btn-open-decision-map">
            🗺️ Sơ Đồ Cây Quyết Định
          </button>
        </div>
      </div>

      <!-- Smartphone Device Mockup -->
      <div class="phone-mockup">
        <div class="phone-screen">
          <div class="phone-status-bar">
            <span>09:41</span>
            <div class="phone-island">
              <div class="phone-camera"></div>
            </div>
            <span>5G 🔋</span>
          </div>
          ${screenContent}
        </div>
      </div>

      <!-- Red Flags Checklist and Official Advice -->
      ${renderRedFlagsChecklist(sim)}
    </div>
  `;

  // Bind Event Listeners for Video Call
  const btnAnswer = container.querySelector('#btn-vc-answer');
  if (btnAnswer) {
    btnAnswer.addEventListener('click', () => {
      sound.playCallConnect();
      state.simCallState = 'active';
      state.simCallSeconds = 0;
      state.simNodeId = tree.startNode;
      state.simNodeHistory = [];
      if (state.simCallTimer) clearInterval(state.simCallTimer);
      state.simCallTimer = setInterval(() => {
        state.simCallSeconds++;
      }, 1000);
      renderSimulation();
    });
  }

  const btnDecline = container.querySelector('#btn-vc-decline');
  if (btnDecline) {
    btnDecline.addEventListener('click', () => {
      sound.playCallEnd();
      state.simCallState = 'ended';
      renderSimulation();
    });
  }

  const btnHangup = container.querySelector('#btn-vc-hangup');
  if (btnHangup) {
    btnHangup.addEventListener('click', () => {
      sound.playCallEnd();
      if (state.simCallTimer) clearInterval(state.simCallTimer);
      state.simCallState = 'ended';
      renderSimulation();
    });
  }

  const btnNext = container.querySelector('#btn-vc-next');
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (currentNode.nextNode) {
        state.simNodeHistory.push(state.simNodeId);
        state.simNodeId = currentNode.nextNode;
        sound.playNotificationPing();
        renderSimulation();
      }
    });
  }

  // Bind Choice Option Buttons
  container.querySelectorAll('.vc-choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const nextNodeId = btn.dataset.nextNode;
      const optType = btn.dataset.optType;
      if (nextNodeId && tree.nodes[nextNodeId]) {
        state.simNodeHistory.push(state.simNodeId);
        state.simNodeId = nextNodeId;
        if (optType === 'danger') {
          sound.playAlertWarning();
        } else {
          sound.playSuccessChime();
        }
        renderSimulation();
      }
    });
  });

  // Bind Backtrack Buttons
  const bindBacktrack = (selector) => {
    container.querySelector(selector)?.addEventListener('click', () => {
      if (state.simNodeHistory.length > 0) {
        state.simNodeId = state.simNodeHistory.pop();
        renderSimulation();
      }
    });
  };
  bindBacktrack('#btn-vc-back');
  bindBacktrack('#btn-vc-backtrack');

  // Bind Try Other Branch
  container.querySelector('#btn-vc-try-other')?.addEventListener('click', () => {
    state.simNodeId = tree.startNode;
    state.simNodeHistory = [];
    renderSimulation();
  });

  // Bind Restart
  container.querySelector('#btn-vc-restart')?.addEventListener('click', () => {
    state.simCallState = 'incoming';
    state.simCallSeconds = 0;
    state.simNodeId = tree.startNode;
    state.simNodeHistory = [];
    renderSimulation();
  });

  // Bind Mic / Cam Toggles
  container.querySelector('#btn-vc-mic')?.addEventListener('click', () => {
    state.simVideoMicMuted = !state.simVideoMicMuted;
    renderSimulation();
  });

  container.querySelector('#btn-vc-cam')?.addEventListener('click', () => {
    state.simVideoCamOff = !state.simVideoCamOff;
    renderSimulation();
  });

  // Bind Open Decision Tree Modal
  const openTreeHandler = () => {
    renderDecisionTreeModal(sim);
  };
  container.querySelector('#btn-open-decision-map')?.addEventListener('click', openTreeHandler);
  container.querySelector('#btn-vc-open-tree')?.addEventListener('click', openTreeHandler);
  container.querySelector('#btn-vc-tree-quick')?.addEventListener('click', openTreeHandler);

  // Bind Standalone Outcome Banner Actions
  bindOutcomeBannerEvents(container, sim, currentNode);
}

// ---------------------------------------------
// 2. CALL SIMULATOR (Voice Vishing Engine)
// ---------------------------------------------
function renderCallSim(container, sim) {
  // If simulation has a branchingTree, render branching mode!
  if (sim.branchingTree) {
    renderBranchingVoiceSim(container, sim);
    return;
  }

  const foundCount = state.simFoundFlags.size;
  const totalFlags = sim.totalFlags;
  const callState = state.simCallState;

  // Format call duration MM:SS
  const mins = String(Math.floor(state.simCallSeconds / 60)).padStart(2, '0');
  const secs = String(state.simCallSeconds % 60).padStart(2, '0');
  const timerDisplay = `${mins}:${secs}`;

  let screenContent = '';

  if (callState === 'incoming') {
    sound.playPhoneRing();

    screenContent = `
      <div class="call-screen">
        <div class="call-header">
          <div class="caller-avatar-wrapper">
            <div class="caller-avatar ringing">${sim.callerAvatar || '📞'}</div>
          </div>
          <div class="caller-name red-flag-marker ${state.simFoundFlags.has('rf4') ? 'found' : ''}" data-flag="rf4">
            ${sim.callerName}
            ${state.simFoundFlags.has('rf4') ? `<div class="flag-tooltip">🚩 ${sim.redFlags.find(f => f.id === 'rf4')?.explanation || ''}</div>` : ''}
          </div>
          <div class="caller-number">${sim.callerNumber}</div>
          <div>
            <span class="call-status-badge incoming">⚠️ Cuộc gọi đến khả nghi</span>
          </div>
        </div>

        <div style="text-align:center;margin:auto 0;padding:var(--space-md);background:rgba(255,255,255,0.03);border-radius:var(--radius-lg)">
          <p style="font-size:0.82rem;color:var(--text-secondary);line-height:1.5">
            ${sim.description}
          </p>
          <div style="margin-top:8px;font-size:0.75rem;color:var(--cyan)">
            💡 Bấm nghe máy để tiếp nhận cuộc gọi và bắt đầu giải mã thủ đoạn!
          </div>
        </div>

        <div class="call-actions-row">
          <div style="text-align:center">
            <button class="circle-call-btn decline" id="btn-call-decline" title="Từ chối cuộc gọi">
              ✕
            </button>
            <div class="call-btn-label">Từ chối / Chặn</div>
          </div>

          <div style="text-align:center">
            <button class="circle-call-btn answer" id="btn-call-answer" title="Nghe máy">
              📞
            </button>
            <div class="call-btn-label">Nghe máy</div>
          </div>
        </div>
      </div>
    `;
  } else if (callState === 'active') {
    sound.stopPhoneRing();

    const currentStep = state.simCallStep || 0;
    const dialogSteps = sim.dialogSteps || [];

    screenContent = `
      <div class="call-screen">
        <div class="call-header" style="margin-top:0;margin-bottom:var(--space-sm)">
          <div style="font-size:1.4rem">${sim.callerAvatar || '📞'}</div>
          <div class="caller-name" style="font-size:0.95rem">${sim.callerName}</div>
          <div style="font-size:0.78rem;color:var(--text-tertiary)">${sim.callerNumber}</div>
          <div>
            <span class="call-status-badge active">🔴 Đang đàm thoại: ${timerDisplay}</span>
          </div>
        </div>

        <!-- Waveform visualizer -->
        <div class="waveform-container">
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
        </div>

        <!-- Dialogue Transcript Box -->
        <div class="call-dialogue-box">
          ${dialogSteps.slice(0, currentStep + 1).map((step, sIdx) => {
      if (step.speaker === 'caller' || step.speaker === 'caller_end') {
        const flag = sim.redFlags.find(f => f.id === step.redFlagId);
        const isFound = flag && state.simFoundFlags.has(flag.id);
        return `
                <div style="margin-bottom:12px">
                  <div class="dialogue-speaker">
                    <span>${sim.callerName}</span>
                    <span style="font-size:0.65rem;color:var(--text-tertiary)">Phát ngôn viên</span>
                  </div>
                  <div class="red-flag-marker ${isFound ? 'found' : ''}" data-flag="${step.redFlagId || ''}" style="color:var(--text-primary);cursor:pointer">
                    "${step.text}"
                    ${isFound ? `<div class="flag-tooltip">🚩 ${flag.explanation}</div>` : ''}
                  </div>
                </div>
              `;
      } else if (step.speaker === 'user_choice') {
        const userChoice = state.simUserChoices[sIdx];
        if (userChoice) {
          return `
                  <div style="margin-bottom:12px;text-align:right">
                    <div class="dialogue-speaker" style="color:var(--cyan);justify-content:flex-end">
                      <span>Bạn (Người nghe)</span>
                    </div>
                    <div style="background:linear-gradient(135deg,var(--cyan),var(--blue));padding:8px 12px;border-radius:var(--radius-md);color:#fff;display:inline-block;text-align:left;font-size:0.82rem">
                      "${userChoice.text}"
                    </div>
                    <div class="choice-feedback ${userChoice.isSafe ? 'safe' : 'trap'}">
                      ${userChoice.feedback}
                    </div>
                  </div>
                `;
        } else {
          return `
                  <div class="call-choices-panel" style="margin-top:10px">
                    <div style="font-size:0.8rem;font-weight:600;color:var(--cyan);margin-bottom:4px">
                      ❓ ${step.question}
                    </div>
                    ${step.options.map(opt => `
                      <button class="choice-btn" data-choice-step="${sIdx}" data-choice-id="${opt.id}">
                        👉 ${opt.text}
                      </button>
                    `).join('')}
                  </div>
                `;
        }
      }
      return '';
    }).join('')}
        </div>

        <!-- Call controls: Hangup & Report -->
        <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center;gap:var(--space-md)">
          <button class="btn btn-sm btn-secondary" id="btn-report-156" style="flex:1;font-size:0.75rem;padding:8px">
            🚨 Báo Cáo 156
          </button>
          
          <div style="text-align:center">
            <button class="circle-call-btn hangup" id="btn-call-hangup" title="Cúp máy">
              📞
            </button>
            <div class="call-btn-label">Cúp máy</div>
          </div>

          <button class="btn btn-sm btn-secondary" id="btn-next-dialog" style="flex:1;font-size:0.75rem;padding:8px" ${currentStep >= dialogSteps.length - 1 ? 'disabled' : ''}>
            Tiếp tục →
          </button>
        </div>
      </div>
    `;
  } else {
    sound.stopPhoneRing();

    screenContent = `
      <div class="call-screen" style="justify-content:center;text-align:center;padding:var(--space-xl)">
        <div style="font-size:3rem;margin-bottom:var(--space-md)">📵</div>
        <h3 style="color:#fff;font-size:1.2rem;margin-bottom:var(--space-xs)">Cuộc Gọi Đã Kết Thúc</h3>
        <p style="color:var(--text-secondary);font-size:0.85rem">
          Thời lượng đàm thoại: <strong style="color:var(--cyan)">${timerDisplay}</strong>
        </p>

        <div class="card mt-2" style="background:rgba(255,255,255,0.03);text-align:left;font-size:0.82rem;line-height:1.6">
          <div style="font-weight:700;color:var(--danger);margin-bottom:4px">
            🛡️ Khuyến cáo từ Bộ Công An & Cục An Toàn Thông Tin:
          </div>
          <div>${sim.advice}</div>
        </div>

        <div style="margin-top:var(--space-xl)">
          <button class="btn btn-primary" id="btn-call-restart" style="width:100%">
            🔄 Thử Lại Tình Huống Này
          </button>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="sim-container">
      <div class="sim-progress">
        <span>🎯 Tìm các dấu hiệu lừa đảo (Red Flags) bằng cách bấm vào các phần đáng ngờ</span>
        <span class="found-count">${foundCount} / ${totalFlags} 🚩</span>
      </div>

      <!-- Smartphone Device Mockup -->
      <div class="phone-mockup">
        <div class="phone-screen">
          <div class="phone-status-bar">
            <span>09:41</span>
            <div class="phone-island">
              <div class="phone-camera"></div>
            </div>
            <span>5G 🔋</span>
          </div>
          ${screenContent}
        </div>
      </div>

      <!-- Red Flags Checklist and Official Advice -->
      ${renderRedFlagsChecklist(sim)}
    </div>
  `;

  // Bind Call Actions
  const btnAnswer = container.querySelector('#btn-call-answer');
  if (btnAnswer) {
    btnAnswer.addEventListener('click', () => {
      sound.playCallConnect();
      state.simCallState = 'active';
      state.simCallSeconds = 0;
      state.simCallStep = 0;
      if (state.simCallTimer) clearInterval(state.simCallTimer);
      state.simCallTimer = setInterval(() => {
        state.simCallSeconds++;
        const timerEl = container.querySelector('.call-status-badge.active');
        if (timerEl) {
          const m = String(Math.floor(state.simCallSeconds / 60)).padStart(2, '0');
          const s = String(state.simCallSeconds % 60).padStart(2, '0');
          timerEl.innerHTML = `🔴 Đang đàm thoại: ${m}:${s}`;
        }
      }, 1000);
      renderSimulation();
    });
  }

  const btnDecline = container.querySelector('#btn-call-decline');
  if (btnDecline) {
    btnDecline.addEventListener('click', () => {
      sound.playCallEnd();
      state.simCallState = 'ended';
      renderSimulation();
    });
  }

  const btnHangup = container.querySelector('#btn-call-hangup');
  if (btnHangup) {
    btnHangup.addEventListener('click', () => {
      sound.playCallEnd();
      if (state.simCallTimer) clearInterval(state.simCallTimer);
      state.simCallState = 'ended';
      renderSimulation();
    });
  }

  const btnRestart = container.querySelector('#btn-call-restart');
  if (btnRestart) {
    btnRestart.addEventListener('click', () => {
      state.simCallState = 'incoming';
      state.simCallSeconds = 0;
      state.simCallStep = 0;
      state.simUserChoices = {};
      renderSimulation();
    });
  }

  const btnNextDialog = container.querySelector('#btn-next-dialog');
  if (btnNextDialog) {
    btnNextDialog.addEventListener('click', () => {
      if (state.simCallStep < (sim.dialogSteps?.length || 1) - 1) {
        state.simCallStep++;
        sound.playNotificationPing();
        renderSimulation();
      }
    });
  }

  const btnReport156 = container.querySelector('#btn-report-156');
  if (btnReport156) {
    btnReport156.addEventListener('click', () => {
      alert(`📞 Hướng dẫn báo cáo cuộc gọi lừa đảo:\n\n1. Gọi điện trực tiếp tới Tổng đài 156 (Miễn phí cước).\n2. Hoặc gửi tin nhắn SMS phản ánh cuộc gọi rác theo cú pháp:\nV [Số điện thoại lừa đảo] [Nội dung cuộc gọi] gửi 156.\n\nThông tin sẽ được chuyển tiếp tới Cục Viễn thông và Bộ Công An để xác minh xử lý!`);
    });
  }

  // Bind Choice Option Buttons
  container.querySelectorAll('.choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const stepIdx = parseInt(btn.dataset.choiceStep, 10);
      const choiceId = btn.dataset.choiceId;
      const step = sim.dialogSteps[stepIdx];
      const opt = step?.options?.find(o => o.id === choiceId);
      if (opt) {
        state.simUserChoices[stepIdx] = opt;
        if (opt.isSafe) {
          sound.playSuccessChime();
        } else {
          sound.playAlertWarning();
        }
        if (state.simCallStep < sim.dialogSteps.length - 1) {
          state.simCallStep++;
        }
        renderSimulation();
      }
    });
  });
}

// Helper: Branching Voice Sim for call scenarios with branching trees
function renderBranchingVoiceSim(container, sim) {
  const tree = sim.branchingTree;
  if (!state.simExploredOutcomes[sim.id]) {
    state.simExploredOutcomes[sim.id] = new Set();
  }
  const exploredSet = state.simExploredOutcomes[sim.id];

  if (!state.simNodeId) {
    state.simNodeId = tree.startNode;
  }

  const currentNode = tree.nodes[state.simNodeId] || tree.nodes[tree.startNode];
  if (currentNode.speaker === 'outcome') {
    exploredSet.add(currentNode.id);
  }

  const exploredCount = exploredSet.size;
  const totalOutcomes = tree.totalOutcomes || 3;
  const progressPercent = Math.min(100, Math.round((exploredCount / totalOutcomes) * 100));

  const mins = String(Math.floor(state.simCallSeconds / 60)).padStart(2, '0');
  const secs = String(state.simCallSeconds % 60).padStart(2, '0');
  const timerDisplay = `${mins}:${secs}`;

  const isOutcome = currentNode.speaker === 'outcome';
  const outcomePopup = isOutcome ? renderOutcomePopupHTML(sim, currentNode, null) : '';

  let screenContent = '';

  if (state.simCallState === 'incoming') {
    sound.playPhoneRing();

    screenContent = `
      <div class="call-screen">
        <div class="call-header">
          <div class="caller-avatar-wrapper">
            <div class="caller-avatar ringing">${sim.callerAvatar || '📞'}</div>
          </div>
          <div class="caller-name">${sim.callerName}</div>
          <div class="caller-number">${sim.callerNumber}</div>
          <div>
            <span class="call-status-badge incoming">⚠️ Cuộc gọi thoại khả nghi</span>
          </div>
        </div>

        <div style="text-align:center;margin:auto 0;padding:var(--space-md);background:rgba(255,255,255,0.03);border-radius:var(--radius-lg)">
          <p style="font-size:0.82rem;color:var(--text-secondary);line-height:1.5">
            ${sim.description}
          </p>
          <div style="margin-top:8px;font-size:0.75rem;color:var(--cyan)">
            💡 Kịch bản phân nhánh: Bạn có thể chọn cách phản ứng khác nhau để khám phá toàn bộ các kết quả!
          </div>
        </div>

        <div class="call-actions-row">
          <div style="text-align:center">
            <button class="circle-call-btn decline" id="btn-call-decline" title="Từ chối cuộc gọi">✕</button>
            <div class="call-btn-label">Từ chối / Chặn</div>
          </div>
          <div style="text-align:center">
            <button class="circle-call-btn answer" id="btn-call-answer" title="Nghe máy">📞</button>
            <div class="call-btn-label">Nghe máy</div>
          </div>
        </div>
      </div>
    `;
  } else if (state.simCallState === 'active') {
    sound.stopPhoneRing();

    if (isOutcome) {
      const outcomeType = currentNode.outcomeType || 'SAFE';
      const badgeIcon = outcomeType === 'TRAP' ? '💥' : (outcomeType === 'PROBE' ? '🎯' : '🛡️');

      screenContent = `
        <div class="call-screen" style="justify-content:center;text-align:center;padding:24px 16px">
          <div style="font-size:2.8rem;margin-bottom:8px">${badgeIcon}</div>
          <div style="font-size:0.75rem;color:${outcomeType === 'TRAP' ? '#fca5a5' : '#6ee7b7'};font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">
            ${outcomeType === 'TRAP' ? '⚠️ ĐÃ SẬP BẪY LỪA ĐẢO' : (outcomeType === 'PROBE' ? '🎯 ĐÃ BÓC MẼ KẺ GIAN' : '🛡️ PHÒNG VỆ AN TOÀN')}
          </div>
          <h3 style="color:#fff;font-size:1.05rem;line-height:1.4;margin-bottom:6px">
            ${currentNode.outcomeTitle}
          </h3>
          <p style="color:var(--text-secondary);font-size:0.78rem;margin-bottom:16px">
            Thời lượng cuộc gọi: <strong style="color:var(--cyan)">${timerDisplay}</strong>
          </p>

          <div style="display:flex;flex-direction:column;gap:8px;width:100%;max-width:280px;margin:0 auto">
            <button class="btn btn-sm btn-primary" id="btn-reopen-outcome-popup" style="font-size:0.8rem;padding:9px 12px;font-weight:700">
              📋 Xem Báo Cáo Kết Cục (Popup)
            </button>
            <button class="btn btn-sm btn-secondary" id="btn-vc-try-other" style="font-size:0.8rem;padding:8px 12px">
              🔄 Thử Nhánh Quyết Định Khác
            </button>
            <button class="btn btn-sm btn-secondary" id="btn-vc-open-tree" style="font-size:0.8rem;padding:8px 12px">
              🗺️ Xem Sơ Đồ Cây Quyết Định (${exploredCount}/${totalOutcomes})
            </button>
          </div>
        </div>
      `;
    } else {
      const isUserChoice = currentNode.speaker === 'user_choice';

      screenContent = `
        <div class="call-screen">
          <div class="call-header" style="margin-top:0;margin-bottom:var(--space-sm)">
            <div style="font-size:1.4rem">${sim.callerAvatar || '📞'}</div>
            <div class="caller-name" style="font-size:0.95rem">${sim.callerName}</div>
            <div style="font-size:0.78rem;color:var(--text-tertiary)">${sim.callerNumber}</div>
            <div>
              <span class="call-status-badge active">🔴 Đang đàm thoại: ${timerDisplay}</span>
            </div>
          </div>

          <!-- Waveform visualizer -->
          <div class="waveform-container">
            <div class="wave-bar"></div>
            <div class="wave-bar"></div>
            <div class="wave-bar"></div>
            <div class="wave-bar"></div>
            <div class="wave-bar"></div>
            <div class="wave-bar"></div>
            <div class="wave-bar"></div>
            <div class="wave-bar"></div>
          </div>

          <!-- Dialogue Box -->
          <div class="call-dialogue-box" style="margin-bottom:12px">
            ${currentNode.speaker === 'caller' ? `
              <div style="margin-bottom:12px">
                <div class="dialogue-speaker">
                  <span>${currentNode.speakerName || sim.callerName}</span>
                </div>
                <div style="color:var(--text-primary);line-height:1.5;font-size:0.85rem">
                  "${currentNode.text}"
                </div>
              </div>
            ` : ''}

            ${isUserChoice ? `
              <div style="font-size:0.82rem;font-weight:700;color:var(--cyan);margin-bottom:4px">
                ❓ ${currentNode.question}
              </div>
              <div style="display:flex;flex-direction:column;gap:6px">
                ${currentNode.options.map(opt => `
                  <button class="choice-btn vc-choice-btn" data-next-node="${opt.nextNode}" data-opt-type="${opt.type}">
                    ${opt.text}
                  </button>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <!-- Controls -->
          <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center;gap:var(--space-md)">
            <button class="btn btn-sm btn-secondary" id="btn-report-156" style="flex:1;font-size:0.75rem;padding:8px">
              🚨 Báo Cáo 156
            </button>
            <div style="text-align:center">
              <button class="circle-call-btn hangup" id="btn-call-hangup" title="Cúp máy">📞</button>
              <div class="call-btn-label">Cúp máy</div>
            </div>
            ${currentNode.speaker === 'caller' && currentNode.nextNode ? `
              <button class="btn btn-sm btn-primary" id="btn-vc-next" style="flex:1;font-size:0.75rem;padding:8px">
                Tiếp tục →
              </button>
            ` : `
              <div style="flex:1"></div>
            `}
          </div>
        </div>
      `;
    }
  } else {
    sound.stopPhoneRing();
    screenContent = `
      <div class="call-screen" style="justify-content:center;text-align:center;padding:var(--space-xl)">
        <div style="font-size:3rem;margin-bottom:var(--space-md)">📵</div>
        <h3 style="color:#fff;font-size:1.2rem;margin-bottom:var(--space-xs)">Cuộc Gọi Đã Kết Thúc</h3>
        <p style="color:var(--text-secondary);font-size:0.85rem">
          Thời lượng đàm thoại: <strong style="color:var(--cyan)">${timerDisplay}</strong> · Đã mở khóa: <strong style="color:#34d399">${exploredCount}/${totalOutcomes} kết cục</strong>
        </p>

        <div class="card mt-2" style="background:rgba(255,255,255,0.03);text-align:left;font-size:0.82rem;line-height:1.6">
          <div style="font-weight:700;color:var(--danger);margin-bottom:4px">
            🛡️ Khuyến cáo từ Bộ Công An:
          </div>
          <div>${sim.advice}</div>
        </div>

        <div style="margin-top:var(--space-xl);display:flex;flex-direction:column;gap:8px">
          <button class="btn btn-primary" id="btn-vc-restart" style="width:100%">
            🔄 Thử Lại Tình Huống Này
          </button>
          <button class="btn btn-secondary" id="btn-vc-open-tree" style="width:100%">
            🗺️ Xem Toàn Bộ Sơ Đồ Cây Quyết Định (${exploredCount}/${totalOutcomes})
          </button>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="sim-container">
      ${outcomePopup}

      <div class="branch-tracker-bar">
        <div class="branch-progress-info">
          <span>⚡ Cây Quyết Định Đa Nhánh:</span>
          <span style="color:var(--cyan);font-weight:700">Đã khám phá ${exploredCount} / ${totalOutcomes} kết cục (${progressPercent}%)</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          ${state.simNodeHistory.length > 0 && state.simCallState === 'active' ? `
            <button class="btn btn-sm btn-secondary" id="btn-vc-backtrack" style="font-size:0.75rem;padding:5px 10px">
              ⏪ Lùi 1 bước
            </button>
          ` : ''}
          <button class="btn-open-tree" id="btn-open-decision-map">
            🗺️ Sơ Đồ Cây Quyết Định
          </button>
        </div>
      </div>

      <div class="phone-mockup">
        <div class="phone-screen">
          <div class="phone-status-bar">
            <span>09:41</span>
            <div class="phone-island">
              <div class="phone-camera"></div>
            </div>
            <span>5G 🔋</span>
          </div>
          ${screenContent}
        </div>
      </div>

      ${renderRedFlagsChecklist(sim)}
    </div>
  `;

  // Bind Actions for Branching Voice Sim
  const btnAnswer = container.querySelector('#btn-call-answer');
  if (btnAnswer) {
    btnAnswer.addEventListener('click', () => {
      sound.playCallConnect();
      state.simCallState = 'active';
      state.simCallSeconds = 0;
      state.simNodeId = tree.startNode;
      state.simNodeHistory = [];
      if (state.simCallTimer) clearInterval(state.simCallTimer);
      state.simCallTimer = setInterval(() => {
        state.simCallSeconds++;
      }, 1000);
      renderSimulation();
    });
  }

  container.querySelector('#btn-call-decline')?.addEventListener('click', () => {
    sound.playCallEnd();
    state.simCallState = 'ended';
    renderSimulation();
  });

  container.querySelector('#btn-call-hangup')?.addEventListener('click', () => {
    sound.playCallEnd();
    if (state.simCallTimer) clearInterval(state.simCallTimer);
    state.simCallState = 'ended';
    renderSimulation();
  });

  container.querySelector('#btn-vc-next')?.addEventListener('click', () => {
    if (currentNode.nextNode) {
      state.simNodeHistory.push(state.simNodeId);
      state.simNodeId = currentNode.nextNode;
      sound.playNotificationPing();
      renderSimulation();
    }
  });

  container.querySelectorAll('.vc-choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const nextNodeId = btn.dataset.nextNode;
      const optType = btn.dataset.optType;
      if (nextNodeId && tree.nodes[nextNodeId]) {
        state.simNodeHistory.push(state.simNodeId);
        state.simNodeId = nextNodeId;
        if (optType === 'danger') sound.playAlertWarning();
        else sound.playSuccessChime();
        renderSimulation();
      }
    });
  });

  const bindBacktrack = (selector) => {
    container.querySelector(selector)?.addEventListener('click', () => {
      if (state.simNodeHistory.length > 0) {
        state.simNodeId = state.simNodeHistory.pop();
        renderSimulation();
      }
    });
  };
  bindBacktrack('#btn-vc-back');
  bindBacktrack('#btn-vc-backtrack');

  container.querySelector('#btn-vc-try-other')?.addEventListener('click', () => {
    state.simNodeId = tree.startNode;
    state.simNodeHistory = [];
    renderSimulation();
  });

  container.querySelector('#btn-vc-restart')?.addEventListener('click', () => {
    state.simCallState = 'incoming';
    state.simCallSeconds = 0;
    state.simNodeId = tree.startNode;
    state.simNodeHistory = [];
    renderSimulation();
  });

  container.querySelector('#btn-report-156')?.addEventListener('click', () => {
    alert(`📞 Hướng dẫn báo cáo cuộc gọi lừa đảo:\n\n1. Gọi điện trực tiếp tới Tổng đài 156 (Miễn phí cước).\n2. Hoặc gửi tin nhắn SMS phản ánh cuộc gọi rác theo cú pháp:\nV [Số điện thoại lừa đảo] [Nội dung cuộc gọi] gửi 156.\n\nThông tin sẽ được chuyển tiếp tới Cục Viễn thông và Bộ Công An để xác minh xử lý!`);
  });

  const openTreeHandler = () => {
    renderDecisionTreeModal(sim);
  };
  container.querySelector('#btn-open-decision-map')?.addEventListener('click', openTreeHandler);
  container.querySelector('#btn-vc-open-tree')?.addEventListener('click', openTreeHandler);

  // Bind Standalone Outcome Banner Actions
  bindOutcomeBannerEvents(container, sim, currentNode);
}

// ---------------------------------------------
// HELPER: DECISION TREE MODAL MAP
// ---------------------------------------------
function renderDecisionTreeModal(sim) {
  let tree = sim.branchingTree;
  if (!tree && sim.phishSite) {
    const consequence = sim.phishSite.consequence || {};
    tree = {
      totalOutcomes: 2,
      startNode: 'phish_start',
      nodes: {
        'phish_start': {
          id: 'phish_start',
          speaker: 'user_choice',
          question: `Tình huống tin nhắn/email mạo danh: "${sim.title}". Khi nhận được liên kết yêu cầu xác thực hoặc đóng phí, bạn quyết định xử lý như thế nào?`,
          options: [
            { text: '⚠️ Nhấp vào đường link giả mạo và cung cấp thông tin/mã OTP', nextNode: 'phish_trap' },
            { text: '🛡️ Nhận diện dấu hiệu lừa đảo, không bấm link và báo cáo cơ quan chức năng', nextNode: 'phish_safe' }
          ]
        },
        'phish_trap': {
          id: 'phish_trap',
          speaker: 'outcome',
          outcomeType: 'TRAP',
          outcomeTitle: consequence.title || 'Sập Bẫy Website Giả Mạo (Phishing)',
          impact: `Nạn nhân cung cấp tài khoản và OTP cho máy chủ kẻ gian. Thiệt hại: ${consequence.financialLoss || 'Mất tiền'}. Số dư còn lại: ${consequence.remainingBalance || '0 VNĐ'}. Dữ liệu bị lộ: ${consequence.stolenData || 'Thông tin tài khoản & OTP'}.`,
          lessons: consequence.urgentActions || [
            'Lập tức liên hệ ngân hàng khóa thẻ và dịch vụ ngân hàng điện tử khẩn cấp.',
            'Thay đổi mật khẩu tất cả tài khoản sử dụng chung email/mật khẩu.'
          ]
        },
        'phish_safe': {
          id: 'phish_safe',
          speaker: 'outcome',
          outcomeType: 'SAFE',
          outcomeTitle: 'Phòng Vệ An Toàn Tuyệt Đối (0% Rủi Ro)',
          impact: 'Tỉnh táo nhận diện đường link giả mạo, kiểm tra tên miền độc hại và không cung cấp bất kỳ thông tin nào. Bảo toàn nguyên vẹn 100% tài sản và thông tin cá nhân.',
          lessons: [
            'Luôn kiểm tra kỹ tên miền chính thức của ngân hàng hoặc cơ quan nhà nước trước khi thao tác.',
            'Không bao giờ nhập OTP, mật khẩu tài khoản ngân hàng trên các website lạ gửi qua SMS hay email.',
            'Phản ánh tin nhắn rác / lừa đảo tới đầu số 156 (miễn cước).'
          ]
        }
      }
    };
  }
  if (!tree) return;

  const exploredSet = state.simExploredOutcomes[sim.id] || new Set();
  const nodes = tree.nodes;

  // Remove existing modal if any
  document.getElementById('decision-map-modal')?.remove();

  const modalEl = document.createElement('div');
  modalEl.className = 'decision-map-overlay active';
  modalEl.id = 'decision-map-modal';

  modalEl.innerHTML = `
    <div class="decision-map-modal">
      <button class="modal-close" id="btn-close-decision-map">✕</button>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:var(--space-md)">
        <span style="font-size:2rem">🗺️</span>
        <div>
          <h2 style="font-size:1.3rem;margin:0">Sơ Đồ Cây Quyết Định & Các Kết Cục Có Thể Xảy Ra</h2>
          <p style="font-size:0.85rem;color:var(--text-secondary);margin:0">
            Tình huống: <strong style="color:var(--cyan)">${sim.title}</strong> · Đã mở khóa <strong>${exploredSet.size}/${tree.totalOutcomes} kết cục</strong>
          </p>
        </div>
      </div>

      <div style="background:rgba(6,182,212,0.06);border:1px solid rgba(6,182,212,0.2);border-radius:var(--radius-lg);padding:12px 16px;font-size:0.84rem;line-height:1.5;margin-bottom:var(--space-lg);color:var(--text-secondary)">
        💡 <strong>Khám phá tự do:</strong> Bạn có thể bấm vào nút <em>"Nhảy tới bước này"</em> ở bất kỳ phân nhánh nào để trải nghiệm kịch bản tương ứng mà không cần phải thực hiện lại từ đầu!
      </div>

      <div class="tree-branches-container">
        ${Object.values(nodes).map(node => {
    const isCurrent = state.simNodeId === node.id || (node.id === 'phish_trap' && state.simPhishConsequenceActive);
    const isOutcome = node.speaker === 'outcome';
    const isExplored = isOutcome ? (exploredSet.has(node.id) || (node.id === 'phish_trap' && state.simPhishConsequenceActive)) : true;

    let badge = '<span class="badge badge-cyan">Hội thoại</span>';
    if (node.speaker === 'user_choice') badge = '<span class="badge" style="background:#8b5cf6;color:#fff">❓ Điểm Quyết Định</span>';
    if (isOutcome) {
      if (node.outcomeType === 'TRAP') badge = '<span class="badge badge-danger">💥 Kết cục: Sập Bẫy</span>';
      else if (node.outcomeType === 'PROBE') badge = '<span class="badge badge-cyan">🎯 Kết cục: Lật Tẩy</span>';
      else badge = '<span class="badge badge-safe">🛡️ Kết cục: An Toàn</span>';
    }

    return `
            <div class="tree-node-card ${isExplored ? 'explored' : 'unexplored'}" style="${isCurrent ? 'border-color:var(--cyan);box-shadow:0 0 15px rgba(6,182,212,0.3)' : ''}">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                <div style="display:flex;align-items:center;gap:8px">
                  ${badge}
                  <span style="font-size:0.75rem;font-family:var(--font-mono,monospace);color:var(--text-tertiary)">#${node.id}</span>
                  ${isCurrent ? '<span style="font-size:0.75rem;color:var(--cyan);font-weight:700">◀ BẠN ĐANG Ở ĐÂY</span>' : ''}
                </div>
                ${isOutcome && isExplored ? '<span style="font-size:0.78rem;color:#34d399;font-weight:700">✓ ĐÃ MỞ KHÓA</span>' : ''}
              </div>

              <div style="font-size:0.88rem;color:var(--text-primary);line-height:1.5;margin-bottom:8px">
                ${node.outcomeTitle || node.question || node.text || ''}
              </div>

              ${node.options ? `
                <div style="display:flex;flex-direction:column;gap:4px;margin-top:6px">
                  ${node.options.map(opt => `
                    <div style="font-size:0.8rem;color:var(--text-secondary);display:flex;align-items:center;gap:6px">
                      <span>↳</span>
                      <span>${opt.text}</span>
                      <span style="font-size:0.7rem;color:var(--text-tertiary);font-family:var(--font-mono,monospace)">→ #${opt.nextNode}</span>
                    </div>
                  `).join('')}
                </div>
              ` : ''}

              <div style="display:flex;justify-content:flex-end;margin-top:8px">
                <button class="btn btn-sm btn-secondary btn-jump-node" data-node-id="${node.id}" style="font-size:0.75rem;padding:4px 10px">
                  👉 Nhảy tới bước này
                </button>
              </div>
            </div>
          `;
  }).join('')}
      </div>
    </div>
  `;

  document.body.appendChild(modalEl);

  // Bind Close
  modalEl.querySelector('#btn-close-decision-map')?.addEventListener('click', () => {
    state.simShowDecisionTree = false;
    modalEl.remove();
  });

  // Bind Jump to Node
  modalEl.querySelectorAll('.btn-jump-node').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetNodeId = btn.dataset.nodeId;
      if (sim.branchingTree && nodes[targetNodeId]) {
        state.simNodeId = targetNodeId;
        state.simCallState = 'active';
        state.simOutcomePopupVisible = (nodes[targetNodeId].speaker === 'outcome');
        state.simShowDecisionTree = false;
        modalEl.remove();
        renderSimulation();
      } else if (sim.phishSite) {
        state.simShowDecisionTree = false;
        modalEl.remove();
        if (targetNodeId === 'phish_trap') {
          state.simPhishBrowserOpen = true;
          state.simPhishConsequenceActive = true;
          state.simOutcomePopupVisible = true;
        } else if (targetNodeId === 'phish_safe') {
          state.simPhishBrowserOpen = false;
          state.simPhishConsequenceActive = false;
          state.simOutcomePopupVisible = false;
          alert('🛡️ Quyết định chính xác: Tỉnh táo nhận diện đường link giả mạo và không cung cấp thông tin giúp bạn bảo vệ toàn vẹn tài sản!');
        } else {
          state.simPhishBrowserOpen = false;
          state.simPhishConsequenceActive = false;
          state.simOutcomePopupVisible = false;
        }
        renderSimulation();
      }
    });
  });
}

// ---------------------------------------------
// 2. CHAT SIMULATOR (Telegram/Zalo Smishing Engine)
// ---------------------------------------------
function renderChatSim(container, sim) {
  const foundCount = state.simFoundFlags.size;
  const totalFlags = sim.totalFlags;

  container.innerHTML = `
    <div class="sim-container">
      <div class="sim-progress">
        <span>🎯 Tìm các dấu hiệu lừa đảo trong luồng tin nhắn bên dưới</span>
        <span class="found-count">${foundCount} / ${totalFlags} 🚩</span>
      </div>

      <!-- Smartphone Mockup with Chat App -->
      <div class="phone-mockup">
        <div class="phone-screen">
          <div class="phone-status-bar">
            <span>09:30</span>
            <div class="phone-island">
              <div class="phone-camera"></div>
            </div>
            <span>WiFi 🔋</span>
          </div>

          <div class="chat-screen">
            <!-- Chat App Header -->
            <div class="chat-header">
              <div style="font-size:1.6rem">${sim.senderAvatar || '💬'}</div>
              <div class="chat-header-info">
                <div class="chat-header-title">${sim.senderName}</div>
                <div class="chat-header-subtitle">
                  <span style="color:#10b981">●</span> ${sim.chatPlatform || 'Chat OTT'} · Đang hoạt động
                </div>
              </div>
              <span style="font-size:0.75rem;padding:2px 8px;border-radius:4px;background:rgba(239,68,68,0.2);color:#f87171">
                Khả nghi
              </span>
            </div>

            <!-- Chat Message Feed -->
            <div class="chat-body">
              ${(sim.chatMessages || []).map((msg, i) => {
    const isThem = msg.sender === 'them';
    return `
                  <div class="chat-msg ${isThem ? 'them' : 'me'}">
                    <div class="chat-bubble">
                      ${msg.text.replace(/(http[^\s]+)/g, '<u style="color:#38bdf8;cursor:pointer">$1</u>')}
                    </div>
                    <span class="chat-msg-time">${msg.time || 'Vừa xong'}</span>
                  </div>
                `;
  }).join('')}

              ${state.simChatChoice ? `
                <div class="chat-msg me">
                  <div class="chat-bubble">${state.simChatChoice.text}</div>
                  <span class="chat-msg-time">Vừa gửi</span>
                </div>

                <div class="chat-msg them">
                  <div class="chat-bubble" style="border:1px solid ${state.simChatChoice.isTrap ? 'var(--danger-border)' : 'var(--safe-border)'}">
                    ${state.simChatChoice.botReply}
                  </div>
                  <span class="chat-msg-time">Vừa xong</span>
                </div>
              ` : ''}
            </div>

            <!-- Interactive Reply Choices Panel -->
            ${!state.simChatChoice && sim.interactiveOptions ? `
              <div style="padding:var(--space-md);background:rgba(15,23,42,0.95);border-top:1px solid rgba(255,255,255,0.08)">
                <div style="font-size:0.75rem;color:var(--text-tertiary);margin-bottom:6px">
                  💬 Chọn câu trả lời để đối đáp thử với đối tượng:
                </div>
                <div style="display:flex;flex-direction:column;gap:6px">
                  ${sim.interactiveOptions.map((opt, oIdx) => `
                    <button class="choice-btn chat-choice-btn" data-opt-index="${oIdx}">
                      👉 ${opt.text}
                    </button>
                  `).join('')}
                </div>
              </div>
            ` : `
              <div style="padding:var(--space-sm);text-align:center;background:rgba(15,23,42,0.9);border-top:1px solid rgba(255,255,255,0.05)">
                <button class="btn btn-sm btn-secondary" id="btn-chat-reset" style="font-size:0.75rem">
                  🔄 Thử lại lựa chọn phản hồi khác
                </button>
              </div>
            `}
          </div>
        </div>
      </div>

      <!-- Red Flags Checklist and Official Advice -->
      ${renderRedFlagsChecklist(sim)}
    </div>
  `;

  // Bind Chat Choice Buttons
  container.querySelectorAll('.chat-choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const optIdx = parseInt(btn.dataset.optIndex, 10);
      const opt = sim.interactiveOptions[optIdx];
      if (opt) {
        state.simChatChoice = opt;
        if (opt.isTrap) {
          sound.playAlertWarning();
        } else {
          sound.playSuccessChime();
        }
        renderSimulation();
      }
    });
  });

  const btnReset = container.querySelector('#btn-chat-reset');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      state.simChatChoice = null;
      renderSimulation();
    });
  }
}

// ---------------------------------------------
// 3. SMS SIMULATOR (Brandname Smishing Engine)
// ---------------------------------------------
function renderSmsSim(container, sim) {
  const foundCount = state.simFoundFlags.size;
  const totalFlags = sim.totalFlags;
  const phish = sim.phishSite;

  const outcomeBanner = state.simPhishConsequenceActive && phish
    ? renderOutcomeBannerHTML(sim, null, phish.consequence)
    : '';

  const phoneContent = state.simPhishBrowserOpen && phish
    ? renderFakeBrowserView(sim)
    : `
      <div style="flex:1;padding:var(--space-lg);display:flex;flex-direction:column">
        <div class="sms-sender red-flag-marker ${state.simFoundFlags.has('rf4') || state.simFoundFlags.has('rf1') ? 'found' : ''}" data-flag="${sim.redFlags[0]?.id || 'rf1'}" style="cursor:pointer;margin-bottom:var(--space-md)">
          <span style="font-size:1.2rem">${sim.avatar || '💬'}</span>
          <span>${sim.from}</span>
          <span style="font-size:0.7rem;color:var(--text-tertiary);margin-left:auto">SMS Brandname</span>
        </div>

        <div class="sms-bubble">
          <span class="red-flag-marker ${state.simFoundFlags.has('rf1') ? 'found' : ''}" data-flag="rf1" style="cursor:pointer">
            ${sim.body.replace(/(http[^\s]+)/g, '<u class="sim-phish-link" style="color:#38bdf8;cursor:pointer;text-decoration:underline;font-weight:600">$1</u>')}
            ${state.simFoundFlags.has('rf1') ? `<div class="flag-tooltip">🚩 ${sim.redFlags[0]?.explanation}</div>` : ''}
          </span>
        </div>

        ${phish ? `
          <div style="margin-top:12px">
            <button class="btn btn-sm btn-phish-open-link" style="width:100%;font-size:0.76rem;padding:8px 12px;background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.3);color:#38bdf8;display:flex;align-items:center;justify-content:center;gap:6px">
              🌐 Nhấp vào liên kết để mô phỏng trang web lừa đảo
            </button>
          </div>
        ` : ''}

        <div style="margin-top:auto;padding-top:var(--space-lg);display:flex;gap:var(--space-sm);flex-wrap:wrap;justify-content:center">
          ${sim.redFlags.slice(1).map(rf => `
            <button class="btn btn-sm btn-secondary red-flag-marker ${state.simFoundFlags.has(rf.id) ? 'found' : ''}" data-flag="${rf.id}" style="position:relative;font-size:0.75rem">
              ⚠️ ${rf.hint}
              ${state.simFoundFlags.has(rf.id) ? `<div class="flag-tooltip">🚩 ${rf.explanation}</div>` : ''}
            </button>
          `).join('')}
        </div>
      </div>
    `;

  container.innerHTML = `
    <div class="sim-container">
      ${outcomeBanner}

      <div class="sim-progress">
        <span>🎯 Tìm các dấu hiệu lừa đảo trong tin nhắn SMS (bấm vào liên kết để xem mô phỏng trang web)</span>
        <span class="found-count">${foundCount} / ${totalFlags} 🚩</span>
      </div>

      <!-- Smartphone Mockup -->
      <div class="phone-mockup">
        <div class="phone-screen">
          <div class="phone-status-bar">
            <span>08:45</span>
            <div class="phone-island">
              <div class="phone-camera"></div>
            </div>
            <span>Viettel 🔋</span>
          </div>

          ${phoneContent}
        </div>
      </div>

      <!-- Red Flags Checklist and Official Advice -->
      ${renderRedFlagsChecklist(sim)}
    </div>
  `;

  // Bind phish link clicks
  container.querySelectorAll('.sim-phish-link, .btn-phish-open-link').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      state.simPhishBrowserOpen = true;
      state.simPhishConsequenceActive = false;
      renderSimulation();
    });
  });

  // Bind Fake Browser Events
  bindFakeBrowserEvents(container, sim);
  bindOutcomeBannerEvents(container, sim, null);
}

// ---------------------------------------------
// 4. EMAIL SIMULATOR (Phishing Engine)
// ---------------------------------------------
function renderEmailSim(container, sim) {
  const foundCount = state.simFoundFlags.size;
  const totalFlags = sim.totalFlags;
  const phish = sim.phishSite;

  const outcomeBanner = state.simPhishConsequenceActive && phish
    ? renderOutcomeBannerHTML(sim, null, phish.consequence)
    : '';

  const emailMainContent = state.simPhishBrowserOpen && phish
    ? renderFakeBrowserView(sim)
    : `
      <div class="email-header">
        <div class="email-meta">
          <div>
            <span class="label">Từ:</span>
            <span class="red-flag-marker ${state.simFoundFlags.has('rf1') ? 'found' : ''}" data-flag="rf1" style="color:#1a1a1a;font-weight:500">
              ${sim.fromDisplay} &lt;${sim.from}&gt;
              ${state.simFoundFlags.has('rf1') ? `<div class="flag-tooltip">🚩 ${sim.redFlags[0]?.explanation}</div>` : ''}
            </span>
          </div>
          <div><span class="label">Đến:</span> <span style="color:#1a1a1a">${sim.to}</span></div>
          <div><span class="label">Ngày:</span> <span style="color:#6b7280">${sim.date}</span></div>
        </div>
        <div class="email-subject red-flag-marker ${state.simFoundFlags.has('rf2') ? 'found' : ''}" data-flag="rf2" style="color:#1a1a1a">
          ${sim.subject}
          ${state.simFoundFlags.has('rf2') ? `<div class="flag-tooltip">🚩 ${sim.redFlags[1]?.explanation}</div>` : ''}
        </div>
      </div>
      <div class="email-body">
        <div data-flag="rf3" class="red-flag-marker ${state.simFoundFlags.has('rf3') ? 'found' : ''}" style="position:relative">
          ${sim.body}
          ${state.simFoundFlags.has('rf3') ? `<div class="flag-tooltip" style="bottom:auto;top:calc(100% + 8px)">🚩 ${sim.redFlags[2]?.explanation}</div>` : ''}
        </div>
        ${phish ? `
          <div style="margin-top:14px">
            <button class="btn btn-sm btn-phish-open-link" style="width:100%;font-size:0.8rem;padding:9px 14px;background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.3);color:#0284c7;display:flex;align-items:center;justify-content:center;gap:6px">
              🌐 Nhấp vào liên kết để mô phỏng trang web & kết cục khi click
            </button>
          </div>
        ` : ''}
        ${sim.redFlags[3] ? `
          <div data-flag="rf4" class="red-flag-marker ${state.simFoundFlags.has('rf4') ? 'found' : ''}" style="position:relative;margin-top:8px">
            ${state.simFoundFlags.has('rf4') ? `<div class="flag-tooltip" style="bottom:auto;top:calc(100% + 8px)">🚩 ${sim.redFlags[3]?.explanation}</div>` : ''}
          </div>
        ` : ''}
      </div>
    `;

  container.innerHTML = `
    <div class="sim-container">
      ${outcomeBanner}

      <div class="sim-progress">
        <span>🎯 Tìm các dấu hiệu lừa đảo (Red Flags) bằng cách bấm vào các phần đáng ngờ hoặc nhấp link</span>
        <span class="found-count">${foundCount} / ${totalFlags} 🚩</span>
      </div>

      <div class="email-viewer">
        <div class="email-toolbar">
          <span class="dot dot-red"></span>
          <span class="dot dot-yellow"></span>
          <span class="dot dot-green"></span>
          <span style="margin-left:12px;font-size:0.8rem;color:#6b7280">📧 Email Client</span>
          ${state.simPhishBrowserOpen ? `
            <button class="btn btn-sm btn-secondary" id="btn-browser-close" style="margin-left:auto;font-size:0.7rem;padding:2px 8px">
              ✕ Trở về Email
            </button>
          ` : ''}
        </div>
        ${emailMainContent}
      </div>

      <!-- Red Flags Checklist and Official Advice -->
      ${renderRedFlagsChecklist(sim)}
    </div>
  `;

  // Bind CTA link clicks in email body
  container.querySelectorAll('.cta-button a, .btn-phish-open-link').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      state.simPhishBrowserOpen = true;
      state.simPhishConsequenceActive = false;
      renderSimulation();
    });
  });

  // Bind Fake Browser Events
  bindFakeBrowserEvents(container, sim);
  bindOutcomeBannerEvents(container, sim, null);
}

// ---------------------------------------------
// HELPER: RENDER IN-PHONE PHISHING BROWSER VIEW
// ---------------------------------------------
function renderFakeBrowserView(sim) {
  const phish = sim.phishSite;
  if (!phish) return '';

  if (state.simPhishConsequenceActive) {
    const c = phish.consequence;
    return `
      <div class="fake-browser-view">
        <div class="fake-browser-topbar">
          <button class="fake-browser-btn" id="btn-browser-back" title="Quay lại trang web">←</button>
          <div class="fake-browser-url-input">
            <span class="url-warn">⚠️ KẾT CỤC TẤN CÔNG</span>
            <span style="color:#cbd5e1">${phish.url}</span>
          </div>
          <button class="fake-browser-btn" id="btn-browser-close" title="Đóng trình duyệt">✕</button>
        </div>

        <div style="flex:1;background:#0f172a;padding:24px 16px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center">
          <div style="font-size:2.8rem;margin-bottom:8px">🚨</div>
          <h3 style="font-size:1.05rem;font-weight:700;color:#f87171;line-height:1.4;margin-bottom:6px">
            Giao Dịch Đã Hoàn Tất
          </h3>
          <p style="font-size:0.78rem;color:#94a3b8;margin-bottom:16px;line-height:1.45">
            Thông tin tài khoản và mã xác thực đã bị gửi tới máy chủ kẻ tấn công.
          </p>

          <div style="display:flex;flex-direction:column;gap:8px;width:100%;max-width:280px;margin:0 auto">
            <button class="btn btn-sm btn-primary" id="btn-reopen-phish-popup" style="font-size:0.8rem;padding:9px 12px;font-weight:700">
              📋 Xem Báo Cáo Kết Cục
            </button>
            <button class="btn btn-sm btn-secondary" id="btn-phish-retry" style="font-size:0.8rem;padding:8px 12px">
              🔄 Thử Lại
            </button>
            <button class="btn btn-sm btn-secondary" id="btn-phish-tree" style="font-size:0.8rem;padding:8px 12px">
              🗺️ Sơ Đồ Quyết Định
            </button>
          </div>
        </div>
      </div>
    `;
  }


  // Landing page of the fake phishing site
  return `
    <div class="fake-browser-view">
      <div class="fake-browser-topbar">
        <button class="fake-browser-btn" id="btn-browser-back" title="Quay lại tin nhắn">←</button>
        <div class="fake-browser-url-input">
          <span class="url-warn">⚠️ Không an toàn</span>
          <span title="${phish.url}">${phish.url}</span>
        </div>
        <button class="fake-browser-btn" id="btn-browser-reload" title="Tải lại">🔄</button>
        <button class="fake-browser-btn" id="btn-browser-close" title="Đóng">✕</button>
      </div>

      <div class="fake-site-content">
        <div class="fake-site-header" style="background:${phish.brandColor || '#1e293b'}">
          <div class="fake-site-brand">
            <span>🛡️</span>
            <span>${phish.brandName}</span>
          </div>
          <span style="font-size:0.7rem;opacity:0.8">Hệ Thống Xác Thực</span>
        </div>

        ${phish.bannerWarning ? `
          <div class="fake-site-banner">
            <span>⚠️</span>
            <span>${phish.bannerWarning}</span>
          </div>
        ` : ''}

        <div class="fake-site-form-card">
          <div style="font-size:0.88rem;font-weight:700;color:#0f172a;margin-bottom:12px;border-bottom:1px solid #f1f5f9;padding-bottom:8px">
            ${phish.title}
          </div>

          <form id="fake-phish-form" onsubmit="return false;">
            ${phish.fields.map(f => `
              <div class="fake-field-group">
                <label for="fake-${f.id}">${f.label}</label>
                <input
                  type="${f.type || 'text'}"
                  id="fake-${f.id}"
                  class="fake-input"
                  placeholder="${f.placeholder || ''}"
                  value="${state.simPhishFormValues[f.id] || ''}"
                  autocomplete="off"
                />
              </div>
            `).join('')}

            <button type="submit" class="fake-submit-btn" style="background:${phish.brandColor || '#dc2626'}">
              <span>🔒</span>
              <span>${phish.submitText || 'Xác Nhận'}</span>
            </button>
          </form>
        </div>

        <div style="margin:auto 14px 10px;padding:10px 12px;background:rgba(239,68,68,0.06);border:1px dashed rgba(239,68,68,0.3);border-radius:8px;font-size:0.75rem;line-height:1.45;color:#b91c1c">
          <strong>💡 Mô phỏng giao diện web lừa đảo:</strong>
          Website giả mạo sao chép logo, màu sắc và phông chữ của thương hiệu uy tín. Hãy bấm nút <strong>"${phish.submitText || 'Xác Nhận'}"</strong> bên trên để mô phỏng điều gì sẽ xảy ra khi nạn nhân gửi thông tin!
        </div>
      </div>
    </div>
  `;
}

// ---------------------------------------------
// HELPER: BIND FAKE BROWSER INTERACTIVE EVENTS
// ---------------------------------------------
function bindFakeBrowserEvents(container, sim) {
  container.querySelector('#btn-browser-back')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (state.simPhishConsequenceActive) {
      state.simPhishConsequenceActive = false;
    } else {
      state.simPhishBrowserOpen = false;
    }
    renderSimulation();
  });

  container.querySelector('#btn-browser-close')?.addEventListener('click', (e) => {
    e.stopPropagation();
    state.simPhishBrowserOpen = false;
    state.simPhishConsequenceActive = false;
    renderSimulation();
  });

  container.querySelector('#btn-browser-reload')?.addEventListener('click', (e) => {
    e.stopPropagation();
    state.simPhishConsequenceActive = false;
    renderSimulation();
  });

  container.querySelector('#btn-phish-retry')?.addEventListener('click', (e) => {
    e.stopPropagation();
    state.simPhishConsequenceActive = false;
    state.simOutcomePopupVisible = false;
    renderSimulation();
  });

  container.querySelector('#btn-phish-tree')?.addEventListener('click', (e) => {
    e.stopPropagation();
    renderDecisionTreeModal(sim);
  });

  // Form submission on fake site
  const phishForm = container.querySelector('#fake-phish-form');
  if (phishForm) {
    phishForm.addEventListener('submit', (e) => {
      e.preventDefault();
      phishForm.querySelectorAll('input').forEach(inp => {
        const key = inp.id.replace('fake-', '');
        state.simPhishFormValues[key] = inp.value;
      });
      sound.playAlertWarning();
      state.simPhishConsequenceActive = true;
      state.simOutcomePopupVisible = true;
      renderSimulation();
    });
  }
}

// ---------------------------------------------
// HELPER: RED FLAGS CHECKLIST & OFFICIAL ADVICE
// ---------------------------------------------
function renderRedFlagsChecklist(sim) {
  const foundCount = state.simFoundFlags.size;
  const totalFlags = sim.totalFlags;
  const isComplete = foundCount === totalFlags;
  const pct = totalFlags > 0 ? Math.round((foundCount / totalFlags) * 100) : 0;

  return `
    <div style="max-width:680px;margin:var(--space-xl) auto 0">
      ${isComplete ? `
        <div class="card mb-2" style="background:var(--safe-bg);border-color:var(--safe-border);text-align:center">
          <h3 style="color:var(--safe)">🎉 Xuất sắc! Bạn đã nhận diện toàn bộ ${totalFlags} điểm bất thường!</h3>
          <p style="margin-top:var(--space-sm);color:var(--text-secondary);font-size:0.88rem">
            Kỹ năng phòng vệ số của bạn rất nhạy bén. Hãy chia sẻ cho người thân cùng cảnh giác!
          </p>
        </div>
      ` : ''}

      <div class="card" style="background:var(--bg-card)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <h4 style="font-size:0.92rem;color:var(--text-primary);display:flex;align-items:center;gap:8px;margin:0">
            🚩 Điểm Bất Thường Cần Tìm
          </h4>
          <span style="font-size:0.8rem;color:var(--cyan);font-weight:700">
            ${foundCount} / ${totalFlags}
          </span>
        </div>

        <div style="height:6px;background:rgba(255,255,255,0.06);border-radius:3px;margin-bottom:var(--space-md);overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${isComplete ? 'var(--safe)' : 'var(--cyan)'};border-radius:3px;transition:width 0.5s ease"></div>
        </div>

        <div class="red-flags-checklist">
          ${sim.redFlags.map(flag => {
    const isFound = state.simFoundFlags.has(flag.id);
    return `
              <div class="flag-card ${isFound ? 'revealed' : ''}">
                <div class="flag-badge">${isFound ? '🚩' : '❓'}</div>
                <div style="flex:1">
                  <div class="flag-info-title" style="color:${isFound ? 'var(--danger)' : 'var(--text-secondary)'}">
                    ${isFound ? flag.hint : 'Bấm vào các thành phần đáng ngờ trong mô phỏng để mở khóa'}
                  </div>
                  ${isFound ? `
                    <div class="flag-info-desc">${flag.explanation}</div>
                  ` : ''}
                </div>
              </div>
            `;
  }).join('')}
        </div>

        ${sim.advice ? `
          <div style="margin-top:var(--space-lg);padding:var(--space-md);background:rgba(6,182,212,0.06);border-left:3px solid var(--cyan);border-radius:0 var(--radius-md) var(--radius-md) 0;font-size:0.85rem;line-height:1.6">
            <strong style="color:var(--cyan)">🛡️ Lời khuyên:</strong> ${sim.advice}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// =============================================
// RENDER: QUIZ PAGE (CSI)
// =============================================
function initQuizPage() {
  state.quizStarted = false;
  state.quizCurrentQ = 0;
  state.quizAnswers = [];
  state.quizFinished = false;
  renderQuizStart();
}

function renderQuizStart() {
  const el = document.getElementById('page-quiz');
  el.innerHTML = `
    <div class="container">
      <div style="max-width:600px;margin:0 auto;text-align:center;padding-top:var(--space-xl)">
        <div style="font-size:4rem;margin-bottom:var(--space-lg)">🧠</div>
        <h2>${questionsData.quizTitle}</h2>
        <p style="color:var(--text-secondary);margin:var(--space-lg) 0;font-size:1.05rem;line-height:1.8">${questionsData.quizDescription}</p>

        <div class="grid-2" style="margin:var(--space-2xl) 0">
          ${questionsData.pillars.map(p => `
            <div class="card" style="text-align:center;padding:var(--space-lg)">
              <div style="font-size:1.6rem;margin-bottom:var(--space-sm)">${p.icon}</div>
              <h4 style="font-size:0.85rem;color:${p.color}">${p.name}</h4>
            </div>
          `).join('')}
        </div>

        <p style="color:var(--text-tertiary);font-size:0.85rem;margin-bottom:var(--space-xl)">
          📝 ${questionsData.questions.length} câu hỏi tình huống • ⏱️ Khoảng 5-7 phút • 🏆 Nhận chứng nhận CySafe
        </p>

        <button class="btn btn-primary btn-lg" id="start-quiz-btn">Bắt Đầu Kiểm Tra →</button>
      </div>
    </div>
  `;

  document.getElementById('start-quiz-btn').addEventListener('click', () => {
    state.quizStarted = true;
    renderQuizQuestion();
  });
}

function renderQuizQuestion() {
  const el = document.getElementById('page-quiz');
  const questions = questionsData.questions;
  const q = questions[state.quizCurrentQ];
  const progress = ((state.quizCurrentQ) / questions.length) * 100;

  el.innerHTML = `
    <div class="container">
      <div class="quiz-container" style="padding-top:var(--space-xl)">
        <div class="quiz-progress-bar">
          <div class="quiz-progress-fill" style="width:${progress}%"></div>
        </div>

        <div class="quiz-question-num">
          Câu ${state.quizCurrentQ + 1} / ${questions.length} • 
          ${questionsData.pillars.find(p => p.id === q.pillar)?.icon} ${questionsData.pillars.find(p => p.id === q.pillar)?.name}
        </div>

        <div class="quiz-question">${q.question}</div>

        <div class="quiz-options">
          ${q.options.map((opt, i) => `
            <button class="quiz-option" data-index="${i}" data-score="${opt.score}">
              ${opt.text}
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  el.querySelectorAll('.quiz-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const score = parseInt(opt.dataset.score);
      const bestScore = Math.max(...q.options.map(o => o.score));

      // Highlight correct/wrong
      el.querySelectorAll('.quiz-option').forEach(o => {
        o.style.pointerEvents = 'none';
        const s = parseInt(o.dataset.score);
        if (s === bestScore) o.classList.add('correct');
        if (o === opt && score !== bestScore) o.classList.add('wrong');
      });

      state.quizAnswers.push({
        questionId: q.id,
        pillar: q.pillar,
        score,
        maxScore: bestScore
      });

      setTimeout(() => {
        state.quizCurrentQ++;
        if (state.quizCurrentQ >= questions.length) {
          renderQuizResult();
        } else {
          renderQuizQuestion();
        }
      }, 1200);
    });
  });
}

function renderQuizResult() {
  const el = document.getElementById('page-quiz');

  // Calculate scores per pillar
  const pillarScores = {};
  questionsData.pillars.forEach(p => {
    pillarScores[p.id] = { total: 0, max: 0, name: p.name, icon: p.icon, color: p.color };
  });

  state.quizAnswers.forEach(a => {
    pillarScores[a.pillar].total += a.score;
    pillarScores[a.pillar].max += a.maxScore;
  });

  const totalScore = state.quizAnswers.reduce((s, a) => s + a.score, 0);
  const maxTotal = state.quizAnswers.reduce((s, a) => s + a.maxScore, 0);
  const percentage = Math.round((totalScore / maxTotal) * 100);

  let grade, gradeClass;
  if (percentage >= 80) { grade = 'Xuất sắc'; gradeClass = 'high'; }
  else if (percentage >= 60) { grade = 'Khá'; gradeClass = 'medium'; }
  else { grade = 'Cần Cải Thiện'; gradeClass = 'low'; }

  el.innerHTML = `
    <div class="container">
      <div class="quiz-container quiz-result" style="padding-top:var(--space-xl)">
        <span class="badge badge-cyan">Kết quả đánh giá</span>
        <h2 style="margin-top:var(--space-md)">Chỉ Số An Toàn Số (CSI) Của Bạn</h2>

        <div class="csi-score-big ${gradeClass}">${percentage}</div>
        <p style="color:var(--text-secondary);font-size:1.2rem;font-weight:600">${grade}</p>
        <p style="color:var(--text-tertiary);font-size:0.9rem;margin-top:var(--space-sm)">${totalScore} / ${maxTotal} điểm</p>

        <div class="pillar-scores">
          ${Object.entries(pillarScores).map(([id, data]) => {
    const pct = data.max > 0 ? Math.round((data.total / data.max) * 100) : 0;
    return `
              <div class="pillar-score-item">
                <div class="pillar-name">${data.icon} ${data.name}</div>
                <div class="pillar-value" style="color:${data.color}">${pct}%</div>
                <div class="pillar-bar">
                  <div class="pillar-bar-fill" style="width:${pct}%;background:${data.color}"></div>
                </div>
              </div>
            `;
  }).join('')}
        </div>

        <!-- Certificate -->
        <div class="cert-card">
          <div class="cert-content">
            <div class="cert-title">Chứng Nhận Số</div>
            <div style="font-size:2.5rem;margin:var(--space-md) 0">🛡️</div>
            <div class="cert-name text-gradient">CySafe Certified</div>
            <div style="font-size:1.3rem;font-weight:700;color:var(--cyan);margin:var(--space-sm) 0">${grade} — ${percentage} điểm</div>
            <div class="cert-date">${new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
            <p style="margin-top:var(--space-lg);font-size:0.8rem;color:var(--text-tertiary)">Chứng nhận năng lực nhận thức an ninh mạng</p>
          </div>
        </div>

        <div style="display:flex;gap:var(--space-md);justify-content:center;margin-top:var(--space-xl)">
          <button class="btn btn-primary" id="retake-quiz">🔄 Làm Lại</button>
          <button class="btn btn-secondary" id="back-home-btn">🏠 Về Trang Chủ</button>
        </div>
      </div>
    </div>
  `;

  // Animate pillar bars
  setTimeout(() => {
    el.querySelectorAll('.pillar-bar-fill').forEach(bar => {
      bar.style.width = bar.style.width; // trigger reflow
    });
  }, 100);

  document.getElementById('retake-quiz')?.addEventListener('click', () => {
    initQuizPage();
  });

  document.getElementById('back-home-btn')?.addEventListener('click', () => {
    navigateTo('home');
  });
}

// =============================================
// INITIALIZE APP
// =============================================
function initApp() {
  // Render pages container
  document.querySelector('#app').innerHTML = `
    <header class="header">
      <div class="header-inner">
        <div class="logo" data-page="home">
          <div class="logo-icon">🛡️</div>
          <span>Cy<span style="color:var(--cyan)">Safe</span></span>
        </div>
        <nav class="nav" id="main-nav">
          <button class="nav-link active" data-page="home">Trang Chủ</button>
          <button class="nav-link" data-page="campaigns">Phong Trào</button>
          <button class="nav-link" data-page="handbook">Cẩm Nang</button>
          <button class="nav-link" data-page="tools">Công Cụ</button>
          <button class="nav-link" data-page="lab">Phòng Lab</button>
          <button class="nav-link" data-page="quiz">Kiểm Tra CSI</button>
        </nav>
        <button class="mobile-toggle" id="mobile-toggle">☰</button>
      </div>
    </header>

    <main>
      <div id="page-home" class="page-section active"></div>
      <div id="page-campaigns" class="page-section"></div>
      <div id="page-handbook" class="page-section"></div>
      <div id="page-tools" class="page-section"></div>
      <div id="page-lab" class="page-section"></div>
      <div id="page-quiz" class="page-section"></div>
    </main>

    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="logo">
              <div class="logo-icon">🛡️</div>
              <span>Cy<span style="color:var(--cyan)">Safe</span></span>
            </div>
            <p>Nền tảng cộng đồng phi lợi nhuận nhằm nâng cao nhận thức của cộng đồng về an toàn thông tin và phòng chống lừa đảo. Với các công cụ hữu ích và các phong trào ý nghĩa, chúng tôi hy vọng sẽ góp phần tạo nên một môi trường số an toàn và lành mạnh cho mọi người.</p>
          </div>
          <div class="footer-col">
            <h4>Tài Nguyên</h4>
            <a href="#" data-page="campaigns">Phong trào Quốc gia</a>
            <a href="#" data-page="handbook">Cẩm nang Lừa đảo</a>
            <a href="#" data-page="tools">Công cụ Kiểm tra</a>
            <a href="#" data-page="lab">Phòng Lab Thực hành</a>
          </div>
          <div class="footer-col">
            <h4>Nguồn Chính Thống</h4>
            <a href="https://khonggianmang.vn" target="_blank">khonggianmang.vn</a>
            <a href="https://tinnhiemmang.vn" target="_blank">tinnhiemmang.vn</a>
            <a href="https://chongluadao.vn" target="_blank">chongluadao.vn</a>
            <a href="https://tingia.gov.vn" target="_blank">tingia.gov.vn</a>
          </div>
          <div class="footer-col">
            <h4>Đường Dây Nóng</h4>
            <a href="tel:02432096789">📞 024.3209.6789 (NCSC)</a>
            <a href="tel:111">📞 111 (Bảo vệ Trẻ em)</a>
            <a href="tel:156">📞 156 (Tin nhắn rác)</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2024 CySafe Vietnam — Dự án phi lợi nhuận nâng cao nhận thức an ninh mạng toàn dân</p>
          <p style="margin-top:4px">Tham chiếu: Cục An toàn thông tin (Bộ TT&TT) • NCSC • Chống Lừa Đảo VN</p>
        </div>
      </div>
    </footer>
  `;

  // Bind navigation
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(el.dataset.page);
    });
  });

  // Mobile toggle
  document.getElementById('mobile-toggle')?.addEventListener('click', () => {
    document.getElementById('main-nav')?.classList.toggle('mobile-open');
  });

  // Keyboard shortcut: Escape closes modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeScamModal();
    }
  });

  // Render home page
  renderHome();
}

// Start the app
initApp();
