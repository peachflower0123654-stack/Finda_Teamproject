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

## 지금 보내는 데이터
| event | 언제 | payload |
|---|---|---|
| `quickmenu_done` | 퀵메뉴 편집 [완료] (종료 지점 ③) | `selected_menu_ids`(고른 추가 메뉴), `recommendation_ids`(그때 보인 맞춤 추천 6개) |

모든 줄에 `test_id`, `flow_version`, `created_at`이 함께 저장돼요.

## 다른 화면에서 보내기 (온보딩 저장 지점 등)
```js
import {sendTestEvent} from './test-data.js';
sendTestEvent('onboarding_step', {step: '05', answers: {...}});
```
- 이벤트 이름은 영어 소문자, 숫자, `_`만 써요.
- 실제 대출 정보나 개인 식별 정보는 넣지 않아요. 테스트용 가상 응답과 익명 id만 저장해요.
- 전송에 실패하면 브라우저에 쌓아 뒀다가 다음 전송 때 같이 보내요.

## 보안 원칙
- 브라우저(publishable 키)는 **추가만** 할 수 있어요. 조회·수정·삭제 정책이 없어서 다른 테스터의 기록을 볼 수 없어요.
- 데이터 확인과 내보내기는 대시보드에서만 해요.
- RLS를 끄거나 정책을 넓히지 않아요.
