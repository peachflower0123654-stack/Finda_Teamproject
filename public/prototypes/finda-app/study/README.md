# Maze용 참가자 진입점

## 독립 홈 진입점 (권장)

As-is와 To-be는 각각 `codex/maze-asis-entry`, `codex/maze-tobe-entry` 브랜치의 독립 PR로 전달합니다. 공통 실행 파일은 두 PR에 동일하게 포함하므로 어느 PR이 먼저 적용되어도 해당 버전만 실행할 수 있습니다. 해당 PR이 적용되기 전에는 그 버전의 새 URL이 없는 것이 정상이며, 두 PR이 모두 적용되면 아래 두 주소가 함께 제공됩니다.

공개 디렉터리의 HTML 두 개가 기존 앱의 진입 HTML·CSS·ES 모듈을 불러옵니다. 화면이나 컴포넌트는 복사하지 않습니다.

- `/asis/`: As-is 홈에서 시작. 기존 홈·포인트·전체·대출·포스트 경로를 그대로 사용합니다.
- `/tobe/`: To-be 홈에서 시작. 진행 중 온보딩 임시 저장이 있으면 기존 규칙에 맞춰 InOB 홈을 사용합니다.
- GitHub Pages: 저장소 base 아래 `https://peachflower0123654-stack.github.io/Finda_Teamproject/asis/`, `…/tobe/`입니다.
- 두 주소에서는 비교 체험 툴바·다른 버전으로 이동하는 완료 링크·개발 검토 패널을 표시하지 않습니다. 순서와 질문은 Maze에서 구성합니다.

주요 화면은 같은 진입점의 `screen` 쿼리로 구분됩니다. 예: `/asis/?screen=posts`, `/tobe/?screen=all`, `/tobe/?screen=find-loan`, `/tobe/?screen=home-loan`. `lwt` 등 기존 쿼리는 유지합니다. 입력 답변은 URL에 넣지 않습니다.

각 화면을 그린 뒤 브라우저 `history.state.findaTestEntry`에 버전별 탐색 상태를 보관합니다. 브라우저 뒤로/앞으로 가기와 같은 탭의 새로고침에서 답변·상세 화면의 복귀 위치를 복원합니다. URL을 새 탭에 붙여넣는 경우 화면은 열리지만 다른 탭의 입력 답변까지 전달하지는 않습니다. 퀵메뉴 팝업·입력칸 변경 등 모든 UI 조작에 별도 URL을 만들지는 않습니다.

### 로컬 실행·빌드

- 저장소 루트: `pnpm dev` → `http://127.0.0.1:8443/asis/`, `/tobe/`. Vite 설정의 개발 전용 middleware가 폴더 주소를 정적 HTML로 연결합니다.
- 앱 폴더: `node server.mjs` → `http://127.0.0.1:4173/asis/`, `/tobe/`. 포트가 사용 중이면 PowerShell에서 `$env:FINDA_PREVIEW_PORT='4175'` 설정 후 실행합니다. 기존 앱 미리보기 주소도 유지합니다.
- 저장소 루트: `pnpm build`, `pnpm exec vite preview --host 127.0.0.1 --port 4176` → `http://127.0.0.1:4176/Finda_Teamproject/asis/`, `/Finda_Teamproject/tobe/`.
- 앱 폴더: `node --test`. 브라우저 검사는 `study/independent.browser.test.html`; 빌드 검사는 `…/Finda_Teamproject/prototypes/finda-app/study/independent.browser.test.html`입니다.
- PR 단독 체크아웃에서는 브라우저 검사 주소 끝에 As-is는 `?variant=asis`, To-be는 `?variant=tobe`를 붙입니다. 쿼리 없이 여는 통합 검사는 두 PR을 함께 적용한 상태에서 실행합니다.

### 수집·저장 범위

`test-data.js`, DB 스키마, 이벤트명·전송 시점·payload 형식은 변경하지 않습니다. To-be의 기존 `session_start.variant='tobe'`는 유지하며, As-is에는 아직 별도 수집 호출이 없습니다. 따라서 As-is의 유입·종료 수집과 모든 이벤트의 `test_variant` 추가는 이번 작업에 포함하지 않습니다.

- `finda.testId`: 기존대로 같은 origin·브라우저에서 공유하는 참가자 식별자입니다. 버전마다 다른 사람 ID를 발급하지 않습니다.
- `finda.pendingTestEvents`: 기존 전송 대기열 그대로입니다. As-is는 이 대기열에 쓰지 않습니다.
- `finda.study.v1.onboardingDraft` / `finda.dev.v1.onboardingDraft`: 기존 To-be 참가자·개발 구분을 유지합니다. As-is는 여기에 쓰지 않습니다.
- 새 탐색 상태는 `history.state` 안에서 `asis`/`tobe`를 구분합니다. LocalStorage에 새 키나 자동 초기화를 추가하지 않습니다.
- 작업용과 최종용이 같은 origin이면 기존 To-be 임시 저장·참가자 ID가 공유됩니다. 최종 테스트 회차별 초기화·저장 구분 정책은 별도 확정이 필요합니다.

현재 로컬에는 `supabase-config.js`가 없으므로 실 DB 저장은 검증할 수 없습니다. 연결 설정·권한은 담당자와 별도로 확인합니다.

### Maze·배포 준비

각 Website Test에 As-is 또는 To-be의 공개 주소를 개별 등록합니다. 이 저장소 변경에는 Maze 코드 스니펫·설문·계정 연동이 포함되지 않습니다. 경로 기록·자동 성공 판정 등은 사용하는 Maze 테스트 방식에 맞춰 설정하고 실제 Maze 미리보기에서 확인해야 합니다.

기존 Pages workflow가 `public/asis/index.html`, `public/tobe/index.html`과 앱 코드를 함께 `dist`로 복사합니다. 서버 rewrite나 새 라이브러리, build input 추가는 필요 없습니다. GitHub push/PR/merge/공개 배포는 별도 승인 후 진행합니다. 이 URL 분리는 현재 작업·공유용 배포 구조이며 최종 테스트 버전을 고정하는 별도 배포는 아닙니다.

## 기존 진입점 (유지)

같은 배포에서 As-is와 To-be의 진입점을 분리하고, 개발용 검토 패널을 숨깁니다.

- `study/asis.html`: As-is 단독 체험. Maze의 첫 Website Test 블록에 넣을 수 있습니다.
- `study/tobe.html`: To-be 단독 체험. Maze의 별도 Website Test 블록에 넣을 수 있습니다.
- `study/index.html`: 공통 안내 → As-is → To-be 순서로 두 화면 연속 체험. 상단 ‘체험 마치기’로 다음 화면에 진입합니다. 두 번째 체험 후 Maze로 돌아가도록 안내합니다.

공통 안내의 `?first=asis` 또는 `?first=tobe`로 순서를 고정할 수 있습니다. 참가자에게는 중립적인 ‘화면 A’, ‘화면 B’ 명칭만 표시합니다. 기존 검토 주소는 유지됩니다.

단독 링크 두 개를 Maze의 서로 다른 블록에 넣는 경우 순서와 설문 연결은 Maze에서 구성합니다. 두 버전을 한 번에 연속 체험시키려면 공통 안내 링크 한 개를 사용합니다.

설문을 자동으로 제출하거나 Maze의 종료 버튼을 대신 누르지 않습니다. Maze 추적 스니펫이나 별도 계정 연동은 추가하지 않았습니다. 개인정보 입력, 저장 스키마, 인증 설정은 변경하지 않습니다.

모든 이동은 같은 사이트의 상대 경로에서 생성하므로 GitHub Pages 하위 경로 배포를 지원합니다. 새 버전은 기존 배포 워크플로의 Git LFS 체크아웃을 사용합니다.
