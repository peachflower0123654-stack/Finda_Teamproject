# Supabase 연결 안내 (사용자 테스트 데이터)

finda-app의 테스트 데이터를 Supabase 무료 플랜에 저장해요. 로그인이 없어서 브라우저마다 익명 `test_id`를 만들고, 기록을 `test_events` 테이블에 한 줄씩 쌓아요.

## 1. 계정과 프로젝트 만들기 (사람이 직접)
1. https://supabase.com 에서 팀 공용 계정으로 가입해요. **무료(Free) 플랜**을 고르고, 카드는 등록하지 않아요.
2. **New project**를 만들어요. 지역은 `Northeast Asia (Seoul)`을 추천해요. DB 비밀번호는 팀 비밀번호 관리 도구에만 보관하고 코드나 채팅에는 적지 않아요.

## 2. 테이블 만들기
1. 대시보드 왼쪽 **SQL Editor**를 열어요.
2. [`schema.sql`](schema.sql) 내용을 전부 붙여 넣고 **Run**을 눌러요.
3. **Table Editor**에 `test_events`가 생겼고 **RLS enabled**로 표시되는지 확인해요.

## 3. 앱에 키 넣기 (내 컴퓨터에서만)
1. `public/prototypes/finda-app/supabase-config.example.js`를 복사해서 같은 폴더에 `supabase-config.js`로 저장해요.
2. **Project Settings → API Keys**에서 아래 두 값을 넣어요.
   - `url`: Project URL (`https://xxxx.supabase.co`)
   - `publishableKey`: **Publishable key**(`sb_publishable_...`). 화면에 없으면 예전 이름인 "anon public" 키를 써요.
3. **넣으면 안 되는 것:** secret 키(`sb_secret_...`), `service_role` 키, DB 비밀번호. 실수로 넣으면 앱이 전송을 거부하고 콘솔에 경고를 띄워요.
4. `supabase-config.js`는 `.gitignore`에 들어 있어서 GitHub에 올라가지 않아요. 커밋 전에 `git status`에 이 파일이 안 보이는지 확인해요.

## 4. 동작 확인
1. 앱에서 퀵메뉴 편집 → 메뉴 고르기 → [완료]를 눌러요.
2. 대시보드 **Table Editor → test_events**에 `quickmenu_done` 줄이 생기면 성공이에요.

## 5. 중복 방지 규칙 넣기 (한 번만)
`schema.sql`에 `test_events_event_id_key` 인덱스가 추가됐어요. SQL Editor에서 `schema.sql` 전체를 다시 **Run** 하면 돼요(여러 번 실행해도 안전해요). 실행 전에도 앱은 정상 동작하지만, 그동안은 드물게 같은 이벤트가 두 번 저장될 수 있어요.

## 지금 보내는 데이터
| event | 언제 | payload |
|---|---|---|
| `quickmenu_done` | 퀵메뉴 편집 [완료] (종료 지점 ③) | `selected_menu_ids`(고른 추가 메뉴), `recommendation_ids`(그때 보인 맞춤 추천 6개) |
| `explore_done` | 탐색 완료 모달이 실제로 뜬 순간 (테스터당 첫 종료 지점 1번) | `exit_point`(`scroll_end` ①60초 이상 머물렀거나 5번 이상 누른 뒤 홈 끝까지 스크롤 · `my_post_click` ②MY 칩 글 클릭 · `quickmenu_done` ③퀵메뉴 편집 [완료] · `click_count` ④홈에서 5번째 누름, 퀵메뉴·포스트로 닿았으면 그 탐색을 마친 뒤), `recommendation_ids`(맞춤 퀵메뉴 6개), `click_count`(그때까지 홈에서 누른 횟수)·`dwell_sec`(홈에 머문 초), ②는 `post_id`·`position`도 |
| `home_ob_view` | 개인화 홈(온보딩 후)에서 MY 3칸이 처음 보인 순간 (같은 MY면 한 번만) | `my_post_ids`(MY 3칸), `recommendation_ids`(맞춤 퀵메뉴 6개). MY 클릭률의 분모 |
| `interest_menus` | 탐색 완료 모달 → 관심 메뉴 6개 고르기 [완료] | `selected_menu_ids`(고른 6개, 고른 순서), `recommendation_ids`(맞춤 퀵메뉴 6개), `match_count`(겹친 개수). 일치율 = match_count / 6 |
| `post_click` | 개인화 홈(온보딩 후)에서 포스트를 누를 때마다 (모든 칩) | `chip`(MY·정책·대출 등), `post_id`, `post_category`, `position`(칩 안 1~3번째), `my_post_ids`(그 사람의 MY 3칸) |
| `session_start` | 참가자 링크(`?mode=test`)로 앱을 연 순간 (새로고침마다) | `variant`(지금은 `tobe`만), `study`(비교 체험 여부), `first`(비교 체험에서 먼저 본 화면). 사람 수는 `test_id`로 세요 |
| `onboarding_start` | 약관(02) [다음]으로 소속(03)에 들어간 순간 | 없음. 완료율·이탈률의 분모 |
| `onboarding_loan_confirmed` | 대출 보유 여부(05)에서 고른 뒤 [다음] | 임시 저장값 전체 + `track` |
| `onboarding_done` | 보유자: 추가 대출 목적(07) [다음] / 미보유자: 대출 목적(09) [다음] | 답 전체 + `track`(`has_loan`·`no_loan`) |
| `onboarding_skip` | 온보딩 화면(03~09)의 [건너뛰기] | 그 순간의 임시 저장값 전체 + `exit_step`, `exit_field`, `resume_step`, `resume_field` |

뒤로 가기·[이전]은 보내지 않아요.

종료 지점(①②③)에서는 "둘러보기를 마쳤어요" 모달 → 관심 메뉴 6개 고르기 → "Maze로 돌아가 [다음]" 안내 순서로 떠요. 고르기 화면은 맞춤 추천이 어떤 메뉴인지 드러나지 않게 전체 메뉴를 같은 모양으로 보여 줘요.

종료 지점 ②는 MY 칩 글 클릭만이에요. 다른 칩 글을 누르면 모달 대신 "구현되지 않았어요" 안내만 뜨고, `post_click`만 남아요. 칩을 바꾸는 것만으로는 아무것도 보내지 않아요.

모든 줄에 `test_id`, `flow_version`, `created_at`이 함께 저장되고, payload에는 `event_id`(이벤트 고유 id)와 `sent_at`(브라우저 시각)이 들어가요. 온보딩 이벤트에는 `attempt_id`도 들어가요(이어하면 같은 값, 새로 시작하면 새 값).

### 온보딩 답 이름 (payload, 테스트용 가상 응답)
`affiliation`(소속), `housing`(주거 형태. 2026-11-18부터 '부모·가족과 함께'로 저장, 그 전엔 '부모.가족과 함께' → 분석 때 `replace(..., '.', '·')`로 합치기), `has_loan`(true/false), `loan_count`, `loan_principal`, `monthly_repayment`, `extra_loan`(추가 대출 목적), `desired_amount`, `loan_purpose`

### 브라우저 임시 저장
- 키: 참가자 링크(`?mode=test`) `finda.study.v1.onboardingDraft` / 그 외 `finda.dev.v1.onboardingDraft`
- CTA를 누른 순간에만 저장해요. 객관식은 [다음], 대출 보유 여부는 [다음](확정), 대출 건수·원금은 다음 칸으로 넘어갈 때, 월 상환액·희망 금액은 넘버패드 [다음].
- 다시 들어오면 홈의 [이어서 입력하기]가 `resume.step` 화면으로 데려가요. 객관식은 선택 안 된 상태, 대출 정보는 저장된 칸만 채우고 `resume.field`에 커서를 둬요.
- 온보딩을 끝내면(`onboarding_done`) 임시 저장을 지워요. 다음엔 새 `attempt_id`로 시작해요.

## 다른 화면에서 보내기 (온보딩 저장 지점 등)
```js
import {sendTestEvent} from './test-data.js';
sendTestEvent('onboarding_step', {step: '05', answers: {...}});
```
- 이벤트 이름은 영어 소문자, 숫자, `_`만 써요.
- 실제 대출 정보나 개인 식별 정보는 넣지 않아요. 테스트용 가상 응답과 익명 id만 저장해요.
- 보내기 전에 먼저 브라우저(`finda.pendingTestEvents`)에 기록하고, 저장되면 지워요. 실패하면 남겨 뒀다가 다음 접속 때 다시 보내요. 같은 `event_id`는 DB에 한 번만 저장돼요(아래 5번).

## 보안 원칙
- 브라우저(publishable 키)는 **추가만** 할 수 있어요. 조회·수정·삭제 정책이 없어서 다른 테스터의 기록을 볼 수 없어요.
- 데이터 확인과 내보내기는 대시보드에서만 해요.
- RLS를 끄거나 정책을 넓히지 않아요.
