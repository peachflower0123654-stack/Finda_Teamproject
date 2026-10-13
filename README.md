# Finda_DefaultHome_Test

핀다 대출 홈 프로토타입 (React 19 + Vite 8 + Tailwind CSS v4)

- 배포 주소: https://<GitHub 계정 또는 조직>.github.io/Finda_DefaultHome_Test/
- 패키지 매니저: **pnpm 10.34.6** (팀 전체 동일 버전 사용)

---

## 1. 준비물

| 도구 | 버전 | 확인 명령어 |
| --- | --- | --- |
| Node.js | 22 이상 | `node -v` |
| pnpm | 10.34.6 | `pnpm -v` |

### pnpm 버전 확인하기

```bash
pnpm -v
# 10.34.6 이 나오면 OK
```

### pnpm이 없거나 버전이 다를 때

Node.js에 포함된 **Corepack**을 쓰면 `package.json`의 `"packageManager": "pnpm@10.34.6"` 버전이 자동으로 맞춰집니다.

```bash
corepack enable
corepack prepare pnpm@10.34.6 --activate
pnpm -v   # 10.34.6 확인
```

> Windows에서 `corepack enable`이 권한 오류를 내면 PowerShell을 **관리자 권한**으로 열어 다시 실행하세요.
> Corepack을 쓸 수 없다면 `npm install -g pnpm@10.34.6` 으로 설치해도 됩니다.

---

## 2. 설치

```bash
git clone https://github.com/<GitHub 계정 또는 조직>/Finda_DefaultHome_Test.git
cd Finda_DefaultHome_Test
pnpm install
```

⚠️ `npm install` / `yarn` 은 쓰지 마세요. `package-lock.json`, `yarn.lock` 이 생기면 lockfile이 꼬입니다.
의존성 추가는 항상 `pnpm add <패키지>` 로 하고, 바뀐 `pnpm-lock.yaml` 도 함께 커밋해주세요.

---

## 3. 실행

| 명령어 | 설명 |
| --- | --- |
| `pnpm dev` | 개발 서버 실행 (터미널에 표시되는 주소로 접속, 기본 `http://localhost:8443/`) |
| `pnpm build` | 배포용 빌드 → `dist/` 폴더 생성 |
| `pnpm preview` | 빌드 결과 미리보기 → `http://localhost:8443/Finda_DefaultHome_Test/` 로 접속 |
| `pnpm format` | 코드 포맷 정리 (oxfmt) |

> 빌드 결과물의 base 경로는 `vite.config.ts`에서 `/Finda_DefaultHome_Test/` 로 설정되어 있습니다.
> 레포 이름과 **대소문자까지** 같아야 GitHub Pages에서 화면이 정상적으로 뜹니다.

---

## 4. 배포 (GitHub Pages)

`main` 브랜치에 push 하면 `.github/workflows/deploy.yml` 이 자동으로 빌드 후 배포합니다.

처음 한 번만 레포 설정이 필요합니다:

1. GitHub 레포 → **Settings → Pages**
2. **Build and deployment → Source** 를 **GitHub Actions** 로 선택

배포 진행 상황은 레포의 **Actions** 탭에서 확인할 수 있습니다.

---

## 5. 협업 규칙

- UI는 **우리 팀 디자인 시스템**만 사용합니다. 다른 UI 라이브러리(MUI, shadcn/ui, Ant Design 등)는 설치하지 않습니다.
- `node_modules/`, `dist/`, `.env`, `.DS_Store` 는 커밋하지 않습니다 (`.gitignore`에 등록됨).
