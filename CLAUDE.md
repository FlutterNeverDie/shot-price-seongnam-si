# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 작업할 때 참고하는 가이드입니다.

## 프로젝트 개요

"이 주사 · 어디가 싸요?" (Shot Price) — 토스 앱 내 웹뷰(App-in-Toss)로 동작하는 비급여 예방접종 가격 비교 플랫폼. 사용자가 백신 종류와 지역을 선택하면 최저가 순으로 병원 목록을 보여준다. 병원 상세정보(주소, 전화번호)는 토스 전면 광고 시청 후 해금된다.

## 주요 명령어

- **개발 서버**: `npm run dev` (Vite, 포트 5173, `--host` 활성화)
- **빌드**: `npm run build` (tsc + vite build)
- **린트**: `npm run lint` (ESLint)
- **토스 로컬 개발**: `npm run toss` (`npx ait dev`)
- **토스 배포**: `npm run deploy` (`npx ait build && npx ait deploy`)

테스트 프레임워크는 설정되어 있지 않음.

## 기술 스택

- React 18 + TypeScript + Vite 7
- Zustand 전역 상태 관리 (`usePriceStore`)
- `@apps-in-toss/web-framework` — 토스 광고 SDK (전면 광고 + 배너 광고)
- `@toss/use-overlay` — 선언적 바텀시트/모달 관리
- Vanilla CSS (토스 디자인 시스템 스타일 준수)
- 건강보험심사평가원(HIRA) 공공 API — 비급여 진료비 데이터

## 아키텍처

### 기능 중심 폴더 구조 (`src/features/`)

각 기능은 자체 `components/`, `hooks/`로 격리되며, 필요시 `types.ts` 포함:

- **search** — 백신 카테고리 탭(`VaccineTabs`), 검색바(`ItemSearchBar`), 세부 백신 선택 바텀시트, 지역 선택. `SearchHeader`가 지역 선택 + 타이틀을 통합.
- **price-list** — 최저가순 병원 가격 카드 목록. `PriceList`가 카드 렌더링, `HospitalDetailBottomSheet`가 해금된 상세정보 표시. `usePriceList` 훅이 데이터 조회/정렬, `useHospitalDetail`이 광고 연동 후 상세 조회 처리.
- **ads** — 토스 광고 연동. `adConfig.ts`에 광고 단위 ID 관리. `useAdFrequency`가 광고 노출 빈도 제어. `useTossAds`가 전면 광고 플로우 래핑. `TossBannerAd`가 하단 고정 배너 렌더링.

### 데이터 흐름

1. 사용자가 백신 탭 선택 → `usePriceStore.selectedVaccine` 업데이트
2. 사용자가 바텀시트에서 지역 선택 → `usePriceStore.selectedRegion` 업데이트
3. `usePriceList` 훅이 로컬 CSV(`/public/vaccine_codes.csv`)에서 코드 추출 후 HIRA API로 병원 가격 조회
4. 병원 상세정보(주소, 전화번호)는 `hiraApi.fetchHospitalItemDetail`로 온디맨드 조회 — 전면 광고 시청 후 해금

### API 레이어 (`src/api/`)

- `hiraApi.ts` — Repository를 래핑하는 파사드, 모든 데이터 조회의 진입점
- `hiraRepository.ts` — HIRA 비급여 API 호출 (병원 목록 요약, 상세, 코드 조회). Base URL: `https://apis.data.go.kr/B551182`
- `hospitalInfoRepository.ts` — 병원 기본정보 API (주소, 전화번호)
- `hiraDto.ts` / `hospitalInfoDto.ts` — API 응답 타입 정의

### 전역 상태 (`src/store/usePriceStore.ts`)

Zustand 스토어: `selectedVaccine`, `selectedSubVaccine`, `selectedRegion`, `isSearching` 관리.

### 핵심 설계 규칙

- **로직 없는 UI**: 모든 비즈니스 로직(API 호출, 정렬, 광고 핸들링)은 커스텀 훅에 위치, 컴포넌트에는 로직을 넣지 않음
- **타입 우선**: 기능 구현 전 `types/`에 인터페이스를 먼저 정의
- **광고 폴백**: `TossAds.isSupported()`가 false인 환경(토스 앱 외부)에서는 광고 없이 즉시 정보 해금
- **파일 크기 제한**: 파일당 ~150줄 이내 유지, 초과 시 분리

## 정적 데이터

- `/public/vaccine_codes.csv` — 백신 키워드를 HIRA 비급여 코드(`npayCd`)로 매핑
- `/public/region_codes.csv` — 지역 코드 매핑 (시도/시군구)

## 배포

토스 App-in-Toss 플랫폼에 `granite.config.ts`로 배포 (앱 이름: `shot-price`). `@apps-in-toss/web-framework/config` 사용.
