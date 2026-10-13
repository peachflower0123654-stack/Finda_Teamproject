import { useState, type ReactNode } from "react"

type IconName = "bell" | "building" | "calculator" | "card" | "chevron" | "close" | "compare" | "gift" | "home" | "menu" | "profile" | "star" | "wallet"

type ButtonProps = {
  children: ReactNode
  className?: string
  label?: string
  onClick?: () => void
  selected?: boolean
}

const popularPosts = {
  사용팁: [
    ["loan", "[팩토체크] 대출 조회만 해도 신용점수가 떨어질까?"],
    [
      "saving",
      "자산관리부터 지금당장시작! 마이데이터 혜택 놓친 건 없으신가요?",
    ],
    ["bag", "지금 추가대출 얼마나 가능할지 궁금하다면"],
  ],
  대출: [
    ["rate", "내 조건에 맞는 최저 금리 대출, 한 번에 찾는 방법"],
    ["check", "대출 갈아타기 전에 꼭 확인해야 할 세 가지"],
    ["bag", "한도 조회는 신용점수에 영향을 줄까?"],
  ],
  신용점수: [
    ["score", "매일 5분, 신용점수를 건강하게 관리하는 습관"],
    ["card", "카드 사용액과 신용점수의 상관관계"],
    ["check", "내 신용점수가 달라진 이유 확인하기"],
  ],
  부동산: [
    ["house", "전세자금대출 준비 전 확인해야 할 체크리스트"],
    ["rate", "주택담보대출 금리를 비교하는 가장 쉬운 방법"],
    ["saving", "내 집 마련을 위한 월별 자금 계획 세우기"],
  ],
} as const

function Button({
  children,
  className = "",
  label,
  onClick,
  selected,
}: ButtonProps) {
  return (
    <button
      aria-label={label}
      aria-pressed={selected}
      className={className}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}

function Icon({ name, size = 20 }: { name: IconName size?: number }) {
  const common = {
    "aria-hidden": true,
    className: "icon",
    fill: "none",
    height: size,
    viewBox: "0 0 24 24",
    width: size,
  }

  const paths: Record<IconName, ReactNode> = {
    bell: (
      <>
        <path d="M6.8 9.6a5.2 5.2 0 0 1 10.4 0v3.1l1.5 2.5H5.3l1.5-2.5V9.6Z" />
        <path d="M10 18h4" />
      </>
    ),
    building: (
      <>
        <path d="M5 21V4h11v17M16 9h3v12M3 21h18" />
        <path d="M8 8h2M8 12h2M8 16h2M13 8h1M13 12h1M13 16h1" />
      </>
    ),
    calculator: (
      <>
        <rect height="18" rx="2" width="16" x="4" y="3" />
        <path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h4" />
      </>
    ),
    card: (
      <>
        <rect height="16" rx="3" width="20" x="2" y="4" />
        <path d="M2 9h20M6 15h4" />
      </>
    ),
    chevron: <path d="m9 6 6 6-6 6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    compare: (
      <>
        <path d="M7 7h13l-3-3M17 17H4l3 3" />
        <path d="m15 4 5 3-5 3M9 14l-5 3 5 3" />
      </>
    ),
    gift: (
      <>
        <path d="M4 10h16v11H4zM2 7h20v4H2zM12 7v14" />
        <path d="M12 7c-1-4-6-4-6-1 0 1.3 1.5 1 6 1ZM12 7c1-4 6-4 6-1 0 1.3-1.5 1-6 1Z" />
      </>
    ),
    home: (
      <>
        <path d="m3 11 9-7 9 7" />
        <path d="M5 10v10h14V10M9 20v-6h6v6" />
      </>
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    profile: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
      </>
    ),
    star: (
      <path d="m12 3 2.4 5 5.6.8-4 3.9.9 5.6-4.9-2.6-4.9 2.6.9-5.6-4-3.9 5.6-.8L12 3Z" />
    ),
    wallet: (
      <>
        <path d="M4 6h14a2 2 0 0 1 2 2v11H4a2 2 0 0 1-2-2V6a3 3 0 0 1 3-3h12" />
        <path d="M15 11h7v5h-7a2.5 2.5 0 0 1 0-5Z" />
      </>
    ),
  }

  return <svg {...common}>{paths[name]}</svg>
}

function BrandMark() {
  return (
    <div className="brand" aria-label="finda">
      finda
    </div>
  )
}

function HeroIllustration() {
  return (
    <div className="hero-illustration" aria-hidden="true">
      <span className="coin coin-one" />
      <span className="coin coin-two" />
      <span className="hero-orbit" />
      <span className="hero-badge">₩</span>
      <span className="hero-alert">!</span>
    </div>
  )
}

function QuickAction({
  color,
  icon,
  title,
  subtitle,
  onClick,
}: {
  color: string
  icon: IconName
  title: string
  subtitle: string
  onClick: () => void
}) {
  return (
    <Button className="quick-card" onClick={onClick}>
      <span className={`quick-icon ${color}`}>
        <Icon name={icon} size={18} />
      </span>
      <strong>{title}</strong>
      <small>{subtitle}</small>
    </Button>
  )
}

function MiniService({
  color,
  icon,
  label,
  onClick,
}: {
  color: string
  icon: IconName
  label: string
  onClick: () => void
}) {
  return (
    <Button className="mini-service" onClick={onClick}>
      <span className={`mini-icon ${color}`}>
        <Icon name={icon} size={15} />
      </span>
      <span>{label}</span>
    </Button>
  )
}

function PostArt({ kind }: { kind: string }) {
  return (
    <span className={`post-art post-art-${kind}`} aria-hidden="true">
      <Icon
        name={
          kind === "loan" || kind === "rate"
            ? "compare"
            : kind === "card"
              ? "card"
              : "wallet"
        }
        size={22}
      />
    </span>
  )
}

function PromoCard({
  className,
  eyebrow,
  title,
  subtitle,
  art,
  onClick,
}: {
  className: string
  eyebrow?: string
  title: ReactNode
  subtitle?: string
  art: ReactNode
  onClick: () => void
}) {
  return (
    <Button className={`promo-card ${className}`} onClick={onClick}>
      <span className="promo-copy">
        {eyebrow && <small>{eyebrow}</small>}
        <strong>{title}</strong>
        {subtitle && <span>{subtitle}</span>}
      </span>
      <span className="promo-art" aria-hidden="true">
        {art}
      </span>
    </Button>
  )
}

export default function App() {
  const [heroVisible, setHeroVisible] = useState(true)
  const [activeCategory, setActiveCategory] =
    useState<keyof typeof popularPosts>("사용팁")
  const [activeNav, setActiveNav] = useState("홈")
  const [showMore, setShowMore] = useState(false)
  const [notice, setNotice] = useState("")

  const notify = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(""), 1800)
  }

  return (
    <div className="prototype-stage">
      <main className="mobile-app">
        <header className="app-header">
          <BrandMark />
          <div className="header-actions">
            <Button
              className="icon-button star-button"
              label="즐겨찾기"
              onClick={() => notify("즐겨찾기를 확인했어요.")}
            >
              <Icon name="star" size={19} />
            </Button>
            <Button
              className="profile-button"
              label="내 정보"
              onClick={() => notify("내 정보 화면으로 이동합니다.")}
            >
              <Icon name="profile" size={15} />
            </Button>
            <Button
              className="icon-button notification-button"
              label="알림"
              onClick={() => notify("새 알림이 1개 있어요.")}
            >
              <Icon name="bell" size={19} />
              <span className="notification-dot" />
            </Button>
          </div>
        </header>

        <div className="product-switcher" aria-label="서비스 선택">
          <Button
            className="switch-option"
            onClick={() => notify("MY금융을 준비 중이에요.")}
          >
            MY금융
          </Button>
          <Button className="switch-option active" selected>
            핀다대출
          </Button>
        </div>

        <div className="content">
          {heroVisible && (
            <section className="hero-card">
              <Button
                className="hero-close"
                label="카드 닫기"
                onClick={() => setHeroVisible(false)}
              >
                <Icon name="close" size={15} />
              </Button>
              <p>박선영님,</p>
              <strong>대출이 있는 데 안보이나요?</strong>
              <HeroIllustration />
              <Button
                className="hero-cta"
                onClick={() => notify("대출 정보를 불러오고 있어요.")}
              >
                내 대출 확인하기
              </Button>
            </section>
          )}

          {!heroVisible && (
            <Button
              className="restore-hero"
              onClick={() => setHeroVisible(true)}
            >
              숨긴 대출 안내 다시 보기
              <Icon name="chevron" size={15} />
            </Button>
          )}

          <section className="quick-grid" aria-label="빠른 대출 메뉴">
            <QuickAction
              color="purple"
              icon="wallet"
              title="대출받기"
              subtitle="비교 비교"
              onClick={() => notify("대출 비교를 시작합니다.")}
            />
            <QuickAction
              color="cyan"
              icon="compare"
              title="대환하기"
              subtitle="대환하기"
              onClick={() => notify("갈아탈 대출을 찾아볼게요.")}
            />
          </section>

          <section className="service-grid" aria-label="대출 서비스">
            <MiniService
              color="navy"
              icon="building"
              label="사업자대출"
              onClick={() => notify("사업자대출을 선택했어요.")}
            />
            <MiniService
              color="magenta"
              icon="wallet"
              label="주택담보대출"
              onClick={() => notify("주택담보대출을 선택했어요.")}
            />
            <MiniService
              color="orange"
              icon="calculator"
              label="전세대출"
              onClick={() => notify("전세대출을 선택했어요.")}
            />
            <MiniService
              color="orange"
              icon="compare"
              label="우수대부"
              onClick={() => notify("우수대부를 선택했어요.")}
            />
            <MiniService
              color="cyan"
              icon="compare"
              label="차 구입대출"
              onClick={() => notify("차 구입대출을 선택했어요.")}
            />
            <MiniService
              color="navy"
              icon="wallet"
              label="차 리스렌트"
              onClick={() => notify("차 리스렌트를 선택했어요.")}
            />
          </section>

          <section className="support-grid" aria-label="카드와 신용카드 서비스">
            <Button
              className="support-card"
              onClick={() => notify("핀다카드 지원을 확인합니다.")}
            >
              <span className="support-icon navy">
                <Icon name="card" size={17} />
              </span>
              <strong>
                핀다카드
                <br />
                대출이자 지원
              </strong>
            </Button>
            <Button
              className="support-card"
              onClick={() => notify("맞춤 신용카드를 찾아볼게요.")}
            >
              <span className="support-icon gradient">
                <Icon name="gift" size={17} />
              </span>
              <strong>
                혜택 많은
                <br />
                신용카드 찾기
              </strong>
            </Button>
          </section>

          <section className="popular-section">
            <h2>요즘 인기있는 포스트예요</h2>
            <div className="category-tabs" role="tablist">
              {(Object.keys(
                popularPosts,
              ) as Array<keyof typeof popularPosts>).map((category) => (
                <Button
                  className={`category-tab ${
                    activeCategory === category ? "active" : ""
                  }`}
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  selected={activeCategory === category}
                >
                  {category}
                </Button>
              ))}
            </div>
            <div className="post-list">
              {popularPosts[activeCategory].map(([kind, title]) => (
                <Button
                  className="post-row"
                  key={title}
                  onClick={() => notify("포스트를 열었어요.")}
                >
                  <PostArt kind={kind} />
                  <strong>{title}</strong>
                </Button>
              ))}
            </div>
            <Button
              className="more-button"
              onClick={() => setShowMore((value) => !value)}
            >
              {showMore ? "포스트 접기" : "포스트 더보기"}
              <Icon name="chevron" size={14} />
            </Button>
            {showMore && (
              <Button
                className="extra-post"
                onClick={() => notify("새 포스트를 열었어요.")}
              >
                대출 이자 줄이는 방법, 지금 확인해 보세요
              </Button>
            )}
          </section>

          <section className="news-section">
            <h2>핀다소식</h2>
            <div className="promo-carousel">
              <PromoCard
                className="gold-promo"
                eyebrow="EVENT"
                title={
                  <>
                    대출 비교하고
                    <br />
                    100만원 도전하기
                  </>
                }
                subtitle="지금 포인트 받기"
                art={
                  <>
                    <span className="gold-glow" />
                    <span className="gold-ticket">100만원</span>
                  </>
                }
                onClick={() => notify("이벤트 상세를 확인합니다.")}
              />
              <PromoCard
                className="mint-promo"
                eyebrow="혜택"
                title={
                  <>
                    첫 대출
                    <br />
                    혜택 확인
                  </>
                }
                art={<span className="mint-coin">P</span>}
                onClick={() => notify("첫 대출 혜택을 확인합니다.")}
              />
            </div>

            <PromoCard
              className="white-promo"
              title={
                <>
                  당장 추가 대출 필요하다면?
                  <br />
                  지금 차량번호로 최고 한도 조회
                </>
              }
              art={
                <>
                  <span className="car-chip">한도 확인</span>
                  <span className="coin-stack" />
                </>
              }
              onClick={() => notify("자동차 대출 한도를 조회합니다.")}
            />
            <PromoCard
              className="blue-promo"
              eyebrow="자동차담보대출"
              title={
                <>
                  차량 대출 갚았어요!
                  <br />
                  <em>최고 3억원</em>
                  <br />
                  추가 신청 가능
                </>
              }
              art={
                <>
                  <span className="blue-bell">1</span>
                  <span className="money-box" />
                </>
              }
              onClick={() => notify("추가 대출 한도를 확인합니다.")}
            />
            <PromoCard
              className="white-promo compact-promo"
              title={
                <>
                  아직죽은땅 신용대출
                  <br />
                  오늘 내 대출한도는 얼마일까?
                </>
              }
              art={<span className="pink-car" />}
              onClick={() => notify("오늘의 대출한도를 확인합니다.")}
            />
            <PromoCard
              className="white-promo compact-promo"
              title={
                <>
                  당장 추가 대출 필요하다면?
                  <br />
                  지금 차량번호로 최고 한도 조회
                </>
              }
              art={
                <span className="rate-card">
                  최대 2%
                  <br />
                  금리할인
                </span>
              }
              onClick={() => notify("금리 할인 혜택을 확인합니다.")}
            />
            <PromoCard
              className="rate-promo"
              eyebrow="SBI 저축은행"
              title={
                <>
                  최대 <em>2%</em>
                  <br />
                  금리할인
                </>
              }
              subtitle="낮은 금리로 부담 없이!"
              art={
                <>
                  <span className="rate-arrow rate-arrow-one" />
                  <span className="rate-arrow rate-arrow-two" />
                  <span className="rate-cylinder" />
                </>
              }
              onClick={() => notify("금리 할인 상품을 확인합니다.")}
            />
            <Button
              className="hide-content"
              onClick={() => notify("추천 콘텐츠 설정을 열었어요.")}
            >
              내 금융, 정보 숨기기
              <Icon name="chevron" size={14} />
            </Button>
          </section>
        </div>

        <nav className="bottom-nav" aria-label="주요 메뉴">
          {[
            ["홈", "home"],
            ["포인트", "profile"],
            ["전체", "menu"],
          ].map(([label, icon]) => (
            <Button
              className={`nav-item ${activeNav === label ? "active" : ""}`}
              key={label}
              onClick={() => setActiveNav(label)}
              selected={activeNav === label}
            >
              <Icon name={icon as IconName} size={20} />
              <span>{label}</span>
            </Button>
          ))}
        </nav>

        <div className={`toast ${notice ? "visible" : ""}`} role="status">
          {notice}
        </div>
      </main>
    </div>
  )
}
