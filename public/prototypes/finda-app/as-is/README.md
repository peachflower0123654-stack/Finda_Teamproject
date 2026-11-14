# 핀다 As-is 프로토타입

기존 핀다 화면을 비교 테스트하기 위한 독립 HTML/CSS/JavaScript 프로토타입입니다. As-is 소스와 에셋은 이 폴더 안에 있으며 To-be 화면, 라우팅, 추천 로직은 변경하지 않습니다. 팀의 공통 디자인 토큰, 하단바, 칩 스와이프 모듈만 읽어서 재사용합니다.

## 미리보기

- Vite: `/prototypes/finda-app/as-is/index.html`
- 기존 로컬 서버: `public/prototypes/finda-app/`에서 `node server.mjs` 실행 후 `http://127.0.0.1:4173/as-is/index.html`
- 참가자용: `index.html?mode=test` (화면 선택 등 검토 패널 숨김)
- To-be 진입점은 기존 `../index.html`을 유지합니다.
- GitHub Pages의 하위 경로에서도 동작하도록 상대 경로를 사용합니다.

## 구현 범위

총 17개 화면: Splash, 시작 안내, 악성앱 안내, 악성앱 필수 동의 팝업, 자산 안내, 연결 방식, 금융사 직접 선택, 동의 시트, 인증서 안내, 서명 대기, 홈, 포인트, 전체 메뉴, 대출 받기, 금리인하, 핀다포스트, 대출 갈아타기.

- Splash → 온보딩 → 홈. 자산 연결 건너뛰기와 금융사 직접 선택 분기를 포함합니다.
- 홈·포인트·전체 탭 왕복과 스크롤 위치 복원을 지원합니다.
- 전체 메뉴에서 대출 받기·금리인하·핀다포스트로 진입합니다. 홈의 대출 받기·대출 갈아타기도 연결됩니다.
- 핀다포스트는 사용팁·대출·신용점수·금융사고·부동산·생활 6개 카테고리의 433개 콘텐츠를 원본 ID 숫자 순서로 표시합니다. 보험은 제외합니다. 칩은 터치 스와이프·마우스 드래그·키보드 스크롤을 지원합니다.
- 금융사 직접 선택과 대출 갈아타기는 제공된 이미지를 유지하고 버튼 영역을 활성화합니다. 실제 선택·신청 등 범위 밖 기능은 안내 메시지를 표시합니다.
- 뒤로가기와 팝업 닫기, 키보드 조작을 지원합니다.

직접 화면 확인: `?screen=splash`, `intro`, `security`, `security-consent`, `assets`, `connect`, `asset-select`, `consent`, `verify`, `signing`, `home`, `point`, `all`, `find-loan`, `rate-cut`, `posts`, `refinance`. 직접 검토 중에는 자동 전환을 멈춥니다.

## 데이터와 제한

- 이름, 개인 잔액·보유 포인트·신용점수·대출 한도·금리 등 개인 표시값은 `OOO`로 처리합니다. 이미지에는 필요한 비개인정보 영역만 사용합니다.
- 실제 악성앱 검사, 자산 연결, 본인 인증, 대출 조회·신청, 외부 API 요청, 개인정보 입력·전송, 테스트 이벤트 저장은 구현하지 않습니다.
- 홈의 핀다포스트 연결점, 포스트 상세와 범위 밖 메뉴 상세는 포함하지 않습니다.
- 에셋은 로컬 파일이며 임시 Figma URL을 런타임에서 사용하지 않습니다.
- 원본: Figma 파일 `8retjNtCQbDXgUxONYXaEO`, As-is 섹션 `4417:4252`.

## 검증

이 폴더에서 `node --test flow.test.mjs post-list.test.mjs ../chip-group.test.mjs`를 실행합니다.

브라우저 검사는 아래 파일을 서버로 열어 확인합니다.

- `browser.test.html`: 전체 화면·이동·좌표·에셋·스크롤 복원
- `posts.browser.test.html`: 카테고리와 433개 원본 ID·크롭·목록
- `direct-assets.browser.test.html`: 금융사 직접 선택 분기와 버튼
- `refinance.browser.test.html`: 대출 갈아타기 이미지와 범위 안내

## HTML 내보내기

별도 HTML은 요청할 때만 생성합니다. 이 PR에는 생성된 공유 HTML이나 과거 사본을 포함하지 않습니다.

- `node export-standalone.mjs`: 전체 오프라인 HTML
- `node export-standalone.mjs --loan-only`: 대출 화면 검토용 HTML

내보내기 결과는 `share/`에 생성됩니다. 배포 전 현재 표시값과 에셋을 다시 확인합니다. Noto Sans KR 글꼴은 [OFL 라이선스](assets/OFL-NotoSansKR.txt)를 따릅니다.